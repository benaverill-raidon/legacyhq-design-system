// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Label } from './label';
import styles from './label.module.css';

const labelCss = readFileSync('packages/ui/src/components/atoms/label/label.module.css', 'utf8');

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

  it('uses a uniform 4px border radius across sizes', () => {
    expect(labelCss).toContain('border-radius: var(--label-border-radius);');
    expect(labelCss).toContain('--label-border-radius: var(--border-radius-sm);');
    expect(labelCss).not.toContain('--label-border-radius: var(--border-radius-lg);');
  });

  // md's 24px line height sets its 24px height; block padding would make it 28px.
  it('gives md no block padding, so it is 24px tall', () => {
    const sizeRule = (name: string) => labelCss.match(new RegExp(`\\.${name} \\{([^}]*)\\}`))?.[1] ?? '';

    expect(sizeRule('size_md')).toContain('--label-padding-block: var(--spacing-none);');
    expect(sizeRule('size_md')).toContain('--label-line-height: var(--typography-heading-xs-line-height);');
    expect(sizeRule('label')).toContain('--label-padding-block: var(--spacing-none);');
    expect(sizeRule('size_sm')).toContain('--label-padding-block: var(--spacing-xxs);');
  });

  // The 20px / 24px minimums are border-box heights; in a content box, padding would add to them.
  it('measures its minimum height as the border box', () => {
    const baseRule = labelCss.match(/\.label \{([^}]*)\}/)?.[1] ?? '';

    expect(baseRule).toContain('box-sizing: border-box;');
    expect(baseRule).toContain('min-block-size: var(--label-min-block-size);');
  });
});

describe('label CSS contract', () => {
  it('matches the current Figma subtle semantic mappings', () => {
    expect(labelCss).toContain('--label-color: var(--color-content-subtle);');
    expect(labelCss).toContain('--label-background: var(--color-background-information-subtle-default);');
    expect(labelCss).toContain('--label-background: var(--color-background-warning-subtle-default);');
    expect(labelCss).toContain('--label-background: var(--color-background-error-subtle-default);');
    expect(labelCss).toContain('--label-background: var(--color-background-success-subtle-default);');
  });

  it('matches the current Figma bold semantic mappings', () => {
    expect(labelCss).toContain('--label-background: var(--color-background-accent-taupe-bold-default);');
    expect(labelCss).toContain('--label-background: var(--color-background-brand-primary-bold-default);');
    expect(labelCss).toContain('--label-background: var(--color-background-accent-green-bold-default);');
    expect(labelCss).toContain('--label-color: var(--color-content-warning-bold);');
  });

  it('uses the default-tier semantic mappings for default, law, and wealth subtle emphasis', () => {
    expect(labelCss).toContain('--label-background: var(--color-background-neutral-default-default);');
    expect(labelCss).toContain('--label-background: var(--color-background-brand-primary-default-default);');
    expect(labelCss).toContain('--label-background: var(--color-background-accent-green-default-default);');
  });
});
