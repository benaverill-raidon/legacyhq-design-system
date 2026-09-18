import type * as React from 'react';

export type FieldState = 'default' | 'error' | 'valid';
export type FieldContext = 'default' | 'inline';
export type FieldSize = 'sm' | 'md' | 'lg';

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The single form control this field wraps (Text Field, Text Area, Select, ...). Field wires the
   * label, message, and validation state to it, so it must be a single React element - not text,
   * a fragment, or multiple elements.
   */
  children: React.ReactElement;
  /**
   * The label text. Rendered in a real native `<label htmlFor>` pointing at the control, so the
   * control gets its accessible name from the label - no separate `aria-label` needed. Omit only
   * when the control is labelled some other way (then Field renders no `<label>`).
   */
  label?: React.ReactNode;
  /**
   * Helper, error, or success text shown below the control. Field links it to the control via
   * `aria-describedby` automatically. Its color, and whether a status icon appears, follow `state`.
   */
  message?: React.ReactNode;
  /**
   * Validation state. `error` and `valid` colour the message and prepend a status icon; `error`
   * also sets `aria-invalid` on the control. Purely visual/semantic - it does not set the control's
   * own error border, so pair `state="error"` with the control's own `invalid` prop for that.
   */
  state?: FieldState;
  /**
   * Field-wide layout context, a single shared axis (matching Figma). `default` aligns the label and
   * message to the control's outer edge (size-independent). `inline` both (a) indents the label and
   * message to line up with the text *inside* the control, by the control's own inner start padding
   * for `size`, and (b) renders the control itself inline (borderless) by giving it
   * `appearance="subtle"` - the control's own `appearance` wins if it sets one. So it's meant for
   * text-bearing controls (Text Field, Select, Text Area, date/time pickers) where that alignment
   * and borderless treatment read; it has no meaningful effect on controls without inner text
   * (checkbox, switch, radio).
   */
  context?: FieldContext;
  /**
   * Matches the wrapped control's size, and is used **only** to pick the `inline` context indent so
   * the label/message align to the control's inner text (lg -> a wider indent than sm/md, which
   * share one). In the `default` context it has no visual effect - every size renders the same. It
   * never resizes the control itself, so set the control's own `size` too.
   */
  size?: FieldSize;
  /**
   * Marks the field required: shows a `*` after the label and forwards `required` to the control.
   * The `*` is decorative (`aria-hidden`) - the forwarded `required` conveys the state to assistive
   * technology.
   */
  required?: boolean;
  /**
   * Explicit id for the control, used for the label's `htmlFor` and the message's `aria-describedby`
   * wiring. Auto-generated when omitted. A control that already carries its own `id` keeps it.
   */
  controlId?: string;
  /** Composes with the `<label>`'s class list. */
  labelClassName?: string;
  /** Composes with the message's class list. */
  messageClassName?: string;
  /**
   * Documentation-only: mirrors a forced pseudo-state on the wrapped control for static Storybook
   * references. Forwarded to the control, matching the convention Text Field and Button use.
   */
  'data-force-state'?: string;
}
