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

  it('is always role="progressbar", even when a role is passed', () => {
    // `role` isn't in ProgressBarProps; a plain-JS caller can still pass one.
    const props = { role: 'status' } as unknown as Record<string, never>;
    render(<ProgressBar data-testid="progress-bar" value={40} label="Uploading" {...props} />);

    expect(screen.getByTestId('progress-bar')).toHaveAttribute('role', 'progressbar');
    expect(screen.getByRole('progressbar', { name: 'Uploading' })).toBeInTheDocument();
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
    // The stop markers were removed in the Figma revision: the track holds the bordered remaining
    // track, and the fill sits inside it (clipped to its inner edge), with nothing else.
    expect(track?.children).toHaveLength(1);
    expect(track?.firstElementChild).toBe(remainingTrack);
    expect(remainingTrack?.children).toHaveLength(1);
    expect(remainingTrack?.firstElementChild).toBe(progressSegment);
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

  it.each([
    // Figma (4217:98931): outer edge radius 38 in an 80 box; hole radius md 22, lg 10. Figma has
    // no circular sm, so the deprecated circular sm draws the md ring.
    ['sm', 22, 16],
    ['md', 22, 16],
    ['lg', 10, 28],
  ] as const)('draws the %s circular ring at hole radius %i, %ipx thick, with the progress across its full thickness', (size, hole, thickness) => {
    const { container } = render(<ProgressBar value={50} variant="circular" size={size} label="Ring geometry" />);
    const svg = container.querySelector('svg');
    const circles = (className: string) => container.querySelector(`.${className}`);
    const border = circles(styles.circularTrackBorder);
    const track = circles(styles.circularTrack);
    const progress = circles(styles.circularProgress);
    const midRadius = hole + thickness / 2;

    expect(svg).toHaveAttribute('viewBox', '0 0 80 80');
    for (const circle of [border, track, progress]) {
      expect(circle).toHaveAttribute('cx', '40');
      expect(circle).toHaveAttribute('cy', '40');
      expect(Number(circle?.getAttribute('r'))).toBe(midRadius);
    }
    // The ring's outer edge is radius 38 at every size.
    expect(midRadius + thickness / 2).toBe(38);
    // The border stroke is 2 wider than the ring, so 1px of border shows outside both edges.
    expect(Number(border?.getAttribute('stroke-width'))).toBe(thickness + 2);
    expect(Number(track?.getAttribute('stroke-width'))).toBe(thickness);
    // No inset pad: the progress wedge fills the ring's full thickness.
    expect(Number(progress?.getAttribute('stroke-width'))).toBe(thickness);
  });

  it('renders the deprecated circular sm exactly as md, and keeps sm for the linear bar', () => {
    const { container: smContainer } = render(
      <ProgressBar data-testid="circular-sm" value={50} variant="circular" size="sm" label="Ring" />,
    );
    const { container: mdContainer } = render(
      <ProgressBar data-testid="circular-md" value={50} variant="circular" size="md" label="Ring" />,
    );
    const circularSm = screen.getByTestId('circular-sm');

    expect(circularSm).toHaveClass(styles.size_md);
    expect(circularSm).not.toHaveClass(styles.size_sm);
    expect(circularSm).toHaveAttribute('data-size', 'md');
    expect(circularSm.className).toBe(screen.getByTestId('circular-md').className);
    expect(smContainer.querySelector('svg')?.outerHTML).toBe(mdContainer.querySelector('svg')?.outerHTML);

    render(<ProgressBar data-testid="linear-sm" value={50} size="sm" label="Bar" />);
    const linearSm = screen.getByTestId('linear-sm');

    expect(linearSm).toHaveClass(styles.size_sm);
    expect(linearSm).toHaveAttribute('data-size', 'sm');
  });

  it('shows the empty track and its border at value 0, in both variants, and hides only the circular arc', () => {
    const { container, rerender } = render(<ProgressBar value={0} variant="circular" label="Empty circular" />);
    const progressBar = screen.getByRole('progressbar', { name: 'Empty circular' });

    expect(progressBar).toHaveClass(styles.variant_circular);
    expect(progressBar).toHaveAttribute('data-empty', 'true');
    expect(container.querySelector(`.${styles.circularTrackBorder}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.circularTrack}`)).toBeInTheDocument();
    // jsdom doesn't compute the CSS, so read the rules: the only thing the empty state hides is the
    // circular progress arc, so no sliver of it can show at the 12 o'clock seam.
    const emptySelectors = [...progressBarCss.matchAll(/([^{}]*\[data-empty='true'\][^{}]*){([^}]*)}/g)].map(
      ([, selector]) => selector.replace(/\/\*[\s\S]*?\*\//g, '').trim(),
    );
    expect(emptySelectors).toEqual([".variant_circular[data-empty='true'] .circularProgress"]);
    expect(progressBarCss).toMatch(
      /\.variant_circular\[data-empty='true'\] \.circularProgress\s*{[^}]*display:\s*none/,
    );

    // The linear variant shows its bordered track at 0 the same way; its fill is zero-width.
    rerender(<ProgressBar data-testid="pb" value={0} label="Empty linear" />);
    expect(screen.getByTestId('pb')).toHaveAttribute('data-empty', 'true');
    expect(screen.getByTestId('pb')).toHaveStyle({ '--progress-bar-fill': '0' });
    expect(container.querySelector(`.${styles.remainingTrack}`)).toBeInTheDocument();
  });

  it('rounds the linear fill at its start, squares its end while partial, and rounds both ends at 100', () => {
    const rule = (selector: string) =>
      progressBarCss.match(new RegExp(`(?:^|\\n)${selector.replace(/[.[\]']/g, '\\$&')}\\s*{([^}]*)}`))?.[1] ?? '';
    // The remaining track is a full pill, and clips the fill to its inner edge.
    expect(rule('.remainingTrack')).toMatch(/border-radius:\s*var\(--border-radius-full-round\)/);
    expect(rule('.remainingTrack')).toMatch(/overflow:\s*hidden/);
    // Partial fill: only the start corners are rounded.
    const fill = rule('.progressSegment');
    expect(fill).toMatch(/border-start-start-radius:\s*var\(--border-radius-full-round\)/);
    expect(fill).toMatch(/border-end-start-radius:\s*var\(--border-radius-full-round\)/);
    expect(fill).not.toMatch(/(^|[^-])border-radius:/);
    expect(fill).not.toMatch(/border-(start-end|end-end)-radius/);
    // Complete: both ends rounded.
    expect(rule(".variant_linear[data-complete='true'] .progressSegment")).toMatch(
      /border-radius:\s*var\(--border-radius-full-round\)/,
    );
  });

  it('sizes the linear bar to the track size, with the fill inside the 1px border at full inner height', () => {
    // Figma removed the outer spacing: the bar is the track size tall, with no pad.
    for (const size of ['sm', 'md', 'lg']) {
      expect(progressBarCss).toMatch(
        new RegExp(`\\.size_${size}\\s*{[^}]*--progress-bar-track-size:\\s*var\\(--component-progress-bar-track-size-${size}\\)`),
      );
    }
    expect(progressBarCss).toMatch(/\.variant_linear\s*{[^}]*block-size:\s*var\(--progress-bar-track-size\)/);
    expect(progressBarCss).not.toContain('--component-progress-bar-linear-root-size');
    expect(progressBarCss).not.toContain('--component-progress-bar-linear-pad');
    expect(progressBarCss).not.toContain('--progress-bar-linear-pad');
    // The fill is positioned in the remaining track's padding box, which is inside its
    // --border-width-sm border: it starts at the border, runs the full inner height, and is the
    // fill fraction of the inner width.
    expect(progressBarCss).toMatch(/\.remainingTrack\s*{[^}]*border:\s*var\(--border-width-sm\) solid var\(--color-border-bold\)/);
    const fill = progressBarCss.match(/\n\.progressSegment\s*{([^}]*)}/)?.[1] ?? '';
    expect(fill).toMatch(/inset-block:\s*0;/);
    expect(fill).toMatch(/inset-inline-start:\s*0;/);
    expect(fill).toMatch(/inline-size:\s*calc\(var\(--progress-bar-fill, 0\) \* 100%\)/);
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

  it('ends the circular progress wedge with straight edges, not rounded caps', () => {
    expect(progressBarCss).toMatch(/\.circularProgress\s*{[^}]*stroke-linecap:\s*butt/);
    expect(progressBarCss).not.toContain('stroke-linecap: round');
  });

  it('sizes the circular box from the 80px token', () => {
    expect(progressBarCss).toMatch(/--progress-bar-circular-size:\s*var\(--component-progress-bar-circular-size\)/);
    expect(tokensCss).toMatch(/--component-progress-bar-circular-size:\s*var\(--measurement-80\);/);
  });

  it('keeps the linear geometry fluid and tokenized', () => {
    expect(progressBarCss).toContain('inline-size: 100%;');
    expect(progressBarCss).not.toContain('404px');
  });

  it('eases fill changes with fade-quick, and not under reduced motion', () => {
    expect(progressBarCss).toContain('transition: inline-size var(--fade-quick);');
    expect(progressBarCss).toMatch(/stroke-dashoffset var\(--fade-quick\),\s*stroke-dasharray var\(--fade-quick\);/);
    // Progress is a visual state change, never physical movement: no spring.
    expect(progressBarCss).not.toMatch(/--move-|--ease-spring/);
    const reduced = progressBarCss.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(reduced).toMatch(/\.progressSegment,\s*\.circularProgress \{\s*transition-duration: 0ms;/);
  });
});
