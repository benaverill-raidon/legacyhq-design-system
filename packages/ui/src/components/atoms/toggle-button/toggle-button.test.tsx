import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CheckIcon, CloseIcon, EditIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { ToggleButton } from './toggle-button';
import styles from './toggle-button.module.css';

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
});
