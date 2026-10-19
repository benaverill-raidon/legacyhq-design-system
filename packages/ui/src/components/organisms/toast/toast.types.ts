import type * as React from 'react';

export type ToastTone = 'default' | 'success' | 'information' | 'warning' | 'error' | 'loading';
/** @deprecated Use `information`, the status name every other component and token uses. Still accepted. */
export type DeprecatedToastTone = 'info';
/** @deprecated Renamed to `ToastTone`. */
export type ToastAppearance = ToastTone;
/** @deprecated Renamed to `DeprecatedToastTone`. */
export type DeprecatedToastAppearance = DeprecatedToastTone;

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * What the toast means. Sets the color and icon of the status tile; `loading` shows a Spinner
   * instead. Defaults to `default`. `info`, the earlier name for `information`, is still accepted.
   */
  tone?: ToastTone | DeprecatedToastTone;
  /** @deprecated Renamed to `tone`, the name every component uses for meaning. Still accepted. */
  appearance?: ToastTone | DeprecatedToastTone;
  /**
   * Visually hidden text read before the title, since the tile is decorative. Defaults to the tone's
   * name: "Success", "Information", "Warning", or "Error"; `default` and `loading` have none. Pass a
   * translation, or an empty string to leave it out.
   */
  statusLabel?: string;
  /** The title: what happened, in a few words. Always shown. */
  title: React.ReactNode;
  /** Supporting text below the title. Shown only while `expanded`. */
  description?: React.ReactNode;
  /** Actions below the description, usually extra-small tertiary Buttons. Shown only while `expanded`. */
  actions?: React.ReactNode;
  /**
   * Shows the description and actions. When `false`, the toast is the title alone. Toast Group sets
   * it: collapsed in the stack, expanded while the stack is hovered or focused.
   */
  expanded?: boolean;
  /** Shows the dismiss button. Turn it off for a `loading` toast that's replaced when the work finishes. */
  isDismissible?: boolean;
  /** The dismiss button's accessible name. Defaults to "Dismiss"; pass a translation. */
  dismissLabel?: string;
  /** Called when the dismiss button is clicked. Toast doesn't hide itself; Toast Group removes it. */
  onDismiss?: () => void;
  /** Defaults to `status`, a polite live region. */
  role?: React.AriaRole;
}
