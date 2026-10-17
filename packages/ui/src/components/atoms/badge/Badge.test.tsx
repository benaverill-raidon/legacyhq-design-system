// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge } from './badge';
import styles from './badge.module.css';

const badgeCss = readFileSync('packages/ui/src/components/atoms/badge/badge.module.css', 'utf8');

afterEach(cleanup);

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>1</Badge>);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('uses the default tone by default', () => {
    render(<Badge>1</Badge>);

    expect(screen.getByText('1')).toHaveAttribute('data-tone', 'default');
  });

  it('uses the selected tone', () => {
    render(<Badge tone="success">+1</Badge>);

    expect(screen.getByText('+1')).toHaveAttribute('data-tone', 'success');
  });

  it('reads label in place of the value, as hidden text', () => {
    const { container } = render(<Badge label="3 unread messages">3</Badge>);
    const root = container.firstElementChild as HTMLElement;

    // Not aria-label: a span with no role can't be named, so screen readers may skip it.
    expect(root).not.toHaveAttribute('aria-label');
    expect(screen.getByText('3 unread messages')).toHaveClass(styles.visuallyHidden);
    expect(screen.getByText('3')).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveTextContent('3 unread messages');
  });

  it('renders the value straight into the root without label', () => {
    const { container } = render(<Badge>3</Badge>);

    expect(container.firstElementChild?.childElementCount).toBe(0);
    expect(container.firstElementChild).toHaveTextContent('3');
  });

  it('still accepts the deprecated ariaLabel, as hidden text', () => {
    const { container } = render(<Badge ariaLabel="1 unread notification">1</Badge>);

    expect(container.firstElementChild).not.toHaveAttribute('aria-label');
    expect(screen.getByText('1 unread notification')).toHaveClass(styles.visuallyHidden);
    expect(screen.getByText('1')).toHaveAttribute('aria-hidden', 'true');
  });

  it('prefers label over the deprecated ariaLabel', () => {
    render(
      <Badge label="2 new comments" ariaLabel="old words">
        2
      </Badge>,
    );

    expect(screen.getByText('2 new comments')).toBeInTheDocument();
    expect(screen.queryByText('old words')).not.toBeInTheDocument();
  });

  it('forwards native attributes to the span', () => {
    render(
      <Badge id="unread-count" data-testid="badge" aria-describedby="unread-help" title="Unread">
        4
      </Badge>,
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('id', 'unread-count');
    expect(badge).toHaveAttribute('aria-describedby', 'unread-help');
    expect(badge).toHaveAttribute('title', 'Unread');
    expect(badge).toHaveAttribute('data-tone', 'default');
  });

  it('applies className', () => {
    render(<Badge className="custom-badge">1</Badge>);

    expect(screen.getByText('1')).toHaveClass('custom-badge');
  });

  it('uses the small semantic border radius token', () => {
    expect(badgeCss).toContain('border-radius: var(--border-radius-sm);');
  });
});

