import governance from '../../../../../docs/foundations/component-registry-governance.json';
import registry from '../../../../../docs/components/registry.json';
import { registryEntry } from './component-page-data';
import type { RegistryEntry } from './component-page-data';
import { withoutComments } from './css-usage';
import { titleCase } from './doc-helpers';

// Pure data for pattern pages: guidance for combining components to solve a recurring product
// problem. The prose is written in each page's MDX; which components a pattern uses, and the values
// they take, are read from the code. Shared by pattern-page.tsx and its tests.

/** The page's sections, in order. Every pattern page has all of them. */
export const PATTERN_PAGE_SECTIONS = ['The problem', 'Choosing', 'Examples', 'Rules', 'Accessibility', "Do and don't", 'Components used'] as const;

export type PatternPageSection = (typeof PATTERN_PAGE_SECTIONS)[number];

/**
 * A template page's sections, in order: a whole workflow built from the system, with the regions
 * it's made of and the questions its designs still have to settle. Every template page has all of
 * them.
 */
export const TEMPLATE_PAGE_SECTIONS = ['Purpose', 'The template', "How it's built", 'Accessibility', 'Open questions', 'Components used'] as const;

export type TemplatePageSection = (typeof TEMPLATE_PAGE_SECTIONS)[number];

const { componentGroups, displayNameOverrides } = governance.classification.storybook as {
  componentGroups: Array<{ category: string; label: string }>;
  displayNameOverrides: Record<string, string>;
};

/** `SectionMessage` -> `Section Message`, with the sidebar's own exceptions (Icon -> Icons). */
export const displayNameOf = (name: string) => displayNameOverrides[name] ?? name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

/** The sidebar title of a component's Docs, the same rule the taxonomy test enforces. */
export function docsTitleOf(entry: RegistryEntry) {
  if (entry.category === 'foundations') return `Foundations/${displayNameOf(entry.name)}`;
  const group = componentGroups.find(({ category }) => category === entry.category)?.label ?? titleCase(entry.category);
  return `Components/${group}/${displayNameOf(entry.name)}`;
}

const ENTRIES = registry as Array<{ id: string; name: string }>;
const COMPONENT_IDS = new Set(ENTRIES.map(({ id }) => id));

// Every component's types file, named for its registry id. Only the paths are used here: the
// folder that holds `<id>.types.ts` is where that component's code lives. That's usually
// `<tier>s/<id>`, but not always: Rich Text Area's is `molecules/text-area/rich`. The same glob as
// component-types.ts, so Storybook loads these modules once.
const typesFiles = Object.keys(import.meta.glob('../../components/**/*.types.ts', { query: '?raw', import: 'default', eager: true }));

/** Each component's code folder under `components/`, by registry id. */
export const CODE_FOLDERS: ReadonlyMap<string, string> = new Map(
  typesFiles.flatMap((path) => {
    const [, folder, id] = path.match(/components\/(.+)\/([\w-]+)\.types\.ts$/) ?? [];
    return id && COMPONENT_IDS.has(id) ? [[id, folder] as const] : [];
  }),
);

/** The component whose code folder holds a path under `components/`, the deepest one if they nest. */
function componentAt(path: string) {
  let found: { id: string; folder: string } | undefined;
  for (const [id, folder] of CODE_FOLDERS) {
    if ((path === folder || path.startsWith(`${folder}/`)) && folder.length > (found?.folder.length ?? -1)) found = { id, folder };
  }
  return found?.id;
}

/**
 * The components a source file imports from the library, in the order they're first imported. An
 * import names the components it brings in when they're exported from that path (`RichTextArea`
 * from `molecules/text-area`); otherwise it counts as the component whose code folder it's in
 * (`toast` from `organisms/toast-group`, `RichTextArea` from `molecules/text-area/rich`). Only
 * registry components count: a shared module such as `primitives/layers` isn't one. Commented-out
 * imports are ignored.
 */
export function componentImports(source: string) {
  const code = withoutComments(source).replace(/^\s*\/\/.*$/gm, '');
  const ids = [...code.matchAll(/import\s+([\w$*\s{},]+?)\s+from\s+['"](?:\.\.?\/)+components\/([\w/.-]+?)(?:\/index)?(?:\.tsx?)?['"]/g)].flatMap(
    ([, clause, path]) => {
      const at = componentAt(path);
      const names = (clause.match(/\{([^}]*)\}/)?.[1] ?? '')
        .split(',')
        .map((name) => name.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0])
        .filter(Boolean);
      const named = names.flatMap((name) => {
        const entry = ENTRIES.find((candidate) => candidate.name === name);
        const folder = entry && CODE_FOLDERS.get(entry.id);
        // Only a component this path exports: its own, or one re-exported from a folder below it.
        return folder && (entry.id === at || folder.startsWith(`${path}/`)) ? [entry.id] : [];
      });
      return named.length > 0 ? named : at ? [at] : [];
    },
  );
  return [...new Set(ids)];
}

/** The registry entries for those imports, with their Docs titles. */
export const componentsUsed = (source: string) =>
  componentImports(source).map((id) => {
    const entry = registryEntry(id);
    return { id, name: displayNameOf(entry.name), title: docsTitleOf(entry) };
  });

/**
 * The values a prop takes, read from a component's `.types.ts`: the string literals of the first
 * type in its union. Renamed values sit in a second, `@deprecated` type (`InlineMessageTone |
 * DeprecatedInlineMessageTone`), so they're left out. Empty when the prop isn't there.
 */
export function propValues(typesSource: string, prop: string) {
  const source = withoutComments(typesSource);
  const declared = source.match(new RegExp(`^\\s*${prop}\\??:\\s*([^;]+);`, 'm'))?.[1];
  if (!declared) return [];
  const first = declared.split('|')[0].trim();
  const union = /^'/.test(first) ? declared : source.match(new RegExp(`export type ${first}\\s*=\\s*([^;]+);`))?.[1];
  return union ? [...union.matchAll(/'([^']+)'/g)].map(([, value]) => value) : [];
}

/** The order tones are read in: neutral, then the statuses from least to most serious. */
export const TONE_ORDER = ['default', 'information', 'success', 'warning', 'error', 'loading'];

/**
 * Which component takes which tone: one column per value any of them takes, in TONE_ORDER (others
 * after, as they come).
 */
export function toneMatrix(rows: Array<{ name: string; values: string[] }>) {
  const all = new Set(rows.flatMap(({ values }) => values));
  const columns = [...TONE_ORDER.filter((tone) => all.has(tone)), ...[...all].filter((tone) => !TONE_ORDER.includes(tone))];
  return { columns, rows: rows.map(({ name, values }) => ({ name, has: columns.map((column) => values.includes(column)) })) };
}
