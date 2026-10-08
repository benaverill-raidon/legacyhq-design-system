import primitiveSource from '../../../tokens/src/primitives/primitive.json';
import borderSource from '../../../tokens/src/semantic/semantic-border.json';
import darkColorSource from '../../../tokens/src/semantic/semantic-color-dark.json';
import lightColorSource from '../../../tokens/src/semantic/semantic-color-light.json';
import darkElevationSource from '../../../tokens/src/semantic/semantic-elevation-dark.json';
import lightElevationSource from '../../../tokens/src/semantic/semantic-elevation-light.json';
import { declarationsIn, displayNames, kindOf, shadowLayers } from '../../blocks/css-usage';

// Everything Foundations / Elevation shows about the tokens is derived here from the DTCG source:
// the surface roles, the shadow color families, the elevation shadow composites and their layers in
// each theme, and the shadow primitives. The second half reads component CSS (passed in, so tests can
// use files read from disk) to find elevation the page lists as exceptions. Guidance is authored on
// the page; elevation.test.ts pins its factual claims.

type Entry = { $type: string; $value: unknown; $description?: string; $extensions?: { 'com.legacyhq'?: { originalName?: string } } };
type Color = { colorSpace: string; components: number[]; alpha?: number };
type Dimension = { value: number; unit: string };
type DtcgLayer = { color: string | Color; offsetX: unknown; offsetY: unknown; blur: unknown; spread: unknown; inset?: boolean };

export const THEMES = ['Light', 'Dark'] as const;
export type Theme = (typeof THEMES)[number];

const primitives = (primitiveSource as unknown as { Primitive: { Value: Record<string, Entry> } }).Primitive.Value;
const border = (borderSource as unknown as Record<string, Record<string, Entry>>)['Semantic: Border'];
const colors: Record<Theme, Record<string, Entry>> = {
  Light: (lightColorSource as unknown as Record<string, Record<string, Record<string, Entry>>>)['Semantic: Color'].Light,
  Dark: (darkColorSource as unknown as Record<string, Record<string, Record<string, Entry>>>)['Semantic: Color'].Dark,
};
const elevation: Record<Theme, Record<string, Entry>> = {
  Light: (lightElevationSource as unknown as Record<string, Record<string, Record<string, Entry>>>)['Semantic: Elevation'].Light,
  Dark: (darkElevationSource as unknown as Record<string, Record<string, Record<string, Entry>>>)['Semantic: Elevation'].Dark,
};

const aliasName = (value: unknown) => (typeof value === 'string' ? value.match(/^\{(?:[^.}]+\.)*([^.}]+)\}$/)?.[1] : undefined);

/**
 * What a color resolves to, read from the primitive's value rather than its name:
 * `{...color-brand-taupe-solid-300}` -> `taupe 300`, an alpha primitive -> `taupe 1100 at 32%`.
 */
const describeColor = (value: unknown, theme: Theme): string => {
  const alias = aliasName(value);
  if (alias && colors[theme][alias]) return describeColor(colors[theme][alias].$value, theme);
  const color = (alias ? primitives[alias]?.$value : value) as Color | undefined;
  if (!color) return alias ?? 'unknown';
  const alpha = color.alpha ?? 1;
  if (alpha === 0) return 'transparent';
  const base = alias?.match(/^color-brand-([a-z]+)-(?:solid|alpha)-(\d+)/);
  if (!base) return `rgba(${color.components.map((c) => Math.round(c * 255)).join(', ')}, ${alpha})`;
  return alpha === 1 ? `${base[1]} ${base[2]}` : `${base[1]} ${base[2]} at ${Math.round(alpha * 100)}%`;
};

const describeLength = (value: unknown): string => {
  const alias = aliasName(value);
  if (alias) return alias;
  const { value: amount, unit } = value as Dimension;
  return amount === 0 ? '0' : `${amount}${unit}`;
};

// --- Surfaces ---------------------------------------------------------------------------------

