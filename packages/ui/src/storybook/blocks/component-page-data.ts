import governance from '../../../../../docs/foundations/component-registry-governance.json';
import registry from '../../../../../docs/components/registry.json';
import { withoutComments } from './css-usage';
import { titleCase } from './doc-helpers';

// Pure data for the component Docs page standard: the sections every page has, the header's facts,
// the API table (from the TypeScript props Storybook's docgen reads), and the design tokens a
// component's own CSS uses. Shared by component-page.tsx and its tests.

/** The page's sections, in order. A page may leave out an optional one, never reorder them. */
export const COMPONENT_PAGE_SECTIONS = [
  { title: 'When to use', required: true },
  { title: 'Anatomy', required: true },
  { title: 'Variants', required: false },
  { title: 'Behavior', required: false },
  { title: "Do and don't", required: true },
  { title: 'Accessibility', required: true },
  { title: 'API', required: true },
  { title: 'Design tokens', required: true },
  { title: 'Related components', required: true },
] as const;

export type ComponentPageSection = (typeof COMPONENT_PAGE_SECTIONS)[number]['title'];

// --- Header facts ----------------------------------------------------------------------------

type FigmaSource = {
  componentName?: string;
  componentSetName?: string;
  variantCount?: number;
  verifiedAt?: string;
  variantComponents?: Array<{ componentName: string }>;
  subComponents?: Array<{ componentName: string }>;
};

export type RegistryEntry = {
  id: string;
  name: string;
  tier: string;
  category: string;
  anatomy?: Array<{ name: string; description?: string }>;
  figmaSource?: FigmaSource | null;
};

