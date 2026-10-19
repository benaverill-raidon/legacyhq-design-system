import primitiveSource from '../../tokens/src/primitives/primitive.json';
import semanticDarkSource from '../../tokens/src/semantic/semantic-color-dark.json';
import semanticLightSource from '../../tokens/src/semantic/semantic-color-light.json';

// Color values read from the DTCG source, shared by the Foundations pages that show what a color
// token resolves to and how it contrasts: aliases followed to an sRGB value in each mode, and the
// WCAG contrast of one color over another.

export type Mode = 'Light' | 'Dark';
export const MODES: Mode[] = ['Light', 'Dark'];

export type Srgb = { colorSpace: 'srgb'; components: number[]; alpha?: number };
type Entry = { $type: string; $value: unknown };

const primitives = (primitiveSource as unknown as { Primitive: { Value: Record<string, Entry> } }).Primitive.Value;
const semantic: Record<Mode, Record<string, Entry>> = {
  Light: (semanticLightSource as unknown as Record<string, Record<Mode, Record<string, Entry>>>)['Semantic: Color'].Light,
  Dark: (semanticDarkSource as unknown as Record<string, Record<Mode, Record<string, Entry>>>)['Semantic: Color'].Dark,
};

/** Follows aliases ({Primitive.Value.x} or another semantic token) to an sRGB value. */
export function resolveColor(name: string, mode: Mode): Srgb | undefined {
  let value = (semantic[mode][name] ?? primitives[name])?.$value;
  for (let depth = 0; typeof value === 'string' && depth < 10; depth++) {
    const target = value.match(/^\{(.+)\}$/)?.[1]?.split('.').pop();
    value = target ? (semantic[mode][target] ?? primitives[target])?.$value : undefined;
  }
  return value && typeof value === 'object' ? (value as Srgb) : undefined;
}

/** The primitive a semantic token points to in a mode, e.g. "color-brand-taupe-solid-1100". */
export function aliasOf(name: string, mode: Mode) {
  const value = semantic[mode][name]?.$value;
  return typeof value === 'string' ? value.replace(/^\{(?:[^.}]+\.)*([^.}]+)\}$/, '$1') : undefined;
}

const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: number[]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** WCAG contrast of a (possibly translucent) foreground over an opaque background. */
export function contrastRatio(foreground: Srgb, background: Srgb) {
  const alpha = foreground.alpha ?? 1;
  const blended = foreground.components.map((c, i) => c * alpha + background.components[i] * (1 - alpha));
  const [lighter, darker] = [luminance(blended), luminance(background.components)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}
