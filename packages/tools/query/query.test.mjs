// @vitest-environment node
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  QueryError,
  REPO_ROOT,
  checkFreshness,
  checkSystem,
  componentFilterValues,
  getComponent,
  getExamples,
  getRules,
  getToken,
  iconCategories,
  listComponents,
  listRuleTopics,
  searchComponents,
  searchIcons,
  searchTokens,
} from './index.mjs';

// The library answers from the repo's own data, so these tests read the same files and check the
// answers against them rather than against hand-copied values.

const read = (relPath) => JSON.parse(readFileSync(path.join(REPO_ROOT, relPath), 'utf8'));
const registry = read('docs/components/registry.json');
const exemplars = read('docs/components/exemplars.json');
const icons = read('packages/ui/src/assets/icons/metadata/icons.json');
const recipes = read('packages/ui/src/tokens/css-recipes.json');

function thrown(fn) {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('expected a QueryError');
}

describe('components', () => {
  it('finds every registry component by id and by name', () => {
    for (const entry of registry) {
      expect(getComponent(entry.id).id).toBe(entry.id);
      expect(getComponent(entry.name).id).toBe(entry.id);
    }
  });

  it('ignores case and punctuation, and finds a sub-component by its name', () => {
    expect(getComponent('Key Value Pair').id).toBe('key-value-pair');
    expect(getComponent('KEY_VALUE_PAIR').id).toBe('key-value-pair');
    expect(getComponent('RadioGroup').id).toBe('radio');
  });

  it('returns the full registry entry with its source file', () => {
    const entry = registry.find((e) => e.id === 'button');
    expect(getComponent('button')).toEqual({ ...entry, source: entry.path });
  });

  it('says what was close when nothing matches', () => {
    const error = thrown(() => getComponent('buton'));
    expect(error).toBeInstanceOf(QueryError);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.suggestions).toContain('button');
  });

  it('lists every component, and filters by category, tier, and status', () => {
    expect(listComponents().map((c) => c.id)).toEqual(registry.map((e) => e.id));
    const forms = listComponents({ category: 'forms', status: 'stable' });
    expect(forms.map((c) => c.id)).toEqual(registry.filter((e) => e.category === 'forms' && e.status === 'stable').map((e) => e.id));
    expect(listComponents({ tier: 'primitive' })).toHaveLength(registry.filter((e) => e.tier === 'primitive').length);
  });

  it('rejects filter values the schema does not allow, listing the allowed ones', () => {
    const error = thrown(() => listComponents({ category: 'layout' }));
    expect(error.code).toBe('INVALID_INPUT');
    expect(error.allowed).toEqual(componentFilterValues().category);
  });

  it('ranks an exact name first and requires every term to match', () => {
    expect(searchComponents('button').results[0].id).toBe('button');
    expect(searchComponents('text input').results[0].id).toBe('text-field');
    const { results } = searchComponents('button group');
    expect(results[0].id).toBe('button-group');
    expect(searchComponents('button zzzz').total).toBe(0);
  });

  it('finds a category by its prefix', () => {
    const ids = searchComponents('form', { limit: 200 }).results.map((c) => c.id);
    for (const entry of registry.filter((e) => e.category === 'forms')) expect(ids).toContain(entry.id);
  });

  it('returns the same order every time, and honors the limit', () => {
    expect(searchComponents('menu')).toEqual(searchComponents('menu'));
    const limited = searchComponents('form', { limit: 2 });
    expect(limited.results).toHaveLength(2);
    expect(limited.total).toBeGreaterThan(2);
  });

  it('rejects an empty query and an out-of-range limit', () => {
    expect(thrown(() => searchComponents('  ')).code).toBe('INVALID_INPUT');
    expect(thrown(() => searchComponents('button', { limit: 0 })).code).toBe('INVALID_INPUT');
    expect(thrown(() => searchComponents('button', { limit: 1.5 })).code).toBe('INVALID_INPUT');
  });
});

describe('examples', () => {
  it('returns every component\'s examples and anti-examples exactly as exemplars.json has them', () => {
    for (const entry of exemplars) {
      const result = getExamples(entry.id);
      expect(result.examples).toEqual(entry.examples);
      expect(result.antiExamples).toEqual(entry.antiExamples);
      expect(result.source).toBe(entry.path);
    }
  });

  it('returns only one kind when asked', () => {
    expect(Object.keys(getExamples('button', { kind: 'example' }))).not.toContain('antiExamples');
    expect(Object.keys(getExamples('button', { kind: 'anti' }))).not.toContain('examples');
    expect(thrown(() => getExamples('button', { kind: 'bad' })).code).toBe('INVALID_INPUT');
  });
});

