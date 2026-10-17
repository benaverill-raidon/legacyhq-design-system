import type * as React from 'react';
import type { DeprecatedToastTone, ToastTone } from '../toast/toast.types';

/** Options accepted by `toast()` and its variants. */
export interface ToastOptions {
  /**
   * The toast's id. Reuse it to update that toast in place, keeping its place in the stack; options
   * you leave out keep their earlier values.
   */
  id?: string;
  /** The Toast's `tone`. The `toast.success`, `.error`, `.warning`, `.info`, and `.loading` helpers set it. */
  tone?: ToastTone | DeprecatedToastTone;
  /** @deprecated Renamed to `tone`. Still accepted. */
  appearance?: ToastTone | DeprecatedToastTone;
  /** Supporting text, shown while the stack is expanded. */
  description?: React.ReactNode;
  /** Actions, usually extra-small tertiary Buttons, shown while the stack is expanded. */
  actions?: React.ReactNode;
  /**
   * How long the toast stays once it's in view, in milliseconds. `Infinity` or `0` keeps it until
   * it's dismissed. Defaults to the group's `duration`; a `loading` toast stays until it's updated or
   * dismissed. When a loading toast is updated to another tone, it gets the group's `duration` again
   * unless you pass one.
   */
  duration?: number;
  /** Shows the dismiss button. Defaults to `true`. */
  isDismissible?: boolean;
}

/** A live toast tracked by the store. */
export interface ToastItem extends ToastOptions {
  id: string;
  title: React.ReactNode;
  /** Counts every add and update, so an updated toast is a new entry for the group's announcer. */
  revision: number;
}

type Listener = (toasts: ToastItem[]) => void;

let counter = 0;
let revisions = 0;

function isLoading(toast: ToastOptions): boolean {
  return (toast.tone ?? toast.appearance) === 'loading';
}

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
    const item: ToastItem = { ...options, id, title, revision: (revisions += 1) };
    const existingIndex = this.toasts.findIndex((toast) => toast.id === id);

    if (existingIndex >= 0) {
      // Update in place - keeps its stack position (loading -> success/error). Options left out keep
      // their earlier values, except a loading toast's duration: once it resolves, it gets the
      // group's duration unless the update passes one.
      this.toasts = this.toasts.map((toast, index) => {
        if (index !== existingIndex) {
          return toast;
        }
        const updated: ToastItem = { ...toast, ...item };
        if (isLoading(toast) && !isLoading(updated) && options.duration === undefined) {
          delete updated.duration;
        }
        return updated;
      });
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
 * set the tone (`info` sets `information`; a `loading` toast stays until it's updated or dismissed),
 * and `toast.dismiss(id)` removes one (or all). Requires a mounted `ToastGroup`.
 */
export const toast: ToastFunction = Object.assign(createToast, {
  success: (title: React.ReactNode, options: ToastOptions = {}) => toastStore.add(title, { ...options, tone: 'success' }),
  error: (title: React.ReactNode, options: ToastOptions = {}) => toastStore.add(title, { ...options, tone: 'error' }),
  warning: (title: React.ReactNode, options: ToastOptions = {}) => toastStore.add(title, { ...options, tone: 'warning' }),
  info: (title: React.ReactNode, options: ToastOptions = {}) => toastStore.add(title, { ...options, tone: 'information' }),
  loading: (title: React.ReactNode, options: ToastOptions = {}) => toastStore.add(title, { ...options, tone: 'loading' }),
  dismiss: (id?: string) => toastStore.dismiss(id),
});
