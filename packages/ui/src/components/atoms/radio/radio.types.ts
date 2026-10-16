import type * as React from 'react';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'checked' | 'defaultChecked'> {
  /**
   * The visible label, after the circle. Clicking it selects the radio. Leave it out only when
   * `aria-label` or `aria-labelledby` names the radio.
   */
  label?: React.ReactNode;
  /** Whether it's selected, for a controlled radio. Pair it with `onCheckedChange`. */
  checked?: boolean;
  /** Whether it starts selected, for an uncontrolled radio. */
  defaultChecked?: boolean;
  /**
   * Marks the radio as failing validation: sets `aria-invalid` and draws the circle in the error
   * color. Pair it with a visible message.
   */
  invalid?: boolean;
  /** The native `required` attribute. Shows a `*` after the label when there is one. */
  required?: boolean;
  /**
   * The native `disabled` attribute: the radio can't be selected and leaves the tab order. The
   * circle and label are dimmed.
   */
  disabled?: boolean;
  /** Added to the root `label` element's classes. */
  className?: string;
  /** Added to the native input's classes. */
  inputClassName?: string;
  /**
   * Called when the radio is selected, with its checked value and the change event. A radio doesn't
   * fire when another one in its group takes over.
   */
  onCheckedChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface RadioGroupOption {
  /** The option's form value, and the group's `value` when it's selected. Unique within the group. */
  value: string;
  /** The option's visible label. */
  label: React.ReactNode;
  /** Disables this option only. */
  disabled?: boolean;
  /** Marks this option as invalid only. */
  invalid?: boolean;
  /** Makes this option natively required and shows a `*` after its label. */
  required?: boolean;
}

export interface RadioGroupProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  /** The group's question, shown as the fieldset's `legend`. Leave it out only when `aria-label` names the group. */
  label?: React.ReactNode;
  /** Helper text under the legend, added to the description of the group and of every option from `options`. */
  description?: React.ReactNode;
  /**
   * An error message after the options, in the error color, added to the same descriptions. It
   * shows whenever it's set; pair it with `invalid`.
   */
  errorMessage?: React.ReactNode;
  /** The `name` every radio from `options` shares, which makes them one choice. A generated name is used when it's left out. */
  name?: string;
  /** The selected option's value, for a controlled group. Pair it with `onValueChange`. Applies to `options` only. */
  value?: string;
  /** The option value selected at first, for an uncontrolled group. Applies to `options` only. */
  defaultValue?: string;
  /** The options, rendered as one Radio each. When it's set, `children` is ignored. */
  options?: RadioGroupOption[];
  /**
   * Radios you lay out yourself, used when `options` isn't set. Give them one `name` and set the
   * checked value and states on each: the group passes them nothing, though a disabled fieldset still disables them.
   */
  children?: React.ReactNode;
  /**
   * Makes every radio from `options` natively required, so the browser asks for a choice, and shows
   * a `*` after the legend.
   */
  required?: boolean;
  /** Sets `aria-invalid` on the fieldset and marks every option from `options` invalid. */
  invalid?: boolean;
  /**
   * Sets the fieldset's native `disabled`, which disables every radio inside it, and shows the
   * options from `options` as disabled.
   */
  disabled?: boolean;
  /** Stacks the options (`vertical`) or sets them in a row that wraps (`horizontal`). */
  orientation?: 'vertical' | 'horizontal';
  /** Called when an option from `options` is selected, with its value and the change event. */
  onValueChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}
