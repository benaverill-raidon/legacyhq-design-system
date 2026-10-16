import type * as React from 'react';

export type ProgressIndicatorAppearance =
  | 'default'
  | 'primary'
  | 'inverse';
/** @deprecated Use `inverse`, the name every other component uses for light-on-dark. Still accepted. */
export type DeprecatedProgressIndicatorAppearance = 'inverted';

export type ProgressIndicatorSize = 'sm' | 'md';

export interface ProgressIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The current step, counted from 1. Rounded down and clamped to `1` through `totalSteps`. */
  currentStep: number;
  /** How many steps, and so how many dots. Rounded down, and at least `1`. */
  totalSteps: number;
  /**
   * The selected dot's color: `default` is the neutral bold color, `primary` the brand color, and
   * `inverse` the neutral subtle color, for a bold surface only. `inverted` is a deprecated name
   * for `inverse`, still accepted.
   */
  appearance?: ProgressIndicatorAppearance | DeprecatedProgressIndicatorAppearance;
  /** Dot size: `sm` is an 8px dot in a 16px space, `md` a 12px dot in a 20px space. */
  size?: ProgressIndicatorSize;
  /** The journey's accessible name, such as "Client onboarding". Used when there's no `aria-label` or `aria-labelledby`. */
  label?: string;
  /** Builds the announced value from the current step and the total. Defaults to "Step 2 of 5". */
  getValueText?: (currentStep: number, totalSteps: number) => string;
  /**
   * Makes each dot a button that calls this with its step number. Progress Indicator stays
   * controlled: update `currentStep` yourself. Without it, the dots are decorative.
   */
  onStepChange?: (step: number) => void;
}