describe('tokens', () => {
  it('names each token by the CSS custom property components use', () => {
    const token = getToken('fade-quick');
    expect(token.cssVar).toBe('--fade-quick');
    expect(token.type).toBe('transition');
    expect(token.tier).toBe('semantic');
    expect(token.values[0].references).toEqual(['duration-fast', 'ease-standard']);
    expect(token.values[0].css).toBe('var(--duration-fast) var(--ease-standard)');
  });

  it('accepts the name with "--" or var(), or the DTCG id', () => {
    const token = getToken('fade-quick');
    expect(getToken('--fade-quick')).toEqual(token);
    expect(getToken('var(--fade-quick)')).toEqual(token);
    expect(getToken('Semantic: Motion.fade-quick')).toEqual(token);
  });

  it('keeps a semantic color\'s light and dark values apart, and narrows to one mode', () => {
    const token = getToken('color-background-brand-primary-bold-default');
    expect(token.values.map((v) => v.mode).sort()).toEqual(['dark', 'light']);
    const dark = getToken('color-background-brand-primary-bold-default', { mode: 'dark' });
    expect(dark.values).toHaveLength(1);
    expect(dark.values[0].id).toMatch(/\.Dark\./);
  });

  it('marks tokens the build leaves out of the CSS', () => {
    for (const id of recipes.omitTokens) {
      const token = getToken(id);
      expect(token.inCss).toBe(false);
    }
  });

  it('includes the CSS-only recipe declarations', () => {
    for (const declaration of recipes.declarations) {
      const token = getToken(declaration.name);
      expect(token.inCss).toBe(true);
      expect(token.values.some((v) => v.value === declaration.value || JSON.stringify(v.value) === JSON.stringify(declaration.value))).toBe(true);
    }
  });

  it('ranks semantic tokens first, and usable tokens before ones left out of the CSS', () => {
    const { results } = searchTokens('background brand primary');
    expect(results[0].tier).toBe('semantic');
    const spin = searchTokens('spin loop').results.map((t) => t.name);
    expect(spin[0]).toBe('spin-loop');
  });

  it('filters by tier, type, and mode, and rejects unknown values', () => {
    expect(searchTokens('blue', { tier: 'primitive' }).results.every((t) => t.tier === 'primitive')).toBe(true);
    expect(searchTokens('background', { type: 'color' }).results.every((t) => t.type === 'color')).toBe(true);
    expect(searchTokens('background', { mode: 'light' }).results.every((t) => t.values.every((v) => v.mode !== 'dark'))).toBe(true);
    const error = thrown(() => searchTokens('background', { tier: 'semantics' }));
    expect(error.code).toBe('INVALID_INPUT');
    expect(error.allowed).toContain('semantic');
  });

  it('suggests close names when a token does not exist', () => {
    const error = thrown(() => getToken('color-background-brand'));
    expect(error.code).toBe('NOT_FOUND');
    expect(error.suggestions.length).toBeGreaterThan(0);
    expect(error.suggestions.every((name) => name.startsWith('color-background-brand'))).toBe(true);
  });
});

describe('rules', () => {
  it('returns every topic, with the governance file\'s own content', () => {
    for (const { topic } of listRuleTopics()) expect(getRules(topic).topic).toBe(topic);
    const tokenGovernance = read('docs/foundations/token-governance.json');
    expect(getRules('motion').content).toEqual(tokenGovernance.motion);
    expect(getRules('componentTokenCreationRule').content).toEqual(tokenGovernance.componentTokenCreationRule);
  });

  it('returns each component API rule by its id', () => {
    for (const rule of read('docs/foundations/component-api-governance.json').rules) {
      expect(getRules(rule.id).content).toEqual(rule);
    }
  });

  it('suggests close topics when one does not exist', () => {
    const error = thrown(() => getRules('motoin'));
    expect(error.code).toBe('NOT_FOUND');
    expect(error.suggestions).toContain('motion');
  });
});

describe('icons', () => {
  it('finds every icon by its own name, first', () => {
    for (const icon of icons) expect(searchIcons(icon.name, { limit: 200 }).results.map((i) => i.name)).toContain(icon.name);
    expect(searchIcons('delete').results[0].name).toBe('delete');
  });

  it('matches keywords, and filters by category', () => {
    const withKeyword = icons.find((icon) => icon.keywords.some((k) => !icon.name.includes(k)));
    const keyword = withKeyword.keywords.find((k) => !withKeyword.name.includes(k));
    expect(searchIcons(keyword, { limit: 200 }).results.map((i) => i.name)).toContain(withKeyword.name);
    const [category] = iconCategories();
    expect(searchIcons('', { category, limit: 200 }).results.every((i) => i.category === category)).toBe(true);
    expect(thrown(() => searchIcons('', { category: 'nope' })).code).toBe('INVALID_INPUT');
  });
});

