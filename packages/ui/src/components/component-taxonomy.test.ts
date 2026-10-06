// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { getStorySortParameter, loadCsf } from 'storybook/internal/csf-tools';
import { describe, expect, it } from 'vitest';

// Keeps component categories and the Storybook sidebar in sync. The valid categories are the
// schema enum; contract.json `category`, story titles, and storySort are each separate copies of
// that classification, so this test is what stops them drifting. Rules: the `classification` block
// in docs/foundations/component-registry-governance.json.

type Contract = { name: string; category?: unknown };

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

const categoryEnum: string[] = readJson('docs/foundations/component-registry.schema.json').items.properties.category.enum;
const { classification } = readJson('docs/foundations/component-registry-governance.json');
const groups: Array<{ category: string; label: string }> = classification.storybook.componentGroups;
const displayNameOverrides: Record<string, string> = classification.storybook.displayNameOverrides;
const groupLabels = new Map(groups.map(({ category, label }) => [category, label]));

const contracts = readdirSync('docs/components', { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.contract.json'))
  .map((file) => ({ file, contract: readJson(`docs/components/${file}`) as Contract }));

const stories = readdirSync('packages/ui/src/components', { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.stories.tsx'))
  .map((file) => {
    const path = `packages/ui/src/components/${file}`;
    // Storybook's own CSF parser, so a `title` arg on a story can't be mistaken for the meta title.
    const csf = loadCsf(readFileSync(path, 'utf8'), { fileName: path, makeTitle: (title) => title }).parse();
    return { path, title: csf.meta.title };
  });

const displayName = (name: string) => displayNameOverrides[name] ?? name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

const expectedTitle = ({ name, category }: Contract) =>
  category === 'foundations'
    ? `Foundations/${displayName(name)}`
    : `Components/${groupLabels.get(category as string)}/${displayName(name)}`;

describe('component taxonomy', () => {
  it('gives every contract a category from the schema enum', () => {
    const invalid = contracts
      .filter(({ contract }) => !categoryEnum.includes(contract.category as string))
      .map(({ file, contract }) => `${file}: ${JSON.stringify(contract.category ?? null)}`);
    expect(invalid).toEqual([]);
  });

  it('defines every schema category exactly once in governance', () => {
    expect(Object.keys(classification.categories.definitions).sort()).toEqual([...categoryEnum].sort());
  });

  it('maps every non-foundations category to exactly one Storybook group', () => {
    expect(groups.map(({ category }) => category).sort()).toEqual(categoryEnum.filter((c) => c !== 'foundations').sort());
    expect(new Set(groups.map(({ label }) => label)).size).toBe(groups.length);
  });

  it('orders the storySort component groups the same as governance', () => {
    // Read the way Storybook reads it - statically - so a non-literal storySort fails here too.
    const { order } = getStorySortParameter(readFileSync('.storybook/preview.js', 'utf8'));
    expect(order[order.indexOf('Components') + 1]).toEqual(groups.map(({ label }) => label));
  });

  it('only overrides display names of real components', () => {
    const names = new Set(contracts.map(({ contract }) => contract.name));
    expect(Object.keys(displayNameOverrides).filter((name) => !names.has(name))).toEqual([]);
  });

  it('gives every component exactly one story titled for its category', () => {
    const problems = contracts.flatMap(({ contract }) => {
      const title = expectedTitle(contract);
      const matches = stories.filter((story) => story.title === title);
      return matches.length === 1 ? [] : [`${contract.name}: ${matches.length} stories titled "${title}"`];
    });
    expect(problems).toEqual([]);
  });

  it('keeps every Components/ story in a known group and tied to a component', () => {
    const expected = new Set(contracts.map(({ contract }) => expectedTitle(contract)));
    const labels = new Set(groups.map(({ label }) => label));
    const problems = stories
      .filter(({ title }) => title.startsWith('Components/'))
      .flatMap(({ path, title }) => {
        const group = title.split('/')[1];
        if (!labels.has(group)) return [`${path}: unknown component group "${group}"`];
        if (!expected.has(title)) return [`${path}: "${title}" matches no contract's name and category`];
        return [];
      });
    expect(problems).toEqual([]);
  });

  it('never uses the retired UI/<Tier>/ titles', () => {
    expect(stories.filter(({ title }) => title.startsWith('UI/')).map(({ path }) => path)).toEqual([]);
  });
});
