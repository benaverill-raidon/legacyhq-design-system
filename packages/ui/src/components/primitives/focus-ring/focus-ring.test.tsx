// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { FocusRing, focusRingClassNames } from './focus-ring';

const focusRingCss = readFileSync('packages/ui/src/components/primitives/focus-ring/focus-ring.module.css', 'utf8');
// The rules only, without the comments that explain them.
const focusRingRules = focusRingCss.replace(/\/\*[\s\S]*?\*\//g, '');

afterEach(cleanup);

describe('FocusRing', () => {
  it('renders child', () => {
    render(
      <FocusRing>
        <button type="button">Button</button>
      </FocusRing>,
    );

    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
  });

  it('applies the default border width class by default', () => {
    render(
      <FocusRing>
        <button type="button">Button</button>
      </FocusRing>,
    );

    expect(screen.getByRole('button', { name: 'Button' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });

  it('applies custom className', () => {
    render(
      <FocusRing className="custom-focus-ring">
        <button type="button">Button</button>
      </FocusRing>,
    );

    expect(screen.getByRole('button', { name: 'Button' })).toHaveClass('custom-focus-ring');
  });

  it('does not apply focus ring styling when disabled', () => {
    render(
      <FocusRing disabled>
        <button type="button">Button</button>
      </FocusRing>,
    );

    expect(screen.getByRole('button', { name: 'Button' })).not.toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });

  it('exports utility class names', () => {
    expect(focusRingClassNames.focusRing).toEqual(expect.any(String));
    expect(focusRingClassNames.focusRingDefault).toEqual(expect.any(String));
  });

  it("leaves the ring's radius to the element's own border-radius, never a parent's", () => {
    expect(focusRingRules).not.toMatch(/border-radius/);
  });

  it("takes a component's offset whatever order stylesheets load in, and 2px otherwise", () => {
    // Registered, not inherited, with 2px as the initial value; .focusRing declares no offset, so
    // there's nothing for a component's own --focus-ring-offset to tie with.
    expect(focusRingRules).toMatch(
      /@property --focus-ring-offset \{\s*syntax: '<length>';\s*inherits: false;\s*initial-value: 2px;\s*\}/,
    );
    expect(focusRingRules.replace(/@property[^}]*\}/, '')).not.toMatch(/--focus-ring-offset\s*:/);
    expect(focusRingRules).toMatch(/outline-offset: var\(--focus-ring-offset\);/);
  });
});
