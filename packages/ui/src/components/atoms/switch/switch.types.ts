import type * as React from 'react';

export type SwitchSize = 'sm' | 'md';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'size' | 'onChange'> {
  /**
   * The visible label, after the switch. Clicking it toggles the switch. Leave it out only when
   * `aria-label` or `aria-labelledby` names the switch.
   */
  label?: React.ReactNode;
  /** `md`, a 40 by 20px track, or `sm`, a 32 by 16px track with a smaller label. */
  size?: SwitchSize;
  /** Whether it's on, for a controlled switch. Pair it with `onCheckedChange`. */
  checked?: boolean;
  /** Whether it starts on, for an uncontrolled switch. */
  defaultChecked?: boolean;
  /** The native `disabled` attribute: the switch can't be changed and leaves the tab order. */
  disabled?: boolean;
  /**
   * The native `required` attribute, which assistive technology announces. Shows a `*` after the
   * label when there is one; the `*` is hidden from assistive technology.
   */
  required?: boolean;
  /**
   * Shows a Spinner in the track and ignores toggles while a change is saved. The switch stays
   * focusable and sets `aria-busy`.
   */
  isLoading?: boolean;
  /** Shows the check (on) and X (off) marks in the track. Set it to `false` for a plain track; the loading Spinner shows either way. */
  showIcons?: boolean;
  /**
   * Called when the user toggles the switch, with the next value and the change event. Not called
   * while it's loading.
   */
  onCheckedChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Added to the root `label` element's classes. */
  className?: string;
}
