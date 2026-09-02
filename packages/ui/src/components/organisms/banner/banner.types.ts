import type * as React from 'react';

export type BannerAppearance = 'default' | 'warning' | 'error';

export interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Semantic appearance - sets the bold background and the leading status icon. Defaults to `default`. */
  appearance?: BannerAppearance;
  /** The banner message. Truncates to a single line with an ellipsis. */
  children: React.ReactNode;
  /** Whether to show the leading status icon. Defaults to `true`. */
  showIcon?: boolean;
  /**
   * Optional trailing actions - typically a ButtonGroup of Buttons. Match them to the bar: use
   * `isInverse` on the dark `default`/`error` bars, and `tone="warning"` (with `appearance="primary"`)
   * on the amber `warning` bar.
   */
  actions?: React.ReactNode;
}
