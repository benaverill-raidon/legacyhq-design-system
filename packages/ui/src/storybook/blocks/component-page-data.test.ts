// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { broadest, shownDefault, figmaFact, formatDate, headerFacts, isStacked, PIN_GAP, PIN_LIFT, placePins, propRows, registryEntry, rootClassOf, splitDescription, tokenRows, whenOf } from './component-page-data';

const buttonCss: string = readFileSync('packages/ui/src/components/atoms/button/button.module.css', 'utf8');

describe('header facts', () => {
  it('formats a date from its parts, so no time zone moves the day', () => {
    expect(formatDate('2026-09-01')).toBe('Sep 1, 2026');
    expect(formatDate('2026-12-31')).toBe('Dec 31, 2026');
  });

  it('describes each figmaSource shape in words', () => {
    expect(figmaFact(registryEntry('button').figmaSource)).toBe('button, 176 variants, checked Sep 1, 2026');
    expect(figmaFact(registryEntry('progress-bar').figmaSource)).toMatch(/^progress-bar-linear \+ progress-bar-circular, checked /);
    expect(figmaFact(registryEntry('radio').figmaSource)).toMatch(/^radio \+ /);
    expect(figmaFact(registryEntry('logo').figmaSource)).toBeNull();
    // A component with its own set and a separate part set names its own.
    expect(figmaFact(registryEntry('inline-message').figmaSource)).toMatch(/^inline-message, \d+ variants, checked /);
  });

  it('lists the category label, the tier, and the Figma source', () => {
    expect(headerFacts(registryEntry('button'))).toEqual(['Actions', 'Atom', 'Figma: button, 176 variants, checked Sep 1, 2026']);
    expect(headerFacts(registryEntry('logo'))).toEqual(['Foundations', 'Primitive']);
  });
});

describe('anatomy numbers', () => {
  it('numbers a row of parts above the specimen, and the root below it', () => {
    const root = { x: 0, y: 0, width: 200, height: 40 };
    const leading = { x: 10, y: 12, width: 16, height: 16 };
    const content = { x: 34, y: 10, width: 120, height: 20 };
    const trailing = { x: 170, y: 12, width: 16, height: 16 };
    const pins = placePins([root, leading, content, trailing, null]);
    expect(pins[0]).toEqual({ x: 100, y: 40, length: PIN_LIFT, side: 'below' });
    expect(pins.slice(1, 4).map((pin) => [pin?.x, pin?.side])).toEqual([
      [18, 'above'],
      [94, 'above'],
      [178, 'above'],
    ]);
    expect(pins[1]).toMatchObject({ y: -PIN_LIFT, length: 12 + PIN_LIFT });
    expect(pins[4]).toBeNull();
  });

  it('spreads numbers that would collide, as far as their parts allow', () => {
    const wide = placePins([
      { x: 0, y: 0, width: 16, height: 16 },
      { x: 16, y: 0, width: 30, height: 16 },
    ]);
    expect(wide.map((pin) => pin?.x)).toEqual([8, 8 + PIN_GAP]);
    // Two 16px icons side by side: the second number moves as far as its icon reaches.
    const narrow = placePins([
      { x: 0, y: 0, width: 16, height: 16 },
      { x: 16, y: 0, width: 16, height: 16 },
    ]);
    expect(narrow.map((pin) => pin?.x)).toEqual([8, 28]);
  });

  it('numbers a column of parts on the left, and the part that holds them above its corner', () => {
    const field = { x: 0, y: 0, width: 300, height: 100 };
    const label = { x: 0, y: 0, width: 300, height: 20 };
    const control = { x: 0, y: 28, width: 300, height: 40 };
    const message = { x: 0, y: 76, width: 300, height: 24 };
    expect(isStacked([field, label, control, message])).toBe(true);
    const pins = placePins([field, label, control, message]);
    expect(pins[0]).toEqual({ x: PIN_GAP / 2, y: -PIN_LIFT, length: PIN_LIFT, side: 'above' });
    expect(pins.slice(1).map((pin) => [pin?.side, pin?.x, pin?.y])).toEqual([
      ['left', -PIN_LIFT, 10],
      ['left', -PIN_LIFT, 48],
      ['left', -PIN_LIFT, 88],
    ]);
  });

  it('numbers a part nested in a row above or below the specimen, not on another part', () => {
    const field = { x: 0, y: 0, width: 300, height: 100 };
    const label = { x: 0, y: 0, width: 120, height: 20 };
    const required = { x: 110, y: 2, width: 8, height: 16 };
    const control = { x: 0, y: 28, width: 300, height: 40 };
    const message = { x: 0, y: 76, width: 300, height: 24 };
    const icon = { x: 0, y: 80, width: 16, height: 16 };
    const pins = placePins([field, label, required, control, message, icon]);
    expect(pins.map((pin) => pin?.side)).toEqual(['above', 'left', 'above', 'left', 'left', 'below']);
    expect(pins[2]).toMatchObject({ x: 114, y: -PIN_LIFT, length: 2 + PIN_LIFT });
    expect(pins[5]).toMatchObject({ x: 8, y: 96, length: 4 + PIN_LIFT });
  });
});

