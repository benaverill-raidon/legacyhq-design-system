import type * as React from 'react';

export type InlineMessageTone = 'default' | 'information' | 'success' | 'warning' | 'error';
/** @deprecated Use `information`, the status name every other component and token uses. Still accepted. */
export type DeprecatedInlineMessageTone = 'info';

export interface InlineMessageProps {
  /**
   * The bold lead text. It doesn't wrap, so keep it to a few words, and make it say the status:
   * the icon isn't announced.
   */
  title: React.ReactNode;
  /** Muted text after the title, such as when something last changed. It doesn't wrap either. */
  secondaryText?: React.ReactNode;
  /**
   * The status. It picks the icon and its color, and the row's tint on hover, focus, and while open.
   * `default` shows a plain dot instead of an icon. `info`, the earlier name for `information`, is
   * still accepted.
   */
  tone?: InlineMessageTone | DeprecatedInlineMessageTone;
  /**
   * Detail shown in a popup below the row. Setting it makes the row a button that opens and closes
   * the popup; leave it unset for a plain status row with no button and no popup.
   */
  content?: React.ReactNode;
  /** Whether the popup is open, for controlled use. Pair it with `onOpenChange`. */
  open?: boolean;
  /** Whether the popup starts open, when `open` isn't set. */
  defaultOpen?: boolean;
  /**
   * Called with the next open state when the row is clicked, and with `false` when Escape or a
   * click outside closes the popup.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Read by assistive technology before the title, since the status icon is decorative. Defaults to
   * the tone's name (Information, Success, Warning, Error); none for `default`. An empty string omits it.
   */
  statusLabel?: string;
  /** Added to the row's classes. */
  className?: string;
  /**
   * Documentation only: shows the hover, focus, or pressed tint without interaction, for Storybook
   * references. Not part of the public API.
   */
  'data-force-state'?: 'hover' | 'focus' | 'press';
}
