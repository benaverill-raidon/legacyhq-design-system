import iconContract from '../../../../../../docs/components/primitives/icon/icon.contract.json';
import iconMetadata from '../../../assets/icons/metadata/icons.json';
import primitiveSource from '../../../tokens/src/primitives/primitive.json';
import dimensionSource from '../../../tokens/src/semantic/semantic-dimension.json';
import { contrastRatio, MODES, resolveColor } from '../../blocks/color-values';
import type { Mode } from '../../blocks/color-values';
import { titleCase } from '../../blocks/doc-helpers';

// Everything Foundations / Icons shows about the icon set is derived here: the icons and their
// categories from the generated metadata, sizes and colors from Icon's own CSS and the DTCG source,
// the props from Icon's contract, and - from source passed in, so tests can read it from disk - the
// glyph grid, identical glyphs, which components use which icons, and the icon exceptions. Guidance
// is authored on the page; icons.test.ts pins its factual claims.

type Entry = { $type?: string; $value?: unknown };
type Dimension = { value: number; unit: string };

const primitives = (primitiveSource as unknown as { Primitive: { Value: Record<string, Entry> } }).Primitive.Value;
const dimensions = (dimensionSource as unknown as Record<string, Record<string, Entry>>)['Semantic: Dimension'];

/** A dimension token's value in px, following aliases. */
export function pxOf(name: string): number | undefined {
  let value = (dimensions[name] ?? primitives[name])?.$value;
  for (let depth = 0; typeof value === 'string' && depth < 10; depth++) {
    const target = value.match(/^\{(.+)\}$/)?.[1]?.split('.').pop();
    value = target ? (dimensions[target] ?? primitives[target])?.$value : undefined;
  }
  return (value as Dimension | undefined)?.value;
}

// --- The set ----------------------------------------------------------------------------------

export type IconCategory = 'multi-purpose' | 'single-purpose';
export type IconEntry = { name: string; component: string; category: IconCategory; keywords: string[]; label: string };

/** Every icon, by name: `archive` before `archive-remove`. */
export const icons = (iconMetadata as IconEntry[]).slice().sort((a, b) => a.name.localeCompare(b.name));
/** Multi-purpose first: they're the ones most screens need. */
export const CATEGORIES: IconCategory[] = ['multi-purpose', 'single-purpose'];
export const iconsIn = (category: IconCategory) => icons.filter((icon) => icon.category === category);

/** Icons whose name or keywords contain every word of the query. */
export function searchIcons(query: string, list: IconEntry[] = icons) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return list;
  return list.filter((icon) => words.every((word) => icon.name.includes(word) || icon.keywords.some((keyword) => keyword.includes(word))));
}

/**
 * Look-alikes: one glyph under two names, because a single-purpose icon reuses a multi-purpose
 * glyph for its own job (or Figma drew them the same). Authored; icons.test.ts checks they exist.
 */
export const LOOK_ALIKES: Array<[a: string, b: string]> = [
  ['check', 'status-success'],
  ['expand-less', 'priority-high'],
  ['expand-more', 'priority-low'],
  ['task-not-started', 'priority-trivial'],
  ['cancel', 'problem'],
];

/** Third-party and product marks in the set. They render in one color like every icon. */
export const BRAND_MARKS = ['counselpro-logo', 'figma', 'figma-component', 'google', 'microsoft'];

/** The viewBox sizes the source SVGs are drawn on, e.g. [16]. */
export const gridsOf = (svgs: string[]) =>
  [...new Set(svgs.map((svg) => Number(svg.match(/viewBox="0 0 (\d+) \1"/)?.[1] ?? Number.NaN)))].sort((a, b) => a - b);

/** Icons drawn with exactly the same paths - one glyph under two names. */
export function identicalGlyphs(svgByName: Record<string, string>) {
  const byPaths = new Map<string, string[]>();
  for (const [name, svg] of Object.entries(svgByName)) {
    const paths = [...svg.matchAll(/\sd="([^"]+)"/g)].map(([, d]) => d.replace(/\s+/g, ' ').trim()).join('|');
    byPaths.set(paths, [...(byPaths.get(paths) ?? []), name]);
  }
  return [...byPaths.values()].filter((names) => names.length > 1).map((names) => names.sort());
}

