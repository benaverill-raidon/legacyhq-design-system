// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  accent,
  aliasOf,
  backgroundMatrices,
  componentsUsing,
  contrast,
  dataViz,
  groupOf,
  MODES,
  palettes,
  primitiveColorNames,
  resolveColor,
  semanticNames,
  surfaces,
  tokensIn,
} from './color-data';

// Foundations / Color renders straight from the token source, so a new token must land somewhere
// on the page (or fail here), and every value it shows must resolve. Contrast is reported on the
// page, not enforced - the thresholds belong to the Accessibility page.

const COMPONENTS = 'packages/ui/src/components';
const componentCss: Record<string, string> = Object.fromEntries(
  readdirSync(COMPONENTS, { recursive: true, encoding: 'utf8' })
    .filter((file: string) => file.endsWith('.module.css'))
    .map((file: string) => [`${COMPONENTS}/${file}`, readFileSync(`${COMPONENTS}/${file}`, 'utf8')]),
);

describe('Foundations / Color data', () => {
  it('places every semantic color token in a section of the page', () => {
    expect(semanticNames.filter((name) => !groupOf(name))).toEqual([]);
  });

  it('resolves every semantic token to a color in both themes', () => {
    const unresolved = MODES.flatMap((mode) => semanticNames.filter((name) => !resolveColor(name, mode)).map((name) => `${mode}: ${name}`));
    expect(unresolved).toEqual([]);
  });

  it('shows every displayed token in a table, matrix, strip, or extras list', () => {
    const placed = new Set<string>([
      ...tokensIn('content'),
      ...tokensIn('border'),
      ...tokensIn('background-disabled'),
      ...tokensIn('background-autofill'),
      ...[...Object.values(backgroundMatrices), surfaces, accent.background].flatMap(({ rows, extras }) => [
        ...rows.flatMap(({ cells }) => Object.values(cells)),
        ...extras,
      ]),
      ...accent.hues.flatMap((hue) => [accent.content(hue, 'default'), accent.content(hue, 'bold'), accent.border(hue)]),
      ...accent.extras,
      ...dataViz.sequences.flatMap(({ steps }) => steps.map(({ name }) => name)),
      ...dataViz.categorical.flatMap(({ byHue }) => Object.values(byHue)),
      ...dataViz.diverging,
    ]);
    const shown = semanticNames.filter((name) => groupOf(name) !== 'shadows');
    expect(shown.filter((name) => !placed.has(name))).toEqual([]);
    expect(dataViz.unplaced).toEqual([]);
  });

  it('lays out every primitive color in a family ramp', () => {
    expect(palettes.unplaced).toEqual([]);
    expect(palettes.families.reduce((total, { solid, alpha }) => total + solid.length + alpha.length, 0)).toBe(primitiveColorNames.length);
  });

  it('records the primitive each semantic token aliases in each theme', () => {
    expect(aliasOf('color-content-default', 'Light')).toMatch(/^color-/);
    expect(aliasOf('color-background-brand-primary-bold-default', 'Light')).toBe('color-brand-prussian-solid-900');
  });

  it('calculates a contrast ratio for every text color on every surface in both themes', () => {
    const cells = contrast.flatMap(({ byMode }) => MODES.flatMap((mode) => byMode[mode]));
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.filter(({ ratio }) => !Number.isFinite(ratio) || ratio < 1 || ratio > 21)).toEqual([]);
  });

  it('finds which components use the accent and data-viz colors', () => {
    expect(componentsUsing('color-background-accent-', componentCss)).toContain('label');
    expect(componentsUsing('color-data-viz-', componentCss)).toContain('slider');
  });
});
