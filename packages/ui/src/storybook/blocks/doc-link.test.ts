// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { posix } from 'node:path';
import { loadCsf } from 'storybook/internal/csf-tools';
import { describe, expect, it } from 'vitest';
import { docLinkPath } from './doc-link';

// Every DocLink must point at a docs page that exists. Targets are read statically from the
// Storybook pages and blocks, so `to` has to be a string literal. Docs pages are MDX files with
// <Meta title="..."> or attached to a story file with <Meta of={...}> (which takes that file's title).

const SRC = 'packages/ui/src';

const filesIn = (dir: string, pattern: RegExp): string[] =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((file: string) => file.replace(/\\/g, '/'))
    .filter((file: string) => pattern.test(file))
    .map((file: string) => `${dir}/${file}`);

const storyTitle = (path: string) =>
  loadCsf(readFileSync(path, 'utf8'), { fileName: path, makeTitle: (title) => title }).parse().meta.title;

const docsTitles = new Set(
  filesIn(SRC, /\.mdx$/).flatMap((path) => {
    const mdx: string = readFileSync(path, 'utf8');
    const titled = [...mdx.matchAll(/<Meta\s[^>]*\btitle=(["'])(.*?)\1/g)].map((match) => match[2]);
    const attached = [...mdx.matchAll(/<Meta\s[^>]*\bof=\{(\w+)\}/g)].map(([, name]) => {
      const source = mdx.match(new RegExp(`import \\* as ${name} from (["'])(.*?)\\1`))?.[2];
      if (!source) throw new Error(`${path}: can't resolve <Meta of={${name}}>`);
      const storyFile = posix.join(posix.dirname(path), source);
      return storyTitle(storyFile.endsWith('.tsx') ? storyFile : `${storyFile}.tsx`);
    });
    return [...titled, ...attached];
  }),
);

const docLinks = filesIn(`${SRC}/storybook`, /\.(mdx|tsx)$/).flatMap((path) =>
  [...(readFileSync(path, 'utf8') as string).matchAll(/<DocLink\b([^>]*)>/g)].map(([, attributes]) => ({
    path,
    attributes,
    to: attributes.match(/\bto=(["'])(.*?)\1/)?.[2],
  })),
);

describe('DocLink', () => {
  it('finds the docs pages and links it validates', () => {
    expect(docsTitles.has('Components/Actions/Button')).toBe(true);
    expect(docLinks.length).toBeGreaterThan(0);
  });

  it('uses a string-literal `to` on every DocLink', () => {
    const nonLiteral = docLinks.filter(({ to }) => !to).map(({ path, attributes }) => `${path}: <DocLink${attributes}>`);
    expect(nonLiteral).toEqual([]);
  });

  it('points every DocLink at an existing docs page', () => {
    const broken = docLinks.filter(({ to }) => to && !docsTitles.has(to)).map(({ path, to }) => `${path}: "${to}"`);
    expect(broken).toEqual([]);
  });

  it('builds the same docs path Storybook uses', () => {
    expect(docLinkPath('Components/Data Display/Key Value Pair')).toBe('?path=/docs/components-data-display-key-value-pair--docs');
  });
});
