import primitiveSource from '../../../tokens/src/primitives/primitive.json';
import borderSource from '../../../tokens/src/semantic/semantic-border.json';
import { declarationsIn, displayNames, kindOf, shadowLayers, tokenUses } from '../../blocks/css-usage';
import type { ShadowLayer, TokenUse } from '../../blocks/css-usage';

// Everything Foundations / Radius shows about the tokens is derived here from the DTCG source: the
// radius and border-width scales, their primitives, and whether any component defines its own
// shape tokens. The second half reads component CSS (passed in, so tests can use files read from
// disk) to find shape usage the page lists as exceptions. Guidance is authored on the page;
// radius.test.ts pins its factual claims.

type Dimension = { value: number; unit: string };
type Entry = { $type: string; $value: unknown; $extensions?: { 'com.legacyhq'?: { originalName?: string } } };

const primitives = (primitiveSource as unknown as { Primitive: { Value: Record<string, Entry> } }).Primitive.Value;
const semantic = (borderSource as unknown as Record<string, Record<string, Entry>>)['Semantic: Border'];
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

export type ShapeToken = {
  /** CSS name without the leading dashes, e.g. `border-radius-lg`. */
  name: string;
  /** The last part of the name, e.g. `lg`, `full-round`. */
  step: string;
  px: number;
  primitive: string | undefined;
  figmaName: string | undefined;
};

const tokens: ShapeToken[] = Object.entries(semantic).map(([name, entry]) => ({
  name,
  step: name.replace(/^border-(radius|width)-/, ''),
  px: px(resolve(entry.$value)) ?? NaN,
  primitive: aliasName(entry.$value),
  figmaName: entry.$extensions?.['com.legacyhq']?.originalName,
}));

const byValue = (a: ShapeToken, b: ShapeToken) => a.px - b.px;

/** Corner radius steps, smallest first; `full-round` (a pill) comes last. */
export const radiusScale = tokens.filter(({ name }) => name.startsWith('border-radius-')).sort(byValue);
/** Stroke thickness steps, thinnest first. */
export const widthScale = tokens.filter(({ name }) => name.startsWith('border-width-')).sort(byValue);
/** Semantic border tokens that are neither radius nor width - should stay empty. */
export const unmatchedTokens = tokens.filter(({ name }) => !/^border-(radius|width)-/.test(name)).map(({ name }) => name);

/** Shape tokens have one mode; nothing changes between Light and Dark. */
export const themed = Object.keys(borderSource).some((collection) => /light|dark/i.test(collection));

const primitiveValues = (prefix: string) =>
  Object.entries(primitives)
    .filter(([name]) => name.startsWith(prefix))
    .map(([, entry]) => px(entry.$value) ?? NaN)
    .sort((a, b) => a - b);

export const primitiveScale = { radius: primitiveValues('border-radius-'), width: primitiveValues('border-width-') };

const shapeTokensIn = (node: unknown, path = ''): string[] =>
  node && typeof node === 'object'
    ? '$value' in node
      ? /radius|border-width|stroke/.test(path) ? [path] : []
      : Object.entries(node).flatMap(([key, child]) => shapeTokensIn(child, path ? `${path}/${key}` : key))
    : [];

/** Component-level radius or stroke tokens, by file - none today. */
export const componentShapeTokens = Object.values(componentSources).flatMap((source) => shapeTokensIn(source));

// --- Exceptions -------------------------------------------------------------------------------

// The page shows an exception only when shape is missing, misclassified, or borrowed: a raw radius
// or stroke thickness, a primitive shape token, a non-shape token standing in for a radius or stroke,
// or a shape token doing a non-shape job. Strokes drawn as elements (a 1px divider's height) and
// arithmetic with shape tokens (calc) are shape doing its job, not exceptions.

export type Exception = { key: string; components: string[] };

const RAW_LENGTH = /(^|[\s(,])-?(\d*\.)?\d+(px|rem|em)\b/;
const isPrimitiveShape = (token: string) => /^border-(radius-(\d+|round)|width-\d+)$/.test(token);
const isOtherDimension = (token: string) => /^(spacing|overlap|size|measurement)-/.test(token);

/** A shadow layer with no blur is a stroke; true when that stroke's thickness is a raw length. */
const rawStrokeLayer = (layer: ShadowLayer) => !layer.blurred && layer.rawLengths.length > 0;

/** Where shape is missing, misclassified, or borrowed for a non-shape purpose. */
export function shapeExceptions(cssByPath: Record<string, string>): Exception[] {
  const declarations = declarationsIn(cssByPath);
  const uses = tokenUses(cssByPath);
  const where = (test: (use: TokenUse) => boolean) => displayNames(uses.filter(test).map((use) => use.component));
  const shapeDeclarations = (kind: 'radius' | 'stroke') => declarations.filter(({ property }) => kindOf(property) === kind);
  const found: Exception[] = [
    // Missing: a raw radius or stroke width, or a stroke-like shadow with a raw thickness.
    {
      key: 'raw-radius',
      components: displayNames(shapeDeclarations('radius').filter(({ value }) => RAW_LENGTH.test(value.replace(/var\([^)]*\)/g, ''))).map(({ component }) => component)),
    },
    {
      key: 'raw-stroke',
      components: displayNames(
        [
          ...shapeDeclarations('stroke').filter(({ value }) => RAW_LENGTH.test(value.replace(/var\([^)]*\)/g, ''))),
          ...declarations.filter(({ property, value }) => kindOf(property) === 'shadow' && shadowLayers(value).some(rawStrokeLayer)),
        ].map(({ component }) => component),
      ),
    },
    { key: 'primitive-shape', components: where(({ token }) => isPrimitiveShape(token)) },
    // Misclassified: a spacing or size token standing in for a radius or a stroke width.
    { key: 'other-token-as-radius', components: where(({ token, kind, bare }) => isOtherDimension(token) && kind === 'radius' && bare) },
    { key: 'other-token-as-stroke', components: where(({ token, kind }) => isOtherDimension(token) && kind === 'stroke') },
    // Borrowed: a radius token outside a radius, or a stroke width doing spacing's or type's job.
    { key: 'radius-borrowed', components: where(({ token, kind, bare }) => token.startsWith('border-radius-') && kind !== 'radius' && bare) },
    {
      key: 'width-borrowed',
      components: where(
        ({ token, kind, bare }) => token.startsWith('border-width-') && ['padding', 'gap', 'margin', 'typography'].includes(kind) && bare,
      ),
    },
  ];
  return found.filter(({ components }) => components.length > 0);
}

