// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COMPONENT_PAGE_SECTIONS } from '../storybook/blocks/component-page-data';

// The component Docs page standard (packages/ui/src/storybook/blocks/component-page.tsx). Every
// MDX page written with <ComponentPage> must list the standard sections in order, with the required
// ones present; name the component it documents; label the contract's anatomy parts; and document
// every prop in the types, since its API table is generated from them. Pages not yet converted are
// listed, not failed, while the standard rolls out.

const COMPONENTS = 'packages/ui/src/components';
const DOCS = 'docs/components';
const TIERS = ['primitives', 'atoms', 'molecules', 'organisms'];

type Page = { tier: string; id: string; path: string; mdx: string };

const pages: Page[] = TIERS.flatMap((tier) =>
  readdirSync(`${COMPONENTS}/${tier}`).flatMap((id: string) => {
    const path = `${COMPONENTS}/${tier}/${id}/${id}.mdx`;
    return existsSync(path) ? [{ tier, id, path, mdx: readFileSync(path, 'utf8') as string }] : [];
  }),
);
const standard = pages.filter(({ mdx }) => mdx.includes('<ComponentPage>'));

const contractOf = ({ tier, id }: Page) => JSON.parse(readFileSync(`${DOCS}/${tier}/${id}/${id}.contract.json`, 'utf8'));
const attribute = (mdx: string, tag: string, name: string) =>
  [...mdx.matchAll(new RegExp(`<${tag}\\b[^>]*?\\b${name}=(["'])(.*?)\\1`, 'g'))].map((match) => match[2]);

/** Members of `interface <Name>Props` that have no JSDoc comment directly above them. */
export function undocumentedProps(source: string, interfaceName: string) {
  const start = source.search(new RegExp(`interface ${interfaceName}\\b[^{]*\\{`));
  if (start < 0) throw new Error(`No interface ${interfaceName}`);
  const lines = source.slice(source.indexOf('{', start) + 1).split('\n');
  const missing: string[] = [];
  let depth = 0;
  let previous = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (depth === 0 && trimmed.startsWith('}')) break;
    const member = depth === 0 ? trimmed.match(/^(?:readonly\s+)?['"]?([\w-]+)['"]?\??:/) : null;
    if (member && !previous.endsWith('*/')) missing.push(member[1]);
    for (const char of line) {
      if (char === '{' || char === '(') depth++;
      if (char === '}' || char === ')') depth--;
    }
    if (trimmed) previous = trimmed;
  }
  return missing;
}

describe('component Docs pages', () => {
  it('finds the pages written to the standard', () => {
    expect(standard.map(({ id }) => id)).toContain('button');
  });

  it.each(standard.map((page) => [page.id, page] as const))('%s lists the standard sections, in order', (_id, page) => {
    const titles = attribute(page.mdx, 'Section', 'title');
    const order = titles.map((title) => COMPONENT_PAGE_SECTIONS.findIndex((section) => section.title === title));
    expect(titles.filter((_title, index) => order[index] < 0)).toEqual([]);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    const required = COMPONENT_PAGE_SECTIONS.filter((section) => section.required).map((section) => section.title);
    expect(required.filter((title) => !titles.includes(title))).toEqual([]);
  });

  it.each(standard.map((page) => [page.id, page] as const))('%s names its own component and token stylesheet', (_id, page) => {
    expect(attribute(page.mdx, 'ComponentHeader', 'id')).toEqual([page.id]);
    expect(attribute(page.mdx, 'TokensTable', 'id')).toEqual([page.id]);
    expect(page.mdx).toMatch(/<PropsTable\s+of=\{\w+Stories\}/);
  });

  it.each(standard.map((page) => [page.id, page] as const))("%s labels the contract's anatomy parts", (_id, page) => {
    const parts = (contractOf(page).anatomy as Array<{ name: string }>).map(({ name }) => name);
    expect(attribute(page.mdx, 'Part', 'name')).toEqual(parts);
  });

  it.each(standard.map((page) => [page.id, page] as const))('%s documents every prop in its types', (_id, page) => {
    const source: string = readFileSync(`${COMPONENTS}/${page.tier}/${page.id}/${page.id}.types.ts`, 'utf8');
    expect(undocumentedProps(source, `${contractOf(page).name}Props`)).toEqual([]);
  });

  it('reads JSDoc coverage from an interface', () => {
    const source = `export interface ThingProps extends Base {
  /** Documented. */
  size?: 'sm' | 'md';
  tone?: Tone;
  /**
   * Also documented.
   */
  onChange?: (value: { id: string }) => void;
  nested?: { inner: string };
}`;
    expect(undocumentedProps(source, 'ThingProps')).toEqual(['tone', 'nested']);
  });

  it('counts the pages still to convert', () => {
    const remaining = pages.filter((page) => !standard.includes(page)).map(({ id }) => id);
    expect(remaining.length + standard.length).toBe(pages.length);
  });
});
