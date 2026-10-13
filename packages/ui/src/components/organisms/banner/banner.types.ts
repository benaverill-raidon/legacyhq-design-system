import type * as React from 'react';

export type BannerTone = 'default' | 'warning' | 'error';
/** @deprecated Renamed to `BannerTone`. */
export type BannerAppearance = BannerTone;

export interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Semantic tone - sets the bold background and the leading status icon. Defaults to `default`. */
  tone?: BannerTone;
  /** @deprecated Renamed to `tone`, the name every component uses for meaning. Still accepted. */
  appearance?: BannerTone;
  /** The banner message. Truncates to a single line with an ellipsis. */
  children: React.ReactNode;
  /**
   * Read by assistive technology before the message, since the status icon is decorative. Defaults
   * to the tone's name ("Warning", "Error"; `default` has none); pass a translation, or an empty string to omit it.
   */
  statusLabel?: string;
  /** Whether to show the leading status icon. Defaults to `true`. */
  showIcon?: boolean;
  /**
   * Optional trailing actions - typically a ButtonGroup of Buttons. Match them to the bar: use
   * `isInverse` on the dark `default`/`error` bars, and `tone="warning"` (with `appearance="primary"`)
   * on the amber `warning` bar.
   */
  actions?: React.ReactNode;
}
