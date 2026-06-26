// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CloseIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { IconButton } from './icon-button';
import styles from './icon-button.module.css';

afterEach(cleanup);

const iconButtonCss = readFileSync('packages/ui/src/components/atoms/icon-button/icon-button.module.css', 'utf8');

describe('IconButton', () => {
  it('renders a native button', () => {
    render(
      <IconButton aria-label="Close">
        <CloseIcon />
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Close' });

    expect(button.tagName).toBe('BUTTON');
  });

  it('defaults type to button', () => {
    render(
      <IconButton aria-label="Close">
        <CloseIcon />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('type', 'button');
  });

  it('forwards refs', () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <IconButton aria-label="Close" ref={ref}>
        <CloseIcon />
      </IconButton>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders children as icon content', () => {
    render(
      <IconButton aria-label="Close">
        <span data-testid="icon-wrapper">
          <CloseIcon />
        </span>
      </IconButton>,
    );

    expect(screen.getByTestId('icon-wrapper')).toBeInTheDocument();
  });

  it('supports aria-label', () => {
    render(
      <IconButton aria-label="Edit">
        <CloseIcon />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('supports aria-labelledby', () => {
    render(
      <>
        <span id="more-actions-label">More actions</span>
        <IconButton aria-labelledby="more-actions-label">
          <CloseIcon />
        </IconButton>
      </>,
    );

    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  });

  it('applies appearance classes', () => {
    const { rerender } = render(
      <IconButton aria-label="Default" appearance="default">
        <CloseIcon />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: 'Default' })).toHaveClass(styles.appearance_default);

    rerender(
      <IconButton aria-label="Primary" appearance="primary">
        <CloseIcon />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: 'Primary' })).toHaveClass(styles.appearance_primary);

    rerender(
      <IconButton aria-label="Subtle" appearance="subtle">
        <CloseIcon />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: 'Subtle' })).toHaveClass(styles.appearance_subtle);
  });

  it('applies size classes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      const { unmount } = render(
        <IconButton aria-label={size} size={size}>
          <CloseIcon />
        </IconButton>,
      );

      expect(screen.getByRole('button', { name: size })).toHaveClass(styles[`size_${size}`]);

      unmount();
    });
  });

  it('applies shape classes', () => {
    const { rerender } = render(
      <IconButton aria-label="Square" shape="square">
        <CloseIcon />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: 'Square' })).toHaveClass(styles.shape_square);

    rerender(
      <IconButton aria-label="Round" shape="round">
        <CloseIcon />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: 'Round' })).toHaveClass(styles.shape_round);
  });

  it('disabled prevents click', () => {
    const handleClick = vi.fn();

    render(
      <IconButton aria-label="Disabled" isDisabled onClick={handleClick}>
        <CloseIcon />
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('loading renders spinner and sets aria-busy', () => {
    const { container } = render(
      <IconButton aria-label="Loading" isLoading>
        <CloseIcon />
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Loading' });

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(container.querySelector(`.${styles.spinner}`)).toBeInTheDocument();
  });

  it('expanded sets aria-expanded', () => {
    render(
      <IconButton aria-label="More actions" isExpanded>
        <CloseIcon />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: 'More actions' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports custom className', () => {
    render(
      <IconButton aria-label="Custom" className="custom-icon-button" data-testid="icon-button">
        <CloseIcon />
      </IconButton>,
    );

    expect(screen.getByTestId('icon-button')).toHaveClass(styles.root, 'custom-icon-button');
  });

  it('click handler fires when enabled', () => {
    const handleClick = vi.fn();

    render(
      <IconButton aria-label="Interactive" onClick={handleClick}>
        <CloseIcon />
      </IconButton>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Interactive' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('loading prevents click without disabling the button element', () => {
    const handleClick = vi.fn();

    render(
      <IconButton aria-label="Busy" isLoading onClick={handleClick}>
        <CloseIcon />
      </IconButton>,
    );

    const button = screen.getByRole('button', { name: 'Busy' });

    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('uses the shared focus ring classes', () => {
    render(
      <IconButton aria-label="Focusable">
        <CloseIcon />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: 'Focusable' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });
});

describe('icon button CSS contract', () => {
  it('maps fixed square sizing to button min-height tokens', () => {
    expect(iconButtonCss).toContain('--icon-button-size: var(--component-button-min-height-md);');
    expect(iconButtonCss).toContain('.size_xs {');
    expect(iconButtonCss).toContain('--icon-button-size: var(--component-button-min-height-xs);');
    expect(iconButtonCss).toContain('--icon-button-size: var(--component-button-min-height-sm);');
    expect(iconButtonCss).toContain('--icon-button-size: var(--component-button-min-height-lg);');
  });

  it('uses button-family radius tokens and full-round for round shape', () => {
    expect(iconButtonCss).toContain('--icon-button-radius: var(--border-radius-lg);');
    expect(iconButtonCss).toContain('--icon-button-radius: var(--border-radius-xl);');
    expect(iconButtonCss).toContain('border-radius: var(--border-radius-full-round);');
  });

  it('keeps icon and spinner color inheritance token-driven', () => {
    expect(iconButtonCss).toContain('.content :global([data-color]) {');
    expect(iconButtonCss).toContain('color: inherit;');
    expect(iconButtonCss).toContain('.spinner {');
  });
});
