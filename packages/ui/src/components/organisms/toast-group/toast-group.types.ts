export interface ToastGroupProps {
  /**
   * How many toasts show at once, stacked or expanded. Newer toasts push older ones out of view; they
   * wait, hidden from assistive technology with their timers paused, and come back as the visible
   * ones are dismissed.
   */
  maxVisible?: number;
  /**
   * How long a toast stays once it's in view, in milliseconds, when its own `duration` isn't set. The
   * timers pause while the stack is hovered or focused and resume with the time that was left.
   */
  duration?: number;
  /** The list's accessible name. Defaults to "Notifications"; pass a translation. */
  label?: string;
  /** Added to the list's classes. */
  className?: string;
}

export type { ToastItem, ToastOptions } from './toast-store';
