import recipeSource from '../../../tokens/css-recipes.json';
import primitiveSource from '../../../tokens/src/primitives/primitive.json';
import typographySource from '../../../tokens/src/semantic/semantic-typography.json';
import { titleCase } from '../../blocks/doc-helpers';

// Everything Foundations / Typography shows about the tokens is derived here from the DTCG source and
// CSS recipes: roles, values, aliases, counts, the scale, and casing. Usage guidance is authored on
// the page. typography.test.ts fails if a token stops resolving or lands outside a role.

type Dimension = { value: number; unit: string };
type Entry = { $type: string; $value: unknown };

const primitives = (primitiveSource as unknown as { Primitive: { Value: Record<string, Entry> } }).Primitive.Value;
const semanticRoot = (typographySource as unknown as Record<string, Record<string, Entry>>)['Semantic: Typography'];
const recipes = (recipeSource as { declarations: Array<{ name: string; value: { kind: string; target?: string; value?: string } }> })
  .declarations;
const componentSources = import.meta.glob('../../../tokens/src/component/*.json', { eager: true, import: 'default' }) as Record<
  string,
  unknown
>;

/** Interface groups: the product's own text. */
export const GROUPS = ['display', 'heading', 'body'] as const;
export type Group = (typeof GROUPS)[number];
/** Document groups: text inside a legal document being edited or generated, never the interface around it. */
export const DOCUMENT_GROUPS = ['title', 'heading', 'body', 'meta'] as const;
export type DocumentGroup = (typeof DOCUMENT_GROUPS)[number];
export type Classification = 'interface' | 'document';
export const PROPERTIES = ['font-family', 'font-weight', 'font-size', 'line-height', 'letter-spacing', 'paragraph-spacing'] as const;
export type Property = (typeof PROPERTIES)[number];

const WEIGHT_NAMES: Record<number, string> = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };
export const weightName = (weight: number) => WEIGHT_NAMES[weight] ?? String(weight);

const aliasName = (value: unknown) => (typeof value === 'string' ? value.match(/^\{(?:[^.}]+\.)*([^.}]+)\}$/)?.[1] : undefined);
const resolve = (value: unknown): unknown => {
  const alias = aliasName(value);
  return alias ? resolve(primitives[alias]?.$value) : value;
};
/** A family stack's first entry, e.g. `Times New Roman` from its fallbacks. */
const familyName = (value: unknown) => String(Array.isArray(value) ? value[0] : value);
const px = (value: unknown) => (value as Dimension | undefined)?.value;

// --- Roles ------------------------------------------------------------------------------------

export type Role = {
  /** e.g. `heading-sm` or `document-title` - the middle of every token name for this role. */
  name: string;
  classification: Classification;
  group: Group | DocumentGroup;
  /** Empty for document roles that have a single size, such as `document-title`. */
  size: string;
  family: string;
  weight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  paragraphSpacing: number;
  /** The primitive each property points to, e.g. `font-size` -> `typography-font-size-16`. */
  aliases: Record<Property, string | undefined>;
};

type Parsed = Partial<Record<Property, unknown>> & {
  classification: Classification;
  group: Group | DocumentGroup;
  size: string;
  aliases: Partial<Record<Property, string>>;
};
const parsed = new Map<string, Parsed>();
export const unmatchedTokens: string[] = [];
for (const [name, entry] of Object.entries(semanticRoot)) {
  const match = name.match(
    /^typography-(document-)?([a-z]+?)(?:-(xxs|xs|sm|md|lg|xl|xxl))?-(font-family|font-weight|font-size|line-height|letter-spacing|paragraph-spacing)$/,
  );
  const [, documentPrefix, group, size = '', property] = (match ?? []) as unknown as [string, string | undefined, string, string, Property];
  const classification: Classification = documentPrefix ? 'document' : 'interface';
  const known =
    classification === 'document' ? (DOCUMENT_GROUPS as readonly string[]).includes(group) : (GROUPS as readonly string[]).includes(group) && size;
  if (!match || !known) {
    unmatchedTokens.push(name);
    continue;
  }
  const role = [documentPrefix && 'document', group, size].filter(Boolean).join('-');
  if (!parsed.has(role)) parsed.set(role, { classification, group: group as Group | DocumentGroup, size, aliases: {} });
  const target = parsed.get(role)!;
  target[property] = resolve(entry.$value);
  target.aliases[property] = aliasName(entry.$value);
}

const allParsed: Role[] = [...parsed].map(([name, role]) => ({
  name,
  classification: role.classification,
  group: role.group,
  size: role.size,
  family: familyName(role['font-family']),
  weight: Number(role['font-weight']),
  fontSize: px(role['font-size'])!,
  lineHeight: px(role['line-height'])!,
  letterSpacing: px(role['letter-spacing'])!,
  paragraphSpacing: px(role['paragraph-spacing'])!,
  aliases: Object.fromEntries(PROPERTIES.map((property) => [property, role.aliases[property]])) as Role['aliases'],
  }));

/** Interface roles, by group, largest first. */
export const roles: Role[] = allParsed
  .filter(({ classification }) => classification === 'interface')
  .sort((a, b) => GROUPS.indexOf(a.group as Group) - GROUPS.indexOf(b.group as Group) || b.fontSize - a.fontSize);
