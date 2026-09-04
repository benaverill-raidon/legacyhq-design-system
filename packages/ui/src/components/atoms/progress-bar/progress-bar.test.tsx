// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProgressBar } from './progress-bar';
import styles from './progress-bar.module.css';

afterEach(cleanup);

const progressBarCss = readFileSync('packages/ui/src/components/atoms/progress-bar/progress-bar.module.css', 'utf8');

describe('ProgressBar', () => {
  it('uses linear and md as defaults', () => {
    render(<ProgressBar data-testid="progress-bar" value={42} label="Generating matters" />);

    const progressBar = screen.getByTestId('progress-bar');

    expect(progressBar).toHaveClass(styles.root, styles.variant_linear, styles.size_md);
    expect(progressBar).toHaveAttribute('aria-valuenow', '42');
  });

  it('renders progressbar semantics', () => {
    render(<ProgressBar value={37} label="Importing matters" />);

    const progressBar = screen.getByRole('progressbar', { name: 'Importing matters' });

    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow', '37');
  });

  it('prefers aria-label over label for naming', () => {
    render(<ProgressBar value={12} aria-label="Explicit progress name" label="Fallback label" />);

    expect(screen.getByRole('progressbar', { name: 'Explicit progress name' })).toBeInTheDocument();
  });

  it('supports aria-labelledby', () => {
    render(
      <>
        <span id="progress-heading">Uploading client files</span>
        <ProgressBar value={52} aria-labelledby="progress-heading" />
      </>,
    );

    expect(screen.getByRole('progressbar', { name: 'Uploading client files' })).toBeInTheDocument();
  });

  it('clamps values below 0', () => {
    render(<ProgressBar data-testid="progress-bar" value={-18} label="Negative progress" />);

    const progressBar = screen.getByTestId('progress-bar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('data-empty', 'true');
    expect(progressBar).toHaveStyle({ '--progress-bar-value': '0%' });
  });

  it('clamps values above 100', () => {
    render(<ProgressBar data-testid="progress-bar" value={180} label="Overflow progress" />);

    const progressBar = screen.getByTestId('progress-bar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    expect(progressBar).toHaveAttribute('data-complete', 'true');
    expect(progressBar).toHaveStyle({ '--progress-bar-value': '100%' });
  });

  it('supports arbitrary values such as 37', () => {
    render(<ProgressBar data-testid="progress-bar" value={37} label="Arbitrary progress" />);

    expect(screen.getByTestId('progress-bar')).toHaveStyle({ '--progress-bar-value': '37%' });
  });

  it('renders circular variant and hides svg from assistive technology', () => {
    const { container } = render(<ProgressBar value={50} variant="circular" label="Circular progress" />);
    const progressBar = screen.getByRole('progressbar', { name: 'Circular progress' });
    const svg = container.querySelector('svg');

    expect(progressBar).toHaveClass(styles.variant_circular);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it('applies size classes', () => {
    render(<ProgressBar data-testid="progress-bar" value={80} size="lg" label="Large progress" />);

    expect(screen.getByTestId('progress-bar')).toHaveClass(styles.size_lg);
  });

  it('maps getValueText to aria-valuetext', () => {
    const getValueText = vi.fn((value: number) => `${value} percent complete`);

    render(<ProgressBar value={60} label="Upload progress" getValueText={getValueText} />);

    const progressBar = screen.getByRole('progressbar', { name: 'Upload progress' });

    expect(progressBar).toHaveAttribute('aria-valuetext', '60 percent complete');
    expect(getValueText).toHaveBeenCalledWith(60);
  });

  it('forwards the root ref', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<ProgressBar ref={ref} value={25} label="Ref progress" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'progressbar');
  });

  it('forwards native data and aria attributes', () => {
    render(
      <ProgressBar
        data-testid="progress-bar"
        value={90}
        label="Forwarded attributes"
        data-state="processing"
        aria-describedby="progress-help"
      />,
    );

    const progressBar = screen.getByTestId('progress-bar');

    expect(progressBar).toHaveAttribute('data-state', 'processing');
    expect(progressBar).toHaveAttribute('aria-describedby', 'progress-help');
  });

  it('supports zero and complete states', () => {
    const { rerender } = render(<ProgressBar data-testid="progress-bar" value={0} label="Zero progress" />);

    expect(screen.getByTestId('progress-bar')).toHaveAttribute('data-empty', 'true');

    rerender(<ProgressBar data-testid="progress-bar" value={100} label="Complete progress" />);

    expect(screen.getByTestId('progress-bar')).toHaveAttribute('data-complete', 'true');
  });

  it('renders the two linear track segments and no stop markers', () => {
    const { container } = render(<ProgressBar value={48} label="Linear segments" />);
    const track = container.querySelector(`.${styles.track}`);
    const remainingTrack = container.querySelector(`.${styles.remainingTrack}`);
    const progressSegment = container.querySelector(`.${styles.progressSegment}`);

    expect(remainingTrack).toBeInTheDocument();
    expect(progressSegment).toBeInTheDocument();
    // The stop markers were removed in the Figma revision: the track holds exactly the two
    // segments and nothing else.
    expect(track?.children).toHaveLength(2);
    // No CSS remains for the removed stop anatomy.
    expect(progressBarCss).not.toContain('stopShape');
    expect(progressBarCss).not.toContain('stopContainer');
  });

  it('renders the circular track-border and progress layers, and no separate progress border', () => {
    const { container } = render(
      <ProgressBar value={50} variant="circular" size="lg" label="Bordered circular progress" />,
    );
    const progressBar = screen.getByRole('progressbar', { name: 'Bordered circular progress' });

    expect(progressBar).toHaveClass(styles.size_lg, styles.variant_circular);
    expect(container.querySelector(`.${styles.circularTrackBorder}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.circularTrack}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.circularProgress}`)).toBeInTheDocument();
    // The progress arc is framed by the track's bold border ring, so it has no border layer of its own.
    expect(progressBarCss).not.toContain('circularProgressBorder');
  });

  it('insets the circular progress arc inside the track ring by the pad', () => {
    // md track thickness 12, pad 4 -> progress arc 12 - 2*4 = 4, narrower than the 12 track ring.
    const { container } = render(<ProgressBar value={50} variant="circular" label="Inset circular" />);
    const trackBorder = container.querySelector(`.${styles.circularTrackBorder}`);
    const progress = container.querySelector(`.${styles.circularProgress}`);
    const trackWidth = Number(trackBorder?.getAttribute('stroke-width'));
    const progressWidth = Number(progress?.getAttribute('stroke-width'));

    expect(trackWidth).toBe(12);
    expect(progressWidth).toBe(4);
    expect(progressWidth).toBeLessThan(trackWidth);
  });

  it('shows no circular track at value 0', () => {
    const { container } = render(<ProgressBar value={0} variant="circular" label="Empty circular" />);
    const progressBar = screen.getByRole('progressbar', { name: 'Empty circular' });

    expect(progressBar).toHaveClass(styles.variant_circular);
    expect(progressBar).toHaveAttribute('data-empty', 'true');
    // The empty-circular rule hides the track ring, its border, and the progress arc.
    expect(progressBarCss).toMatch(
      /\.variant_circular\[data-empty='true'\][^{]*\.circularProgress\s*{[^}]*display:\s*none/,
    );
    // The track layers are still in the DOM (hidden by CSS, which jsdom does not compute).
    expect(container.querySelector(`.${styles.circularTrackBorder}`)).toBeInTheDocument();
  });

  it('gives the linear track and progress fill fully rounded corners at every value', () => {
    // Both the remaining track and the progress fill are full-round pills - no per-corner or
    // completion-conditional rounding, so the progress fill is a rounded pill at any value.
    expect(progressBarCss).toMatch(
      /\.remainingTrack\s*{[^}]*border-radius:\s*var\(--border-radius-full-round\)/,
    );
    expect(progressBarCss).toMatch(
      /\.progressSegment\s*{[^}]*border-radius:\s*var\(--border-radius-full-round\)/,
    );
    expect(progressBarCss).not.toContain('border-start-start-radius');
    expect(progressBarCss).not.toContain('border-end-end-radius');
  });

  it('insets the progress fill inside the bordered track by the linear pad', () => {
    // The fill floats inside the track: inset by the pad on the block axis and inline-start, and
    // sized to the fill fraction of the padded inner width so 100% leaves an equal inline-end pad.
    expect(progressBarCss).toMatch(/\.progressSegment\s*{[^}]*inset-block:\s*var\(--progress-bar-linear-pad\)/);
    expect(progressBarCss).toMatch(
      /inline-size:\s*calc\(var\(--progress-bar-fill[^)]*\) \* \(100% - 2 \* var\(--progress-bar-linear-pad\)\)\)/,
    );
    render(<ProgressBar data-testid="pb" value={37} label="Fill fraction" />);
    expect(screen.getByTestId('pb')).toHaveStyle({ '--progress-bar-fill': '0.37' });
  });

  it('uses the brand palette, not the old data-viz sequence tokens', () => {
    // Progress fill = brand primary bold; remaining track = deep surface; borders = border/bold.
    expect(progressBarCss).toContain('var(--color-background-brand-primary-bold-default)');
    expect(progressBarCss).toContain('var(--color-elevation-surface-deep-default)');
    expect(progressBarCss).toContain('var(--color-border-bold)');
    expect(progressBarCss).not.toContain('data-viz-sequence-prussian');
  });

  it('caps the circular progress arc with rounded ends', () => {
    expect(progressBarCss).toMatch(/\.circularProgress\s*{[^}]*stroke-linecap:\s*round/);
    expect(progressBarCss).not.toContain('stroke-linecap: butt');
  });

  it('keeps the linear geometry fluid and tokenized', () => {
    expect(progressBarCss).toContain('inline-size: 100%;');
    expect(progressBarCss).not.toContain('404px');
  });
});
