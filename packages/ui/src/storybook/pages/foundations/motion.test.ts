// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { componentsUsingToken } from '../../blocks/css-usage';
import {
  animatedComponents,
  declaredProperties,
  durations,
  easings,
  instantHover,
  keyframesOf,
  motionExceptions,
  overshoots,
  peakOf,
  recipes,
  recipesUsing,
  reducedMotion,
} from './motion-data';

// Foundations / Motion renders from the token source and component CSS, so every recipe must resolve
// to a duration and an easing, and the exceptions detector must catch the motion bugs it was built
// from. The page's authored copy also cites specific components and behaviors - pinned here so the
// copy fails loudly instead of drifting.

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
const reduceBlock = (name: string) => cssOf(name).match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
const recipe = (name: string) => recipes.find((entry) => entry.name === name)!;

describe('Foundations / Motion data', () => {
  it('reads four durations, shortest first, and three easings', () => {
    expect(durations.map(({ name, ms }) => `${name} ${ms}`)).toEqual(['duration-fast 150', 'duration-slow 300', 'duration-loop 860', 'duration-loop-slow 1500']);
    expect(easings.map(({ name }) => name)).toEqual(['ease-standard', 'ease-spring', 'ease-loop']);
  });

  it('resolves every recipe to a duration and an easing, with no delay', () => {
    expect(recipes.map(({ name, kind }) => `${name} ${kind}`)).toEqual([
      'fade-quick transition',
      'fade-long transition',
      'move-quick transition',
      'move-long transition',
      'spin-loop loop',
      'pulse-loop loop',
    ]);
    for (const { duration, delayMs } of recipes) {
      expect(Number.isFinite(duration.ms)).toBe(true);
      expect(delayMs).toBe(0);
    }
  });

  it('pairs fade with the standard curve and move with the spring, quick with fast and long with slow', () => {
    for (const { name, easing, points, duration } of recipes.filter(({ kind }) => kind === 'transition')) {
      expect(easing).toBe(name.startsWith('fade-') ? 'ease-standard' : 'ease-spring');
      expect(overshoots(points)).toBe(name.startsWith('move-'));
      expect(duration.name).toBe(name.endsWith('-quick') ? 'duration-fast' : 'duration-slow');
    }
  });

  it('gives pulse-loop a linear curve of its own, and draws the spring peaking near 110%', () => {
    expect(recipe('pulse-loop').easing).toBeUndefined();
    expect(recipe('pulse-loop').points).toEqual([0, 0, 1, 1]);
    expect(recipe('spin-loop').easing).toBe('ease-loop');
    expect(Math.round(peakOf(easings.find(({ name }) => name === 'ease-spring')!.points) * 100)).toBe(110);
    expect(recipesUsing('duration-fast')).toEqual(['fade-quick', 'move-quick']);
    expect(recipesUsing('ease-loop')).toEqual(['spin-loop']);
  });
});

describe('motion exceptions', () => {
  const defined = new Set(['fade-quick', 'fade-long', 'duration-fast', 'ease-standard']);
  const at = (css: Record<string, string>) => motionExceptions(css, defined).map(({ key, components }) => `${key}: ${components.join(', ')}`);
  const reduced = (selector: string, declaration: string) => `@media (prefers-reduced-motion: reduce) { ${selector} { ${declaration} } }`;

  it('lists motion that is missing, misclassified, or borrowed', () => {
    expect(
      at({
        // Toast Group before it moved onto the recipes.
        'a/one.module.css': `.x { transition: transform 300ms cubic-bezier(0.21, 1.02, 0.73, 1), opacity 300ms ease; } ${reduced('.x', 'transition-duration: 0ms;')}`,
        // Modal Dialog's entrance before the fix: two timing functions, so the browser dropped it.
        'a/two.module.css': `.x { animation: in var(--fade-quick, 120ms) ease-out; } ${reduced('.x', 'animation: none;')}`,
        // Toast's swipe rule before the fix: more specific than the reduce rule for .x.
        'a/three.module.css': `.x { transition: opacity var(--fade-long); } .x[data-swiping='true'] { transition: opacity var(--fade-long); } ${reduced('.x', 'transition-duration: 0ms;')}`,
        'a/four.module.css': `.x { transition: color var(--duration-fast) var(--ease-standard); } ${reduced('.x', 'transition-duration: 0ms;')}`,
        'a/five.module.css': `.x { transition: color var(--fade-slow); } ${reduced('.x', 'transition-duration: 0ms;')}`,
      }),
    ).toEqual(['raw-timing: One', 'recipe-plus-timing: Two', 'not-reduced: Three', 'primitive-motion: Four', 'missing-token: Five']);
  });

  it('leaves recipes, motion switched off, and entrances added only when motion is allowed alone', () => {
    expect(
      at({
        'a/popup.module.css': `.p { animation: fade-in var(--fade-quick); } ${reduced('.p', 'animation-duration: 0ms;')}`,
        'a/modal.module.css': '@media (prefers-reduced-motion: no-preference) { .m { animation: rise var(--fade-quick); } }',
        'a/link.module.css': '.l { transition: none; } .l:hover { color: red; }',
        'a/tag.module.css': `.a, .b { transition: background-color var(--fade-quick); } ${reduced('.a, .b', 'transition-duration: 0ms;')}`,
      }),
    ).toEqual([]);
  });

  it('reads the generated token CSS for what exists', () => {
    const tokens = declaredProperties(...generated);
    for (const name of ['fade-quick', 'move-long', 'spin-loop', 'pulse-loop', 'duration-fast', 'ease-spring']) expect(tokens.has(name)).toBe(true);
  });
});

