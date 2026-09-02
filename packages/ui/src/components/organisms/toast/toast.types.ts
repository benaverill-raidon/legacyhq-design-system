import type * as React from 'react';

export type ToastAppearance = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Semantic appearance - sets the leading status tile (or a spinner for `loading`). Defaults to `default`. */
  appearance?: ToastAppearance;
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
  /** Called when the dismiss button is clicked. */
  onDismiss?: () => void;
}
