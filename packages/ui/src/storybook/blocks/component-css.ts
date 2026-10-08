import { componentsMatching, componentsUsing, titleCase } from './doc-helpers';

// Every component stylesheet, inlined by Vite, so docs pages can say which components use a token
// or behavior - read from the CSS itself rather than retyped. Storybook only: Vitest intercepts
// `?raw` CSS imports, so tests pass CSS read from disk to the pure helpers in doc-helpers.ts instead.
export const componentCss = import.meta.glob('../../components/**/*.module.css', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;

/** Display names of components whose CSS references a token with any of these prefixes. */
export const usersOf = (...prefixes: string[]) =>
  [...new Set(prefixes.flatMap((prefix) => componentsUsing(prefix, componentCss)))].sort().map(titleCase);

/** Display names of components whose CSS contains this text, e.g. `text-overflow: ellipsis`. */
export const componentsWith = (text: string) => componentsMatching((css) => css.includes(text), componentCss).map(titleCase);
