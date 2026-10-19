import type * as React from 'react';

export type KeyValuePairSize = 'sm' | 'md' | 'lg';

export interface KeyValuePairProps {
  /** The key: the text in the left column, rendered as the `dt`. Required. */
  label: string;
  /** A read-only value, rendered as text in the `dd`. Ignored when `children` is set. */
  value?: React.ReactNode;
  /** The row's minimum height and text size: 32, 40, or 48px from `sm` to `lg`. It doesn't size an inline control in `children`: give it the same `size`. */
  size?: KeyValuePairSize;
  /** Draws a 1px divider under the row. In a list, it usually goes on every pair but the last. */
  underline?: boolean;
  /** Added to the root element's classes. */
  className?: string;
  /**
   * An editable value: a Text Field, Text Area, or Select with `context="inline"`, usually inside
   * Inline Edit. Replaces `value` when set. Give the control an `aria-label`: the key doesn't name it.
   */
  children?: React.ReactNode;
}
