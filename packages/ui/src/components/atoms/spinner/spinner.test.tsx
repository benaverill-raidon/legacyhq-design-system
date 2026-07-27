// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Spinner } from './spinner';
import styles from './spinner.module.css';
import type { SpinnerSize } from './spinner.types';

const spinnerCss = readFileSync('packages/ui/src/components/atoms/spinner/spinner.module.css', 'utf8');

afterEach(cleanup);

describe('Spinner', () => {
  it('renders successfully', () => {
    render(<Spinner data-testid="spinner" />);

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('uses lg as the default size', () => {
    render(<Spinner data-testid="spinner" />);

    expect(screen.getByTestId('spinner')).toHaveClass(styles.spinner, styles.size_lg);
  });

  it('renders each size variant', () => {
    const sizes: SpinnerSize[] = ['sm', 'md', 'lg', 'xl'];

    sizes.forEach((size) => {
      const { unmount } = render(<Spinner data-testid={`spinner-${size}`} size={size} />);

      expect(screen.getByTestId(`spinner-${size}`)).toHaveClass(styles[`size_${size}`]);

      unmount();
    });
  });

  it('supports custom className', () => {
    render(<Spinner className="custom-spinner" data-testid="spinner" />);

    expect(screen.getByTestId('spinner')).toHaveClass('custom-spinner');
  });

  it('is decorative by default', () => {
    render(<Spinner data-testid="spinner" />);

    expect(screen.getByTestId('spinner')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('uses accessible loading status semantics when label is provided', () => {
    render(<Spinner label="Loading matters" />);

    const spinner = screen.getByRole('status');

    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(spinner).not.toHaveAttribute('aria-hidden');
    expect(screen.getByText('Loading matters')).toHaveClass(styles.visuallyHidden);
  });

  it('forwards native span attributes', () => {
    render(<Spinner data-testid="spinner" id="matter-spinner" title="Loading matters" />);

    const spinner = screen.getByTestId('spinner');

    expect(spinner).toHaveAttribute('id', 'matter-spinner');
    expect(spinner).toHaveAttribute('title', 'Loading matters');
  });

  it('always hides the svg from assistive technologies', () => {
    const { container } = render(<Spinner label="Loading" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it('renders a 90 degree arc path', () => {
    const { container } = render(<Spinner />);
    const path = container.querySelector('path');

    expect(path).toHaveAttribute('d', 'M12 3a9 9 0 0 0-9 9');
  });

  it('uses expected base and variant classes', () => {
    render(<Spinner size="md" data-testid="spinner" />);

    expect(screen.getByTestId('spinner')).toHaveClass(styles.spinner, styles.size_md);
  });

  it('maps spinner sizing and stroke widths to the current token model', () => {
    expect(spinnerCss).toContain('--spinner-size: var(--size-spinner-sm);');
    expect(spinnerCss).toContain('--spinner-size: var(--size-spinner-md);');
    expect(spinnerCss).toContain('--spinner-size: var(--size-spinner-lg);');
    expect(spinnerCss).toContain('--spinner-size: var(--size-spinner-xl);');
    expect(spinnerCss).toContain('--spinner-stroke-width: var(--border-width-sm);');
    expect(spinnerCss).toContain('--spinner-stroke-width: var(--border-width-md);');
    expect(spinnerCss).toContain('--spinner-stroke-width: var(--border-width-lg);');
    expect(spinnerCss).toContain('--spinner-graphic-size: 100%;');
    expect(spinnerCss).toContain('--spinner-graphic-size: calc(var(--measurement-32) / var(--size-spinner-xl) * 100%);');
    expect(spinnerCss).toContain('inline-size: var(--spinner-graphic-size);');
    expect(spinnerCss).toContain('block-size: var(--spinner-graphic-size);');
    expect(spinnerCss).toContain('color: var(--color-border-bold);');
  });
});