export const registryEntry = (id: string): RegistryEntry => {
  const entry = (registry as RegistryEntry[]).find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`No component "${id}" in docs/components/registry.json`);
  return entry;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2026-09-01` -> `Sep 1, 2026`, read from the string so no time zone can move the day. */
export function formatDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

/** Where the component lives in Figma, as text: `button, 176 variants, checked Sep 1, 2026`. */
export function figmaFact(source: FigmaSource | null | undefined) {
  if (!source) return null;
  const names = source.variantComponents ?? source.subComponents;
  const name = names ? names.map((part) => part.componentName).join(' + ') : (source.componentName ?? source.componentSetName);
  if (!name) return null;
  const variants = !names && source.variantCount ? `, ${source.variantCount} variants` : '';
  const checked = source.verifiedAt ? `, checked ${formatDate(source.verifiedAt)}` : '';
  return `${name}${variants}${checked}`;
}

const groupLabel = (category: string) =>
  governance.classification.storybook.componentGroups.find((group) => group.category === category)?.label ?? titleCase(category);

/** The header's facts line: category, tier, and Figma source. Status stays off until it means something. */
export function headerFacts(entry: RegistryEntry) {
  const figma = figmaFact(entry.figmaSource);
  return [groupLabel(entry.category), titleCase(entry.tier), ...(figma ? [`Figma: ${figma}`] : [])];
}

// --- API -------------------------------------------------------------------------------------

/** The shape of one prop in the `__docgenInfo` Storybook's react-docgen plugin attaches. */
export type DocgenProp = {
  required?: boolean;
  description?: string;
  defaultValue?: { value: string };
  tsType?: { name: string; raw?: string };
};

export type DocgenInfo = { props?: Record<string, DocgenProp> };

export type PropRow = {
  name: string;
  type: string | null;
  defaultValue: string | null;
  required: boolean;
  description: string;
  deprecated: string | null;
};

/** Props every component forwards and the page notes once, instead of a row each. */
const PASSTHROUGH = new Set(['className', 'style']);

const typeOf = (prop: DocgenProp) => (prop.tsType ? (prop.tsType.raw ?? prop.tsType.name) : null);

/** Splits `@deprecated reason` (and any other tag) off a JSDoc description. */
export function splitDescription(description = '') {
  const deprecated = description.match(/@deprecated\b\s*([\s\S]*?)(?=\n\s*@\w|$)/);
  const text = description.replace(/@\w+\b[\s\S]*$/, '').trim();
  return { text, deprecated: deprecated ? deprecated[1].trim() || 'Deprecated.' : null };
}

/** The API table's rows, in declaration order: current props, then deprecated ones. */
export function propRows(info: DocgenInfo | undefined) {
  const rows: PropRow[] = Object.entries(info?.props ?? {})
    .filter(([name]) => !PASSTHROUGH.has(name))
    .map(([name, prop]) => {
      const { text, deprecated } = splitDescription(prop.description);
      return {
        name,
        type: typeOf(prop),
        defaultValue: prop.defaultValue?.value ?? null,
        required: Boolean(prop.required),
        description: text,
        deprecated,
      };
    });
  return { current: rows.filter((row) => !row.deprecated), deprecated: rows.filter((row) => row.deprecated) };
}

// --- Design tokens ---------------------------------------------------------------------------

export type TokenFamily = 'Color' | 'Typography' | 'Spacing' | 'Size' | 'Radius' | 'Border width' | 'Motion' | 'Elevation' | 'Component' | 'Other';

export const TOKEN_FAMILIES: TokenFamily[] = ['Color', 'Typography', 'Spacing', 'Size', 'Radius', 'Border width', 'Motion', 'Elevation', 'Component', 'Other'];

export const familyOf = (token: string): TokenFamily =>
  token.startsWith('color-')
    ? 'Color'
    : token.startsWith('typography-')
      ? 'Typography'
      : token.startsWith('spacing-') || token.startsWith('overlap-')
        ? 'Spacing'
        : token.startsWith('size-')
          ? 'Size'
          : token.startsWith('border-radius-')
            ? 'Radius'
            : token.startsWith('border-width-')
              ? 'Border width'
              : /^(fade|move|spin|pulse)-/.test(token)
                ? 'Motion'
                : token.startsWith('elevation-')
                  ? 'Elevation'
                  : token.startsWith('component-')
                    ? 'Component'
                    : 'Other';

/** The condition of a rule on the root class alone. */
export const BASE = 'base';

/** States a selector puts the component in, as page words. Order is the order they're listed. */
const STATES: Array<[RegExp, string]> = [
  [/:hover|\[data-force-state='hover'\]/, 'hover'],
  [/:focus-visible|:focus-within|\[data-force-state='focus'\]/, 'focus'],
  [/:active|\[data-force-state='press'\]/, 'pressed'],
  [/\[data-expanded='true'\]/, 'expanded'],
  [/\[data-loading='true'\]/, 'loading'],
  [/\[data-invalid='true'\]/, 'invalid'],
  [/:disabled|\[data-disabled='true'\]|\[aria-disabled='true'\]/, 'disabled'],
];

/** Removes `:not(...)` so what a selector excludes doesn't read as a state it's in. */
const withoutNot = (selector: string) => {
  let out = '';
  for (let index = 0; index < selector.length; index++) {
    if (selector.startsWith(':not(', index)) {
      let depth = 0;
      for (index += 4; index < selector.length; index++) {
        if (selector[index] === '(') depth++;
        else if (selector[index] === ')' && --depth === 0) break;
      }
      continue;
    }
    out += selector[index];
  }
  return out;
};

/** Splits a selector list at its top-level commas (commas inside `:is(...)` stay). */
const selectorList = (selectors: string) => {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of selectors) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += char;
  }
  return [...parts, current.trim()].filter(Boolean);
};

/**
 * When a rule applies, in page words: `.prominence_secondary.tone_error:hover` -> `secondary · error
 * · hover`. Modifier classes are `axis_value`; other classes name a mode (`.inverse`); the root class
 * says nothing. A disabled rule reads as just disabled, since disabled wins over hover and press.
 */
export function whenOf(selector: string, rootClass: string) {
  const plain = withoutNot(selector).replace(/:global\([^)]*\)/g, '');
  const classes = [...plain.matchAll(/\.([A-Za-z][\w-]*)/g)].map(([, name]) => name).filter((name) => name !== rootClass);
  const words = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  const values = [...new Set(classes.map((name) => (name.includes('_') ? name.split('_').slice(1).join(' ') : words(name))))];
  const states = STATES.filter(([pattern]) => pattern.test(plain)).map(([, label]) => label);
  const shown = states.includes('disabled') ? ['disabled'] : states;
  return [...values, ...(shown.length ? [shown.join(' / ')] : [])].join(' · ') || BASE;
}

const partsOf = (condition: string) => (condition === BASE ? [] : condition.split(' · '));

/**
 * Drops a condition another one already covers: `secondary · error · disabled` goes when `secondary ·
 * disabled` is listed, and everything goes when `base` is, since a token that applies more broadly
 * applies in the narrower case too.
 */
export function broadest(conditions: string[]) {
  return conditions.filter(
    (condition) =>
      !conditions.some((other) => other !== condition && partsOf(other).every((part) => partsOf(condition).includes(part))),
  );
}

/** The first class a stylesheet styles, which is its root element's (`.button`, `.root`). */
export const rootClassOf = (css: string) => withoutComments(css).match(/^\s*\.([A-Za-z][\w-]*)/m)?.[1] ?? '';

export type TokenRow = { family: TokenFamily; token: string; property: string; when: string[] };

const typographyRole = (token: string) => token.match(/^(typography-[a-z]+-[a-z0-9]+)-/)?.[1];

/**
 * The tokens a component's CSS uses, one row per token and property, with when each applies. A
 * component's own custom property counts as the properties that read it in the same stylesheet
 * (`--button-border-radius` -> border-radius); one read elsewhere keeps its own name. A type role's
 * font properties collapse into one `font` row.
 */
export function tokenRows(css: string, rootClass: string): TokenRow[] {
  const rules = [...withoutComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, body]) => ({
    selectors: selectors.trim(),
    declarations: [...body.matchAll(/(--[\w-]+|[a-z-]+)\s*:\s*([^;]+);/g)].map(([, property, value]) => ({ property, value })),
  }));
  const readersOf = (custom: string) =>
    [...new Set(rules.flatMap(({ declarations }) => declarations.filter(({ value }) => new RegExp(`var\\(\\s*${custom}\\b`).test(value)).map(({ property }) => property)))];

  // The stylesheet's own custom properties aren't tokens: they're followed to what reads them.
  const declared = new Set(rules.flatMap(({ declarations }) => declarations.map(({ property }) => property).filter((property) => property.startsWith('--'))));
  const rows = new Map<string, TokenRow>();
  for (const { selectors, declarations } of rules) {
    if (selectors.startsWith('@') || /^(from|to|\d+%)$/.test(selectors)) continue;
    const when = selectorList(selectors).map((selector) => whenOf(selector, rootClass));
    for (const { property, value } of declarations) {
      for (const [, token] of value.matchAll(/var\(\s*--([\w-]+)/g)) {
        if (declared.has(`--${token}`)) continue;
        const role = typographyRole(token);
        const properties = role ? ['font'] : property.startsWith('--') ? readersOf(property).filter((reader) => !reader.startsWith('--')) : [property];
        for (const used of properties.length ? properties : [property]) {
          const name = role ? `${role}-*` : token;
          const key = `${name}|${used}`;
          const row = rows.get(key) ?? { family: familyOf(token), token: name, property: used, when: [] };
          for (const condition of when) if (!row.when.includes(condition)) row.when.push(condition);
          rows.set(key, row);
        }
      }
    }
  }
  return [...rows.values()]
    .map((row) => ({ ...row, when: broadest(row.when) }))
    .sort((a, b) => TOKEN_FAMILIES.indexOf(a.family) - TOKEN_FAMILIES.indexOf(b.family));
}
