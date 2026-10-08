import primitiveSource from '../../../tokens/src/primitives/primitive.json';
import dimensionSource from '../../../tokens/src/semantic/semantic-dimension.json';
import { componentsMatching, titleCase } from '../../blocks/doc-helpers';

// Everything Foundations / Spacing shows about the tokens is derived here from the DTCG source:
// the spacing and overlap scales, the sizing families, the primitive scale, and component tokens.
// The second half reads component CSS (passed in, so tests can use files read from disk) to say
// which components use each step and for what, and to find the uses the page lists as exceptions.
// Usage guidance is authored on the page; spacing.test.ts pins its factual claims.

type Dimension = { value: number; unit: string };
type Entry = { $type: string; $value: unknown; $extensions?: { 'com.legacyhq'?: { originalName?: string } } };

const primitives = (primitiveSource as unknown as { Primitive: { Value: Record<string, Entry> } }).Primitive.Value;
const semantic = (dimensionSource as unknown as Record<string, Record<string, Entry>>)['Semantic: Dimension'];
const componentSources = import.meta.glob('../../../tokens/src/component/*.json', { eager: true, import: 'default' }) as Record<
  string,
  unknown
>;

const aliasName = (value: unknown) => (typeof value === 'string' ? value.match(/^\{(?:[^.}]+\.)*([^.}]+)\}$/)?.[1] : undefined);
const resolve = (value: unknown): unknown => {
  const alias = aliasName(value);
  return alias ? resolve(primitives[alias]?.$value) : value;
};
const px = (value: unknown) => (value as Dimension | undefined)?.value;

// --- Tokens -----------------------------------------------------------------------------------

export type DimensionToken = {
  /** CSS name without the leading dashes, e.g. `spacing-sm`. */
  name: string;
  /** The last part of the name, e.g. `sm`, `075`, `control-md`. */
  step: string;
  px: number;
  /** The primitive it aliases, e.g. `measurement-8`. */
  primitive: string | undefined;
  figmaName: string | undefined;
};

const tokens: DimensionToken[] = Object.entries(semantic).map(([name, entry]) => ({
  name,
  step: name.replace(/^(spacing|overlap|size)-/, ''),
  px: px(resolve(entry.$value)) ?? NaN,
  primitive: aliasName(entry.$value),
  figmaName: entry.$extensions?.['com.legacyhq']?.originalName,
}));

const byValue = (a: DimensionToken, b: DimensionToken) => Math.abs(a.px) - Math.abs(b.px);

/** Dimension tokens have one mode; nothing changes between Light and Dark. */
export const themed = Object.keys(dimensionSource).some((collection) => /light|dark/i.test(collection));

/** The spacing scale, smallest first. */
export const spacingScale = tokens.filter(({ name }) => name.startsWith('spacing-')).sort(byValue);
/** Negative spacing for elements that deliberately stack, smallest overlap first. */
export const overlapScale = tokens.filter(({ name }) => name.startsWith('overlap-')).sort(byValue);
/** Semantic tokens that are neither spacing, overlap, nor size - should stay empty. */
export const unmatchedTokens = tokens.filter(({ name }) => !/^(spacing|overlap|size)-/.test(name)).map(({ name }) => name);

export type SizeFamily = { key: string; label: string; tokens: DimensionToken[] };

// Role families first, then the scales that belong to one component, then the generic numeric scale.
const FAMILY_LABELS: Array<[key: string, label: string, test: RegExp]> = [
  ['control', 'Control heights', /^size-control-/],
  ['choice', 'Checkbox and radio', /^size-choice-/],
  ['icon', 'Icons', /^size-icon-/],
  ['marker', 'Markers and dots', /^size-marker-/],
  ['avatar', 'Avatar', /^size-avatar-/],
  ['logo', 'Logo', /^size-logo-/],
  ['spinner', 'Spinner', /^size-spinner-/],
  ['numeric', 'Numeric scale', /^size-\d+$/],
];

export const sizeFamilies: SizeFamily[] = FAMILY_LABELS.map(([key, label, test]) => ({
  key,
  label,
  tokens: tokens.filter(({ name }) => test.test(name)),
}));

/** Size tokens that no family claims - should stay empty. */
export const unfamiliedSizes = tokens
  .filter(({ name }) => name.startsWith('size-') && !FAMILY_LABELS.some(([, , test]) => test.test(name)))
  .map(({ name }) => name);

