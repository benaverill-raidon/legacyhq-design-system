import recipes from '../../../tokens/css-recipes.json';
import baseCss from '../../../tokens/generated/tokens.css?raw';
import lightCss from '../../../tokens/generated/light.css?raw';
import darkCss from '../../../tokens/generated/dark.css?raw';

// Documentation only. Keep source paths/metadata and read public CSS verbatim from the existing
// build, including its compatibility recipes. No second export or token generation step.
const sources = import.meta.glob('../../../tokens/src/**/*.json', { eager: true, import: 'default' });
export type Tier = 'primitives' | 'semantic' | 'component';
export type Mode = 'Light' | 'Dark';
export type Category = 'Color' | 'Dimensions' | 'Spacing' | 'Radius' | 'Border' | 'Typography' | 'Shadow' | 'Elevation' | 'Motion';
type Node = { $type: string; $value: unknown; $description?: string; $extensions?: { 'com.legacyhq'?: { originalName?: string } } };
export type Token = {
  id: string; name: string; file: string; tier: Tier; category: Category; group: string;
  mode?: Mode; type: string; value: unknown; description?: string; originalName?: string;
  recipe: boolean; emitted: boolean; deprecated: boolean;
};

const wrappers = new Set(['Primitive', 'Value', 'Light', 'Dark', 'Semantic: Border', 'Semantic: Color',
  'Semantic: Dimension', 'Semantic: Elevation', 'Semantic: Typography', 'Semantic: Motion']);
// Tested against the canonical pipeline's cssName for every source token.
export const cssName = (parts: string[]) => parts.filter(part => !wrappers.has(part)).map(part => part
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()).join('-');
export const declarations = (css: string): Record<string, string> => Object.fromEntries(
  [...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
);
export const cssByMode = {
  Light: { ...declarations(baseCss), ...declarations(lightCss) },
  Dark: { ...declarations(baseCss), ...declarations(darkCss) },
};

function categoryOf(name: string, tier: Tier): Category {
  if (tier === 'component') return 'Dimensions'; // Component pages are selected by family, not category.
  if (name.startsWith('color-')) return 'Color';
  if (name.startsWith('typography-')) return 'Typography';
  if (name.startsWith('border-radius-')) return 'Radius';
  if (name.startsWith('border-width-')) return 'Border';
  if (name.startsWith('shadow-')) return 'Shadow';
  if (name.startsWith('elevation-')) return 'Elevation';
  if (name.startsWith('spacing-')) return 'Spacing';
  if (/^(measurement|size|overlap)-/.test(name)) return 'Dimensions';
  if (/^(duration|ease|fade|move|spin|pulse)-/.test(name)) return 'Motion';
  throw new Error(`Unclassified token: ${name}`);
}

function groupOf(name: string, tier: Tier, originalName?: string): string {
  if (tier === 'component') return 'Values'; // Replaced below with the source anatomy path.
  if (name.startsWith('color-')) {
    const parts = (originalName ?? name.replace(/-/g, '/')).split('/');
    if (tier === 'primitives') return parts.slice(1, parts[1] === 'brand' ? 4 : 3).join(' / ');
    if (parts[1] === 'background') return parts.slice(1, ['brand', 'accent'].includes(parts[2]) ? 4 : 3).join(' / ');
    if (['content', 'border'].includes(parts[1])) return parts.slice(1, ['brand', 'accent', 'inverse'].includes(parts[2]) ? 3 : 2).join(' / ');
    return parts.slice(1, 3).join(' / ');
  }
  if (name.startsWith('typography-')) return name.replace(/^typography-/, '').replace(/-(font-family|font-weight|font-size|line-height|letter-spacing|paragraph-spacing|text-transform)$/, '').replace(/-(?:minus-)?\d.*$/, '');
  if (/^(size|overlap)-/.test(name)) return name.replace(/-[^-]+$/, '').replace(/-\d+$/, '');
  if (name.startsWith('shadow-')) return name.split('-').slice(0, 2).join(' / ');
  return name.split('-')[0];
}

export const sourceTokens: Token[] = [];
function visit(tree: unknown, parts: string[], file: string) {
  if (!tree || typeof tree !== 'object') return;
  if ('$value' in tree) {
    const node = tree as Node;
    const tier = file.split('/')[0] as Tier;
    const name = cssName(parts);
    sourceTokens.push({ id: parts.join('.'), name, file, tier, category: categoryOf(name, tier),
      group: tier === 'component' ? parts.slice(2, -1).filter(part => !['Light', 'Dark'].includes(part)).join(' / ') || 'Values' : groupOf(name, tier, node.$extensions?.['com.legacyhq']?.originalName),
      mode: parts.includes('Light') ? 'Light' : parts.includes('Dark') ? 'Dark' : undefined,
      type: node.$type, value: node.$value, description: node.$description,
      originalName: node.$extensions?.['com.legacyhq']?.originalName,
      recipe: false, emitted: !recipes.omitTokens.includes(parts.join('.')), deprecated: false });
    return;
  }
  Object.entries(tree).filter(([key]) => !key.startsWith('$')).forEach(([key, child]) => visit(child, [...parts, key], file));
}
Object.entries(sources).sort(([a], [b]) => a.localeCompare(b)).forEach(([file, tree]) => visit(tree, [], file.split('/src/')[1]));
export const byId = new Map(sourceTokens.map(token => [token.id, token]));

const recipeTokens: Token[] = recipes.declarations.map(recipe => {
  const sourcePath = 'sourcePath' in recipe ? String(recipe.sourcePath) : undefined;
  const mode = recipe.mode === 'light' ? 'Light' : recipe.mode === 'dark' ? 'Dark' : undefined;
  const targetName = 'target' in recipe.value ? recipe.value.target : undefined;
  const target = sourceTokens.find(t => t.name === targetName && (!t.mode || t.mode === mode));
  const tier: Tier = sourcePath?.startsWith('Primitive.') ? 'primitives' : sourcePath?.startsWith('component.') ? 'component' : target?.tier ?? 'semantic';
  return { id: sourcePath ?? `css.${recipe.mode}.${recipe.name}`, name: recipe.name, file: 'css-recipes.json',
    tier, category: categoryOf(recipe.name, tier), group: sourcePath ? 'CSS recipes' : 'Deprecated CSS aliases', mode,
    type: 'CSS recipe', value: recipe.value, originalName: 'originalName' in recipe ? String(recipe.originalName) : undefined,
    recipe: true, emitted: true, deprecated: !sourcePath };
});
export const catalogue = [...sourceTokens, ...recipeTokens];

/** Resolve public CSS aliases in the selected mode. calc() stays a truthful CSS expression. */
export function resolveCss(name: string, mode: Mode, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`Circular CSS alias: ${name}`);
  const value = cssByMode[mode][name];
  if (value === undefined) throw new Error(`Missing CSS declaration: ${name} (${mode})`);
  return value.replace(/var\(--([\w-]+)\)/g, (_, target) => resolveCss(target, mode, new Set(seen).add(name)));
}

