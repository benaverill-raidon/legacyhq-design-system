import { createRequire } from 'node:module';
import path from 'node:path';
import { QueryError, REPO_ROOT, checkFilter, checkLimit, compact, ranked, readJson, requireQuery, suggest, terms } from './core.mjs';

// Design tokens, read from the DTCG sources through scripts/lib/tokens.cjs (the same reader and
// validator the token build uses), plus the CSS-only declarations in css-recipes.json. A token is
// looked up by its CSS custom property name, the name component CSS uses. A semantic color has one
// value per mode (light and dark) under the same name; mode "all" means one value for both.

const require = createRequire(import.meta.url);
const tokenLib = require('../../../scripts/lib/tokens.cjs');

const SOURCE_DIR = tokenLib.ROOT;
const MODES = { tokens: 'all', light: 'light', dark: 'dark' };
const TIER_OF_DIR = { primitives: 'primitive', responsive: 'responsive', semantic: 'semantic', component: 'component' };
// Semantic tokens are what components should use (token-governance.json), so they rank first.
const TIER_RANK = { semantic: 3, component: 1, primitive: 0, responsive: 0 };

function referencedIds(value, found = []) {
  if (typeof value === 'string') {
    const match = value.match(tokenLib.wholeReference);
    if (match) found.push(match[1]);
  } else if (Array.isArray(value)) value.forEach((v) => referencedIds(v, found));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => referencedIds(v, found));
  return found;
}

function recipeTier(declaration, byName) {
  const head = declaration.sourcePath?.split('.')[0];
  if (head === 'Primitive') return 'primitive';
  if (head?.startsWith('Semantic')) return 'semantic';
  if (head === 'component') return 'component';
  return byName.get(declaration.value.target)?.tier ?? 'semantic';
}

/**
 * Every token by CSS name: { name, cssVar, type, tier, description, values: [{ mode, id, value,
 * references, css }], source, inCss }. `value` is the authored DTCG value; `css` is what the build
 * writes for it; `references` are the CSS names it points at. `inCss` is false when the build leaves
 * a token out of the CSS (css-recipes.json `omitTokens`), so it can't be used as a var().
 */
export function loadTokens({ root = REPO_ROOT } = {}) {
  const { tokens, byId } = tokenLib.validateSources(tokenLib.readSources(path.join(root, SOURCE_DIR)));
  const recipes = readJson(tokenLib.RECIPE_FILE, root);
  const omitted = new Set(recipes.omitTokens);
  const byName = new Map();

  for (const token of tokens) {
    const tier = TIER_OF_DIR[token.file.split('/')[0]];
    let entry = byName.get(token.name);
    if (!entry) {
      entry = {
        name: token.name,
        cssVar: `--${token.name}`,
        type: token.node.$type,
        tier,
        description: token.node.$description ?? null,
        values: [],
        source: `${SOURCE_DIR}/${token.file}`,
        inCss: false,
      };
      byName.set(token.name, entry);
    }
    if (!omitted.has(token.id)) entry.inCss = true;
    entry.values.push({
      mode: MODES[tokenLib.scope(token)],
      id: token.id,
      value: token.node.$value,
      references: referencedIds(token.node.$value).map((id) => byId.get(id).name),
      css: tokenLib.cssValue(token, byId),
    });
  }

  // CSS-only declarations: values DTCG can't express (keywords, composed recipes like spin-loop).
  for (const declaration of recipes.declarations) {
    const entry = byName.get(declaration.name) ?? {
      name: declaration.name,
      cssVar: `--${declaration.name}`,
      type: `css-recipe:${declaration.value.kind}`,
      tier: recipeTier(declaration, byName),
      description: null,
      values: [],
      source: tokenLib.RECIPE_FILE,
      inCss: true,
    };
    byName.set(declaration.name, entry);
    entry.values.push({
      mode: MODES[declaration.mode],
      id: declaration.sourcePath ?? null,
      value: declaration.value,
      references: declaration.value.kind === 'alias' ? [declaration.value.target] : [],
      css: null,
    });
  }
  return byName;
}

/** The allowed values for each token filter, read from the tokens themselves. */
export function tokenFilterValues(byName = loadTokens()) {
  const entries = [...byName.values()];
  return {
    tier: [...new Set(entries.map((t) => t.tier))].sort(),
    type: [...new Set(entries.map((t) => t.type))].sort(),
    mode: ['light', 'dark'],
  };
}

/** Narrows a token to one mode: its values for that mode plus any that apply to all modes. */
function inMode(token, mode) {
  if (!mode) return token;
  const values = token.values.filter((v) => v.mode === mode || v.mode === 'all');
  return values.length ? { ...token, values } : null;
}

/** "color-x", "--color-x", and "var(--color-x)" all name the same token. */
const bareName = (asked) => asked.trim().replace(/^var\(\s*/, '').replace(/\s*\)$/, '').replace(/^--/, '');

/**
 * One token by CSS name (with or without "--" or "var()") or by DTCG id.
 * @param {string} name
 * @param {{ mode?: 'light' | 'dark' }} [options]
 */
export function getToken(name, { mode } = {}) {
  const asked = requireQuery(name, 'getToken');
  checkFilter('mode', mode, ['light', 'dark']);
  const byName = loadTokens();
  const wanted = bareName(asked);
  const token = byName.get(wanted) ?? [...byName.values()].find((t) => t.values.some((v) => v.id === asked));
  if (!token) {
    throw new QueryError('NOT_FOUND', `No token "${asked}".`, { suggestions: suggest(wanted, [...byName.keys()]) });
  }
  const narrowed = inMode(token, mode);
  if (!narrowed) throw new QueryError('NOT_FOUND', `${token.name} has no ${mode} value.`);
  return narrowed;
}

/**
 * Tokens whose name matches every term of the query, best match first: an exact name, then whole
 * words, then semantic tokens before component and primitive ones. Tokens left out of the CSS come last.
 * @param {string} query
 * @param {{ tier?: string, type?: string, mode?: 'light' | 'dark', limit?: number }} [options]
 */
export function searchTokens(query, { tier, type, mode, limit } = {}) {
  const asked = requireQuery(query, 'searchTokens');
  const max = checkLimit(limit);
  const byName = loadTokens();
  const allowed = tokenFilterValues(byName);
  checkFilter('tier', tier, allowed.tier);
  checkFilter('type', type, allowed.type);
  checkFilter('mode', mode, allowed.mode);

  const wanted = terms(bareName(asked));
  const scored = [];
  for (const token of byName.values()) {
    if ((tier && token.tier !== tier) || (type && token.type !== type)) continue;
    const narrowed = inMode(token, mode);
    if (!narrowed) continue;
    const words = terms(token.name);
    const scores = wanted.map((term) => {
      if (words.includes(term)) return 10;
      if (words.some((word) => word.startsWith(term))) return 6;
      return compact(token.name).includes(term) ? 2 : 0;
    });
    if (scores.includes(0)) continue;
    const exact = token.name === bareName(asked) ? 100 : 0;
    const score = exact + scores.reduce((sum, s) => sum + s, 0) + TIER_RANK[token.tier] - (token.inCss ? 0 : 50);
    scored.push({ item: narrowed, score });
  }
  return ranked(scored, (item) => item.name, max);
}
