import * as React from 'react';

export type BadgeTone = 'default' | 'brand' | 'success' | 'error';

export interface BadgeProps {
  /** The value: a short number of one to four characters, such as `3`, `+1`, or `99+`. Required. It doesn't wrap or truncate. */
  children: React.ReactNode;
  /** The fill: `default` is neutral, `brand` is the brand color, and `success` and `error` show a change up or down. */
  tone?: BadgeTone;
  /**
   * Sets `aria-label` on the badge's `span`. The span has no role, so screen readers may ignore it and
   * read the visible number: put the words that give the count meaning next to the badge instead.
   */
  ariaLabel?: string;
  /** Added to the span's classes. */
  className?: string;
}
