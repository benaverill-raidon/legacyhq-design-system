import type * as React from 'react';

export type BadgeTone = 'default' | 'brand' | 'success' | 'error';

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The value: a short number of one to four characters, such as `3`, `+1`, or `99+`. Required. It doesn't wrap or truncate. */
  children: React.ReactNode;
  /** The fill: `default` is neutral, `brand` is the brand color, and `success` and `error` show a change up or down. */
  tone?: BadgeTone;
  /**
   * What the number means in words, such as "3 unread messages". Screen readers read it in place of
   * the visible value, which is then hidden from them. Leave it unset when the text beside the badge
   * already says what it counts.
   */
  label?: string;
  /**
   * @deprecated Use `label`. It's read the same way: in place of the visible value, as hidden text.
   */
  ariaLabel?: string;
  /** Added to the span's classes. */
  className?: string;
}