// A temporary copy of just the data the library reads: the docs, the component folders' Docs pages
// and tests (which the registry's status evidence comes from), and the token sources.
const copies = [];
afterAll(() => copies.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

function copyRepoData() {
  const root = mkdtempSync(path.join(tmpdir(), 'legacyhq-query-'));
  copies.push(root);
  cpSync(path.join(REPO_ROOT, 'docs'), path.join(root, 'docs'), { recursive: true });
  const code = 'packages/ui/src/components';
  cpSync(path.join(REPO_ROOT, code), path.join(root, code), {
    recursive: true,
    filter: (source) => statSync(source).isDirectory() || /\.(mdx|test\.tsx?)$/.test(source),
  });
  cpSync(path.join(REPO_ROOT, 'packages/ui/src/tokens'), path.join(root, 'packages/ui/src/tokens'), { recursive: true });
  return root;
}

function editJson(root, relPath, edit) {
  const file = path.join(root, relPath);
  const data = JSON.parse(readFileSync(file, 'utf8'));
  edit(data);
  writeFileSync(file, JSON.stringify(data));
}

const touchButtonExample = (examples) => {
  examples.examples[0].jsx += ' ';
};

describe('freshness', () => {
  it('finds the checked-in generated files current', async () => {
    for (const result of await checkFreshness()) expect(result).toMatchObject({ fresh: true, changed: [] });
  });

  it('names the stale file, the component, and the command to run', async () => {
    const root = copyRepoData();
    editJson(root, 'docs/components/atoms/button/button.examples.json', touchButtonExample);

    const [exemplarsResult, registryResult] = await checkFreshness({ root });
    expect(exemplarsResult).toEqual({ file: 'docs/components/exemplars.json', fresh: false, command: 'npm run generate:exemplars', changed: ['button'] });
    expect(registryResult.fresh).toBe(true);
  });
});

describe('system check', () => {
  const failed = (result) => result.checks.filter((check) => !check.ok);

  it('passes on the repo as it is', async () => {
    const result = await checkSystem();
    expect(failed(result)).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('fails a stale generated file, with the command that fixes it', async () => {
    const root = copyRepoData();
    editJson(root, 'docs/components/atoms/button/button.examples.json', touchButtonExample);
    const result = await checkSystem({ root });
    expect(result.ok).toBe(false);
    expect(failed(result)).toEqual([expect.objectContaining({ id: 'fresh:docs/components/exemplars.json', fix: 'Run npm run generate:exemplars.' })]);
  });

  it('fails when the generated files disagree on components', async () => {
    const root = copyRepoData();
    const file = path.join(root, 'docs/components/exemplars.json');
    writeFileSync(file, JSON.stringify(JSON.parse(readFileSync(file, 'utf8')).filter((entry) => entry.id !== 'button')));
    const ids = failed(await checkSystem({ root })).find((check) => check.id === 'ids');
    expect(ids.message).toContain('only in registry.json: button');
  });

  it('fails an unreadable generated file without throwing', async () => {
    const root = copyRepoData();
    writeFileSync(path.join(root, 'docs/components/registry.json'), '{ not json');
    const result = await checkSystem({ root });
    expect(failed(result).map((check) => check.id)).toEqual(['parse:docs/components/registry.json']);
  });

  it('fails a broken token reference', async () => {
    const root = copyRepoData();
    editJson(root, 'packages/ui/src/tokens/src/semantic/semantic-motion.json', (motion) => {
      motion['Semantic: Motion']['fade-quick'].$value.duration = '{Primitive.Value.no-such-token}';
    });
    const tokens = failed(await checkSystem({ root })).find((check) => check.id === 'tokens');
    expect(tokens.message).toContain('no-such-token');
  });
});

describe('read-only', () => {
  function snapshot() {
    const hashes = {};
    for (const dir of ['docs', 'packages/ui/src/tokens', 'packages/ui/src/assets/icons/metadata']) {
      for (const file of readdirSync(path.join(REPO_ROOT, dir), { recursive: true, encoding: 'utf8' })) {
        const full = path.join(REPO_ROOT, dir, file);
        if (statSync(full).isFile()) hashes[`${dir}/${file}`] = createHash('sha1').update(readFileSync(full)).digest('hex');
      }
    }
    return hashes;
  }

  it('writes nothing to the repo', async () => {
    const before = snapshot();
    listComponents();
    searchComponents('button');
    getExamples('button');
    searchTokens('background');
    getRules('motion');
    searchIcons('add');
    await checkFreshness();
    await checkSystem();
    expect(snapshot()).toEqual(before);
  });
});
