// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { componentCount, componentGroups, findComponentRule, tokenTrace } from './overview-data';

const buttonCss = readFileSync('packages/ui/src/components/atoms/button/button.module.css', 'utf8');

// The Overview renders these straight from source files, so a renamed token, a moved CSS rule, or
// a governance change would otherwise leave the page silently blank or wrong.

describe('Overview data', () => {
  it('describes every component group with a definition and a count', () => {
    expect(componentGroups).toHaveLength(6);
    for (const group of componentGroups) {
      expect(group.definition, group.category).toBeTruthy();
      expect(group.count, group.category).toBeGreaterThan(0);
    }
    expect(componentCount).toBe(componentGroups.reduce((total, group) => total + group.count, 0));
  });

  it('resolves the traced token from Figma name to Button CSS in both themes', () => {
    expect(tokenTrace.figmaName).toBe('color/background/brand/primary/bold/default');
    for (const { mode, reference } of tokenTrace.modes) {
      expect(reference, mode).toMatch(/^\{Primitive\.Value\.[\w-]+\}$/);
    }
    expect(findComponentRule(buttonCss)?.declaration).toBe(`background: var(${tokenTrace.cssVariable});`);
  });

  it('still matches the primitive the trace caption names ("Prussian 900")', () => {
    expect(tokenTrace.modes.find(({ mode }) => mode === 'Light')?.reference).toBe('{Primitive.Value.color-brand-prussian-solid-900}');
  });
});