describe('API rows', () => {
  it("leaves a function's source out of the Default column", () => {
    expect(shownDefault("'md'")).toBe("'md'");
    expect(shownDefault('(count) => `+${count}`')).toBeNull();
    expect(shownDefault('function defaultFormat(date) {\n  return date;\n}')).toBeNull();
    expect(shownDefault(undefined)).toBeNull();
  });

  it('splits @deprecated off a description', () => {
    expect(splitDescription('@deprecated Renamed to `tone`. Still accepted.')).toEqual({ text: '', deprecated: 'Renamed to `tone`. Still accepted.' });
    expect(splitDescription('Semantic tone.')).toEqual({ text: 'Semantic tone.', deprecated: null });
    expect(splitDescription(undefined)).toEqual({ text: '', deprecated: null });
  });

  it('keeps declaration order, lists deprecated props after, and leaves out className and style', () => {
    const { current, deprecated } = propRows({
      props: {
        tone: { tsType: { name: 'union', raw: "'default' | 'error'" }, defaultValue: { value: "'default'" }, description: 'Meaning.' },
        appearance: { tsType: { name: 'union', raw: "'default' | 'error'" }, description: '@deprecated Renamed to `tone`.' },
        children: { required: true, tsType: { name: 'ReactReactNode', raw: 'React.ReactNode' }, description: '' },
        className: { tsType: { name: 'string' } },
        isOpen: { tsType: { name: 'boolean' } },
      },
    });
    expect(current.map(({ name, type, defaultValue, required }) => [name, type, defaultValue, required])).toEqual([
      ['tone', "'default' | 'error'", "'default'", false],
      ['children', 'React.ReactNode', null, true],
      ['isOpen', 'boolean', null, false],
    ]);
    expect(deprecated.map(({ name, deprecated: reason }) => [name, reason])).toEqual([['appearance', 'Renamed to `tone`.']]);
  });
});

