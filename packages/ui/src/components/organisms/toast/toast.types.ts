import type * as React from 'react';

export type ToastAppearance = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Semantic appearance - sets the leading status tile (or a spinner for `loading`). Defaults to `default`. */
  appearance?: ToastAppearance;
  /**
   * Read by assistive technology before the message, since the status icon is decorative. Defaults
   * to the appearance's name ("Success", "Information", "Warning", "Error"; `default` and `loading` have none); pass a translation, or an empty string to omit it.
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
