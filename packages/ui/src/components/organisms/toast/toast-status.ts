import type { DeprecatedToastTone, ToastTone } from './toast.types';

/** What each tone announces before the title; `default` and `loading` carry no status. */
export const TOAST_STATUS_LABELS: Partial<Record<ToastTone, string>> = {
  success: 'Success',
  information: 'Information',
  warning: 'Warning',
  error: 'Error',
};

/**
 * The tone a toast shows: `tone`, else the deprecated `appearance`, else `default`, with the
 * deprecated `info` mapped to `information`. Shared by Toast and Toast Group.
 */
export function resolveToastTone(
  tone: ToastTone | DeprecatedToastTone | undefined,
  appearance?: ToastTone | DeprecatedToastTone,
): ToastTone {
  const requested = tone ?? appearance ?? 'default';
  return requested === 'info' ? 'information' : requested;
}