/** Document roles, in reading order: title, headings, body, then page furniture. */
export const documentRoles: Role[] = allParsed
  .filter(({ classification }) => classification === 'document')
  .sort(
    (a, b) =>
      DOCUMENT_GROUPS.indexOf(a.group as DocumentGroup) - DOCUMENT_GROUPS.indexOf(b.group as DocumentGroup) || b.fontSize - a.fontSize,
  );
export const allRoles = [...roles, ...documentRoles];

export const rolesIn = (group: Group) => roles.filter((role) => role.group === group);

/** The Figma text style for a role, e.g. `heading-sm` -> `Heading/SM`, `document-title` -> `Document/Title`. */
export const figmaStyleOf = (role: Role) =>
  [role.classification === 'document' && 'Document', titleCase(role.group), role.size.toUpperCase()].filter(Boolean).join('/');

/** A group's family and weight, if every role in it shares them. */
export function groupFace(group: Group | 'document') {
  const members = group === 'document' ? documentRoles : rolesIn(group);
  const families = new Set(members.map(({ family }) => family));
  const weights = new Set(members.map(({ weight }) => weight));
  return families.size === 1 && weights.size === 1 ? { family: members[0].family, weight: members[0].weight } : undefined;
}

// --- Primitives, tiers, themes ----------------------------------------------------------------

const primitiveTypography = Object.entries(primitives).filter(([name]) => name.startsWith('typography-'));
const ofKind = (kind: string) => primitiveTypography.filter(([name]) => name.startsWith(`typography-${kind}-`));

export const primitiveScale = {
  families: ofKind('font-family').map(([, entry]) => familyName(entry.$value)),
  sizes: ofKind('font-size').map(([, entry]) => px(entry.$value)!).sort((a, b) => b - a),
  weights: ofKind('font-weight').map(([, entry]) => Number(entry.$value)).sort((a, b) => a - b),
  lineHeights: ofKind('line-height').map(([, entry]) => px(entry.$value)!),
  letterSpacings: ofKind('letter-spacing').map(([, entry]) => px(entry.$value)!),
  paragraphSpacings: ofKind('paragraph-spacing').map(([, entry]) => px(entry.$value)!),
  /** Every font size is a pixel dimension. */
  allSizesInPx: ofKind('font-size').every(([, entry]) => (entry.$value as Dimension).unit === 'px'),
};
export const primitiveCount = primitiveTypography.length;
export const semanticTokenCount = Object.keys(semanticRoot).length;

/** Typography collections with Light/Dark modes nest tokens under mode names; this one doesn't. */
export const themed = Object.values(semanticRoot).some((entry) => !('$value' in entry));

/** Component-level typography tokens (font family/weight types, or font/line/letter dimensions). */
export const componentTypographyTokens = Object.values(componentSources).flatMap((source) => {
  const found: string[] = [];
  const walk = (node: unknown, path: string[]) => {
    if (!node || typeof node !== 'object') return;
    const entry = node as Entry;
    if (entry.$type) {
      if (['fontFamily', 'fontWeight'].includes(entry.$type) || /font|line-height|letter-spacing|typography/.test(path.join('.'))) found.push(path.join('.'));
      return;
    }
    for (const [key, child] of Object.entries(node)) if (!key.startsWith('$')) walk(child, [...path, key]);
  };
  walk(source, []);
  return found;
});

// --- Letter spacing and casing (code-only) ----------------------------------------------------

const letterSpacings = new Set(allRoles.map(({ letterSpacing }) => letterSpacing));
/** The single letter-spacing value every role uses, or undefined if roles differ. */
export const uniformLetterSpacing = letterSpacings.size === 1 ? [...letterSpacings][0] : undefined;

/** Per-role casing recipes (`typography-<role>-text-transform`) and the keyword each resolves to. */
export const casing = allRoles.map((role) => {
  const recipe = recipes.find(({ name }) => name === `typography-${role.name}-text-transform`);
  const target = recipe?.value.kind === 'alias' ? recipes.find(({ name }) => name === recipe.value.target) : recipe;
  return { role: role.name, value: target?.value.kind === 'keyword' ? target.value.value : undefined };
});
export const uniformCasing = new Set(casing.map(({ value }) => value)).size === 1 ? casing[0]?.value : undefined;

// --- Scale --------------------------------------------------------------------------------------

/** Every primitive size, largest first, with the roles at that size in each group. */
export const scale = primitiveScale.sizes.map((size) => ({
  size,
  byGroup: Object.fromEntries(GROUPS.map((group) => [group, rolesIn(group).filter(({ fontSize }) => fontSize === size)])) as Record<
    Group,
    Role[]
  >,
}));

const sizesWhere = (test: (row: (typeof scale)[number]) => boolean) => scale.filter(test).map(({ size }) => size);
/** Sizes with both a heading and a body role. */
export const pairedSizes = sizesWhere(({ byGroup }) => byGroup.heading.length > 0 && byGroup.body.length > 0);
/** Sizes where display overlaps a heading role, and sizes only display reaches. */
export const displayOverlapSizes = sizesWhere(({ byGroup }) => byGroup.display.length > 0 && byGroup.heading.length > 0);
export const displayOnlySizes = sizesWhere(
  ({ byGroup }) => byGroup.display.length > 0 && byGroup.heading.length === 0 && byGroup.body.length === 0,
);
export const smallestSize = Math.min(...allRoles.map(({ fontSize }) => fontSize));
export const rolesAtSmallestSize = allRoles.filter(({ fontSize }) => fontSize === smallestSize);