/** From most recessed to most raised. `default` is the page itself. */
export const SURFACE_ROLES = ['deep', 'sunken', 'default', 'raised'] as const;
export type SurfaceRole = (typeof SURFACE_ROLES)[number];

export type Surface = {
  role: SurfaceRole;
  /** The resting token, e.g. `color-elevation-surface-raised-default`. */
  name: string;
  /** Every token in the role: default, hover, press. */
  tokens: string[];
  figmaName: string | undefined;
  /** The primitive step each theme resolves to, e.g. `taupe 0`. */
  values: Record<Theme, string>;
};

const surfaceName = (role: SurfaceRole, state: string) =>
  role === 'default' ? `color-elevation-surface-${state}` : `color-elevation-surface-${role}-${state}`;

export const surfaces: Surface[] = SURFACE_ROLES.map((role) => ({
  role,
  name: surfaceName(role, 'default'),
  tokens: ['default', 'hover', 'press'].map((state) => surfaceName(role, state)).filter((name) => colors.Light[name]),
  figmaName: colors.Light[surfaceName(role, 'default')]?.$extensions?.['com.legacyhq']?.originalName,
  values: Object.fromEntries(THEMES.map((theme) => [theme, describeColor(colors[theme][surfaceName(role, 'default')]?.$value, theme)])) as Record<Theme, string>,
}));

/** Surface tokens no role claims - should stay empty. */
export const unmatchedSurfaces = Object.keys(colors.Light)
  .filter((name) => name.startsWith('color-elevation-surface-'))
  .filter((name) => !surfaces.some((surface) => surface.tokens.includes(name)));

// --- Shadow colors ----------------------------------------------------------------------------

export type ShadowColorFamily = { family: string; tokens: string[] };

/** The shadow color tokens by family (`overlay`, `raised`, `overflow`), in source order. */
export const shadowColorFamilies: ShadowColorFamily[] = Object.keys(colors.Light)
  .filter((name) => name.startsWith('color-elevation-shadow-'))
  .reduce<ShadowColorFamily[]>((families, name) => {
    const family = name.replace('color-elevation-shadow-', '').split('-')[0];
    const existing = families.find((entry) => entry.family === family);
    if (existing) existing.tokens.push(name);
    else families.push({ family, tokens: [name] });
    return families;
  }, []);

export const themed = true;

// --- Elevation shadows ------------------------------------------------------------------------

export type Layer = {
  inset: boolean;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  /** The color token, e.g. `color-elevation-shadow-overlay-spread`. */
  colorToken: string | undefined;
  /** What that color is in this theme, e.g. `taupe 1100 at 16%`. */
  color: string;
  /** No blur: the layer is a stroke (Shape), composed into the recipe. */
  stroke: boolean;
};

export type ElevationShadow = {
  /** CSS name without the leading dashes, e.g. `elevation-shadow-overlay`. */
  name: string;
  /** The role, e.g. `overlay`. */
  role: string;
  description: string | undefined;
  figmaName: Record<Theme, string | undefined>;
  layers: Record<Theme, Layer[]>;
};

const layersOf = (entry: Entry, theme: Theme): Layer[] =>
  (Array.isArray(entry.$value) ? entry.$value : [entry.$value]).map((raw) => {
    const layer = raw as DtcgLayer;
    const blur = describeLength(layer.blur);
    return {
      inset: Boolean(layer.inset),
      offsetX: describeLength(layer.offsetX),
      offsetY: describeLength(layer.offsetY),
      blur,
      spread: describeLength(layer.spread),
      colorToken: aliasName(layer.color),
      color: describeColor(layer.color, theme),
      stroke: blur === '0',
    };
  });

export const elevationShadows: ElevationShadow[] = Object.keys(elevation.Light).map((name) => ({
  name,
  role: name.replace('elevation-shadow-', ''),
  description: elevation.Light[name].$description,
  figmaName: Object.fromEntries(THEMES.map((theme) => [theme, elevation[theme][name]?.$extensions?.['com.legacyhq']?.originalName])) as Record<Theme, string | undefined>,
  layers: Object.fromEntries(THEMES.map((theme) => [theme, layersOf(elevation[theme][name], theme)])) as Record<Theme, Layer[]>,
}));

