import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Logo } from './Logo';
import styles from './Logo.module.css';

afterEach(cleanup);

describe('Logo', () => {
  it('renders the default full logo at md size', () => {
    render(<Logo />);

    const logo = screen.getByRole('img', { name: 'LegacyHQ' });

    expect(logo).toBeInTheDocument();
    expect(logo.closest('span')).toHaveClass(styles.logo, styles.type_full, styles.size_md);
  });

  it('renders the mark logo', () => {
    render(<Logo type="mark" />);

    expect(screen.getByRole('img', { name: 'LegacyHQ' }).closest('span')).toHaveAttribute('data-logo-type', 'mark');
  });

  it('renders the wordmark logo', () => {
    render(<Logo type="wordmark" />);

    expect(screen.getByRole('img', { name: 'LegacyHQ' }).closest('span')).toHaveAttribute('data-logo-type', 'wordmark');
  });

  it('renders the full logo', () => {
    render(<Logo type="full" />);

    expect(screen.getByRole('img', { name: 'LegacyHQ' }).closest('span')).toHaveAttribute('data-logo-type', 'full');
  });

  it('applies the size prop', () => {
    render(<Logo size="lg" />);

    const root = screen.getByRole('img', { name: 'LegacyHQ' }).closest('span');

    expect(root).toHaveClass(styles.size_lg);
    expect(root).toHaveAttribute('data-logo-size', 'lg');
  });

  it('supports decorative mode', () => {
    const { container } = render(<Logo decorative />);

    const root = container.querySelector('span');
    const svg = container.querySelector('svg');

    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('supports title prop', () => {
    render(<Logo title="LegacyHQ brand" />);

    const logo = screen.getByRole('img', { name: 'LegacyHQ brand' });

    expect(logo.closest('span')).toHaveAttribute('title', 'LegacyHQ brand');
  });

  it('supports ariaLabel prop', () => {
    render(<Logo ariaLabel="LegacyHQ home" />);

    expect(screen.getByRole('img', { name: 'LegacyHQ home' })).toBeInTheDocument();
  });

  it('supports className', () => {
    render(<Logo className="custom-logo" />);

    expect(screen.getByRole('img', { name: 'LegacyHQ' }).closest('span')).toHaveClass('custom-logo');
  });

  it('preserves svg aspect ratio through viewBox and CSS sizing', () => {
    const { container } = render(<Logo type="full" size="sm" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('viewBox', '0 0 140 32');
    expect(svg).toHaveClass(styles.svg);
  });
});
