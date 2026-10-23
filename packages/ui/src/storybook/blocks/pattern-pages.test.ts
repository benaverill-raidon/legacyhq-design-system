// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { loadCsf } from 'storybook/internal/csf-tools';
import { describe, expect, it } from 'vitest';
import { registryEntry } from './component-page-data';
import { CODE_FOLDERS, componentImports, componentsUsed, docsTitleOf, PATTERN_PAGE_SECTIONS, propValues, TEMPLATE_PAGE_SECTIONS, toneMatrix } from './pattern-page-data';

// Keeps every pattern page (an MDX page using <PatternPage>) and template page (<TemplatePage>) to
// its standard, and its facts true: the sections in order, examples that are stories built from
// system components, a "Components used" list that covers everything the page renders, and links
// to real Docs pages.

const PAGES = 'packages/ui/src/storybook/pages';
const COMPONENTS = 'packages/ui/src/components';

const filesIn = (dir: string, pattern: RegExp): string[] =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((file: string) => file.replace(/\\/g, '/'))
    .filter((file: string) => pattern.test(file))
    .map((file: string) => `${dir}/${file}`);

const read = (path: string): string => readFileSync(path, 'utf8');
const titleOf = (path: string) => loadCsf(read(path), { fileName: path, makeTitle: (title) => title }).parse().meta.title;

const componentTitles = new Set(filesIn(COMPONENTS, /\.stories\.tsx$/).map(titleOf));
const typesOf = (id: string) => filesIn(COMPONENTS, new RegExp(`/${id}/${id}\\.types\\.ts$`)).map(read)[0] ?? '';

const KINDS = [
  { wrapper: '<PatternPage>', header: 'PatternHeader', sections: [...PATTERN_PAGE_SECTIONS] as string[], group: 'Patterns' },
  { wrapper: '<TemplatePage>', header: 'TemplateHeader', sections: [...TEMPLATE_PAGE_SECTIONS] as string[], group: 'Templates' },
];

const pages = filesIn(PAGES, /\.mdx$/).flatMap((path) => {
  const mdx = read(path);
  const kind = KINDS.find(({ wrapper }) => mdx.includes(wrapper));
  if (!kind) return [];
  const storiesPath = path.replace(/\.mdx$/, '.stories.tsx');
  return [{ path, mdx, kind, storiesPath, stories: read(storiesPath) }];
});

describe('pattern page helpers', () => {
  it('reads the components a file imports, by folder, once each', () => {
    const source = `import { Button } from '../../../components/atoms/button';
import { toast, ToastGroup } from '../../../components/organisms/toast-group';
import { LAYERS } from '../../../components/primitives/layers';
// import { Tag } from '../../../components/atoms/tag';
import { Button as Again } from '../../../components/atoms/button/button';`;
    expect(componentImports(source)).toEqual(['button', 'toast-group']);
  });

  it("counts an import as the component whose code it is, not the folder it's in", () => {
    expect(CODE_FOLDERS.get('rich-text-area')).toBe('molecules/text-area/rich');
    // Its code folder, a file in it, and the re-export from Text Area's index.
    expect(componentImports(`import { RichTextArea } from '../../../components/molecules/text-area/rich';`)).toEqual(['rich-text-area']);
    expect(componentImports(`import { RichTextArea } from '../../../components/molecules/text-area/rich/rich-text-area';`)).toEqual(['rich-text-area']);
    expect(componentImports(`import { RichTextArea } from '../../../components/molecules/text-area';`)).toEqual(['rich-text-area']);
    expect(componentImports(`import { TextArea, RichTextArea } from '../../../components/molecules/text-area';`)).toEqual(['text-area', 'rich-text-area']);
    expect(componentImports(`import { TextArea } from '../../../components/molecules/text-area';`)).toEqual(['text-area']);
    // A helper, not a component, counts as the component whose folder it's in.
    expect(componentImports(`import { toast } from '../../../components/organisms/toast-group';`)).toEqual(['toast-group']);
    expect(componentsUsed(`import { RichTextArea } from '../../../components/molecules/text-area';`)).toEqual([
      { id: 'rich-text-area', name: 'Rich Text Area', title: 'Components/Forms/Rich Text Area' },
    ]);
  });

  it('finds every registry component\'s code folder', () => {
    expect([...CODE_FOLDERS.keys()].sort()).toEqual(filesIn('docs/components', /\.contract\.json$/).map((path) => path.split('/').slice(-2)[0]).sort());
    for (const [id, folder] of CODE_FOLDERS) expect(read(`${COMPONENTS}/${folder}/${id}.types.ts`)).not.toBe('');
  });

  it("reads a prop's values from its first type, leaving the deprecated one out", () => {
    const types = `export type InlineMessageTone = 'default' | 'information';
/** @deprecated */
export type DeprecatedInlineMessageTone = 'info';
export interface InlineMessageProps {
  /** The tone?: of the row. */
  tone?: InlineMessageTone | DeprecatedInlineMessageTone;
  size?: 'sm' | 'md';
}`;
    expect(propValues(types, 'tone')).toEqual(['default', 'information']);
    expect(propValues(types, 'size')).toEqual(['sm', 'md']);
    expect(propValues(types, 'missing')).toEqual([]);
  });

  it('orders tones from neutral to most serious, with any others after', () => {
    expect(toneMatrix([{ name: 'A', values: ['error', 'brand', 'default'] }, { name: 'B', values: ['warning'] }])).toEqual({
      columns: ['default', 'warning', 'error', 'brand'],
      rows: [
        { name: 'A', has: [true, false, true, true] },
        { name: 'B', has: [false, true, false, false] },
      ],
    });
  });

  it('builds the sidebar title the taxonomy test enforces', () => {
    expect(docsTitleOf(registryEntry('section-message'))).toBe('Components/Feedback/Section Message');
    expect(docsTitleOf(registryEntry('icon'))).toBe('Foundations/Icons');
  });
});