// --- Size -------------------------------------------------------------------------------------

export type IconSizeStep = { name: string; token: string; px: number | undefined };

/** Icon's sizes, read from its CSS (`.size_md { --icon-size: var(--size-icon-md) }`), largest first. */
export const sizesIn = (iconCss: string): IconSizeStep[] =>
  [...iconCss.matchAll(/\.size_(\w+)\s*\{\s*--icon-size:\s*var\(--([\w-]+)\)/g)]
    .map(([, name, token]) => ({ name, token, px: pxOf(token) }))
    .sort((a, b) => (b.px ?? 0) - (a.px ?? 0));

/** The box `spacing="spacious"` puts an icon in. */
export const spaciousBoxIn = (iconCss: string) => {
  const token = iconCss.match(/\.spacing_spacious\s*\{\s*--icon-container-size:\s*var\(--([\w-]+)\)/)?.[1];
  return token ? { token, px: pxOf(token) } : undefined;
};

/** Control heights, xs to lg - the containers an icon sits in, not the icon. */
export const controlHeights = ['xs', 'sm', 'md', 'lg'].map((size) => ({ size, token: `size-control-${size}`, px: pxOf(`size-control-${size}`) }));

// --- Color ------------------------------------------------------------------------------------

export type IconColorOption = { name: string; token: string | undefined };

/** Icon's color options, read from its CSS: `inherit` (no token) and one content token each. */
export const colorsIn = (iconCss: string): IconColorOption[] =>
  [...iconCss.matchAll(/\.color_(\w+)\s*\{\s*color:\s*([^;]+);/g)].map(([, name, value]) => ({ name, token: value.match(/var\(--([\w-]+)\)/)?.[1] }));

export const CONTRAST_SURFACES = ['color-elevation-surface-default', 'color-elevation-surface-raised-default'];
/** Inverse is for dark or bold surfaces, so it's measured on the brand bold background instead. */
export const INVERSE_SURFACES = ['color-background-brand-primary-bold-default'];

/** The lowest contrast a color reaches over these surfaces, per mode. */
export function lowestContrast(token: string, surfaces: string[] = CONTRAST_SURFACES): Record<Mode, number> {
  return Object.fromEntries(
    MODES.map((mode) => {
      const foreground = resolveColor(token, mode);
      const ratios = surfaces.map((surface) => {
        const background = resolveColor(surface, mode);
        return foreground && background ? contrastRatio(foreground, background) : Number.NaN;
      });
      return [mode, Math.min(...ratios)];
    }),
  ) as Record<Mode, number>;
}

// --- API --------------------------------------------------------------------------------------

type ContractProp = { type: string; default?: unknown; enum?: string[]; description?: string };

/** Icon's props from its contract, in order. */
export const iconProps = Object.entries((iconContract as unknown as { props: Record<string, ContractProp> }).props).map(([name, prop]) => ({
  name,
  type: prop.enum ? prop.enum.map((value) => `'${value}'`).join(' | ') : prop.type,
  default: prop.default === null || prop.default === undefined ? undefined : String(prop.default),
  description: prop.description,
}));

// --- Usage in components ----------------------------------------------------------------------

/** `.../atoms/avatar/avatar-presence-busy.tsx` -> `avatar`: the folder names the component. */
const componentOf = (path: string) => path.replace(/\\/g, '/').match(/\/components\/[a-z]+\/([a-z-]+)\//)?.[1];
const isSource = (path: string) => /\.tsx$/.test(path) && !/(stories|test)\.tsx$/i.test(path) && !/\/assets\//.test(path.replace(/\\/g, '/'));

/** Component source files only: no stories, tests, or generated icons. */
const sourcesOf = (tsxByPath: Record<string, string>) =>
  Object.entries(tsxByPath)
    .filter(([path]) => isSource(path))
    .map(([path, source]) => ({ component: componentOf(path), source }))
    .filter((file): file is { component: string; source: string } => Boolean(file.component));

/** Which components import each library icon: `{ CloseIcon: ['Menu', 'Table', ...] }`. */
export function iconUsage(tsxByPath: Record<string, string>) {
  const known = new Set(icons.map(({ component }) => component));
  const usage = new Map<string, Set<string>>();
  for (const { component, source } of sourcesOf(tsxByPath)) {
    for (const [, names] of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'[^']*assets\/icons'/g)) {
      for (const name of names.split(',').map((part) => part.trim()).filter((part) => known.has(part))) {
        usage.set(name, new Set([...(usage.get(name) ?? []), titleCase(component)]));
      }
    }
  }
  return Object.fromEntries([...usage].map(([name, users]) => [name, [...users].sort()])) as Record<string, string[]>;
}

/** Components that render library icons. */
export const iconUsers = (tsxByPath: Record<string, string>) => [...new Set(Object.values(iconUsage(tsxByPath)).flat())].sort();

/**
 * Icons a component renders at a fixed size other than the default: `[{ component, icon }]`. An icon
 * named directly (`<CloseIcon size="sm" />`) is read from the tag. One picked from a lookup
 * (`<status.Icon size="sm" />`, Field's status icon) is read from the lookup's entries, the icons
 * assigned to that property in the same file (`Icon: StatusErrorIcon`).
 */
export function fixedSizes(tsxByPath: Record<string, string>, size: string) {
  return sourcesOf(tsxByPath).flatMap(({ component, source }) =>
    [...source.matchAll(new RegExp(`<(?:\\w+\\.(\\w+)|(\\w+Icon))\\b[^>]*\\bsize="${size}"`, 'g'))].flatMap(([, property, icon]) => {
      const names = icon ? [icon] : [...source.matchAll(new RegExp(`\\b${property}:\\s*(\\w+Icon)\\b`, 'g'))].map(([, name]) => name);
      return [...new Set(names)].map((name) => ({ component: titleCase(component), icon: name }));
    }),
  );
}

// --- Exceptions -------------------------------------------------------------------------------

// SVGs in component source that aren't icons, or are a documented exception, and don't belong on
// the exceptions list: Icon draws every glyph; Spinner, Progress Bar, and Logo are graphics; Avatar's
// presence and status badges are two-tone, badge-sized glyphs.
export const OWN_GRAPHICS = ['icon', 'spinner', 'progress-bar', 'logo', 'avatar'];

/** The opening tag starting at `index`, braces and quotes respected: `<IconButton a={b > c}>`. */
function openingTag(source: string, index: number) {
  let depth = 0;
  let quote: string | undefined;
  for (let i = index; i < source.length; i++) {
    const char = source[i];
    if (quote) {
      if (char === quote) quote = undefined;
    } else if (char === '"' || char === "'" || char === '`') quote = char;
    else if (char === '{') depth++;
    else if (char === '}') depth--;
    else if (char === '>' && depth === 0) return source.slice(index, i + 1);
  }
  return source.slice(index);
}

export type Exception = { key: string; components: string[] };

/**
 * Where icons are drawn outside the library, given a fixed color, or used as an unnamed control.
 * Read from component source; stories and tests are skipped.
 */
export function iconExceptions(tsxByPath: Record<string, string>): Exception[] {
  const files = sourcesOf(tsxByPath);
  const where = (test: (source: string) => boolean, ignore: string[] = []) =>
    [...new Set(files.filter(({ component, source }) => !ignore.includes(component) && test(source)).map(({ component }) => titleCase(component)))].sort();
  const found: Exception[] = [
    // A glyph drawn by hand instead of taken from the library.
    { key: 'raw-glyph', components: where((source) => /<svg\b/.test(source), OWN_GRAPHICS) },
    // An icon given a fixed color instead of inheriting one or using the color prop.
    { key: 'fixed-color', components: where((source) => /<\w+Icon\b[^>]*\b(style=\{\{[^}]*\b(color|fill)\b|fill=")/.test(source)) },
    // An icon-only control with no accessible name.
    {
      key: 'unnamed-control',
      components: where((source) =>
        [...source.matchAll(/<(Toggle)?IconButton\b/g)].some(({ index }) => !/aria-label(ledby)?=|\{\.\.\./.test(openingTag(source, index!))),
      ),
    },
  ];
  return found.filter(({ components }) => components.length > 0);
}
