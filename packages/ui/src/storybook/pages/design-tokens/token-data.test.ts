// @ts-expect-error This project doesn't include Node built-in type declarations for test-only file reads.
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import pipeline from '../../../../../../scripts/lib/tokens.cjs';
import recipes from '../../../tokens/css-recipes.json';
import { byId, catalogue, categoriesFor, cssByMode, families, referencesOf, resolveCss, resolvedValue, sourceTokens, tokensFor } from './token-data';

// Vitest's default CSS handling stubs even ?raw CSS imports. Supply the real checked-in files,
// rather than enabling CSS processing for every component test in the repository.
const rawCss = await vi.hoisted(async () => {
  // @ts-expect-error Node types are absent from this browser-focused project.
  const fs = await import('node:fs');
  return Object.fromEntries(['tokens', 'light', 'dark'].map(mode => [mode, fs.readFileSync(`packages/ui/src/tokens/generated/${mode}.css`, 'utf8')]));
});
vi.mock('../../../tokens/generated/tokens.css?raw', () => ({ default: rawCss.tokens }));
vi.mock('../../../tokens/generated/light.css?raw', () => ({ default: rawCss.light }));
vi.mock('../../../tokens/generated/dark.css?raw', () => ({ default: rawCss.dark }));

const canonical = pipeline.validateSources(pipeline.readSources()).tokens;
const pagesDir = 'packages/ui/src/storybook/pages/design-tokens';
const pages = readdirSync(pagesDir).filter((file: string) => file.endsWith('.mdx')).map((file: string) => readFileSync(`${pagesDir}/${file}`, 'utf8')) as string[];

describe('Design Tokens reference integrity', () => {
  it('covers every canonical source token and uses the exact pipeline CSS names', () => {
    expect(sourceTokens.map(t => t.id).sort()).toEqual(canonical.map(t => t.id).sort());
    for (const token of canonical) expect(byId.get(token.id)?.name, token.id).toBe(token.name);
  });

  it('documents every emitted declaration, including all recipes, in each mode', () => {
    for (const mode of ['Light', 'Dark'] as const) {
      const emitted = catalogue.filter(t => t.emitted && (!t.mode || t.mode === mode));
      expect(emitted.map(t => t.name).sort()).toEqual(Object.keys(cssByMode[mode]).sort());
      expect(new Set(emitted.map(t => t.name)).size).toBe(emitted.length);
    }
    expect(catalogue.filter(t => t.recipe)).toHaveLength(recipes.declarations.length);
  });

  it('resolves every value and every source alias without missing variables in both themes', () => {
    for (const mode of ['Light', 'Dark'] as const) for (const token of catalogue.filter(t => !t.mode || t.mode === mode)) {
      const value = resolvedValue(token, mode);
      expect(value, token.id).toBeTruthy();
      expect(value, token.id).not.toMatch(/undefined|NaN|var\(--|\{[^}]*\}/);
      if (!token.recipe) for (const ref of referencesOf(token.value)) for (const id of ref.chain) expect(byId.has(id), id).toBe(true);
    }
  });

  it('keeps theme aliases distinct, zero delays omitted, and calculated geometry as CSS', () => {
    expect(resolveCss('color-content-default', 'Light')).not.toBe(resolveCss('color-content-default', 'Dark'));
    expect(resolveCss('fade-quick', 'Light')).toBe(`${resolveCss('duration-fast', 'Light')} ${resolveCss('ease-standard', 'Light')}`);
    expect(resolveCss('component-progress-bar-linear-root-size-md', 'Light')).toMatch(/^calc\(.+ \+ 2 \* .+\)$/);
    for (const id of recipes.omitTokens) {
      const token = byId.get(id)!;
      expect(token.emitted).toBe(false);
      expect(cssByMode.Light[token.name]).toBeUndefined();
      expect(resolvedValue(token, 'Light')).toBeTruthy();
    }
  });

  it('has a nonempty MDX reference for every actual category and component family', () => {
    for (const tier of ['primitives', 'semantic'] as const) for (const category of categoriesFor(tier)) {
      expect(pages.some(page => page.includes(`tier="${tier}" category="${category}"`)), `${tier}/${category}`).toBe(true);
      expect(tokensFor(tier, category, undefined, 'Light').length).toBeGreaterThan(0);
    }
    for (const family of families) expect(pages.some(page => page.includes(`tier="component" family="${family}"`)), family).toBe(true);
    expect(pages.every(page => page.includes('<Meta title="Design Tokens/'))).toBe(true);
  });

  it('rejects missing references instead of displaying invented values', () => {
    expect(() => resolveCss('missing-token', 'Light')).toThrow('Missing CSS declaration');
    expect(() => referencesOf('{missing.token}')).toThrow('Invalid source alias');
  });
});
