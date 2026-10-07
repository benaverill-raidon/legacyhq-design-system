import primitiveSource from '../../../tokens/src/primitives/primitive.json';
import semanticDarkSource from '../../../tokens/src/semantic/semantic-color-dark.json';
import semanticLightSource from '../../../tokens/src/semantic/semantic-color-light.json';

// Everything Foundations / Color shows about tokens is derived here from the DTCG source: names,
// groups, aliases, counts, matrices, ramps, and contrast. Usage guidance is authored on the page;
// values are not. color.test.ts fails if a token stops resolving or lands in no group.

export type Mode = 'Light' | 'Dark';
export const MODES: Mode[] = ['Light', 'Dark'];

type Srgb = { colorSpace: 'srgb'; components: number[]; alpha?: number };
type Entry = { $type: string; $value: unknown; $extensions?: { 'com.legacyhq'?: { originalName?: string } } };

const primitives = (primitiveSource as unknown as { Primitive: { Value: Record<string, Entry> } }).Primitive.Value;
const semantic: Record<Mode, Record<string, Entry>> = {
  Light: (semanticLightSource as unknown as Record<string, Record<Mode, Record<string, Entry>>>)['Semantic: Color'].Light,
  Dark: (semanticDarkSource as unknown as Record<string, Record<Mode, Record<string, Entry>>>)['Semantic: Color'].Dark,
};
const componentSources = import.meta.glob('../../../tokens/src/component/*.json', { eager: true, import: 'default' }) as Record<
  string,
  unknown
>;

export const semanticNames = Object.keys(semantic.Light);
export const primitiveColorNames = Object.keys(primitives).filter((name) => primitives[name].$type === 'color');

/** Component tokens of type color, by component (exceptions to the semantic layer). */
export const componentColorTokens = Object.values(componentSources).flatMap((source) =>
  Object.entries((source as { component?: Record<string, unknown> }).component ?? {}).flatMap(([component, tree]) => {
    const names = new Set<string>();
    const walk = (node: unknown, path: string[]) => {
      if (!node || typeof node !== 'object') return;
      const entry = node as Entry;
      if (entry.$type === 'color') names.add(path.filter((part) => !MODES.includes(part as Mode)).join('.'));
      else for (const [key, child] of Object.entries(node)) if (!key.startsWith('$')) walk(child, [...path, key]);
    };
    walk(tree, []);
    return names.size ? [{ component, names: [...names] }] : [];
  }),
);

// --- Values -----------------------------------------------------------------------------------

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

export const figmaNameOf = (name: string) =>
  (semantic.Light[name] ?? primitives[name])?.$extensions?.['com.legacyhq']?.originalName;

// --- Grouping ---------------------------------------------------------------------------------

export type GroupId =
  | 'content'
  | 'border'
  | 'background-status'
  | 'background-brand'
  | 'background-neutral'
  | 'background-selected'
  | 'background-disabled'
  | 'background-autofill'
  | 'surfaces'
  | 'shadows'
  | 'accent'
  | 'data-viz';

/** Which section of the page a semantic token belongs to. Shadows are documented with Elevation. */
export function groupOf(name: string): GroupId | undefined {
  if (/^color-(content|border|background)-accent-/.test(name)) return 'accent';
  if (name.startsWith('color-content-')) return 'content';
  if (name.startsWith('color-border-')) return 'border';
  if (/^color-background-(error|warning|success|information)-/.test(name)) return 'background-status';
  if (name.startsWith('color-background-brand-')) return 'background-brand';
  if (name.startsWith('color-background-neutral-')) return 'background-neutral';
  if (name.startsWith('color-background-selected-')) return 'background-selected';
  if (name === 'color-background-disabled' || name === 'color-background-inverse-disabled') return 'background-disabled';
  if (name.startsWith('color-background-autofill-')) return 'background-autofill';
  if (name.startsWith('color-elevation-surface-')) return 'surfaces';
  if (name.startsWith('color-elevation-shadow-')) return 'shadows';
  if (name.startsWith('color-data-viz-')) return 'data-viz';
  return undefined;
}

export const tokensIn = (group: GroupId) => semanticNames.filter((name) => groupOf(name) === group);

// --- Emphasis x state matrices ----------------------------------------------------------------

export const EMPHASES = ['subtle', 'default', 'bold'] as const;
export const STATES = ['default', 'hover', 'press'] as const;
const COLUMN_ORDER = [...EMPHASES.flatMap((emphasis) => STATES.map((state) => `${emphasis}-${state}`)), 'overlay-hover', 'overlay-press'];

export type Matrix = { columns: string[]; rows: Array<{ row: string; cells: Record<string, string> }>; extras: string[] };

/**
 * Lays tokens out as rows x (emphasis-state | overlay-state) columns. `split` returns a token's row
 * and the rest of its name; anything that isn't `<emphasis>-<state>` or `overlay-<state>` is an extra.
 */
