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
const tokensCss = readFileSync('packages/ui/src/tokens/generated/tokens.css', 'utf8');

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

  it('keeps distinct start and end stop classes on the linear track', () => {
    const { container } = render(<ProgressBar value={48} label="Stop positions" />);
    const startStop = container.querySelector(`.${styles.stopStart}`);
    const endStop = container.querySelector(`.${styles.stopEnd}`);
    const stopShapes = container.querySelectorAll(`.${styles.stopShape}`);

    expect(startStop).toBeInTheDocument();
    expect(endStop).toBeInTheDocument();
    expect(startStop).not.toBe(endStop);
    expect(stopShapes).toHaveLength(2);
  });

  it('gives each linear stop the segment color it sits on top of, not one fixed color', () => {
    function stopSegments(value: number) {
      const { container, unmount } = render(<ProgressBar value={value} label={`Value ${value}`} />);
      const startShape = container.querySelector(`.${styles.stopStart} .${styles.stopShape}`);
      const endShape = container.querySelector(`.${styles.stopEnd} .${styles.stopShape}`);
      const result = {
        start: startShape?.classList.contains(styles.stopSegment_progress)
          ? 'progress'
          : startShape?.classList.contains(styles.stopSegment_track)
            ? 'track'
            : null,
        end: endShape?.classList.contains(styles.stopSegment_progress)
          ? 'progress'
          : endShape?.classList.contains(styles.stopSegment_track)
            ? 'track'
            : null,
      };
      unmount();
      return result;
    }

    expect(stopSegments(0)).toEqual({ start: 'track', end: 'track' });
    expect(stopSegments(48)).toEqual({ start: 'progress', end: 'track' });
    expect(stopSegments(100)).toEqual({ start: 'progress', end: 'progress' });
  });

  it('gives the circular stop the segment color it sits on top of', () => {
    function circularStopSegment(value: number) {
      const { container, unmount } = render(
        <ProgressBar value={value} variant="circular" label={`Circular value ${value}`} />,
      );
      const stopShape = container.querySelector(`.${styles.stopTop} .${styles.stopShape}`);
      const segment = stopShape?.classList.contains(styles.stopSegment_progress)
        ? 'progress'
        : stopShape?.classList.contains(styles.stopSegment_track)
          ? 'track'
          : null;
      unmount();
      return segment;
    }

    expect(circularStopSegment(0)).toBe('track');
    expect(circularStopSegment(50)).toBe('track');
    expect(circularStopSegment(100)).toBe('progress');
  });

  it('does not hardcode a fixed border/background on the shared stop shape', () => {
    expect(progressBarCss).not.toMatch(/\.stopShape\s*{[^}]*border:/);
    expect(progressBarCss).not.toMatch(/\.stopShape\s*{[^}]*background:/);
  });

  it('uses the component stop-size token and renders circular border layers', () => {
    const { container } = render(<ProgressBar value={50} variant="circular" size="lg" label="Bordered circular progress" />);
    const progressBar = screen.getByRole('progressbar', { name: 'Bordered circular progress' });
    const stopShape = container.querySelector(`.${styles.stopShape}`);
    const trackBorder = container.querySelector(`.${styles.circularTrackBorder}`);
    const progressBorder = container.querySelector(`.${styles.circularProgressBorder}`);

    expect(progressBar).toHaveClass(styles.size_lg, styles.variant_circular);
    expect(stopShape).toHaveClass(styles.stopShape);
    expect(trackBorder).toBeInTheDocument();
    expect(progressBorder).toBeInTheDocument();
  });

  it('keeps the linear geometry fluid and tokenized', () => {
    expect(progressBarCss).toContain('inline-size: 100%;');
    expect(progressBarCss).not.toContain('404px');
    expect(progressBarCss).toContain('--progress-bar-stop-size: var(--size-marker-xs);');
  });

  it('uses the current 4px stop-size token from the token source', () => {
    expect(tokensCss).toContain('--size-marker-xs: var(--measurement-4);');
  });
});
