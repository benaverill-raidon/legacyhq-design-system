import type * as React from 'react';

export type ProgressTrackerSize = 'md' | 'lg';

export interface ProgressTrackerStep {
  /** The step label. */
  label: React.ReactNode;
  /**
   * Optional link target. A step before the current one that has an `href` and is not disabled
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
  /** The steps, in order. Each step's label sits under its equal share of the bar. */
  steps: ProgressTrackerStep[];
  /** The current step, counted from 1. Rounded down and clamped to `1` through the number of steps. */
  currentStep: number;
  /** Bar thickness only: `md` is a 12px fill, `lg` a 24px fill. The labels don't change. */
  size?: ProgressTrackerSize;
  /** Disables the whole tracker: mutes every label and greys the fill and its outline; nothing is a link. */
  disabled?: boolean;
  /** The tracker's accessible name. Defaults to "Progress". Ignored when `aria-labelledby` is set. */
  'aria-label'?: string;
  /** Names the tracker by the id of a visible heading. When set, no `aria-label` is rendered. */
  'aria-labelledby'?: string;
}
