// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Link, getSecureRel } from './link';
import styles from './link.module.css';

afterEach(cleanup);

const linkCss = readFileSync('packages/ui/src/components/atoms/link/link.module.css', 'utf8');

describe('Link', () => {
  it('renders a native anchor with children', () => {
    render(<Link href="/clients">Clients</Link>);

    const link = screen.getByRole('link', { name: 'Clients' });

    expect(link.tagName).toBe('A');
    expect(link).toHaveTextContent('Clients');
  });

  it('applies href and default target', () => {
    render(<Link href="/clients">Clients</Link>);

    const link = screen.getByRole('link', { name: 'Clients' });

    expect(link).toHaveAttribute('href', '/clients');
    expect(link).toHaveAttribute('target', '_self');
  });

  it('applies appearance variants', () => {
    const { rerender } = render(
      <Link href="/clients" appearance="default">
        Default
      </Link>,
    );

    expect(screen.getByRole('link', { name: 'Default' })).toHaveClass(styles.appearance_default);

    rerender(
      <Link href="/clients" appearance="subtle">
        Subtle
      </Link>,
    );

    expect(screen.getByRole('link', { name: 'Subtle' })).toHaveClass(styles.appearance_subtle);

    rerender(
      <Link href="/clients" appearance="inverse">
        Inverse
      </Link>,
    );

    expect(screen.getByRole('link', { name: 'Inverse' })).toHaveClass(styles.appearance_inverse);
  });

  it('applies size variants', () => {
    const { rerender } = render(
      <Link href="/clients" size="sm">
        Small
      </Link>,
    );

    expect(screen.getByRole('link', { name: 'Small' })).toHaveClass(styles.size_sm);

    rerender(
      <Link href="/clients" size="md">
        Medium
      </Link>,
    );

    expect(screen.getByRole('link', { name: 'Medium' })).toHaveClass(styles.size_md);
  });

  it('forwards native anchor props and supports custom className', () => {
    render(
      <Link href="/download" download data-testid="download-link" className="custom-link">
        Download
      </Link>,
    );

    const link = screen.getByTestId('download-link');

    expect(link).toHaveAttribute('download');
    expect(link).toHaveClass(styles.root, 'custom-link');
  });

  it('renders a decorative external icon for target blank', () => {
    const { container } = render(
      <Link href="https://example.com" target="_blank">
        External website
      </Link>,
    );

    const link = screen.getByRole('link', { name: 'External website' });
    const icon = container.querySelector(`.${styles.icon}`);
    const svg = container.querySelector('svg');

    expect(link).toHaveAttribute('target', '_blank');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it('does not render an external icon for self target', () => {
    const { container } = render(<Link href="/clients">Clients</Link>);

    expect(container.querySelector(`.${styles.icon}`)).not.toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('applies secure rel values for target blank', () => {
    render(
      <Link href="https://example.com" target="_blank">
        External website
      </Link>,
    );

    expect(screen.getByRole('link', { name: 'External website' })).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves existing rel values while adding secure values', () => {
    render(
      <Link href="https://example.com" target="_blank" rel="nofollow sponsored">
        External website
      </Link>,
    );

    expect(screen.getByRole('link', { name: 'External website' })).toHaveAttribute(
      'rel',
      'nofollow sponsored noopener noreferrer',
    );
  });

  it('does not duplicate secure rel values', () => {
    expect(getSecureRel('_blank', 'noopener external')).toBe('noopener external noreferrer');
  });

  it('preserves rel for non-blank targets', () => {
    render(
      <Link href="/clients" rel="tag">
        Clients
      </Link>,
    );

    expect(screen.getByRole('link', { name: 'Clients' })).toHaveAttribute('rel', 'tag');
  });

  it('uses focus ring utility classes', () => {
    render(<Link href="/clients">Clients</Link>);

    expect(screen.getByRole('link', { name: 'Clients' })).toHaveClass(
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });

  it('maps the inverse appearance directly to the inverse content token across states', () => {
    expect(linkCss).toContain('.appearance_inverse {');
    expect(linkCss).toContain('color: var(--color-content-inverse);');
    expect(linkCss).toContain('.appearance_inverse:hover');
    expect(linkCss).toContain('.appearance_inverse:active');
    expect(linkCss).toContain('.appearance_inverse:focus-visible');
    expect(linkCss).toContain('.appearance_inverse:visited');
  });
});
