import type * as React from 'react';

export type ProgressTrackerSize = 'md' | 'lg';

export interface ProgressTrackerStep {
  /** The step label. */
  label: React.ReactNode;
  /**
   * Optional link target. A step that has an `href`, is not disabled, and is not the current step
   * renders its label as a `Link` (a visited step the user can jump back to). The current and
   * upcoming steps are never rendered as links.
   */
  href?: string;
  /** Anchor `target` for `href` steps. */
  target?: React.HTMLAttributeAnchorTarget;
  /** Called when a navigable step's label is activated. */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Marks this step non-interactive and muted (never a link). */
  disabled?: boolean;
}

export interface ProgressTrackerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** The steps, in order. */
  steps: ProgressTrackerStep[];
  /** The 1-based index of the current step. Clamped to `1..steps.length`. */
  currentStep: number;
  /** Bar thickness. Defaults to `md`. */
  size?: ProgressTrackerSize;
  /** Disables the whole tracker: mutes every label and greys the fill; nothing is a link. */
  disabled?: boolean;
  /** Accessible name for the tracker. Defaults to `Progress`. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
