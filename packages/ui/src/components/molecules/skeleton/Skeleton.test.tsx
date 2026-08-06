// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton';
import styles from './skeleton.module.css';

const skeletonCss = readFileSync(
  'packages/ui/src/components/molecules/skeleton/skeleton.module.css',
  'utf8',
);

afterEach(cleanup);

describe('Skeleton', () => {
  it('renders successfully', () => {
    render(<Skeleton data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('uses subtle appearance and rectangle shape by default', () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-appearance', 'subtle');
    expect(skeleton).toHaveAttribute('data-shape', 'rectangle');
    expect(skeleton).toHaveClass(styles.root, styles.appearance_subtle, styles.shape_rectangle);
  });

  it('applies a selected appearance', () => {
    render(<Skeleton appearance="default" data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toHaveClass(styles.appearance_default);
  });

  it('applies a selected shape', () => {
    render(<Skeleton shape="circle" data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-shape', 'circle');
    expect(skeleton).toHaveClass(styles.shape_circle);
  });

  it('supports custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toHaveClass('custom-skeleton');
  });

  it('is decorative and hidden from the accessibility tree by default', () => {
    render(<Skeleton data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('uses accessible loading status semantics when label is provided', () => {
    render(<Skeleton label="Loading profile" />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-live', 'polite');
    expect(skeleton).not.toHaveAttribute('aria-hidden');
    expect(screen.getByText('Loading profile')).toHaveClass(styles.visuallyHidden);
  });

  it('forwards native div attributes', () => {
    render(<Skeleton data-testid="skeleton" id="matter-skeleton" title="Loading matters" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('id', 'matter-skeleton');
    expect(skeleton).toHaveAttribute('title', 'Loading matters');
  });

  it('forwards a ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} data-testid="skeleton" />);

    expect(ref.current).toBe(screen.getByTestId('skeleton'));
  });

  it('supports arbitrary sizing via style, matching how usages vary width and height', () => {
    render(<Skeleton data-testid="skeleton" style={{ inlineSize: '48px', blockSize: '48px' }} />);

    expect(screen.getByTestId('skeleton')).toHaveStyle({ inlineSize: '48px', blockSize: '48px' });
  });

  it('uses semantic and component color tokens for each appearance', () => {
    expect(skeletonCss).toContain('--skeleton-color: var(--color-skeleton-default);');
    expect(skeletonCss).toContain('--skeleton-color: var(--component-skeleton-color-subtle);');
  });

  it('uses the full-round radius token for the circle shape', () => {
    expect(skeletonCss).toContain('border-radius: var(--border-radius-full-round);');
  });

  it('pulses on a loop using the shared motion token and respects reduced motion', () => {
    expect(skeletonCss).toContain('animation: skeleton-pulse var(--pulse-loop) infinite;');
    expect(skeletonCss).toContain('animation: none;');
  });
});
