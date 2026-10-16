// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import registry from '../../../../docs/components/registry.json';
import { COMPONENT_PAGE_SECTIONS } from '../storybook/blocks/component-page-data';

// The component Docs page standard (packages/ui/src/storybook/blocks/component-page.tsx). Every
// MDX page written with <ComponentPage> must list the standard sections in order, with the required
// ones present; name a component in registry.json; label that component's anatomy parts, as its
// contract names them; read a stylesheet that exists; and document every prop in the component's
// types, since its API table is generated from them. Pages not yet converted are counted, not
// failed, while the standard rolls out.

const COMPONENTS = 'packages/ui/src/components';

const files: string[] = readdirSync(COMPONENTS, { recursive: true, encoding: 'utf8' }).map((file: string) => `${COMPONENTS}/${file.replace(/\\/g, '/')}`);
const read = (path: string): string => readFileSync(path, 'utf8');

const attribute = (mdx: string, tag: string, name: string) =>
  [...mdx.matchAll(new RegExp(`<${tag}\\b[^>]*?\\b${name}=(["'])(.*?)\\1`, 'g'))].map((match) => match[2]);

type Entry = { id: string; anatomy?: Array<{ name: string }> };

const docsPages = files.filter((path) => path.endsWith('.mdx')).map((path) => ({ path, mdx: read(path) }));
const standard = docsPages
  .filter(({ mdx }) => mdx.includes('<ComponentPage>'))
  .map((page) => {
    const id = attribute(page.mdx, 'ComponentHeader', 'id')[0];
    return { ...page, id, entry: (registry as Entry[]).find((candidate) => candidate.id === id) };
  });

/** Every member of a `*Props` interface or object type that has no JSDoc comment directly above it. */
export function undocumentedProps(source: string) {
  const missing: string[] = [];
  for (const declaration of source.matchAll(/(?:interface\s+(\w+Props)\b[^{]*|type\s+(\w+Props)\s*=[^{;]*?)\{/g)) {
    const name = declaration[1] ?? declaration[2];
    const lines = source.slice((declaration.index ?? 0) + declaration[0].length).split('\n');
    let depth = 0;
    let previous = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (depth === 0 && trimmed.startsWith('}')) break;
      const member = depth === 0 ? trimmed.match(/^(?:readonly\s+)?['"]?([\w-]+)['"]?\??:/) : null;
      if (member && !previous.endsWith('*/')) missing.push(`${name}.${member[1]}`);
      for (const char of line) {
        if (char === '{' || char === '(') depth++;
        if (char === '}' || char === ')') depth--;
      }
      if (trimmed) previous = trimmed;
    }
  }
  return missing;
}

/** The component's types: `<id>.types.ts`, or the component file itself when it declares its props. */
const typesOf = (id: string) => files.filter((path) => path.endsWith(`/${id}.types.ts`) || path.endsWith(`/${id}.tsx`));

describe('component Docs pages', () => {
  it('finds the pages written to the standard', () => {
    expect(standard.map(({ id }) => id)).toContain('button');
  });

  it.each(standard.map((page) => [page.id ?? page.path, page] as const))('%s names a component in registry.json', (_id, page) => {
    expect(page.entry).toBeDefined();
  });

  it.each(standard.map((page) => [page.id, page] as const))('%s lists the standard sections, in order', (_id, page) => {
    const titles = attribute(page.mdx, 'Section', 'title');
    const order = titles.map((title) => COMPONENT_PAGE_SECTIONS.findIndex((section) => section.title === title));
    expect(titles.filter((_title, index) => order[index] < 0)).toEqual([]);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    const required = COMPONENT_PAGE_SECTIONS.filter((section) => section.required).map((section) => section.title);
    expect(required.filter((title) => !titles.includes(title))).toEqual([]);
  });

  it.each(standard.map((page) => [page.id, page] as const))('%s has an API table and reads a stylesheet that exists', (_id, page) => {
    expect(page.mdx).toMatch(/<PropsTable\b/);
    const stylesheets = attribute(page.mdx, 'TokensTable', 'id');
    expect(stylesheets.length).toBeGreaterThan(0);
    expect(stylesheets.filter((sheet) => !files.some((path) => path.endsWith(`/${sheet}.module.css`)))).toEqual([]);
  });

  it.each(standard.map((page) => [page.id, page] as const))("%s labels the contract's anatomy parts", (_id, page) => {
    const parts = (page.entry?.anatomy ?? []).map(({ name }) => name);
    expect(parts.length).toBeGreaterThan(0);
    expect(attribute(page.mdx, 'Part', 'name')).toEqual(parts);
  });

  it.each(standard.map((page) => [page.id, page] as const))('%s documents every prop in its types', (_id, page) => {
    const sources = typesOf(page.id);
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.flatMap((path) => undocumentedProps(read(path)))).toEqual([]);
  });

  it('reads JSDoc coverage from interfaces and object types', () => {
    const source = `export interface ThingProps extends Base {
  /** Documented. */
  size?: 'sm' | 'md';
  tone?: Tone;
  /**
   * Also documented.
   */
  onChange?: (value: { id: string }) => void;
  nested?: { inner: string };
}

export type OtherProps = Base & {
  /** Documented. */
  open: boolean;
  label: string;
};

export type EitherProps = ThingProps | OtherProps;`;
    expect(undocumentedProps(source)).toEqual(['ThingProps.tone', 'ThingProps.nested', 'OtherProps.label']);
  });

  it('counts the pages still to convert', () => {
    const remaining = docsPages.filter(({ mdx }) => !mdx.includes('<ComponentPage>') && !mdx.includes('<Meta title='));
    expect(remaining.length + standard.length).toBeLessThanOrEqual(docsPages.length);
  });
});
