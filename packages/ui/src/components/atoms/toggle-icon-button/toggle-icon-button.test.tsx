import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloseIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { ToggleIconButton } from './toggle-icon-button';
import styles from './toggle-icon-button.module.css';

afterEach(cleanup);

describe('ToggleIconButton', () => {
  it('renders a native button', () => {
    render(
      <ToggleIconButton aria-label="Close">
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Close' }).tagName).toBe('BUTTON');
  });

  it('defaults type to button', () => {
    render(
      <ToggleIconButton aria-label="Close">
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('type', 'button');
  });

  it('forwards refs', () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <ToggleIconButton aria-label="Close" ref={ref}>
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders children as icon content', () => {
    render(
      <ToggleIconButton aria-label="Close">
        <span data-testid="icon-wrapper">
          <CloseIcon />
        </span>
      </ToggleIconButton>,
    );

    expect(screen.getByTestId('icon-wrapper')).toBeInTheDocument();
  });

  it('supports aria-label', () => {
    render(
      <ToggleIconButton aria-label="Edit">
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('supports aria-labelledby', () => {
    render(
      <>
        <span id="grid-view-label">Grid view</span>
        <ToggleIconButton aria-labelledby="grid-view-label">
          <CloseIcon />
        </ToggleIconButton>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Grid view' })).toBeInTheDocument();
  });

  it('sets aria-pressed false by default', () => {
    render(
      <ToggleIconButton aria-label="Grid view">
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('sets aria-pressed true when selected', () => {
    render(
      <ToggleIconButton aria-label="Grid view" isSelected>
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies selected class/state when selected', () => {
    render(
      <ToggleIconButton aria-label="Grid view" isSelected>
        <CloseIcon />
      </ToggleIconButton>,
    );

    const button = screen.getByRole('button', { name: 'Grid view' });
    expect(button).toHaveClass(styles.selected);
    expect(button).toHaveAttribute('data-selected', 'true');
  });

  it('applies size classes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      const { unmount } = render(
        <ToggleIconButton aria-label={size} size={size}>
          <CloseIcon />
        </ToggleIconButton>,
      );

      expect(screen.getByRole('button', { name: size })).toHaveClass(styles[`size_${size}`]);
      unmount();
    });
  });

  it('applies tone classes', () => {
    const { rerender } = render(
      <ToggleIconButton aria-label="Default" tone="default">
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Default' })).toHaveClass(styles.tone_default);

    rerender(
      <ToggleIconButton aria-label="Subtle" tone="subtle">
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Subtle' })).toHaveClass(styles.tone_subtle);
  });

  it('applies shape classes', () => {
    const { rerender } = render(
      <ToggleIconButton aria-label="Square" shape="square">
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Square' })).toHaveClass(styles.shape_square);

    rerender(
      <ToggleIconButton aria-label="Round" shape="round">
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Round' })).toHaveClass(styles.shape_round);
  });

  it('disabled sets native disabled', () => {
    render(
      <ToggleIconButton aria-label="Disabled" isDisabled>
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  it('disabled prevents click', () => {
    const handleClick = vi.fn();

    render(
      <ToggleIconButton aria-label="Disabled" isDisabled onClick={handleClick}>
        <CloseIcon />
      </ToggleIconButton>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Disabled' }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('custom className is applied', () => {
    render(
      <ToggleIconButton aria-label="Custom" className="custom-toggle-icon-button" data-testid="toggle-icon-button">
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByTestId('toggle-icon-button')).toHaveClass(styles.root, 'custom-toggle-icon-button');
  });

  it('click handler fires when enabled', () => {
    const handleClick = vi.fn();

    render(
      <ToggleIconButton aria-label="Interactive" onClick={handleClick}>
        <CloseIcon />
      </ToggleIconButton>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Interactive' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('uses the shared focus ring classes', () => {
    render(
      <ToggleIconButton aria-label="Focusable">
        <CloseIcon />
      </ToggleIconButton>,
    );

    expect(screen.getByRole('button', { name: 'Focusable' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });
});
