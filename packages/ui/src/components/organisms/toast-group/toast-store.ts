import type * as React from 'react';
import type { ToastAppearance } from '../toast/toast.types';

/** Options accepted by `toast()` and its variants. */
export interface ToastOptions {
  /** Stable id. Reuse it to update an existing toast in place (e.g. loading -> success). */
  id?: string;
  appearance?: ToastAppearance;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Auto-dismiss delay in ms. `Infinity` (or 0) keeps the toast until dismissed. Defaults to 5000. */
  duration?: number;
  isDismissible?: boolean;
}

/** A live toast tracked by the store. */
export interface ToastItem extends ToastOptions {
  id: string;
  title: React.ReactNode;
}

type Listener = (toasts: ToastItem[]) => void;

let counter = 0;

/**
 * A tiny observer store, so `toast()` can be called from anywhere without a React context. The
 * ToastGroup subscribes and renders. Newest toasts are kept at the front of the list.
 */
class ToastStore {
  private toasts: ToastItem[] = [];
  private listeners = new Set<Listener>();

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit() {
    for (const listener of this.listeners) {
      listener(this.toasts);
    }
  }

  add = (title: React.ReactNode, options: ToastOptions = {}): string => {
    const id = options.id ?? `toast-${(counter += 1)}`;
    const item: ToastItem = { ...options, id, title };
    const existingIndex = this.toasts.findIndex((toast) => toast.id === id);

    if (existingIndex >= 0) {
      // Update in place - keeps its stack position (loading -> success/error).
      this.toasts = this.toasts.map((toast, index) => (index === existingIndex ? { ...toast, ...item } : toast));
    } else {
      this.toasts = [item, ...this.toasts];
    }

    this.emit();
    return id;
  };

  dismiss = (id?: string): void => {
    this.toasts = id ? this.toasts.filter((toast) => toast.id !== id) : [];
    this.emit();
  };
}

export const toastStore = new ToastStore();

interface ToastFunction {
  (title: React.ReactNode, options?: ToastOptions): string;
  success: (title: React.ReactNode, options?: ToastOptions) => string;
  error: (title: React.ReactNode, options?: ToastOptions) => string;
  warning: (title: React.ReactNode, options?: ToastOptions) => string;
  info: (title: React.ReactNode, options?: ToastOptions) => string;
  loading: (title: React.ReactNode, options?: ToastOptions) => string;
  dismiss: (id?: string) => void;
}

function createToast(title: React.ReactNode, options: ToastOptions = {}): string {
  return toastStore.add(title, options);
}

/**
 * Imperative API. Call `toast('Saved')` from anywhere; `toast.success/error/warning/info/loading`
 * set the appearance, and `toast.dismiss(id)` removes one (or all). Requires a mounted `ToastGroup`.
 */
export const toast: ToastFunction = Object.assign(createToast, {
  success: (title: React.ReactNode, options: ToastOptions = {}) => toastStore.add(title, { ...options, appearance: 'success' }),
  error: (title: React.ReactNode, options: ToastOptions = {}) => toastStore.add(title, { ...options, appearance: 'error' }),
  warning: (title: React.ReactNode, options: ToastOptions = {}) => toastStore.add(title, { ...options, appearance: 'warning' }),
  info: (title: React.ReactNode, options: ToastOptions = {}) => toastStore.add(title, { ...options, appearance: 'info' }),
  loading: (title: React.ReactNode, options: ToastOptions = {}) =>
    toastStore.add(title, { duration: Infinity, ...options, appearance: 'loading' }),
  dismiss: (id?: string) => toastStore.dismiss(id),
});
