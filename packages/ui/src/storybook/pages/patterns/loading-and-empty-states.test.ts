// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { propValues } from '../../blocks/pattern-page-data';

// The facts Patterns / Loading and Empty States states, checked against the component source, so
// the page can't drift from what the components do.

const COMPONENTS = 'packages/ui/src/components';
const source = (path: string): string => readFileSync(`${COMPONENTS}/${path}`, 'utf8');

describe('Loading and Empty States cites', () => {
  it('Skeleton and Spinner: hidden without a label, a polite status with one', () => {
    for (const path of ['molecules/skeleton/skeleton.tsx', 'atoms/spinner/spinner.tsx']) {
      const code = source(path);
      expect(code).toMatch(/role=\{hasLabel \? 'status' : undefined\}/);
      expect(code).toMatch(/aria-live=\{hasLabel \? 'polite' : undefined\}/);
      expect(code).toMatch(/aria-hidden=\{hasLabel \? undefined : true\}/);
    }
  });

  it('Skeleton and Spinner stop moving with reduced motion; Progress Bar changes at once', () => {
    expect(source('molecules/skeleton/skeleton.module.css')).toMatch(/var\(--pulse-loop\)[\s\S]*prefers-reduced-motion: reduce[\s\S]*animation: none/);
    expect(source('atoms/spinner/spinner.module.css')).toMatch(/var\(--spin-loop\)[\s\S]*prefers-reduced-motion: reduce[\s\S]*animation: none/);
    expect(source('atoms/progress-bar/progress-bar.module.css')).toMatch(/prefers-reduced-motion: reduce[\s\S]*transition-duration: 0ms/);
  });

  it('Progress Bar: 0 to 100, linear or circular with no indeterminate mode, named by label, not live', () => {
    const types = source('atoms/progress-bar/progress-bar.types.ts');
    const code = source('atoms/progress-bar/progress-bar.tsx');
    expect(propValues(types, 'variant')).toEqual(['linear', 'circular']);
    expect(types).not.toMatch(/indeterminate/i);
    expect(code).toMatch(/role=\{role \?\? 'progressbar'\}/);
    expect(code).toMatch(/aria-valuemin=\{0\}/);
    expect(code).toMatch(/aria-valuemax=\{100\}/);
    expect(code).toMatch(/getValueText \? getValueText\(clampedValue\)/);
    expect(code).toMatch(/if \(label\) \{\s*return \{ 'aria-label': label \};/);
    expect(code).not.toMatch(/aria-live/);
  });

  it('Button and Link Button: a Spinner over the label, aria-busy and aria-disabled, clicks ignored', () => {
    for (const path of ['atoms/button/button.tsx', 'atoms/link-button/link-button.tsx']) {
      const code = source(path);
      expect(code).toMatch(/aria-busy=\{isLoading \? true : undefined\}/);
      expect(code).toMatch(/<Spinner size="md" \/>/);
      expect(code).toMatch(/event\.preventDefault\(\);/);
    }
    expect(source('atoms/button/button.tsx')).toMatch(/aria-disabled=\{isLoading \? true : undefined\}/);
    expect(source('atoms/link-button/link-button.tsx')).toMatch(/aria-disabled=\{isInactive \? true : undefined\}/);
    // Neither sets the native `disabled` while loading, so both stay focusable.
    expect(source('atoms/button/button.tsx')).toMatch(/disabled=\{disabled\}/);
    expect(source('atoms/link-button/link-button.tsx')).toMatch(/tabIndex=\{isDisabled \? -1 : isLoading \? \(tabIndex \?\? 0\) : tabIndex\}/);
  });

  it('Switch, Icon Button, and Split Button take isLoading; Switch and Icon Button set aria-busy', () => {
    for (const path of ['atoms/switch/switch.types.ts', 'atoms/icon-button/icon-button.types.ts', 'molecules/split-button/split-button.types.ts']) {
      expect(source(path)).toMatch(/isLoading\?: boolean;/);
    }
    expect(source('atoms/switch/switch.tsx')).toMatch(/aria-busy=\{isLoading \? true : undefined\}/);
    expect(source('atoms/icon-button/icon-button.tsx')).toMatch(/aria-busy=\{isLoading \? true : undefined\}/);
  });

  it('Menu has a loading row and an empty message', () => {
    const types = source('organisms/menu/menu.types.ts');
    expect(types).toMatch(/loading\?: boolean;/);
    expect(types).toMatch(/emptyMessage\?: React\.ReactNode;/);
  });

  it('a loading toast stays until it is replaced, and reads no status word', () => {
    expect(propValues(source('organisms/toast/toast.types.ts'), 'tone')).toContain('loading');
    expect(source('organisms/toast-group/toast-group.tsx')).toMatch(/item\.duration \?\? \(isLoading \? Infinity : duration\)/);
    expect(source('organisms/toast-group/toast-store.ts')).toMatch(/loading: \(title: React\.ReactNode, options: ToastOptions = \{\}\) => toastStore\.add\(title, \{ \.\.\.options, tone: 'loading' \}\)/);
    expect(source('organisms/toast-group/toast-store.ts')).toMatch(/\berror: \(/);
    expect(source('organisms/toast/toast.types.ts')).toMatch(/`default` and `loading` have none/);
  });

  it('Table: skeleton rows (5 by default) with aria-busy, and its default empty text', () => {
    const code = source('organisms/table/table.tsx');
    expect(code).toMatch(/skeletonRowCount = 5,/);
    expect(code).toMatch(/aria-busy=\{loading \|\| undefined\}/);
    expect(code).toMatch(/<Skeleton className=\{styles\.skeletonText\} \/>/);
    expect(code).toMatch(/emptyHeadingLabel = 'No results',/);
    expect(code).toMatch(/emptyDescriptionLabel = 'There is nothing to show here yet\.',/);
    expect(code).toMatch(/\{empty \?\? \(/);
    // Its only live region announces the selection count, not the rows running out.
    expect([...code.matchAll(/aria-live="polite">\s*\{(\w+)/g)].map(([, value]) => value)).toEqual(['selectionAnnouncement']);
  });

  it('Empty State: appearance sets only the background, it has no role and no live region', () => {
    const code = source('organisms/empty-state/empty-state.tsx');
    expect(propValues(source('organisms/empty-state/empty-state.types.ts'), 'appearance')).toEqual(['inherited', 'informative']);
    expect(code).toMatch(/\?\? 'inherited'/);
    expect(code).not.toMatch(/\brole=|aria-live/);
  });

  it('Section Message: a polite live region by default, with an error tone', () => {
    expect(source('organisms/section-message/section-message.tsx')).toMatch(/role = 'status'/);
    expect(propValues(source('organisms/section-message/section-message.types.ts'), 'tone')).toContain('error');
  });
});