describe('pattern and template pages', () => {
  it('finds the pattern pages', () => {
    expect(pages.map(({ path }) => path)).toContain(`${PAGES}/patterns/messages-and-feedback.mdx`);
  });

  it.each(pages.map((page) => [page.path, page]))('%s: has every section, in order', (_, { mdx, kind }) => {
    const titles = [...mdx.matchAll(/<Section title=(["'])(.*?)\1/g)].map(([, , title]) => title);
    expect(titles).toEqual(kind.sections);
  });

  it.each(pages.map((page) => [page.path, page]))('%s: documents its own stories, in its group', (_, { mdx, kind, storiesPath, stories }) => {
    const name = storiesPath.split('/').pop()?.replace(/\.tsx$/, '');
    expect(mdx).toMatch(new RegExp(`import \\* as Stories from '\\./${name}';`));
    expect(mdx).toContain('<Meta of={Stories} name="Docs" />');
    expect(mdx).toContain(`import storiesSource from './${name}.tsx?raw';`);
    expect(mdx).toMatch(new RegExp(`<${kind.header} [^>]*source=\\{storiesSource\\}`));
    expect(mdx).toContain('<ComponentsUsed source={storiesSource} />');
    expect(titleOf(storiesPath).startsWith(`${kind.group}/`)).toBe(true);
    expect(stories).toMatch(/export const \w+: Story/);
  });

  it.each(pages.map((page) => [page.path, page]))('%s: writes multi-line code samples as exports, so they keep their indent', (_, { mdx }) => {
    // MDX strips two spaces from every line of a multi-line string in a JSX attribute.
    const inline = [...mdx.matchAll(/code=\{`([^`]*)`\}/g)].filter(([, code]) => code.includes('\n')).map(([, code]) => code.split('\n')[0]);
    expect(inline).toEqual([]);
  });

  it.each(pages.map((page) => [page.path, page]))('%s: builds its examples from system components only', (_, { stories }) => {
    const sources = [...stories.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(([, source]) => source);
    const allowed = (source: string) =>
      source === 'react' ||
      source.startsWith('@storybook/') ||
      /^(\.\.\/)+components\//.test(source) ||
      // The system's icons (Foundations / Icons), for Icon Button and icon slots.
      /^(\.\.\/)+assets\/icons$/.test(source) ||
      /^\.\/[\w-]+\.module\.css$/.test(source);
    expect(sources.filter((source) => !allowed(source))).toEqual([]);
  });

  it.each(pages.map((page) => [page.path, page]))('%s: lists every component it renders as used', (_, { mdx, stories }) => {
    const used = componentImports(stories);
    expect(used.length).toBeGreaterThan(0);
    expect(componentImports(mdx).filter((id) => !used.includes(id))).toEqual([]);
  });

  it.each(pages.map((page) => [page.path, page]))('%s: links each component used to its Docs page', (_, { stories }) => {
    expect(componentsUsed(stories).filter(({ title }) => !componentTitles.has(title))).toEqual([]);
  });

  it.each(pages.map((page) => [page.path, page]))('%s: reads a value from every component in its tone tables', (_, { mdx }) => {
    const tables = [...mdx.matchAll(/<ToneMatrix components=\{\[([^\]]*)\]\}(?:\s+prop="(\w+)")?/g)].flatMap(([, ids, prop = 'tone']) =>
      [...ids.matchAll(/'([a-z-]+)'/g)].map(([, id]) => ({ id, prop })),
    );
    expect(tables.filter(({ id, prop }) => propValues(typesOf(id), prop).length === 0)).toEqual([]);
  });
});

describe('Messages and Feedback cites', () => {
  const source = (path: string) => read(`${COMPONENTS}/${path}`);

  it('the tones each component takes', () => {
    expect(propValues(typesOf('banner'), 'tone')).toEqual(['default', 'warning', 'error']);
    expect(propValues(typesOf('toast'), 'tone')).toContain('loading');
    expect(propValues(typesOf('field'), 'state')).toEqual(['default', 'error', 'success']);
  });

  it("Toast Group's 5-second default and its live region", () => {
    expect(source('organisms/toast-group/toast-group.tsx')).toMatch(/const DEFAULT_DURATION = 5000;/);
    expect(source('organisms/toast-group/toast-group.tsx')).toMatch(/role="status"/);
  });

  it('Banner and Section Message as polite live regions by default', () => {
    expect(source('organisms/banner/banner.tsx')).toMatch(/role = 'status'/);
    expect(source('organisms/section-message/section-message.tsx')).toMatch(/role = 'status'/);
  });

  it('Inline Message as no live region', () => {
    expect(source('molecules/inline-message/inline-message.tsx')).not.toMatch(/aria-live|role="status"|role = 'status'/);
  });

  it('a hidden status label on each message component', () => {
    for (const id of ['banner', 'section-message', 'inline-message', 'toast']) expect(typesOf(id)).toMatch(/statusLabel\?: string;/);
  });
});