describe('design tokens', () => {
  it('reads a selector as the variant and state it applies in', () => {
    expect(whenOf('.button', 'button')).toBe('base');
    expect(whenOf('.prominence_secondary.tone_error', 'button')).toBe('secondary · error');
    expect(whenOf(".prominence_primary:not(:disabled):not([data-loading='true']):is(:hover, :focus-visible, [data-force-state='hover'])", 'button')).toBe(
      'primary · hover / focus',
    );
    expect(whenOf('.prominence_tertiary:disabled:hover', 'button')).toBe('tertiary · disabled');
    expect(whenOf('.button.inverse:not(:disabled)', 'button')).toBe('inverse');
    expect(whenOf('.fullWidth', 'button')).toBe('full width');
    expect(whenOf(".root[aria-disabled='true']", 'root')).toBe('disabled');
    expect(whenOf('.input:focus', 'root')).toBe('input · focus');
    expect(whenOf(".root:has(.input:autofill), .root[data-force-state='autofill']", 'root')).toBe('input · autofill');
    expect(whenOf(".root[data-editable-cell]:not([data-invalid='true']):is(:focus-within)", 'root')).toBe('editable cell · focus');
    expect(whenOf(".root[data-context='inline'][data-size='md']", 'root')).toBe('inline · md');
    expect(whenOf('.editor :global(.rta-active)', 'root')).toBe('editor · rta active');
    expect(whenOf(".input:checked, .root[aria-checked='true']", 'root')).toBe('input · checked');
  });

  it("finds a stylesheet's root class: the first one it styles", () => {
    expect(rootClassOf(buttonCss)).toBe('button');
    expect(rootClassOf('/* .note */\n.root {\n}\n.child {\n}')).toBe('root');
  });

  it('drops a condition a broader one covers', () => {
    expect(broadest(['secondary · disabled', 'secondary · error · disabled', 'primary · disabled'])).toEqual(['secondary · disabled', 'primary · disabled']);
    expect(broadest(['base', 'md'])).toEqual(['base']);
    expect(broadest(['secondary · brand', 'tertiary · brand'])).toEqual(['secondary · brand', 'tertiary · brand']);
  });

  it("reads Button's tokens by family, with the property and when", () => {
    const rows = tokenRows(buttonCss, 'button');
    const find = (token: string, property: string) => rows.find((row) => row.token === token && row.property === property);
    expect([...new Set(rows.map((row) => row.family))]).toEqual(['Color', 'Typography', 'Spacing', 'Size', 'Radius', 'Border width', 'Motion']);
    expect(find('typography-heading-xs-*', 'font')?.when).toEqual(['base']);
    expect(find('typography-heading-sm-*', 'font')?.when).toEqual(['lg']);
    // A component's own custom property counts as the property that reads it.
    expect(find('border-radius-lg', 'border-radius')?.when).toEqual(['sm', 'md']);
    expect(find('spacing-sm', 'padding-inline')?.when).toEqual(['xs', 'sm']);
    expect(find('color-background-error-bold-default', 'background')?.when).toEqual(['primary · error']);
    expect(find('color-background-disabled', 'background')?.when).toEqual(['secondary · disabled', 'primary · disabled', 'tertiary · disabled']);
    // An open menu trigger keeps the hover fill.
    expect(find('color-background-brand-primary-bold-hover', 'background')?.when).toEqual(['primary · hover / focus / expanded']);
    expect(find('fade-quick', 'transition')?.when).toEqual(['base']);
  });

  it('follows a custom property by its whole name, not a longer one that starts the same', () => {
    const rows = tokenRows(
      `.root {
  --root-fill: var(--color-background-neutral-bold-default);
  --root-fill-layer: linear-gradient(var(--color-background-selected-default-default), transparent);
  background: var(--root-fill);
  background-image: var(--root-fill-layer);
}`,
      'root',
    );
    expect(rows.map(({ token, property }) => `${token} -> ${property}`)).toEqual([
      'color-background-neutral-bold-default -> background',
      'color-background-selected-default-default -> background-image',
    ]);
  });

  it("follows a stylesheet's own custom properties instead of listing them, and files component tokens", () => {
    const rows = tokenRows(
      `.root {
  --root-size: var(--component-slider-handle-width-md);
  --other-radius: var(--border-radius-sm);
  inline-size: var(--root-size);
  border-radius: var(--other-radius);
}`,
      'root',
    );
    expect(rows.map(({ family, token, property }) => `${family}: ${token} -> ${property}`)).toEqual([
      'Radius: border-radius-sm -> border-radius',
      'Component: component-slider-handle-width-md -> inline-size',
    ]);
  });
});
