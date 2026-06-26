// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Label } from './Label';
import styles from './Label.module.css';

const labelCss = readFileSync('packages/ui/src/components/atoms/label/Label.module.css', 'utf8');

afterEach(cleanup);

describe('Label', () => {
  it('renders children', () => {
    render(<Label>Active</Label>);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default props', () => {
    render(<Label>Default</Label>);

    expect(screen.getByText('Default')).toHaveClass(
      styles.label,
      styles.size_md,
      styles.tone_default,
      styles.emphasis_subtle,
    );
  });

  it('applies size classes', () => {
    render(<Label size="sm">Small</Label>);

    expect(screen.getByText('Small')).toHaveClass(styles.size_sm);
  });

  it('applies tone classes', () => {
    render(<Label tone="success">Success</Label>);

    expect(screen.getByText('Success')).toHaveClass(styles.tone_success);
  });

  it('applies emphasis classes', () => {
    render(<Label emphasis="bold">Bold</Label>);

    expect(screen.getByText('Bold')).toHaveClass(styles.emphasis_bold);
  });

  it('merges custom className', () => {
    render(<Label className="custom-label">Custom</Label>);

    expect(screen.getByText('Custom')).toHaveClass('custom-label');
  });

  it('forwards standard span attributes', () => {
    render(
      <Label data-testid="status-label" title="Matter status">
        Open
      </Label>,
    );

    expect(screen.getByTestId('status-label')).toHaveAttribute('title', 'Matter status');
  });

  it('renders as a span', () => {
    render(<Label>Span</Label>);

    expect(screen.getByText('Span').tagName).toBe('SPAN');
  });

  it('does not render as a button', () => {
    render(<Label>Not a button</Label>);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is not focusable by default', () => {
    render(<Label>Static</Label>);

    expect(screen.getByText('Static')).not.toHaveAttribute('tabindex');
  });

  it('uses the small semantic border radius token', () => {
    expect(labelCss).toContain('border-radius: var(--border-radius-sm);');
  });
});
