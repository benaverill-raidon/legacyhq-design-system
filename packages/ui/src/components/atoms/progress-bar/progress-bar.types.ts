import type * as React from 'react';

export type ProgressBarVariant = 'linear' | 'circular';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

// No `role`: the root is always `role="progressbar"`, which its `aria-value*` attributes need.
export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  /**
   * How much of the process is done, from 0 to 100. Any number is accepted: below 0 and non-finite
   * values show and announce as 0, above 100 as 100.
   */
  value: number;
  /** `linear` fills the width its container gives it; `circular` is a 72px ring at every size. */
  variant?: ProgressBarVariant;
  /**
   * The thickness of the bar or ring. Linear bars are 24, 32, or 40px tall for `sm`, `md`, and
   * `lg`; the circular ring stays 72px across and only its stroke changes.
   */
  size?: ProgressBarSize;
  /**
   * The accessible name, set as `aria-label`. Name the process ("Uploading client files"), not the
   * number. An `aria-label` or `aria-labelledby` you pass wins over it.
   */
  label?: string;
  /**
   * Returns the text announced for the value, set as `aria-valuetext`, such as "6 of 10 documents
   * prepared". It gets the clamped value. Without it, the value is announced as a percentage,
   * unless you pass `aria-valuetext` yourself.
   */
  getValueText?: (value: number) => string;
}
