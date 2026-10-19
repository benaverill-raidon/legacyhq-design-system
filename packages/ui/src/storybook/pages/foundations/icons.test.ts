// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as generatedIcons from '../../../assets/icons/generated';
import {
  BRAND_MARKS,
  CATEGORIES,
  colorsIn,
  controlHeights,
  fixedSizes,
  gridsOf,
  iconExceptions,
  iconProps,
  icons,
  iconsIn,
  iconUsage,
  iconUsers,
  identicalGlyphs,
  INVERSE_SURFACES,
  LOOK_ALIKES,
  lowestContrast,
  searchIcons,
  sizesIn,
  spaciousBoxIn,
} from './icons-data';

// Foundations / Icons renders from the icon metadata, Icon's CSS and contract, the DTCG source, and
// component source, so those must agree, and the exceptions detector must catch what it lists. The
// page's authored copy also cites specific components and glyphs - pinned here so the copy fails
// loudly instead of drifting.

const read = (dir: string, test: (file: string) => boolean): Record<string, string> =>
  Object.fromEntries(
    readdirSync(dir, { recursive: true, encoding: 'utf8' })
      .filter(test)
      .map((file: string) => [`${dir}/${file}`.replace(/\\/g, '/'), readFileSync(`${dir}/${file}`, 'utf8')]),
  );
const COMPONENTS = 'packages/ui/src/components';
const componentTsx = read(COMPONENTS, (file) => file.endsWith('.tsx'));
const sourceSvgs = read('packages/ui/src/assets/icons/source', (file) => file.endsWith('.svg'));
const iconCss = readFileSync(`${COMPONENTS}/primitives/icon/icon.module.css`, 'utf8');
const sourceOf = (path: string) => readFileSync(`${COMPONENTS}/${path}`, 'utf8');
const exported = new Set(Object.keys(generatedIcons));
const byName = (name: string) => icons.find((icon) => icon.name === name);

describe('Foundations / Icons data', () => {
  it('reads every icon, with a generated component, in one of two categories', () => {
    expect(icons.length).toBe(Object.keys(sourceSvgs).length);
    for (const icon of icons) expect(exported.has(icon.component)).toBe(true);
    expect(CATEGORIES.reduce((sum, category) => sum + iconsIn(category).length, 0)).toBe(icons.length);
  });

  it('draws every glyph on one 16px grid, with one glyph filed twice', () => {
    expect(gridsOf(Object.values(sourceSvgs))).toEqual([16]);
    const svgByName = Object.fromEntries(Object.entries(sourceSvgs).map(([path, svg]) => [path.split('/').pop()!.replace('.svg', ''), svg]));
    expect(identicalGlyphs(svgByName)).toEqual([['incapacitated', 'life-insurance-policy']]);
  });

  it('reads sizes, the spacious box, and control heights from CSS and tokens', () => {
    expect(sizesIn(iconCss)).toEqual([
      { name: 'md', token: 'size-icon-md', px: 16 },
      { name: 'sm', token: 'size-icon-sm', px: 12 },
    ]);
    expect(spaciousBoxIn(iconCss)).toEqual({ token: 'size-300', px: 24 });
    expect(controlHeights.map(({ px }) => px)).toEqual([24, 32, 40, 48]);
  });

  it('reads the color options, inherit first, and every one but disabled clears 3:1', () => {
    const colors = colorsIn(iconCss);
    expect(colors[0]).toEqual({ name: 'inherit', token: undefined });
    expect(colors.map(({ name }) => name)).toEqual(['inherit', 'default', 'subtle', 'inverse', 'brand', 'selected', 'success', 'warning', 'error', 'information', 'disabled']);
    for (const { name, token } of colors) {
      if (!token || name === 'disabled') continue;
      const contrast = lowestContrast(token, name === 'inverse' ? INVERSE_SURFACES : undefined);
      expect(contrast.Light).toBeGreaterThanOrEqual(3);
      expect(contrast.Dark).toBeGreaterThanOrEqual(3);
    }
  });

  it('reads the props from the contract, with inherit as the color default', () => {
    expect(iconProps.map(({ name }) => name)).toEqual(['size', 'spacing', 'color', 'title', 'decorative', 'className', 'testId']);
    expect(iconProps.find(({ name }) => name === 'color')?.default).toBe('inherit');
  });

  it('searches names and keywords', () => {
    expect(searchIcons('trash').map(({ name }) => name)).toEqual(['delete']);
    expect(searchIcons('arrow up').map(({ name }) => name).sort()).toEqual(['arrow-up', 'arrow-up-left', 'arrow-up-right']);
    expect(searchIcons('')).toHaveLength(icons.length);
  });
});