export function resolvedValue(token: Token, mode: Mode): string {
  if (token.emitted) return resolveCss(token.name, mode);
  // The four loop parameters are source-only. Their types are duration and cubicBezier.
  let value = token.value;
  const seen = new Set<string>();
  while (typeof value === 'string' && /^\{.+\}$/.test(value)) {
    const id = value.slice(1, -1);
    if (seen.has(id) || !byId.has(id)) throw new Error(`Invalid source alias: ${id}`);
    seen.add(id);
    value = byId.get(id)!.value;
  }
  if (token.type === 'duration') { const v = value as { value: number; unit: string }; return `${v.value}${v.unit}`; }
  if (token.type === 'cubicBezier') return JSON.stringify(value) === '[0,0,1,1]' ? 'linear' : `cubic-bezier(${(value as number[]).join(', ')})`;
  throw new Error(`Unsupported source-only token: ${token.id}`);
}

export type Reference = { property: string; chain: string[] };
export function referencesOf(value: unknown, property = ''): Reference[] {
  if (typeof value === 'string' && /^\{.+\}$/.test(value)) {
    const chain: string[] = [];
    let next: unknown = value;
    while (typeof next === 'string' && /^\{.+\}$/.test(next)) {
      const id = next.slice(1, -1);
      if (chain.includes(id) || !byId.has(id)) throw new Error(`Invalid source alias: ${id}`);
      chain.push(id);
      next = byId.get(id)!.value;
    }
    return [{ property, chain }];
  }
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, member]) => referencesOf(member, property ? `${property}.${key}` : key));
  return [];
}

export const tokensFor = (tier: Tier, category: Category | undefined, family: string | undefined, mode: Mode) => catalogue
  .filter(t => t.tier === tier && (!category || t.category === category) && (!family || t.id.startsWith(`component.${family}.`)) && (!t.mode || t.mode === mode))
  .sort((a, b) => a.group.localeCompare(b.group, undefined, { numeric: true }) || a.name.localeCompare(b.name, undefined, { numeric: true }));
export const families = [...new Set(sourceTokens.filter(t => t.tier === 'component').map(t => t.id.split('.')[1]))].sort();
export const categoriesFor = (tier: Tier) => [...new Set(sourceTokens.filter(t => t.tier === tier).map(t => t.category))];
