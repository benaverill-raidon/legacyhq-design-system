export interface ToastGroupProps {
  /**
   * How many toasts show at once, stacked or expanded. Newer toasts push older ones out of view; they
   * come back as the visible ones are dismissed.
   */
  maxVisible?: number;
  /**
   * How long a toast stays, in milliseconds, when its own `duration` isn't set. The timers stop while
   * the stack is hovered or focused.
   */
  duration?: number;
  /** The list's accessible name. Defaults to "Notifications"; pass a translation. */
  label?: string;
  /** Added to the list's classes. */
  className?: string;
}

export type { ToastItem, ToastOptions } from './toast-store';
