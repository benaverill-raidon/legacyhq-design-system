// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { componentsMatching, componentsUsing } from '../../blocks/doc-helpers';
import {
  casing,
  componentTypographyTokens,
  PROPERTIES,
  primitiveScale,
  roles,
  rolesIn,
  scale,
  themed,
  unmatchedTokens,
} from './typography-data';

// Foundations / Typography renders from the token source, so every token must land in a role and
// resolve. The page's authored copy also makes a few factual claims - Display is Merriweather, which
// components use which heading/body sizes, Label never truncates, sizes are pixels - pinned here so
// the copy fails loudly instead of drifting.

const COMPONENTS = 'packages/ui/src/components';
const componentCss: Record<string, string> = Object.fromEntries(
  readdirSync(COMPONENTS, { recursive: true, encoding: 'utf8' })
    .filter((file: string) => file.endsWith('.module.css'))
    .map((file: string) => [`${COMPONENTS}/${file}`, readFileSync(`${COMPONENTS}/${file}`, 'utf8')]),
);
const users = (role: string) => componentsUsing(`typography-${role}-`, componentCss);

describe('Foundations / Typography data', () => {
  it('parses every semantic typography token into a role property', () => {
    expect(unmatchedTokens).toEqual([]);
  });

  it('resolves all six properties of every role', () => {
    const broken = roles.flatMap((role) =>
      [
        !role.family && 'font-family',
        !Number.isFinite(role.weight) && 'font-weight',
        ...(['fontSize', 'lineHeight', 'letterSpacing', 'paragraphSpacing'] as const).filter((key) => !Number.isFinite(role[key])),
        ...PROPERTIES.filter((property) => !role.aliases[property]).map((property) => `${property} alias`),
      ]
        .filter(Boolean)
        .map((problem) => `${role.name}: ${problem}`),
    );
    expect(broken).toEqual([]);
  });

  it('places every role on the scale exactly once', () => {
    const placed = scale.flatMap(({ byGroup }) => Object.values(byGroup).flat().map(({ name }) => name));
    expect(placed.sort()).toEqual(roles.map(({ name }) => name).sort());
  });

  it('gives every role a casing recipe, all preserving authored casing', () => {
    expect(casing.filter(({ value }) => value !== 'none')).toEqual([]);
  });

  it('keeps typography theme-independent, with no component-level tokens, in pixels', () => {
    expect(themed).toBe(false);
    expect(componentTypographyTokens).toEqual([]);
    expect(primitiveScale.allSizesInPx).toBe(true);
  });

  it('matches the authored group copy', () => {
    expect(rolesIn('display').every(({ family }) => family === 'Merriweather')).toBe(true);
    expect(users('heading-sm')).toContain('button');
    expect(users('heading-xs')).toEqual(expect.arrayContaining(['button', 'tabs']));
    expect(users('heading-xxs')).toEqual(expect.arrayContaining(['badge', 'field']));
    expect(users('body-sm')).toEqual(expect.arrayContaining(['field', 'tooltip']));
  });

  it('matches the truncation copy: Label never truncates', () => {
    const truncating = componentsMatching((css) => css.includes('text-overflow: ellipsis'), componentCss);
    expect(truncating.length).toBeGreaterThan(0);
    expect(truncating).not.toContain('label');
  });
});
