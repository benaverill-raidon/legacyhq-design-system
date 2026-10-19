import { componentsMatching, titleCase } from './doc-helpers';

// How component CSS uses design tokens, property by property - shared by the Foundations pages that
// say which components use each token, and for what. Pure functions over CSS passed in by path (the
// page passes component-css's Vite glob, tests pass files read from disk).

export type UseKind =
  | 'padding'
  | 'gap'
  | 'margin'
  | 'inset'
  | 'size'
  | 'radius'
  | 'stroke'
  | 'focus-offset'
  | 'motion'
  | 'shadow'
  | 'typography'
  | 'other';

/** What a CSS property does with a length, e.g. `padding-inline` -> padding, `outline` -> stroke. */
export const kindOf = (property: string): UseKind =>
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
            : /radius$/.test(property)
              ? 'radius'
              : /(border.*width|stroke-width|outline-width)$/.test(property) ||
                  /^(border(-(top|right|bottom|left|block|inline)(-(start|end))?)?|outline)$/.test(property)
                ? 'stroke'
                : property === 'outline-offset'
                  ? 'focus-offset'
                  : /^(transform|translate)$/.test(property)
                    ? 'motion'
                    : /^(box-shadow|text-shadow|filter)$/.test(property)
                      ? 'shadow'
                      : /^(font-size|line-height|letter-spacing)$/.test(property)
                        ? 'typography'
                        : 'other';

export type Declaration = { component: string; property: string; value: string };
export type TokenUse = { component: string; token: string; kind: UseKind; bare: boolean };

/** `.../rich-text-area.module.css` -> `rich-text-area`; the stylesheet names the component. */
export const componentName = (path: string) => path.replace(/\\/g, '/').match(/\/([a-z-]+)\.module\.css$/)?.[1];

export const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Every declaration in component CSS (story-only stylesheets skipped), comments removed. */
export function declarationsIn(cssByPath: Record<string, string>): Declaration[] {
  return Object.entries(cssByPath).flatMap(([path, css]) => {
    const component = componentName(path);
    if (!component || component.endsWith('-stories')) return [];
    return [...withoutComments(css).matchAll(/(--[\w-]+|[a-z-]+)\s*:\s*([^;{}]+);/g)].map(([, property, value]) => ({
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

/** Component names as display names, sorted and de-duplicated. */
export const displayNames = (components: Iterable<string>) => [...new Set(components)].sort().map(titleCase);

/** Display names of components whose CSS references exactly this token. */
export const componentsUsingToken = (token: string, cssByPath: Record<string, string>) =>
  componentsMatching((css) => new RegExp(`var\\(\\s*--${token}\\s*[,)]`).test(css), cssByPath).map(titleCase);

// --- Shadows ----------------------------------------------------------------------------------

/** Splits `a, b(c, d)` at top-level commas, or `x calc(y z)` at top-level spaces. */
export function splitTopLevel(value: string, separator: ',' | ' ') {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (depth === 0 && (separator === ',' ? char === ',' : /\s/.test(char))) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export type ShadowLayer = {
  inset: boolean;
  /** The layer's lengths in order: x, y, then blur and spread when present. */
  lengths: string[];
  /** A non-zero blur makes the layer elevation; a layer without one is a stroke (Shape). */
  blurred: boolean;
  /** Non-zero lengths written as raw numbers rather than tokens or calc(). */
  rawLengths: string[];
  /** Custom properties the layer references, e.g. `color-elevation-shadow-overlay-spread`. */
  references: string[];
};

const isShadowLength = (part: string) =>
  /^-?(\d*\.)?\d+(px|rem|em)?$/.test(part) || /^calc\(/.test(part) || /^var\(--(border-width|spacing|size|measurement|shadow)-/.test(part);
const isRawLength = (part: string) => /^-?(\d*\.)?\d+(px|rem|em)$/.test(part) && !/^-?0+(\.0+)?(px|rem|em)$/.test(part);

/** Each layer of a box-shadow value, in order. `none` and a bare var() have no lengths. */
export const shadowLayers = (value: string): ShadowLayer[] =>
  splitTopLevel(value, ',').map((layer) => {
    const parts = splitTopLevel(layer, ' ');
    const lengths = parts.filter((part) => part !== 'inset' && isShadowLength(part));
    const blur = lengths[2];
    return {
      inset: parts.includes('inset'),
      lengths,
      blurred: blur !== undefined && !/^0(px)?$/.test(blur),
      rawLengths: lengths.filter(isRawLength),
      references: [...layer.matchAll(/var\(\s*--([\w-]+)/g)].map(([, name]) => name),
    };
  });
