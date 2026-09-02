export interface ToastGroupProps {
  /** How many toasts are shown stacked before the rest collapse behind them. Defaults to 3. */
  maxVisible?: number;
  /** Default auto-dismiss delay in ms for toasts that don't set their own. Defaults to 5000. */
  duration?: number;
  /** Accessible label for the notification region. Defaults to 'Notifications'. */
  label?: string;
  className?: string;
}

export type { ToastItem, ToastOptions } from './toast-store';
