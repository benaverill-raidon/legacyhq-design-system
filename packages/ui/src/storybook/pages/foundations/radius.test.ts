// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { componentsUsingToken } from '../../blocks/css-usage';
import { componentShapeTokens, primitiveScale, radiusScale, shapeExceptions, unmatchedTokens, widthScale } from './radius-data';

// Foundations / Radius renders from the token source and component CSS, so every border token must
// be a radius or a width and resolve, and the exceptions detector must tell a stroke from an
// elevation shadow. The page's authored copy also cites specific components and steps - pinned here
// so the copy fails loudly instead of drifting.

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
const radius = (step: string) => new RegExp(`var\\(--border-radius-${step}\\)`);

describe('Foundations / Radius data', () => {
  it('splits every semantic border token into radius or width, and every one resolves', () => {
    expect(unmatchedTokens).toEqual([]);
    expect([...radiusScale, ...widthScale].filter(({ px }) => !Number.isFinite(px)).map(({ name }) => name)).toEqual([]);
  });

  it('orders the scales by size, with full-round last', () => {
    for (const scale of [radiusScale, widthScale]) {
      const values = scale.map(({ px }) => px);
      expect(values).toEqual([...values].sort((a, b) => a - b));
    }
    expect(radiusScale[radiusScale.length - 1].step).toBe('full-round');
    expect(radiusScale[radiusScale.length - 1].px).toBeGreaterThanOrEqual(999);
  });

  it('has shape primitives of its own and no component-level shape tokens', () => {
    expect(primitiveScale.radius.length).toBeGreaterThan(0);
    expect(primitiveScale.width.length).toBeGreaterThan(0);
    expect(componentShapeTokens).toEqual([]);
  });
});

describe('shape exceptions', () => {
  const at = (css: Record<string, string>) => shapeExceptions(css).map(({ key, components }) => `${key}: ${components.join(', ')}`);

  it('lists shape that is missing, misclassified, or borrowed', () => {
    expect(
      at({
        'a/one.module.css': '.x { border-radius: 6px; }',
        'a/two.module.css': '.x { box-shadow: inset 0 0 0 1px var(--color-border-focus); }',
        'a/three.module.css': '.x { border-radius: var(--border-radius-8); }',
        'a/four.module.css': '.x { border-radius: var(--spacing-xs); }',
        'a/five.module.css': '.x { border: var(--spacing-xxs) solid var(--color-border-default); }',
        'a/six.module.css': '.x { inline-size: var(--border-radius-lg); }',
        'a/seven.module.css': '.x { padding: var(--border-width-sm); }',
      }),
    ).toEqual([
      'raw-radius: One',
      'raw-stroke: Two',
      'primitive-shape: Three',
      'other-token-as-radius: Four',
      'other-token-as-stroke: Five',
      'radius-borrowed: Six',
      'width-borrowed: Seven',
    ]);
  });

  it('leaves elevation, stroke geometry, and arithmetic alone', () => {
    expect(
      at({
        'a/toast.module.css': '.x { box-shadow: 0 8px 12px var(--color-a), 0 0 1px var(--color-b); }',
        'a/field.module.css': '.x { box-shadow: inset 0 calc(-1 * (var(--border-width-md) - var(--border-width-sm))) 0 0 var(--color-c); }',
        'a/menu.module.css': '.d { block-size: var(--border-width-sm); } .r { border-radius: 0; }',
        'a/checkbox.module.css': '.x { border-radius: calc(var(--border-radius-xs) + (var(--size-choice-target) - var(--size-choice-indicator)) / 2); }',
        'a/picker.module.css': '.x { margin-inline-start: calc(-1 * var(--border-width-sm)); }',
      }),
    ).toEqual([]);
  });
});