describe('icon usage', () => {
  it('finds which components import library icons', () => {
    const usage = iconUsage(componentTsx);
    expect(usage.LinkExternalIcon).toEqual(['Link']);
    expect(usage.StatusErrorIcon).toEqual(['Banner', 'Field', 'Inline Message', 'Modal Dialog', 'Section Message', 'Toast']);
    expect(iconUsers(componentTsx)).toHaveLength(20);
  });

  it('cites the components that use sm', () => {
    expect(fixedSizes(componentTsx, 'sm')).toEqual([
      { component: 'Menu', icon: 'CloseIcon' },
      { component: 'Table', icon: 'ArrowUpIcon' },
      { component: 'Table', icon: 'ArrowDownIcon' },
    ]);
    expect(sourceOf('atoms/link/link.module.css')).toMatch(/\.size_sm \{\s*--link-icon-size: var\(--size-icon-sm\);/);
    expect(sourceOf('atoms/link/link.tsx')).toContain('<LinkExternalIcon size={size} />');
  });
});

describe('icon exceptions', () => {
  const at = (files: Record<string, string>) => iconExceptions(files).map(({ key, components }) => `${key}: ${components.join(', ')}`);

  it('lists glyphs drawn by hand, fixed colors, and unnamed icon-only controls', () => {
    expect(
      at({
        'x/components/atoms/one/one.tsx': 'export const One = () => <svg viewBox="0 0 16 16"><path d="M0 0" /></svg>;',
        'x/components/atoms/two/two.tsx': "export const Two = () => <CheckIcon style={{ color: 'red' }} />;",
        'x/components/atoms/three/three.tsx': 'export const Three = () => <IconButton onClick={go}><CloseIcon /></IconButton>;',
      }),
    ).toEqual(['raw-glyph: One', 'fixed-color: Two', 'unnamed-control: Three']);
  });

  it('leaves graphics, the color prop, named controls, and stories alone', () => {
    expect(
      at({
        'x/components/atoms/spinner/spinner.tsx': 'export const Spinner = () => <svg />;',
        'x/components/atoms/avatar/avatar-status-approved.tsx': 'export const Badge = () => <svg />;',
        'x/components/atoms/four/four.tsx': '<CheckIcon color="success" />',
        'x/components/atoms/five/five.tsx': '<IconButton aria-label={label} onClick={() => a > b}><CloseIcon /></IconButton>',
        'x/components/atoms/six/six.tsx': '<IconButton {...rest}><CloseIcon /></IconButton>',
        'x/components/atoms/seven/Seven.stories.tsx': '<svg />',
      }),
    ).toEqual([]);
  });
});

describe('Foundations / Icons copy', () => {
  it('names look-alikes and brand marks that exist', () => {
    for (const [a, b] of LOOK_ALIKES) {
      expect(byName(a)).toBeDefined();
      expect(byName(b)).toBeDefined();
    }
    for (const name of BRAND_MARKS) expect(byName(name)).toBeDefined();
    expect(byName('task-not-started')?.category).toBe('single-purpose');
    expect(byName('radio-unchecked')?.category).toBe('multi-purpose');
  });

  it('cites the components that draw glyphs at their own sizes', () => {
    expect(sourceOf('molecules/icon-tile/icon-tile.module.css')).toMatch(/--icon-tile-icon-size: calc\(var\(--icon-tile-size\) \* 2 \/ 3\)/);
    expect(sourceOf('atoms/avatar/avatar-status-approved.tsx')).toMatch(/<svg/);
    expect(readFileSync('packages/ui/src/tokens/generated/tokens.css', 'utf8')).toMatch(/--component-avatar-badge-icon-size-md:/);
  });

  it('cites how components name and announce icons', () => {
    expect(sourceOf('atoms/icon-button/icon-button.tsx')).toContain('IconButton requires either `aria-label` or `aria-labelledby`');
    for (const path of ['organisms/banner/banner.tsx', 'organisms/section-message/section-message.tsx', 'organisms/toast/toast-status.ts']) {
      expect(sourceOf(path)).toMatch(/error: 'Error'/);
    }
    expect(sourceOf('organisms/toast/toast.types.ts')).toContain('dismissLabel?: string;');
    expect(sourceOf('organisms/menu/menu.types.ts')).toContain('clearSearchLabel?: string;');
    expect(sourceOf('atoms/link/link.tsx')).toContain("newTabLabel = '(opens in a new tab)'");
  });
});
