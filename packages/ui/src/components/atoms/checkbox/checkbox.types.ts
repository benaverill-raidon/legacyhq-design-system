import type * as React from 'react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  /**
   * The visible label, after the box. Clicking it toggles the checkbox. Leave it out only when
   * `aria-label` or `aria-labelledby` names the checkbox.
   */
  label?: React.ReactNode;
  /** Whether it's checked, for a controlled checkbox. Pair it with `onCheckedChange`. */
  checked?: boolean;
  /** Whether it starts checked, for an uncontrolled checkbox. */
  defaultChecked?: boolean;
  /**
   * Shows a dash for a partial selection and announces it as mixed. It's separate from `checked`
   * and stays until you set it back to `false`.
   */
  indeterminate?: boolean;
  /**
   * Marks the checkbox as failing validation: sets `aria-invalid` and draws the box in the error
   * color. Pair it with a visible message: `errorMessage` sets it for you.
   */
  invalid?: boolean;
  /**
   * An error message under the box, in the error color, added to the checkbox's `aria-describedby`.
   * Setting it also marks the checkbox invalid. Use it for a single checkbox; in a Checkbox Group,
   * pass the group's own `errorMessage`.
   */
  errorMessage?: React.ReactNode;
  /**
   * The native `disabled` attribute: the checkbox can't be changed and leaves the tab order. A
   * disabled Checkbox Group disables it too.
   */
  disabled?: boolean;
  /**
   * The native `required` attribute, which assistive technology announces. Shows a `*` after the
   * label when there is one; the `*` is hidden from assistive technology.
   */
  required?: boolean;
  /** Called when the user toggles the checkbox, with the next checked value and the change event. */
  onCheckedChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Added to the root element's classes: the `label`, or, with `errorMessage`, the `div` around the
   * label and the message.
   */
  className?: string;
}

export interface CheckboxGroupOption {
  /** The option's form value, and its entry in the group's `value`. Unique within the group. */
  value: string;
  /** The option's visible label. */
  label: React.ReactNode;
  /** Disables this option only. */
  disabled?: boolean;
  /** Marks this option as invalid only. */
  invalid?: boolean;
  /** Makes this option natively required and shows a `*` after its label, hidden from assistive technology. */
  required?: boolean;
}

export interface CheckboxGroupProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  /** The group's name, shown as the fieldset's `legend`. Leave it out only when `aria-label` names the group. */
  label?: React.ReactNode;
  /** Helper text under the legend, added to the description of the group and of every option from `options`. */
  description?: React.ReactNode;
  /**
   * An error message after the options, in the error color, added to the same descriptions. It
   * shows whenever it's set; pair it with `invalid`.
   */
  errorMessage?: React.ReactNode;
  /** The `name` every checkbox from `options` submits under. A generated name is used when it's left out. */
  name?: string;
  /** The checked option values, for a controlled group. Pair it with `onValueChange`. Applies to `options` only. */
  value?: string[];
  /** The option values checked at first, for an uncontrolled group. Applies to `options` only. */
  defaultValue?: string[];
  /** The options, rendered as one Checkbox each. When it's set, `children` is ignored. */
  options?: CheckboxGroupOption[];
  /**
   * Checkboxes you lay out yourself, used when `options` isn't set. Set `name`, the checked value,
   * and their other states on each one. The group's `disabled` still reaches them.
   */
  children?: React.ReactNode;
  /**
   * Marks the question as required: shows a `*` after the legend and adds `requiredLabel` to the
   * group's name, so assistive technology announces it. It doesn't make any checkbox required, so
   * check that at least one is chosen yourself.
   */
  required?: boolean;
  /**
   * The word added, hidden, to the group's name when `required` is set, for assistive technology.
   * Defaults to `required`; pass a translation.
   */
  requiredLabel?: string;
  /** Sets `aria-invalid` on the fieldset and marks every option from `options` invalid. */
  invalid?: boolean;
  /**
   * Sets the fieldset's native `disabled`, which disables every checkbox inside it, and shows every
   * checkbox in the group as disabled, from `options` or `children`.
   */
  disabled?: boolean;
  /** Stacks the options (`vertical`) or sets them in a row that wraps (`horizontal`). */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Called when an option from `options` is toggled, with the next array of checked values and the
   * change event.
   */
  onValueChange?: (value: string[], event: React.ChangeEvent<HTMLInputElement>) => void;
}
