import type * as React from 'react';

export type ToastTone = 'default' | 'success' | 'information' | 'warning' | 'error' | 'loading';
/** @deprecated Use `information`, the status name every other component and token uses. Still accepted. */
export type DeprecatedToastTone = 'info';
/** @deprecated Renamed to `ToastTone`. */
export type ToastAppearance = ToastTone;
/** @deprecated Renamed to `DeprecatedToastTone`. */
export type DeprecatedToastAppearance = DeprecatedToastTone;

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Semantic tone - sets the leading status tile (or a spinner for `loading`). Defaults to `default`. */
  tone?: ToastTone | DeprecatedToastTone;
  /** @deprecated Renamed to `tone`, the name every component uses for meaning. Still accepted. */
  appearance?: ToastTone | DeprecatedToastTone;
  /**
   * Read by assistive technology before the message, since the status icon is decorative. Defaults
   * to the tone's name ("Success", "Information", "Warning", "Error"; `default` and `loading` have none); pass a translation, or an empty string to omit it.
   */
  statusLabel?: string;
  /** The toast title. */
  title: React.ReactNode;
  /** Optional supporting description, shown when expanded. */
  description?: React.ReactNode;
  /** Optional actions - typically Buttons - shown when expanded. */
  actions?: React.ReactNode;
  /**
   * Whether the description and actions are shown. When `false` the toast is compact (title only).
   * Defaults to `true`. The ToastGroup drives this from its collapsed/expanded state.
   */
  expanded?: boolean;
  /** Whether to show the dismiss button. Defaults to `true`. */
  isDismissible?: boolean;
  /** Accessible name for the dismiss button. Defaults to "Dismiss". */
  dismissLabel?: string;
  /** Called when the dismiss button is clicked. */
  onDismiss?: () => void;
}
