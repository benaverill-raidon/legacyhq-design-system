// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProgressTracker } from './progress-tracker';
import styles from './progress-tracker.module.css';
import type { ProgressTrackerStep } from './progress-tracker.types';

const css = readFileSync(
  'packages/ui/src/components/organisms/progress-tracker/progress-tracker.module.css',
  'utf8',
);

const steps: ProgressTrackerStep[] = [
  { label: 'Details', href: '#details' },
  { label: 'Parties', href: '#parties' },
  { label: 'Documents', href: '#documents' },
  { label: 'Review' },
  { label: 'Submit' },
];

function renderTracker(props: Partial<React.ComponentProps<typeof ProgressTracker>> = {}) {
  return render(<ProgressTracker steps={steps} currentStep={3} aria-label="Setup" {...props} />);
}

afterEach(cleanup);

describe('ProgressTracker', () => {
  it('renders a labelled nav with an ordered list of steps', () => {
    renderTracker();

    const nav = screen.getByRole('navigation', { name: 'Setup' });
    const list = within(nav).getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(steps.length);
  });

  it('defaults the accessible name to "Progress"', () => {
    render(<ProgressTracker steps={steps} currentStep={1} />);

    expect(screen.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument();
  });

  it('marks the current step with aria-current="step"', () => {
    renderTracker({ currentStep: 3 });

    const current = screen.getByText('Documents');
    expect(current).toHaveAttribute('aria-current', 'step');

    // Only one step is current.
    expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  });

  it('renders visited (past) steps with an href as links; the current and upcoming steps are not links', () => {
    renderTracker({ currentStep: 3 });

    // Visited: Details, Parties -> links.
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute('href', '#details');
    expect(screen.getByRole('link', { name: 'Parties' })).toBeInTheDocument();

    // Current + upcoming (even with an href) are not links.
    expect(screen.queryByRole('link', { name: 'Documents' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Review' })).not.toBeInTheDocument();
  });

  it('fires a navigable step onClick', () => {
    const onClick = vi.fn();
    render(
      <ProgressTracker
        steps={[{ label: 'Details', href: '#details', onClick }, { label: 'Parties' }]}
        currentStep={2}
        aria-label="Setup"
      />,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Details' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('clamps currentStep into the valid range', () => {
    const { container, rerender } = renderTracker({ currentStep: 99 });
    let track = container.querySelector(`.${styles.track}`);
    expect(track).toHaveAttribute('data-fill', '100%');

    rerender(<ProgressTracker steps={steps} currentStep={-4} aria-label="Setup" />);
    track = container.querySelector(`.${styles.track}`);
    expect(track).toHaveAttribute('data-fill', '20%');
  });

  it('sets the fill to currentStep / totalSteps', () => {
    const { container } = renderTracker({ currentStep: 2 });
    const track = container.querySelector(`.${styles.track}`);
    expect(track).toHaveAttribute('data-fill', '40%');
    expect(track).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the size on the root', () => {
    const { container } = renderTracker({ size: 'lg' });
    expect(container.querySelector(`.${styles.root}`)).toHaveAttribute('data-size', 'lg');
  });

  it('disables the whole tracker: no links and a disabled marker on the root', () => {
    const { container } = renderTracker({ currentStep: 3, disabled: true });

    expect(container.querySelector(`.${styles.root}`)).toHaveAttribute('data-disabled', 'true');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Documents')).toHaveAttribute('aria-current', 'step');
  });

  it('does not render a disabled step as a link even when visited with an href', () => {
    render(
      <ProgressTracker
        steps={[
          { label: 'Details', href: '#details', disabled: true },
          { label: 'Parties', href: '#parties' },
          { label: 'Review' },
        ]}
        currentStep={3}
        aria-label="Setup"
      />,
    );

    expect(screen.queryByRole('link', { name: 'Details' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Parties' })).toBeInTheDocument();
  });
});

describe('ProgressTracker CSS contract', () => {
  it('fills the track with the brand token as a full-round pill on a sunken, border-bold track', () => {
    const trackRule = css.match(/\.track \{([\s\S]*?)\}/)?.[1] ?? '';
    expect(trackRule).toContain('background: var(--color-elevation-surface-sunken-default);');
    expect(trackRule).toContain('border: var(--border-width-sm) solid var(--color-border-bold);');
    expect(trackRule).toContain('border-radius: var(--border-radius-full-round);');

    const fillRule = css.match(/\.fill \{([\s\S]*?)\}/)?.[1] ?? '';
    expect(fillRule).toContain('background: var(--color-background-brand-primary-bold-default);');
    expect(fillRule).toContain('inline-size: var(--progress-tracker-fill, 0%);');
  });

  it('greys the fill and switches the track border to the disabled token when disabled', () => {
    expect(css).toMatch(
      /\.root\[data-disabled='true'\] \.fill \{[\s\S]*?background: var\(--color-background-disabled\);/,
    );
    expect(css).toMatch(
      /\.root\[data-disabled='true'\] \.track \{[\s\S]*?border-color: var\(--color-border-disabled\);/,
    );
  });

  it('uses heading-xs labels with the selected token for the current step', () => {
    const labelRule = css.match(/\.label \{([\s\S]*?)\}/)?.[1] ?? '';
    expect(labelRule).toContain('color: var(--color-content-subtle);');
    expect(labelRule).toContain('font-size: var(--typography-heading-xs-font-size);');
    expect(css).toMatch(/\.labelCurrent \{[\s\S]*?color: var\(--color-content-selected\);/);
  });

  it('overrides the Link atom states: no :visited colour, hover changes colour with no underline', () => {
    // No :visited purple - the visited link colour is pinned to the subtle/default content tokens.
    expect(css).toMatch(
      /\.link\.link \{[\s\S]*?--link-color-visited: var\(--color-content-subtle\);/,
    );
    // Hover: colour change to content/default, and underline removed.
    expect(css).toMatch(/\.link\.link:hover \{[\s\S]*?color: var\(--color-content-default\);/);
    expect(css).toMatch(/\.link\.link:hover,\s*\n\s*\.link\.link:active \{[\s\S]*?text-decoration-line: none;/);
  });
});
