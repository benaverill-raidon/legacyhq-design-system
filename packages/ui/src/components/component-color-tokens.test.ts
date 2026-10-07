// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Components take color from semantic tokens (or an approved component token), never from the
// primitive palette - the three-tier rule in docs/foundations/token-governance.json. Stylelint only
// rejects raw values, so this covers the other half: any var(--<primitive color>) in component CSS
// fails, including a deprecated alias that resolves to a primitive.

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

const primitives: Record<string, { $type: string }> = readJson('packages/ui/src/tokens/src/primitives/primitive.json').Primitive.Value;
const recipes: Array<{ name: string; value: { kind: string; target?: string } }> = readJson(
  'packages/ui/src/tokens/css-recipes.json',
).declarations;

const primitiveColors = new Set(
  Object.entries(primitives)
    .filter(([, token]) => token.$type === 'color')
    .map(([name]) => name),
);
for (const { name, value } of recipes) {
  if (value.kind === 'alias' && primitiveColors.has(value.target)) primitiveColors.add(name);
}

const COMPONENTS = 'packages/ui/src/components';
const cssFiles: string[] = readdirSync(COMPONENTS, { recursive: true, encoding: 'utf8' })
  .map((file: string) => file.replace(/\\/g, '/'))
  .filter((file: string) => file.endsWith('.css'))
  .map((file: string) => `${COMPONENTS}/${file}`);

describe('component color tokens', () => {
  it('reads the primitive color palette and the component stylesheets', () => {
    expect(primitiveColors.size).toBeGreaterThan(0);
    expect(cssFiles.length).toBeGreaterThan(0);
  });

  it('never references a primitive color token from component CSS', () => {
    const violations = cssFiles.flatMap((path) =>
      (readFileSync(path, 'utf8') as string).split(/\r?\n/).flatMap((line, index) =>
        [...line.matchAll(/var\(--([a-z0-9-]+)/g)]
          .filter(([, name]) => primitiveColors.has(name))
          .map(
            ([, name]) =>
              `${path}:${index + 1} uses primitive color --${name}. Use a semantic color token ` +
              '(--color-content-*, --color-border-*, --color-background-*, --color-elevation-*) or an approved component token.',
          ),
      ),
    );
    expect(violations).toEqual([]);
  });
});
