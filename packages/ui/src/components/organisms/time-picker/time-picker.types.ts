import type * as React from 'react';
import type { PopupAlignment } from '../../primitives/popup';

export type TimePickerSize = 'sm' | 'md' | 'lg';
/** `default` is a bordered field; `inline` is a borderless (subtle) field. */
export type TimePickerContext = 'default' | 'inline';

export interface TimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /**
   * Controlled selected time, carried on a `Date` (only the hours and minutes are used). Pass `null`
   * for no selection.
   */
  value?: Date | null;
  /** Initial selected time for uncontrolled usage. */
  defaultValue?: Date | null;
  /** Called with the committed time (a `Date`) when Confirm is pressed. */
  onChange?: (value: Date) => void;
  /** Controlled open state of the popup. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Called when the popup requests to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Field size. Defaults to `md`. */
  size?: TimePickerSize;
  /** Field context: `default` (bordered) or `inline` (borderless). Defaults to `default`. */
  context?: TimePickerContext;
  /** Disables the field and popup. */
  disabled?: boolean;
  /** Marks the field invalid. */
  invalid?: boolean;
  /** Placeholder shown when there is no selected time. */
  placeholder?: string;
  /** Minute increment for the minute column. Defaults to `5`. */
  minuteStep?: number;
  /** Formats the selected time for the field. Defaults to a locale 12-hour time (e.g. `04:30 PM`). */
  format?: (value: Date, locale?: string) => string;
  /** BCP 47 locale for the field text. */
  locale?: string;
  /** Where the popup opens relative to the field. Defaults to `bottomLeft`. */
  alignment?: PopupAlignment;
  /** Label for the Confirm button. Defaults to `Confirm`. */
  confirmLabel?: string;
  /** Label for the Cancel button. Defaults to `Cancel`. */
  cancelLabel?: string;
  /** Accessible label for the hours column. Defaults to `Hours`. */
  hoursLabel?: string;
  /** Accessible label for the minutes column. Defaults to `Minutes`. */
  minutesLabel?: string;
  /** Accessible label for the AM/PM column. Defaults to `AM/PM`. */
  meridiemLabel?: string;
  /** Id for the field input. */
  id?: string;
  /** Accessible label for the field. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** Ids of elements that describe the input, such as Field's message. Set on the input, not the wrapper. */
  'aria-describedby'?: string;
  /** Marks the input invalid, as `invalid` does. Field passes it for an error. */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Sets the input's native `required`. Field passes it when its `required` is set. */
  required?: boolean;
}