/** Shadow color families with no elevation shadow composed from them yet. */
export const familiesWithoutRole = shadowColorFamilies
  .map(({ family }) => family)
  .filter((family) => !elevationShadows.some(({ role }) => role === family));

/** Every color token an elevation shadow composes, in either theme. */
export const composedColors = [...new Set(elevationShadows.flatMap(({ layers }) => THEMES.flatMap((theme) => layers[theme].map(({ colorToken }) => colorToken))))].filter(
  (name): name is string => Boolean(name),
);

/** The border-width token the overlay's inner ring takes from Shape, and its width. */
export const ringWidth = elevationShadows.flatMap(({ layers }) => layers.Light).find(({ stroke }) => stroke)?.spread;
const ringPrimitive = ringWidth ? aliasName(border[ringWidth]?.$value) : undefined;
export const ringWidthPx = ringPrimitive ? (primitives[ringPrimitive]?.$value as Dimension | undefined)?.value : undefined;

// --- Shadow primitives ------------------------------------------------------------------------

/** `shadow-sm-x`, `shadow-lg-blur`, ... - offsets, blur, and spread with no token or component using them. */
export const shadowPrimitives = Object.keys(primitives).filter((name) => /^shadow-/.test(name));

// --- Exceptions -------------------------------------------------------------------------------

// The page shows an exception only when elevation is missing, misclassified, or borrowed: a blurred
// shadow written with raw lengths, a shadow rebuilt from the shadow colors instead of the role, a
// shadow primitive used directly, spacing or size tokens borrowed for a shadow's geometry, or a
// reference to an elevation token that doesn't exist. Unblurred rings are strokes - Shape - and
// stay off this list.

export type Exception = { key: string; components: string[] };

/** Custom properties declared anywhere in these stylesheets. */
export const declaredProperties = (...stylesheets: string[]) =>
  new Set(stylesheets.flatMap((css) => [...css.matchAll(/(--[\w-]+)\s*:/g)].map(([, name]) => name.slice(2))));

/** Where elevation is missing, misclassified, or borrowed. `defined` holds every token CSS declares. */
export function elevationExceptions(cssByPath: Record<string, string>, defined: Set<string>): Exception[] {
  const shadows = declarationsIn(cssByPath)
    .filter(({ property }) => kindOf(property) === 'shadow')
    .map((declaration) => ({ ...declaration, layers: shadowLayers(declaration.value) }));
  const local = declaredProperties(...Object.values(cssByPath));
  const where = (test: (shadow: (typeof shadows)[number]) => boolean) => displayNames(shadows.filter(test).map(({ component }) => component));
  const found: Exception[] = [
    // Missing: blurred geometry written raw, or a reference to an elevation token nothing defines.
    { key: 'raw-blurred', components: where(({ layers }) => layers.some((layer) => layer.blurred && layer.rawLengths.length > 0)) },
    {
      key: 'missing-token',
      components: where(({ layers }) =>
        layers.some((layer) => layer.references.some((name) => /^(elevation|shadow|color-elevation-shadow)-/.test(name) && !defined.has(name) && !local.has(name))),
      ),
    },
    // Misclassified: the role rebuilt from its colors, or a shadow primitive used directly.
    { key: 'rebuilt-role', components: where(({ layers }) => layers.some((layer) => layer.references.some((name) => name.startsWith('color-elevation-shadow-')))) },
    { key: 'primitive-shadow', components: where(({ layers }) => layers.some((layer) => layer.references.some((name) => name.startsWith('shadow-')))) },
    // Borrowed: spacing or size tokens standing in for a blurred shadow's geometry.
    {
      key: 'borrowed-geometry',
      components: where(({ layers }) => layers.some((layer) => layer.blurred && layer.references.some((name) => /^(spacing|overlap|size|measurement)-/.test(name)))),
    },
  ];
  return found.filter(({ components }) => components.length > 0);
}