export function buildMatrix(names: string[], split: (name: string) => { row: string; rest: string } | undefined): Matrix {
  const rows = new Map<string, Record<string, string>>();
  const extras: string[] = [];
  for (const name of names) {
    const parts = split(name);
    if (!parts || !COLUMN_ORDER.includes(parts.rest)) {
      extras.push(name);
      continue;
    }
    if (!rows.has(parts.row)) rows.set(parts.row, {});
    rows.get(parts.row)![parts.rest] = name;
  }
  const used = new Set([...rows.values()].flatMap((cells) => Object.keys(cells)));
  return {
    columns: COLUMN_ORDER.filter((column) => used.has(column)),
    rows: [...rows].map(([row, cells]) => ({ row, cells })),
    extras,
  };
}

const after = (prefix: string, name: string) => (name.startsWith(prefix) ? name.slice(prefix.length) : undefined);

export const backgroundMatrices = {
  status: buildMatrix(tokensIn('background-status'), (name) => {
    const [, row, rest] = name.match(/^color-background-(error|warning|success|information)-(.+)$/) ?? [];
    return row ? { row, rest } : undefined;
  }),
  brand: buildMatrix(tokensIn('background-brand'), (name) => {
    const [, row, rest] = name.match(/^color-background-brand-(primary|secondary)-(.+)$/) ?? [];
    return row ? { row, rest } : undefined;
  }),
  neutral: buildMatrix(tokensIn('background-neutral'), (name) => {
    const rest = after('color-background-neutral-', name);
    return rest ? { row: 'neutral', rest } : undefined;
  }),
  selected: buildMatrix(tokensIn('background-selected'), (name) => {
    const rest = after('color-background-selected-', name);
    return rest ? { row: 'selected', rest } : undefined;
  }),
};

/** Accent: background matrix per hue, plus that hue's content and border colors. */
export const accent = (() => {
  const names = tokensIn('accent');
  const background = buildMatrix(
    names.filter((name) => name.startsWith('color-background-accent-')),
    (name) => {
      const [, row, rest] = name.match(/^color-background-accent-([a-z]+)-(.+)$/) ?? [];
      return row ? { row, rest } : undefined;
    },
  );
  const content = (hue: string, emphasis: string) => names.find((name) => name === `color-content-accent-${hue}-${emphasis}`);
  const border = (hue: string) => names.find((name) => name === `color-border-accent-${hue}`);
  const placed = new Set(
    background.rows.flatMap(({ row }) => [content(row, 'default'), content(row, 'bold'), border(row)]).filter(Boolean),
  );
  const extras = [
    ...background.extras,
    ...names.filter((name) => !name.startsWith('color-background-accent-') && !placed.has(name)),
  ];
  return { background, hues: background.rows.map(({ row }) => row), content, border, extras };
})();

export const surfaces = buildMatrix(tokensIn('surfaces'), (name) => {
  const rest = after('color-elevation-surface-', name);
  if (!rest) return undefined;
  const [level, state] = rest.includes('-') ? rest.split('-') : ['default', rest];
  // Surfaces have no emphasis axis; reuse the matrix with the surface level as the row.
  return { row: level, rest: `default-${state}` };
});

// --- Data visualization -----------------------------------------------------------------------

const DIVERGING_ORDER = ['negative-bold', 'negative', 'negative-subtle', 'neutral', 'positive-subtle', 'positive', 'positive-bold'];

export const dataViz = (() => {
  const names = tokensIn('data-viz');
  const sequences = new Map<string, Array<{ step: number; name: string }>>();
  const categorical = new Map<string, Record<string, string>>();
  const diverging: string[] = [];
  const unplaced: string[] = [];
  for (const name of names) {
    const sequence = name.match(/^color-data-viz-sequence-([a-z]+)-(\d+)$/);
    const category = name.match(/^color-data-viz-category-(subtle|default|bold)-([a-z]+)$/);
    const divergingStep = after('color-data-viz-diverging-', name);
    if (sequence) {
      if (!sequences.has(sequence[1])) sequences.set(sequence[1], []);
      sequences.get(sequence[1])!.push({ step: Number(sequence[2]), name });
    } else if (category) {
      if (!categorical.has(category[1])) categorical.set(category[1], {});
      categorical.get(category[1])![category[2]] = name;
    } else if (divergingStep && DIVERGING_ORDER.includes(divergingStep)) {
      diverging.push(name);
    } else {
      unplaced.push(name);
    }
  }
  diverging.sort((a, b) => DIVERGING_ORDER.indexOf(after('color-data-viz-diverging-', a)!) - DIVERGING_ORDER.indexOf(after('color-data-viz-diverging-', b)!));
  const hues = [...new Set([...categorical.values()].flatMap((row) => Object.keys(row)))];
  return {
    sequences: [...sequences].map(([family, steps]) => ({ family, steps: steps.sort((a, b) => a.step - b.step) })),
    categorical: EMPHASES.filter((emphasis) => categorical.has(emphasis)).map((emphasis) => ({ emphasis, byHue: categorical.get(emphasis)! })),
    categoricalHues: hues,
    diverging,
    unplaced,
  };
})();

