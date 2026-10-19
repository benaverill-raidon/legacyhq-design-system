import type * as React from 'react';

export type FieldState = 'default' | 'error' | 'valid';
export type FieldContext = 'default' | 'inline';
export type FieldSize = 'sm' | 'md' | 'lg';

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The one form control the field wraps, such as a Text Field or a Text Area. Field clones it to
   * pass the wiring, so it must be a single element: not text, a fragment, or several elements.
   */
  children: React.ReactElement;
  /**
   * The label, rendered in a native `<label htmlFor>` that points at the control and becomes its
   * accessible name. Omit it only when the control is named some other way; Field then renders no label.
   */
  label?: React.ReactNode;
  /**
   * Helper, error, or success text below the control, added to the control's `aria-describedby`. Its
   * color, and whether a status icon shows, follow `state`.
   */
  message?: React.ReactNode;
  /**
   * `error` and `valid` color the message and put a status icon before it; `error` also sets
   * `aria-invalid` on the control. It doesn't change the control's border, so pair `state="error"`
   * with the control's own `invalid`.
   */
  state?: FieldState;
  /**
   * Where the field sits, one axis shared with its control (as in Figma). `default` keeps the label
   * and message flush with the control's edge, at every size. `inline` steps them in to line up with
   * the text inside the control, by the control's start padding for `size`, and passes
   * `context="inline"` to the control unless it sets its own `context` (or a deprecated `appearance`
   * or `tone`). Meant for controls with text inside, such as Text Field, Text Area, and Select.
   */
  context?: FieldContext;
  /**
   * The wrapped control's size, used only for the `inline` indent: 8px for `sm` and `md`, 12px for
   * `lg`. It doesn't resize the control, so set the control's own `size` to match.
   */
  size?: FieldSize;
  /**
   * Shows a `*` after the label and passes `required` to the control. The `*` is hidden from
   * assistive technology, since the control's `required` already says it.
   */
  required?: boolean;
  /**
   * The id for the label's `htmlFor` and the message wiring, when the control has no `id` of its own.
   * Generated when omitted.
   */
  controlId?: string;
  /** Added to the label's classes. */
  labelClassName?: string;
  /** Added to the message's classes. */
  messageClassName?: string;
  /**
   * Documentation only: pins a hover or focus look on the wrapped control for static Storybook
   * references. Passed to the control, as Text Field and Button use it.
   */
  'data-force-state'?: string;
}
