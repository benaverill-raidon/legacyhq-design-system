const fs = require('node:fs');
const { RECIPE_FILE, scope, cssValue } = require('./tokens.cjs');
const readRecipes = () => JSON.parse(fs.readFileSync(RECIPE_FILE, 'utf8'));

function recipeValue(recipe, byId) {
  const token = id => {
    const target = byId.get(id);
    if (!target) throw new Error(`Recipe ${recipe.name}: missing token ${id}`);
    return target;
  };
  const value = recipe.value;
  switch (value.kind) {
    case 'keyword': return value.value;
    case 'alias': return `var(--${value.target})`;
    case 'inset-size': return `calc(var(--${token(value.track).name}) + 2 * var(--${token(value.padding).name}))`;
    case 'motion': return `${cssValue(token(value.duration), byId)} ${cssValue(token(value.timingFunction), byId)}`;
    default: throw new Error(`Unknown CSS recipe: ${value.kind}`);
  }
}

function validateRecipes(recipes, byId) {
  if (recipes.version !== 1 || !Array.isArray(recipes.omitTokens) || !Array.isArray(recipes.declarations)
    || Object.keys(recipes).some(k => !['version', 'omitTokens', 'declarations'].includes(k))) throw new Error('Invalid CSS recipe document');
  if (new Set(recipes.omitTokens).size !== recipes.omitTokens.length) throw new Error('Duplicate omitted token');
  for (const id of recipes.omitTokens) if (!byId.has(id)) throw new Error(`Missing omitted token: ${id}`);
  for (const recipe of recipes.declarations) {
    if (!/^[a-z0-9-]+$/.test(recipe.name) || !['tokens', 'light', 'dark'].includes(recipe.mode)
      || !(recipe.after === null || typeof recipe.after === 'string')
      || !recipe.value || Object.keys(recipe).some(k => !['name', 'mode', 'after', 'value', 'sourcePath', 'originalName'].includes(k))) throw new Error('Invalid CSS declaration recipe');
    const v = recipe.value;
    const fields = { keyword: ['kind', 'value'], alias: ['kind', 'target'],
      'inset-size': ['kind', 'track', 'padding'], motion: ['kind', 'duration', 'timingFunction'] }[v.kind];
    if (!fields || Object.keys(v).length !== fields.length || fields.some(k => !Object.hasOwn(v, k))) throw new Error(`Invalid recipe value: ${recipe.name}`);
    if (v.kind === 'keyword' && v.value !== 'none') throw new Error('Casing must preserve authored text; other casing requires a new design decision');
    if (v.kind === 'alias' && !/^[a-z0-9-]+$/.test(v.target)) throw new Error('Invalid CSS alias');
    for (const [field, expected] of Object.entries({ track: 'dimension', padding: 'dimension', duration: 'duration', timingFunction: 'cubicBezier' })) {
      if (!Object.hasOwn(v, field)) continue;
      const target = byId.get(v[field]);
      if (!target || target.node.$type !== expected) throw new Error(`Recipe ${recipe.name}: ${field} must reference ${expected}`);
      if (scope(target) !== 'tokens' && scope(target) !== recipe.mode) throw new Error(`Recipe ${recipe.name}: incompatible mode`);
    }
    recipeValue(recipe, byId);
  }
}

function declarationsFor(entries, byId, recipes, mode) {
  const omitted = new Set(recipes.omitTokens);
  const result = entries.filter(t => scope(t) === mode && !omitted.has(t.id))
    .map(t => ({ name: t.name, value: cssValue(t, byId) }));
  const names = new Set(result.map(t => t.name));
  const pending = recipes.declarations.filter(r => r.mode === mode);
  for (const r of pending) {
    if (names.has(r.name)) throw new Error(`Duplicate CSS declaration: ${r.name}`);
    names.add(r.name);
  }
  // Recipes can anchor to other recipes; ordering must be deterministic and acyclic.
  while (pending.length) {
    let progress = false;
    for (let i = 0; i < pending.length;) {
      const r = pending[i];
      const anchor = r.after === null ? -1 : result.findIndex(t => t.name === r.after);
      if (r.after !== null && anchor < 0) { i++; continue; }
      result.splice(anchor + 1, 0, { name: r.name, value: recipeValue(r, byId) });
      pending.splice(i, 1);
      progress = true;
    }
    if (!progress) throw new Error(`Missing or cyclic recipe placement: ${pending.map(r => r.name).join(', ')}`);
  }
  return result;
}

function validateCssGraph(base, theme) {
  const values = new Map([...base, ...theme].map(t => [t.name, t.value]));
  const done = new Set();
  function visit(name, stack = new Set()) {
    if (stack.has(name)) throw new Error(`CSS reference cycle: ${name}`);
    if (!values.has(name)) throw new Error(`Undefined CSS variable: ${name}`);
    if (done.has(name)) return;
    for (const [, target] of values.get(name).matchAll(/var\(--([\w-]+)\)/g)) visit(target, new Set(stack).add(name));
    done.add(name);
  }
  values.forEach((_, name) => visit(name));
}

function buildDeclarations(entries, byId, recipes) {
  validateRecipes(recipes, byId);
  const result = Object.fromEntries(['tokens', 'light', 'dark'].map(mode => [mode, declarationsFor(entries, byId, recipes, mode)]));
  for (const mode of ['light', 'dark']) validateCssGraph(result.tokens, result[mode]);
  return result;
}
module.exports = { readRecipes, recipeValue, validateRecipes, buildDeclarations };
