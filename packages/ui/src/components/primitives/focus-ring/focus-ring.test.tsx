import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { FocusRing, focusRingClassNames } from './focus-ring';

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

  it('applies the compact border width class', () => {
    render(
      <FocusRing borderWidth="compact">
        <button type="button">Button</button>
      </FocusRing>,
    );

    expect(screen.getByRole('button', { name: 'Button' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingCompact,
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
      focusRingClassNames.focusRingCompact,
    );
  });

  it('exports utility class names', () => {
    expect(focusRingClassNames.focusRing).toEqual(expect.any(String));
    expect(focusRingClassNames.focusRingDefault).toEqual(expect.any(String));
    expect(focusRingClassNames.focusRingCompact).toEqual(expect.any(String));
  });
});