describe('Foundations / Radius copy', () => {
  it('cites the control radius by size', () => {
    for (const [name, base] of [
      ['button', '.button'],
      ['link-button', '.linkButton'],
      ['toggle-button', '.toggleButton'],
    ]) {
      expect(rule(name, base)).toMatch(radius('sm'));
      expect(rule(name, '.size_sm')).toMatch(radius('lg'));
      expect(rule(name, '.size_md')).toMatch(radius('lg'));
      expect(rule(name, '.size_lg')).toMatch(radius('xl'));
    }
    expect(rule('icon-button', '.size_xs')).toMatch(radius('sm'));
    expect(rule('icon-button', '.size_lg')).toMatch(radius('xl'));
    expect(rule('text-field', '.size_md')).toMatch(radius('lg'));
    expect(rule('text-field', '.size_lg')).toMatch(radius('xl'));
    expect(rule('icon-tile', '.size_xs')).toMatch(radius('sm'));
    expect(rule('icon-tile', '.size_lg')).toMatch(radius('xl'));
  });

  it('cites small elements, containers, and round elements', () => {
    expect(rule('badge', '.badge')).toMatch(radius('sm'));
    expect(cssOf('label')).toMatch(radius('sm'));
    expect(rule('tooltip', '.content')).toMatch(radius('sm'));
    expect(rule('date-picker-calendar', '.day')).toMatch(radius('sm'));
    expect(rule('link', '.root')).toMatch(radius('xs'));
    expect(cssOf('checkbox')).toMatch(radius('xs'));
    expect(rule('card', '.root')).toMatch(radius('lg'));
    expect(cssOf('card')).toMatch(radius('xl'));
    expect(cssOf('card')).toMatch(radius('xxl'));
    expect(rule('popup', '.panelSurface')).toMatch(radius('lg'));
    expect(rule('section-message', '.root')).toMatch(radius('xl'));
    expect(rule('toast', '.root')).toMatch(radius('xl'));
    expect(rule('modal-dialog', '.panel')).toMatch(radius('xxl'));
    for (const name of ['avatar', 'slider', 'switch', 'progress-bar', 'chip', 'banner']) expect(cssOf(name)).toMatch(radius('full-round'));
  });

  it('cites contained Tabs as the nested example', () => {
    const list = rule('tabs', ".root[data-type='contained'] .tablist");
    expect(list).toMatch(radius('xl'));
    expect(list).toMatch(/padding: var\(--spacing-xs\)/);
    expect(rule('tabs', ".root[data-type='contained'] .tab")).toMatch(radius('lg'));
  });

  it('describes md as used only by Rich Text Area’s slash input', () => {
    expect(componentsUsingToken('border-radius-md', componentCss)).toEqual(['Rich Text Area']);
    expect(rule('rich-text-area', '.slashInput')).toMatch(radius('md'));
  });

  it('cites what each border width and stroke technique is used for', () => {
    expect(componentsUsingToken('border-width-lg', componentCss)).toEqual(['Spinner', 'Tabs']);
    expect(rule('focus-ring', '.focusRing')).toMatch(/--focus-ring-width: var\(--border-width-md\)/);
    expect(rule('text-field', '.root')).toMatch(/border: var\(--border-width-sm\) solid/);
    expect(cssOf('text-field')).toContain('box-shadow: inset 0 0 0 calc(var(--border-width-md) - var(--border-width-sm))');
    expect(cssOf('text-area')).toContain('box-shadow: inset 0 0 0 calc(var(--border-width-md) - var(--border-width-sm))');
    expect(rule('menu', '.item_selected')).toMatch(/box-shadow: inset var\(--border-width-md\)/);
    expect(cssOf('time-picker')).toMatch(/box-shadow: inset var\(--border-width-md\)/);
    expect(cssOf('avatar')).toMatch(/box-shadow: inset 0 0 0 var\(--border-width-md\)/);
    expect(rule('avatar-group', '.avatarRing')).toMatch(/box-shadow: 0 0 0 var\(--border-width-sm\)/);
    expect(rule('menu', '.divider')).toMatch(/block-size: var\(--border-width-sm\)/);
  });
});