const primitiveLengths = Object.entries(primitives)
  .filter(([name, entry]) => /^measurement-/.test(name) && entry.$type === 'dimension')
  .map(([, entry]) => px(entry.$value) ?? NaN);

export const primitiveScale = {
  positive: primitiveLengths.filter((value) => value >= 0).sort((a, b) => a - b),
  negative: primitiveLengths.filter((value) => value < 0).sort((a, b) => b - a),
};

const dimensionTokensIn = (node: unknown): number =>
  node && typeof node === 'object'
    ? '$value' in node
      ? Number((node as Entry).$type === 'dimension')
      : Object.values(node).reduce<number>((sum, child) => sum + dimensionTokensIn(child), 0)
    : 0;

/** Component token files that define dimension tokens, with how many. */
export const componentDimensionTokens = Object.entries(componentSources)
  .map(([path, source]) => ({ component: path.match(/([a-z-]+)\.json$/)?.[1] ?? path, count: dimensionTokensIn(source) }))
  .filter(({ count }) => count > 0)
  .sort((a, b) => a.component.localeCompare(b.component));

// --- How component CSS uses them --------------------------------------------------------------

export type UseKind = 'padding' | 'gap' | 'margin' | 'inset' | 'size' | 'focus-offset' | 'motion' | 'stroke' | 'shadow' | 'typography' | 'other';
export const SPACING_KINDS = ['padding', 'gap', 'margin', 'inset'] as const;

const kindOf = (property: string): UseKind =>
  /^padding/.test(property)
    ? 'padding'
    : /^(gap|row-gap|column-gap)$/.test(property)
      ? 'gap'
      : /^margin/.test(property)
        ? 'margin'
        : /^(inset|top|right|bottom|left)(-|$)/.test(property)
          ? 'inset'
          : /^(inline-size|block-size|width|height|min-|max-|flex-basis)/.test(property)
            ? 'size'
            : property === 'outline-offset'
              ? 'focus-offset'
              : /^(transform|translate)$/.test(property)
                ? 'motion'
                : /(border.*width|stroke-width|outline-width)$/.test(property)
                  ? 'stroke'
                  : /^(box-shadow|text-shadow|filter)$/.test(property)
                    ? 'shadow'
                    : /^(font-size|line-height|letter-spacing)$/.test(property)
                      ? 'typography'
                      : 'other';

type Declaration = { component: string; property: string; value: string };
export type TokenUse = { component: string; token: string; kind: UseKind; bare: boolean };

const componentName = (path: string) => path.replace(/\\/g, '/').match(/\/([a-z-]+)\.module\.css$/)?.[1];

function declarationsIn(cssByPath: Record<string, string>): Declaration[] {
  return Object.entries(cssByPath).flatMap(([path, css]) => {
    const component = componentName(path);
    if (!component || component.endsWith('-stories')) return [];
    const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
    return [...source.matchAll(/(--[\w-]+|[a-z-]+)\s*:\s*([^;{}]+);/g)].map(([, property, value]) => ({
      component,
      property,
      value: value.trim(),
    }));
  });
}