// --- Primitive palettes -----------------------------------------------------------------------

const FAMILY_ORDER = ['taupe', 'prussian', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'magenta'];

export const palettes = (() => {
  const families = new Map<string, { brand: boolean; solid: Array<{ step: string; name: string }>; alpha: Array<{ step: string; name: string }> }>();
  const unplaced: string[] = [];
  for (const name of primitiveColorNames) {
    const match = name.match(/^color-(brand-)?([a-z]+)-(solid|alpha)-(.+)$/);
    if (!match) {
      unplaced.push(name);
      continue;
    }
    const [, brand, family, kind, step] = match;
    if (!families.has(family)) families.set(family, { brand: Boolean(brand), solid: [], alpha: [] });
    families.get(family)![kind as 'solid' | 'alpha'].push({ step, name });
  }
  const numeric = (step: string) => step.split('-').map(Number);
  const byStep = (a: { step: string }, b: { step: string }) => {
    const [a1, a2 = 0] = numeric(a.step);
    const [b1, b2 = 0] = numeric(b.step);
    return a1 - b1 || a2 - b2;
  };
  return {
    families: [...families]
      .sort(([a], [b]) => FAMILY_ORDER.indexOf(a) - FAMILY_ORDER.indexOf(b))
      .map(([family, { brand, solid, alpha }]) => ({ family, brand, solid: solid.sort(byStep), alpha: alpha.sort(byStep) })),
    unplaced,
  };
})();

// --- Contrast ---------------------------------------------------------------------------------

export const CONTRAST_TEXT = [
  'color-content-default',
  'color-content-subtle',
  'color-content-subtler',
  'color-content-disabled',
  'color-content-brand-primary-default',
  'color-content-selected',
  'color-content-error',
  'color-content-warning',
  'color-content-success',
  'color-content-information',
];
export const CONTRAST_SURFACES = ['color-elevation-surface-default', 'color-elevation-surface-raised-default', 'color-elevation-surface-sunken-default'];
/** Below 4.5:1 by documented intent, so not reported as gaps (see the Contrast notes). */
export const CONTRAST_LIMITED = ['color-content-subtler', 'color-content-disabled'];

const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: number[]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** WCAG contrast of a (possibly translucent) foreground over an opaque background. */
export function contrastRatio(foreground: Srgb, background: Srgb) {
  const alpha = foreground.alpha ?? 1;
  const blended = foreground.components.map((c, i) => c * alpha + background.components[i] * (1 - alpha));
  const [lighter, darker] = [luminance(blended), luminance(background.components)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastBand = 'text' | 'large' | 'low';
export const bandOf = (ratio: number): ContrastBand => (ratio >= 4.5 ? 'text' : ratio >= 3 ? 'large' : 'low');

export const contrast = CONTRAST_TEXT.map((text) => ({
  text,
  byMode: Object.fromEntries(
    MODES.map((mode) => [
      mode,
      CONTRAST_SURFACES.map((surface) => {
        const foreground = resolveColor(text, mode);
        const background = resolveColor(surface, mode);
        return { surface, ratio: foreground && background ? contrastRatio(foreground, background) : Number.NaN };
      }),
    ]),
  ) as Record<Mode, Array<{ surface: string; ratio: number }>>,
}));

export const contrastGaps = contrast.flatMap(({ text, byMode }) =>
  CONTRAST_LIMITED.includes(text)
    ? []
    : MODES.flatMap((mode) => byMode[mode].filter(({ ratio }) => ratio < 4.5).map(({ surface, ratio }) => ({ text, mode, surface, ratio }))),
);

export const ratioRange = (text: string, mode: Mode) => {
  const ratios = contrast.find((row) => row.text === text)?.byMode[mode].map(({ ratio }) => ratio) ?? [];
  return { min: Math.min(...ratios), max: Math.max(...ratios) };
};

// --- Usage ------------------------------------------------------------------------------------

/** Component folder names whose CSS references any token with this prefix. CSS is passed in. */
export function componentsUsing(prefix: string, cssByPath: Record<string, string>) {
  const users = Object.entries(cssByPath)
    .filter(([, css]) => css.includes(`var(--${prefix}`))
    .map(([path]) => path.replace(/\\/g, '/').match(/\/([a-z-]+)\/[^/]+\.module\.css$/)?.[1])
    .filter((name): name is string => Boolean(name));
  return [...new Set(users)].sort();
}
