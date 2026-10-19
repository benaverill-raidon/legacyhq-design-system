import type * as React from 'react';

export type BannerTone = 'default' | 'warning' | 'error';
/** @deprecated Renamed to `BannerTone`. */
export type BannerAppearance = BannerTone;

export interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What the announcement means. Sets the bar's color and its status icon. Defaults to `default`. */
  tone?: BannerTone;
  /** @deprecated Renamed to `tone`, the name every component uses for meaning. Still accepted. */
  appearance?: BannerTone;
  /** The message. It stays on one line and is cut off with an ellipsis when it doesn't fit. */
  children: React.ReactNode;
  /**
   * Visually hidden text read before the message, since the icon is decorative. Defaults to the
   * tone's name, "Warning" or "Error"; `default` has none. Pass a translation, or an empty string to
   * leave it out.
   */
  statusLabel?: string;
  /** Shows the status icon, or the dot for `default`. The status text is still read without it. */
  showIcon?: boolean;
  /**
   * One or two actions after the message, such as Buttons in a Button Group. On the dark `default`
   * and `error` bars, set `isInverse` on them; on the `warning` bar, use `prominence="primary"` with
   * `tone="warning"`.
   */
  actions?: React.ReactNode;
  /**
   * Defaults to `status`, a polite live region. Use `alert` for an urgent error that must interrupt
   * what the user is doing.
   */
  role?: React.AriaRole;
}
