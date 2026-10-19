// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { componentsUsingToken, declarationsIn, kindOf, shadowLayers } from '../../blocks/css-usage';
import {
  composedColors,
  declaredProperties,
  elevationExceptions,
  elevationShadows,
  familiesWithoutRole,
  ringWidth,
  shadowColorFamilies,
  shadowPrimitives,
  surfaces,
  THEMES,
  unmatchedSurfaces,
} from './elevation-data';

// Foundations / Elevation renders from the token source and component CSS, so every surface token
// must land in a role, the overlay composite must parse in both themes, and the exceptions detector
// must tell elevation from Shape. The page's authored copy also cites specific components - pinned
// here so the copy fails loudly instead of drifting.

const COMPONENTS = 'packages/ui/src/components';
const componentCss: Record<string, string> = Object.fromEntries(
  readdirSync(COMPONENTS, { recursive: true, encoding: 'utf8' })
    .filter((file: string) => file.endsWith('.module.css'))
    .map((file: string) => [`${COMPONENTS}/${file}`, readFileSync(`${COMPONENTS}/${file}`, 'utf8')]),
);
const generated = ['tokens', 'light', 'dark'].map((mode) => readFileSync(`packages/ui/src/tokens/generated/${mode}.css`, 'utf8'));
const cssOf = (name: string) => {
  const entry = Object.entries(componentCss).find(([path]) => path.replace(/\\/g, '/').endsWith(`/${name}.module.css`));
  if (!entry) throw new Error(`no stylesheet for ${name}`);
  return entry[1].replace(/\/\*[\s\S]*?\*\//g, '');
};
const blurredShadowsIn = (name: string) =>
  declarationsIn({ [`x/${name}.module.css`]: cssOf(name) })
    .filter(({ property }) => kindOf(property) === 'shadow')
    .some(({ value }) => shadowLayers(value).some((layer) => layer.blurred) || value.includes('var(--elevation-shadow-'));

describe('Foundations / Elevation data', () => {
  it('puts every surface token in a role, resolving in both themes', () => {
    expect(unmatchedSurfaces).toEqual([]);
    expect(surfaces.map(({ role }) => role)).toEqual(['deep', 'sunken', 'default', 'raised']);
    for (const surface of surfaces) {
      expect(surface.tokens).toHaveLength(3);
      for (const theme of THEMES) expect(surface.values[theme]).toMatch(/^taupe \d+$/);
    }
  });

  it('composes the overlay shadow from a Shape ring and two blurred layers, the same geometry in both themes', () => {
    const overlay = elevationShadows.find(({ role }) => role === 'overlay');
    expect(overlay).toBeDefined();
    const geometry = (theme: (typeof THEMES)[number]) => overlay!.layers[theme].map(({ inset, offsetX, offsetY, blur, spread }) => [inset, offsetX, offsetY, blur, spread]);
    expect(geometry('Dark')).toEqual(geometry('Light'));
    expect(overlay!.layers.Light.map(({ stroke }) => stroke)).toEqual([true, false, false]);
    expect(ringWidth).toBe('border-width-sm');
    expect(composedColors.every((name) => name.startsWith('color-elevation-shadow-overlay-'))).toBe(true);
    for (const theme of THEMES) expect(overlay!.layers[theme][0].color).toBe('transparent');
  });

  it('describes the unused families and primitives the page lists', () => {
    expect(shadowColorFamilies.map(({ family }) => family).sort()).toEqual(['overflow', 'overlay', 'raised']);
    expect([...familiesWithoutRole].sort()).toEqual(['overflow', 'raised']);
    for (const family of familiesWithoutRole) {
      const tokens = shadowColorFamilies.find((entry) => entry.family === family)!.tokens;
      expect(tokens.flatMap((token) => componentsUsingToken(token, componentCss))).toEqual([]);
    }
    expect(shadowPrimitives.length).toBeGreaterThan(0);
    expect(shadowPrimitives.flatMap((token) => componentsUsingToken(token, componentCss))).toEqual([]);
  });
});

describe('elevation exceptions', () => {
  const defined = new Set(['elevation-shadow-overlay', 'color-elevation-shadow-overlay-spread', 'shadow-sm-y', 'spacing-xs']);
  const at = (css: Record<string, string>) => elevationExceptions(css, defined).map(({ key, components }) => `${key}: ${components.join(', ')}`);

  it('lists elevation that is missing, misclassified, or borrowed', () => {
    expect(
      at({
        'a/one.module.css': '.x { box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2); }',
        'a/two.module.css': '.x { box-shadow: var(--elevation-shadow-floating); }',
        'a/three.module.css': '.x { box-shadow: 0 0 0 var(--color-elevation-shadow-overlay-spread); }',
        'a/four.module.css': '.x { box-shadow: 0 var(--shadow-sm-y) 0 0 red; }',
        'a/five.module.css': '.x { box-shadow: 0 var(--spacing-xs) var(--spacing-xs) red; }',
      }),
    ).toEqual(['raw-blurred: One', 'missing-token: Two', 'rebuilt-role: Three', 'primitive-shadow: Four', 'borrowed-geometry: Five']);
  });

  it('leaves the elevation role, Shape strokes, and local properties alone', () => {
    expect(
      at({
        'a/popup.module.css': '.x { box-shadow: var(--elevation-shadow-overlay); }',
        'a/tabs.module.css': '.x { box-shadow: inset 0 calc(-1 * var(--border-width-sm)) 0 0 var(--color-border-default); }',
        'a/avatar.module.css': '.x { --ring: 0 0 0 var(--border-width-sm) red; box-shadow: var(--ring); }',
      }),
    ).toEqual([]);
  });

  it('reads the generated token CSS for what exists', () => {
    const tokens = declaredProperties(...generated);
    expect(tokens.has('elevation-shadow-overlay')).toBe(true);
    expect(tokens.has('color-elevation-shadow-overlay-inner')).toBe(true);
  });
});

describe('Foundations / Elevation copy', () => {
  it('names the floating surfaces that take the overlay shadow', () => {
    expect(componentsUsingToken('elevation-shadow-overlay', componentCss)).toEqual(['Modal Dialog', 'Popup', 'Rich Text Area', 'Toast']);
    for (const consumer of ['organisms/dropdown-menu/dropdown-menu', 'organisms/date-picker/date-picker', 'organisms/time-picker/time-picker', 'molecules/inline-message/inline-message']) {
      expect(readFileSync(`${COMPONENTS}/${consumer}.tsx`, 'utf8')).toContain('<Popup');
    }
    expect(readFileSync(`${COMPONENTS}/molecules/select/select.tsx`, 'utf8')).toMatch(/DropdownMenu/);
    expect(readFileSync(`${COMPONENTS}/atoms/tooltip/tooltip.tsx`, 'utf8')).toMatch(/unstyled/);
    expect(blurredShadowsIn('tooltip')).toBe(false);
  });

  it('says floating surfaces keep their border, and resting surfaces cast no shadow', () => {
    for (const name of ['popup', 'toast', 'modal-dialog', 'rich-text-area']) expect(cssOf(name)).toMatch(/border: var\(--border-width-sm\) solid var\(--color-border-default\)/);
    for (const name of ['card', 'text-field', 'text-area', 'table']) expect(blurredShadowsIn(name)).toBe(false);
  });

  it('cites the recessed examples', () => {
    expect(cssOf('empty-state')).toMatch(/var\(--color-elevation-surface-sunken-default\)/);
    expect(cssOf('progress-bar')).toMatch(/var\(--color-elevation-surface-deep-default\)/);
    expect(cssOf('card')).toMatch(/sunken/);
    expect(cssOf('card')).toMatch(/deep/);
  });
});
