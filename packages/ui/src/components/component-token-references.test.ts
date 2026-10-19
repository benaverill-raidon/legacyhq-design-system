// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Every design token a stylesheet reads must exist. A removed or renamed token leaves var() with
// nothing to resolve, so the property silently falls back to its inherited value: Label's bold text
// read --color-content-inverse for weeks after that token was renamed, and rendered black on dark
// fills. Only token families are checked; a component's own variables (set in its stylesheet, or by
// a parent such as Focus Ring) aren't tokens.

const TOKENS = 'packages/ui/src/tokens/generated';
const SOURCES = ['packages/ui/src/components', 'packages/ui/src/storybook'];
const TOKEN_FAMILY = /^--(color|spacing|overlap|size|border-radius|border-width|typography|fade|move|spin|pulse|elevation|component)-/;

const defined = new Set(
  ['tokens.css', 'light.css', 'dark.css'].flatMap((file) =>
    [...(readFileSync(`${TOKENS}/${file}`, 'utf8') as string).matchAll(/(--[\w-]+)\s*:/g)].map(([, name]) => name),
  ),
);

const stylesheets: string[] = SOURCES.flatMap((dir) =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((file: string) => `${dir}/${file.replace(/\\/g, '/')}`)
    .filter((path: string) => path.endsWith('.module.css')),
);

describe('token references', () => {
  it('finds the generated tokens and the stylesheets', () => {
    expect(defined.has('--color-content-default')).toBe(true);
    expect(stylesheets.length).toBeGreaterThan(50);
  });

  it('reads only tokens that exist', () => {
    const missing = stylesheets.flatMap((path) => {
      const css = (readFileSync(path, 'utf8') as string).replace(/\/\*[\s\S]*?\*\//g, '');
      const local = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(([, name]) => name));
      const read = new Set([...css.matchAll(/var\(\s*(--[\w-]+)\s*[,)]/g)].map(([, name]) => name));
      return [...read].filter((name) => TOKEN_FAMILY.test(name) && !defined.has(name) && !local.has(name)).map((name) => `${path}: ${name}`);
    });
    expect(missing).toEqual([]);
  });
});
