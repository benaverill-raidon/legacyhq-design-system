// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  componentDimensionTokens,
  overlapScale,
  sizeFamilies,
  spacingExceptions,
  spacingScale,
  unfamiliedSizes,
  unmatchedTokens,
} from './spacing-data';
import { tokenUses } from '../../blocks/css-usage';

// Foundations / Spacing renders from the token source and component CSS, so every dimension token
// must land in a family and resolve, and the CSS analysis must attribute uses to the right
// property. The page's authored copy also cites specific components and steps - pinned here so the
// copy fails loudly instead of drifting.

const COMPONENTS = 'packages/ui/src/components';
const componentCss: Record<string, string> = Object.fromEntries(
  readdirSync(COMPONENTS, { recursive: true, encoding: 'utf8' })
    .filter((file: string) => file.endsWith('.module.css'))
    .map((file: string) => [`${COMPONENTS}/${file}`, readFileSync(`${COMPONENTS}/${file}`, 'utf8')]),
);
const cssOf = (name: string) => {
  const entry = Object.entries(componentCss).find(([path]) => path.replace(/\\/g, '/').endsWith(`/${name}.module.css`));
  if (!entry) throw new Error(`no stylesheet for ${name}`);
  return entry[1].replace(/\/\*[\s\S]*?\*\//g, '');
};
/** The declarations of one rule, e.g. rule('button', '.size_md'). */
const rule = (name: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return cssOf(name).match(new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
};

describe('Foundations / Spacing data', () => {
  it('puts every semantic dimension token in a family, and every one resolves to pixels', () => {
    expect(unmatchedTokens).toEqual([]);
    expect(unfamiliedSizes).toEqual([]);
    const all = [...spacingScale, ...overlapScale, ...sizeFamilies.flatMap((family) => family.tokens)];
    expect(all.filter(({ px }) => !Number.isFinite(px)).map(({ name }) => name)).toEqual([]);
  });

  it('orders the spacing scale by size, including the 6px step', () => {
    const values = spacingScale.map(({ px }) => px);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(spacingScale.find(({ name }) => name === 'spacing-075')?.px).toBe(6);
    expect(overlapScale.every(({ px }) => px < 0)).toBe(true);
  });

  it('attributes a step set through a component variable to the property that consumes it', () => {
    const uses = tokenUses(componentCss).filter(({ component, token }) => component === 'text-field' && token === 'spacing-075');
    expect(new Set(uses.map(({ kind }) => kind))).toEqual(new Set(['gap', 'padding']));
  });
});

describe('spacing exceptions', () => {
  const at = (css: Record<string, string>) =>
    spacingExceptions(css).map(({ key, components, raw }) => `${key}: ${components.join(', ')}${raw?.length ? ` (raw: ${raw.join(', ')})` : ''}`);

  it('lists spacing that is missing, misclassified, or borrowed - not layout arithmetic', () => {
    expect(
      at({
        'a/one.module.css': '.x { gap: var(--measurement-6); }',
        'a/two.module.css': '.x { block-size: var(--spacing-lg); }',
        'a/three.module.css': '.x { padding-block: var(--size-075); }',
        'a/four.module.css': '.x { inset-block-start: calc(100% + var(--spacing-sm)); min-inline-size: calc(var(--spacing-lg) * 2); }',
      }),
    ).toEqual(['primitive-as-spacing: One', 'size-as-spacing: Three', 'spacing-as-size: Two']);
  });

  it('leaves sizing and layout debt off the page', () => {
    expect(
      at({
        'a/spinner.module.css': '.x { inline-size: var(--measurement-32); }',
        'a/table.module.css': '.row { block-size: 40px; }',
        'a/modal-dialog.module.css': '.panel { inline-size: 600px; }',
      }),
    ).toEqual([]);
  });

  it('follows a custom property to the component that consumes it', () => {
    expect(
      at({
        'a/focus-ring.module.css': '.ring { --focus-ring-offset: 2px; outline-offset: var(--focus-ring-offset); }',
        'a/button.module.css': '.button { --focus-ring-offset: var(--spacing-xxs); }',
      }),
    ).toEqual(['spacing-as-focus-offset: Button (raw: Focus Ring)']);
  });

  it('shows raw focus-ring offsets only alongside offsets that borrow spacing tokens', () => {
    expect(at({ 'a/focus-ring.module.css': '.ring { --focus-ring-offset: 2px; outline-offset: var(--focus-ring-offset); }' })).toEqual([]);
  });

  it('finds the exceptions the page currently lists', () => {
    expect(spacingExceptions(componentCss).map(({ key }) => key)).toEqual(
      expect.arrayContaining(['spacing-as-focus-offset', 'spacing-as-shadow', 'spacing-as-typography']),
    );
  });
});

describe('Foundations / Spacing copy', () => {
  it('cites the related-item steps components actually use', () => {
    expect(rule('toggle-button', '.toggleButton')).toMatch(/gap: var\(--spacing-075\)/);
    expect(rule('field', '.label')).toMatch(/padding-bottom: var\(--spacing-xs\)/);
    for (const group of ['button-group', 'chip-group', 'tag-group']) expect(cssOf(group)).toMatch(/gap: var\(--spacing-sm\)/);
  });

  it('cites Button padding by size and Modal Dialog’s content inset', () => {
    expect(rule('button', '.size_xs')).toMatch(/padding-inline: var\(--spacing-sm\)/);
    expect(rule('button', '.size_sm')).toMatch(/padding-inline: var\(--spacing-sm\)/);
    expect(rule('button', '.size_md')).toMatch(/padding-inline: var\(--spacing-md\)/);
    expect(rule('button', '.size_lg')).toMatch(/padding-inline: var\(--spacing-lg\)/);
    expect(rule('button', '.button')).toMatch(/block-size: var\(--size-control-md\)[\s\S]*padding-block: var\(--spacing-none\)/);
    expect(rule('modal-dialog', '.body')).toMatch(/padding-inline: var\(--spacing-2xl\)/);
  });

  it('cites Form’s group and section spacing', () => {
    expect(rule('form', '.row')).toMatch(/gap: var\(--spacing-lg\)/);
    expect(rule('form', '.header')).toMatch(/gap: var\(--spacing-md\)/);
    expect(rule('form', '.section')).toMatch(/padding-block-start: var\(--spacing-3xl\)/);
    expect(rule('form', '.footer')).toMatch(/padding-block-start: var\(--spacing-4xl\)/);
  });

  it('cites the right families in the spacing-vs-sizing examples', () => {
    expect(rule('badge', '.badge')).toMatch(/block-size: var\(--size-200\)/);
    expect(cssOf('tag')).toMatch(/var\(--size-icon-md\)/);
    expect(cssOf('avatar-group')).toMatch(/var\(--overlap-/);
    expect(cssOf('inline-edit')).toMatch(/calc\(100% \+ var\(--spacing-sm\)\)/);
    const tokensCss = readFileSync('packages/ui/src/tokens/generated/tokens.css', 'utf8');
    expect(tokensCss).toMatch(/--component-switch-md-thumb-translation:/);
    expect(tokensCss).toMatch(/--component-menu-width-md:/);
    const size200 = sizeFamilies.flatMap((family) => family.tokens).find(({ name }) => name === 'size-200');
    expect(size200?.px).toBe(spacingScale.find(({ name }) => name === 'spacing-lg')?.px);
  });

  it('lists the component token files the structure section names', () => {
    expect(componentDimensionTokens.map(({ component }) => component)).toEqual(
      expect.arrayContaining(['menu', 'slider', 'switch', 'tooltip']),
    );
  });
});