describe('Foundations / Motion: reduced motion', () => {
  it('sorts every animated component into a reduced-motion treatment', () => {
    const treatments = reducedMotion(componentCss);
    expect(treatments.map(({ treatment }) => treatment)).toEqual(['instant', 'stopped', 'entrance-instant', 'allowed-only']);
    expect(treatments.find(({ treatment }) => treatment === 'stopped')!.components).toEqual(['Skeleton', 'Spinner']);
    expect(treatments.find(({ treatment }) => treatment === 'entrance-instant')!.components).toEqual(['Popup']);
    expect(treatments.find(({ treatment }) => treatment === 'allowed-only')!.components).toEqual(['Modal Dialog']);
    expect(animatedComponents(componentCss)).toContain('Toast Group');
  });

  it('holds the page’s own demos to the same rules', () => {
    const pageCss = readFileSync('packages/ui/src/storybook/pages/foundations/motion.module.css', 'utf8');
    expect(motionExceptions({ 'pages/motion.module.css': pageCss }, declaredProperties(...generated))).toEqual([]);
    expect(animatedComponents({ 'pages/motion.module.css': pageCss })).toEqual(['Motion']);
  });

  it('stops Spinner rather than slowing it, leaving a still arc', () => {
    expect(reduceBlock('spinner')).toMatch(/\.svg \{\s*animation: none;/);
    expect(cssOf('spinner')).not.toMatch(/animation-duration/);
  });
});

describe('Foundations / Motion copy', () => {
  it('names the instant hovers: dense rows and inline links', () => {
    expect(instantHover(componentCss)).toEqual(['Avatar Group', 'Inline Edit', 'Link', 'Menu', 'Table']);
  });

  it('cites the indicators that turn or grow with fade-quick, and progress never springs', () => {
    expect(cssOf('select')).toContain('transition: transform var(--fade-quick);');
    for (const name of ['progress-bar', 'progress-tracker']) {
      expect(cssOf(name)).toMatch(/inline-size var\(--fade-quick\)/);
      expect(cssOf(name)).not.toMatch(/--move-|--ease-spring/);
    }
  });

  it('cites the moving parts that use move-quick', () => {
    expect(componentsUsingToken('move-quick', componentCss)).toEqual(['Avatar', 'Slider', 'Switch']);
    expect(cssOf('switch')).toContain('transition: transform var(--move-quick);');
    expect(cssOf('slider')).toMatch(/inline-size var\(--move-quick\)/);
    expect(cssOf('avatar')).toContain('transition: box-shadow var(--move-quick);');
  });

  it('describes overlays entering with fade-quick, Modal rising 8px, and both leaving at once', () => {
    expect(keyframesOf(componentCss).map(({ component, name }) => `${component}: ${name}`).sort()).toEqual([
      'Modal Dialog: modal-backdrop-in',
      'Modal Dialog: modal-panel-in',
      'Popup: popupFadeIn',
      'Skeleton: skeleton-pulse',
      'Spinner: spinner-rotate',
    ]);
    expect(cssOf('popup')).toContain('animation: popupFadeIn var(--fade-quick);');
    expect(cssOf('modal-dialog')).toContain('animation: modal-backdrop-in var(--fade-quick);');
    expect(cssOf('modal-dialog')).toMatch(/@keyframes modal-panel-in \{\s*from \{\s*opacity: 0;\s*transform: translateY\(8px\);/);
    for (const name of ['popup', 'modal-dialog']) expect(cssOf(name)).not.toMatch(/transition\s*:/);
  });

  it('cites Toast Group on the long recipes, with its exit timer matching duration-slow', () => {
    expect(componentsUsingToken('move-long', componentCss)).toEqual(['Toast Group']);
    expect(componentsUsingToken('fade-long', componentCss)).toEqual(['Toast Group']);
    const exitMs = Number(readFileSync(`${COMPONENTS}/organisms/toast-group/toast-group.tsx`, 'utf8').match(/const EXIT_MS = (\d+);/)?.[1]);
    expect(exitMs).toBe(durations.find(({ name }) => name === recipe('fade-long').duration.name)!.ms);
  });

  it('cites the loops and the distances', () => {
    expect(componentsUsingToken('spin-loop', componentCss)).toEqual(['Spinner']);
    expect(componentsUsingToken('pulse-loop', componentCss)).toEqual(['Skeleton']);
    expect(cssOf('switch')).toMatch(/--switch-thumb-translate-x: var\(--component-switch-md-thumb-translation\)/);
    expect(cssOf('switch')).toMatch(/--switch-thumb-translate-x: var\(--component-switch-sm-thumb-translation\)/);
  });

  it('says Stylelint does not check motion values yet', () => {
    const [properties] = JSON.parse(readFileSync('.stylelintrc.json', 'utf8')).rules['scale-unlimited/declaration-strict-value'] as [string[]];
    expect(properties.some((property) => /^(transition|animation)/.test(property))).toBe(false);
  });
});
