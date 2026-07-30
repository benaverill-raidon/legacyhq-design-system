// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CheckIcon, CloseIcon, EditIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { ToggleButton } from './toggle-button';
import styles from './toggle-button.module.css';

const toggleButtonCss = readFileSync(
  'packages/ui/src/components/atoms/toggle-button/toggle-button.module.css',
  'utf8',
);

afterEach(cleanup);

describe('ToggleButton', () => {
  it('renders a native button', () => {
    render(<ToggleButton>Bold</ToggleButton>);

    expect(screen.getByRole('button', { name: 'Bold' }).tagName).toBe('BUTTON');
  });

  it('defaults type to button', () => {
    render(<ToggleButton>Bold</ToggleButton>);

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('type', 'button');
  });

  it('renders children', () => {
    render(<ToggleButton>Italic</ToggleButton>);

    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
  });

  it('supports iconBefore', () => {
    render(
      <ToggleButton
        iconBefore={
          <span data-testid="before">
            <CheckIcon />
          </span>
        }
      >
        Filter
      </ToggleButton>,
    );

    expect(screen.getByTestId('before')).toBeInTheDocument();
  });

  it('supports iconAfter', () => {
    render(
      <ToggleButton
        iconAfter={
          <span data-testid="after">
            <CloseIcon />
          </span>
        }
      >
        Filter
      </ToggleButton>,
    );

    expect(screen.getByTestId('after')).toBeInTheDocument();
  });

  it('sets aria-pressed false by default', () => {
    render(<ToggleButton>Bold</ToggleButton>);

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('sets aria-pressed true when selected', () => {
    render(<ToggleButton isSelected>Bold</ToggleButton>);

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies selected state when selected', () => {
    render(<ToggleButton isSelected>Bold</ToggleButton>);

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveClass(styles.selected);
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('data-selected', 'true');
  });

  it('applies size classes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      const { unmount } = render(<ToggleButton size={size}>{size}</ToggleButton>);

      expect(screen.getByRole('button', { name: size })).toHaveClass(styles[`size_${size}`]);

      unmount();
    });
  });

  it('applies tone classes', () => {
    const { rerender } = render(<ToggleButton tone="default">Default</ToggleButton>);

    expect(screen.getByRole('button', { name: 'Default' })).toHaveClass(styles.tone_default);

    rerender(<ToggleButton tone="subtle">Subtle</ToggleButton>);

    expect(screen.getByRole('button', { name: 'Subtle' })).toHaveClass(styles.tone_subtle);
  });

  it('disabled sets native disabled', () => {
    render(<ToggleButton isDisabled>Disabled</ToggleButton>);

    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  it('disabled prevents click', () => {
    const handleClick = vi.fn();

    render(
      <ToggleButton isDisabled onClick={handleClick}>
        Disabled
      </ToggleButton>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('supports custom className', () => {
    render(
      <ToggleButton className="custom-toggle-button" data-testid="toggle-button">
        View
      </ToggleButton>,
    );

    expect(screen.getByTestId('toggle-button')).toHaveClass(styles.toggleButton, 'custom-toggle-button');
  });

  it('forwards refs', () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(<ToggleButton ref={ref}>View</ToggleButton>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('uses the shared focus ring classes', () => {
    render(
      <ToggleButton iconBefore={<EditIcon />}>
        Edit
      </ToggleButton>,
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });

  it('maps Figma states and geometry to shared semantic tokens', () => {
    expect(toggleButtonCss).toContain('min-block-size: var(--size-control-xs);');
    expect(toggleButtonCss).toContain('min-block-size: var(--size-control-sm);');
    expect(toggleButtonCss).toContain('min-block-size: var(--size-control-md);');
    expect(toggleButtonCss).toContain('min-block-size: var(--size-control-lg);');
    expect(toggleButtonCss).toContain('background: var(--color-background-neutral-overlay-hovered);');
    expect(toggleButtonCss).toContain('background: var(--color-background-neutral-overlay-pressed);');
    expect(toggleButtonCss).toContain('background: var(--color-background-brand-primary-default-default);');
    expect(toggleButtonCss).toContain('border-color: var(--color-border-brand-primary);');
    expect(toggleButtonCss).toContain('color: var(--color-content-brand-primary-default);');
    expect(toggleButtonCss).toContain('background: var(--color-background-disabled);');
    expect(toggleButtonCss).toMatch(/\.tone_default \{[\s\S]*?background: transparent;/);
    expect(toggleButtonCss).toMatch(/\.tone_subtle \{[\s\S]*?border-color: transparent;[\s\S]*?background: transparent;/);
    expect(toggleButtonCss).not.toContain('--component-button-');
    expect(toggleButtonCss).not.toContain('--color-background-selected-');
    expect(toggleButtonCss).not.toContain('--color-border-selected');
  });

  it('uses a 6px icon-to-text gap, matching Figma at every size', () => {
    // Regression guard: this was previously --spacing-sm (8px) - measuring Figma's own auto-layout
    // itemSpacing on the icon/text container shows a constant 6px at xs/sm/md/lg alike.
    expect(toggleButtonCss).toMatch(/\.toggleButton \{[\s\S]*?gap: var\(--measurement-6\);/);
    expect(toggleButtonCss).not.toContain('gap: var(--spacing-sm);');
  });

  it('supports pinning hover/pressed as a static Storybook reference via data-force-state', () => {
    expect(toggleButtonCss).toContain("[data-force-state='hover']");
    expect(toggleButtonCss).toContain("[data-force-state='active']");
  });

  it('shows the hover fill on focus-visible too, matching Button', () => {
    expect(toggleButtonCss).toMatch(
      /:is\(\s*:hover,\s*:focus-visible,\s*\[data-force-state='hover'\],\s*\[data-force-state='focus'\]\s*\)\s*\{\s*background: var\(--color-background-neutral-overlay-hovered\);/,
    );
  });
});