const referencedVars = (value: string) => [...value.matchAll(/var\(\s*--([\w-]+)/g)].map(([, name]) => name);
const isBare = (value: string) => /^var\(\s*--[\w-]+\s*\)$/.test(value);

/**
 * Every token reference in component CSS, attributed to the property it ends up in. A custom
 * property (`--text-field-gap: var(--spacing-075)`) counts as whatever properties consume it,
 * anywhere in the system (`gap: var(--text-field-gap)`), so a value set through a component's own
 * variable still lands in the right column. `bare` means no arithmetic on the way.
 */
export function tokenUses(cssByPath: Record<string, string>): TokenUse[] {
  const declarations = declarationsIn(cssByPath);
  const consumers = new Map<string, Array<{ property: string; bare: boolean }>>();
  for (const { property, value } of declarations) {
    for (const name of referencedVars(value)) {
      if (!consumers.has(name)) consumers.set(name, []);
      consumers.get(name)!.push({ property, bare: isBare(value) });
    }
  }
  const finalKinds = (property: string, bare: boolean, seen = new Set<string>()): Array<{ kind: UseKind; bare: boolean }> => {
    if (!property.startsWith('--')) return [{ kind: kindOf(property), bare }];
    const name = property.slice(2);
    if (seen.has(name)) return [];
    seen.add(name);
    const users = consumers.get(name) ?? [];
    if (!users.length) return [{ kind: 'other', bare }];
    return users.flatMap((user) => finalKinds(user.property, bare && user.bare, seen));
  };
  const uses = new Map<string, TokenUse>();
  for (const { component, property, value } of declarations) {
    for (const token of referencedVars(value)) {
      for (const { kind, bare } of finalKinds(property, isBare(value))) {
        const key = `${component}|${token}|${kind}|${bare}`;
        if (!uses.has(key)) uses.set(key, { component, token, kind, bare });
      }
    }
  }
  return [...uses.values()];
}

const sortedNames = (components: Iterable<string>) => [...new Set(components)].sort().map(titleCase);

/** Display names of components whose CSS references exactly this token. */
export const componentsUsingToken = (token: string, cssByPath: Record<string, string>) =>
  componentsMatching((css) => new RegExp(`var\\(\\s*--${token}\\s*[,)]`).test(css), cssByPath).map(titleCase);

/** For each token, the components that use it for each kind of spacing. */
export function spacingUsage(uses: TokenUse[], tokenNames: string[]) {
  return tokenNames.map((token) => ({
    token,
    byKind: Object.fromEntries(
      SPACING_KINDS.map((kind) => [kind, sortedNames(uses.filter((use) => use.token === token && use.kind === kind).map((use) => use.component))]),
    ) as Record<(typeof SPACING_KINDS)[number], string[]>,
  }));
}

// --- Exceptions -------------------------------------------------------------------------------

// The page shows an exception only when spacing is missing, misclassified, or borrowed for a
// non-spacing purpose. Sizing and layout debt - raw row heights, panel widths - belongs elsewhere.

export type Exception = {
  key: string;
  components: string[];
  /** Components that set the same thing with a raw length (focus-ring offsets only). */
  raw?: string[];
};

const BORROWED: Array<[kind: UseKind, key: string]> = [
  ['size', 'spacing-as-size'],
  ['focus-offset', 'spacing-as-focus-offset'],
  ['motion', 'spacing-as-motion'],
  ['stroke', 'spacing-as-stroke'],
  ['shadow', 'spacing-as-shadow'],
  ['typography', 'spacing-as-typography'],
];

/**
 * Focus-ring offsets set with a raw length. Listed by hand rather than detected, because a raw
 * length alone isn't a spacing issue; they're shown only alongside the offsets that borrow spacing
 * tokens, since both point to the same missing focus-ring offset token.
 */
export const RAW_FOCUS_RING_OFFSETS: Record<string, RegExp> = {
  'focus-ring': /--focus-ring-offset:\s*\d+px/,
  table: /outline-offset:\s*\d+px/,
};

/** Where spacing is missing, misclassified, or borrowed for a non-spacing purpose. */
export function spacingExceptions(cssByPath: Record<string, string>): Exception[] {
  const uses = tokenUses(cssByPath);
  const where = (test: (use: TokenUse) => boolean) => sortedNames(uses.filter(test).map((use) => use.component));
  const spacing = (token: string) => /^(spacing|overlap)-/.test(token);
  const spacingKind = (kind: UseKind) => (SPACING_KINDS as readonly string[]).includes(kind);
  const found: Exception[] = [
    // Missing: a spacing distance written with a primitive, because the scale lacks the step.
    { key: 'primitive-as-spacing', components: where(({ token, kind }) => /^measurement-/.test(token) && spacingKind(kind)) },
    // Misclassified: a size token doing spacing's job.
    { key: 'size-as-spacing', components: where(({ token, kind, bare }) => /^size-/.test(token) && spacingKind(kind) && bare) },
    // Borrowed: a spacing token doing something that isn't spacing. Arithmetic (calc) is exempt for sizes.
    ...BORROWED.map(([kind, key]) => ({
      key,
      components: where((use) => spacing(use.token) && use.kind === kind && (kind !== 'size' || use.bare)),
    })),
  ];
  const focus = found.find(({ key }) => key === 'spacing-as-focus-offset');
  if (focus?.components.length) {
    const sources = Object.fromEntries(
      Object.entries(cssByPath).map(([path, css]) => [componentName(path) ?? path, css.replace(/\/\*[\s\S]*?\*\//g, '')]),
    );
    focus.raw = sortedNames(Object.entries(RAW_FOCUS_RING_OFFSETS).filter(([name, pattern]) => pattern.test(sources[name] ?? '')).map(([name]) => name));
  }
  return found.filter(({ components }) => components.length > 0);
}
