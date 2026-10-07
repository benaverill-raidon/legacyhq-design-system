// Pure helpers shared by docs pages: turning data into readable copy, and finding which components
// use something. No Vite-specific imports, so tests can use these directly (pass CSS read from disk).

/** `icon-tile` -> `Icon Tile`. */
export const titleCase = (value: string) =>
  value.replace(/(^|-)([a-z])/g, (_match, dash: string, letter: string) => `${dash ? ' ' : ''}${letter.toUpperCase()}`);

/** `a`, `a and b`, `a, b, and c`. */
export const listOf = (items: string[]) =>
  items.length <= 2 ? items.join(' and ') : `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** Small counts as words for running copy (`9` -> `nine`); larger numbers stay digits. */
export const inWords = (count: number) => NUMBER_WORDS[count] ?? String(count);

/**
 * Component names (sorted) whose CSS - keyed by file path - passes `test`. The name comes from the
 * stylesheet (`rich-text-area.module.css` -> `rich-text-area`), not its folder, and story-only
 * stylesheets (`*-stories.module.css`) are skipped because they aren't component styles.
 */
export function componentsMatching(test: (css: string) => boolean, cssByPath: Record<string, string>) {
  const names = Object.entries(cssByPath)
    .filter(([, css]) => test(css))
    .map(([path]) => path.replace(/\\/g, '/').match(/\/([a-z-]+)\.module\.css$/)?.[1])
    .filter((name): name is string => Boolean(name) && !name!.endsWith('-stories'));
  return [...new Set(names)].sort();
}

/** Component names whose CSS references any token starting with `prefix`. */
export const componentsUsing = (prefix: string, cssByPath: Record<string, string>) =>
  componentsMatching((css) => css.includes(`var(--${prefix}`), cssByPath);
