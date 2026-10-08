import { describe, expect, it } from 'vitest';
import { componentsUsingToken, kindOf, shadowLayers, tokenUses } from './css-usage';

// The Foundations pages say which components use each token, and for what, from these helpers - so
// a property landing in the wrong kind would put a component in the wrong column or exception.

describe('css-usage', () => {
  it('classifies properties by what they do with a length', () => {
    expect(['padding-inline', 'gap', 'margin-block-start', 'inset-inline-end', 'min-block-size'].map(kindOf)).toEqual([
      'padding',
      'gap',
      'margin',
      'inset',
      'size',
    ]);
    expect(['border-radius', 'border-start-end-radius', 'border', 'border-block-end', 'border-inline-start-width', 'outline', 'stroke-width'].map(kindOf)).toEqual([
      'radius',
      'radius',
      'stroke',
      'stroke',
      'stroke',
      'stroke',
      'stroke',
    ]);
    expect(['outline-offset', 'transform', 'box-shadow', 'line-height', 'border-collapse'].map(kindOf)).toEqual([
      'focus-offset',
      'motion',
      'shadow',
      'typography',
      'other',
    ]);
  });

  it('attributes a token set through a custom property to where that property is consumed', () => {
    const uses = tokenUses({
      'a/button.module.css': '.b { --button-radius: var(--border-radius-lg); border-radius: var(--button-radius); }',
      'a/field.module.css': '.f { box-shadow: inset 0 0 0 calc(var(--border-width-md) - var(--border-width-sm)) red; }',
    });
    expect(uses).toEqual(
      expect.arrayContaining([
        { component: 'button', token: 'border-radius-lg', kind: 'radius', bare: true },
        { component: 'field', token: 'border-width-md', kind: 'shadow', bare: false },
      ]),
    );
  });

  it('reads each shadow layer: blurred (elevation) or not (a stroke), and its raw lengths', () => {
    const [ring, drop, perimeter] = shadowLayers(
      'inset 0 0 0 var(--border-width-sm) var(--color-a), 0 8px 12px 0 var(--color-b), 0 0 1px var(--color-c)',
    );
    expect(ring).toEqual({ inset: true, lengths: ['0', '0', '0', 'var(--border-width-sm)'], blurred: false, rawLengths: [], references: ['border-width-sm', 'color-a'] });
    expect(drop).toMatchObject({ inset: false, blurred: true, rawLengths: ['8px', '12px'], references: ['color-b'] });
    expect(perimeter).toMatchObject({ blurred: true, rawLengths: ['1px'] });
    expect(shadowLayers('var(--elevation-shadow-overlay)')).toEqual([
      { inset: false, lengths: [], blurred: false, rawLengths: [], references: ['elevation-shadow-overlay'] },
    ]);
    expect(shadowLayers('inset 0 calc(-1 * var(--border-width-sm)) 0 0 red')[0]).toMatchObject({ blurred: false, rawLengths: [] });
  });

  it('matches a token exactly, not by prefix', () => {
    const css = { 'a/one.module.css': '.x { inline-size: var(--size-1000); }', 'a/two.module.css': '.x { inline-size: var(--size-100); }' };
    expect(componentsUsingToken('size-100', css)).toEqual(['Two']);
  });
});
