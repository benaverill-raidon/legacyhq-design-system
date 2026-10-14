// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { broadest, figmaFact, formatDate, headerFacts, propRows, registryEntry, splitDescription, tokenRows, whenOf } from './component-page-data';

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
  });

  it('lists the category label, the tier, and the Figma source', () => {
    expect(headerFacts(registryEntry('button'))).toEqual(['Actions', 'Atom', 'Figma: button, 176 variants, checked Sep 1, 2026']);
    expect(headerFacts(registryEntry('logo'))).toEqual(['Foundations', 'Primitive']);
  });
});

describe('API rows', () => {
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
});
