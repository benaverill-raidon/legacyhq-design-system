import governance from '../../../../../../docs/foundations/component-registry-governance.json';
import registry from '../../../../../../docs/components/registry.json';
import semanticDark from '../../../tokens/src/semantic/semantic-color-dark.json';
import semanticLight from '../../../tokens/src/semantic/semantic-color-light.json';

// Everything the Overview shows about the system itself is derived here from the source files,
// never retyped: component groups (governance), counts (registry), and the token trace (DTCG
// source + Button's CSS). overview.test.ts fails if any of it stops resolving.
//
// Button's CSS is passed in rather than imported here: the page imports it with Vite's `?raw`,
// which Vitest intercepts as a CSS module, so the test reads the same file from disk instead.

const { categories, storybook } = governance.classification;

export const componentGroups = storybook.componentGroups.map(({ category, label }) => ({
  category,
  label,
  definition: categories.definitions[category as keyof typeof categories.definitions],
  count: registry.filter((component) => component.category === category).length,
}));

export const componentCount = componentGroups.reduce((total, group) => total + group.count, 0);

type TokenEntry = { $value: string; $extensions?: { 'com.legacyhq'?: { originalName?: string } } };
type ModeFile = Record<string, Record<string, Record<string, TokenEntry>>>;

const TRACE_COLLECTION = 'Semantic: Color';
const TRACE_TOKEN = 'color-background-brand-primary-bold-default';
const TRACE_SELECTOR = '.prominence_primary';
const modeFiles = { Light: semanticLight, Dark: semanticDark } as unknown as Record<'Light' | 'Dark', ModeFile>;

const traceEntry = (mode: 'Light' | 'Dark') => modeFiles[mode][TRACE_COLLECTION]?.[mode]?.[TRACE_TOKEN];

export const tokenTrace = {
  collection: TRACE_COLLECTION,
  token: TRACE_TOKEN,
  cssVariable: `--${TRACE_TOKEN}`,
  figmaName: traceEntry('Light')?.$extensions?.['com.legacyhq']?.originalName,
  modes: (['Light', 'Dark'] as const).map((mode) => ({ mode, reference: traceEntry(mode)?.$value })),
};

/** The declaration in Button's CSS (button.module.css source) that consumes the traced token. */
export function findComponentRule(buttonCss: string) {
  const body = buttonCss.match(new RegExp(`^\\${TRACE_SELECTOR}\\s*\\{([^}]*)\\}`, 'm'))?.[1];
  const declaration = body
    ?.split(';')
    .map((line) => line.trim())
    .find((line) => line.includes(`var(--${TRACE_TOKEN})`));
  return declaration ? { selector: TRACE_SELECTOR, declaration: `${declaration};` } : undefined;
}
