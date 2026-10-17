import type * as React from 'react';
import type { PopupAlignment } from '../../primitives/popup';

export type TimePickerSize = 'sm' | 'md' | 'lg';
/** `default` is the bordered field for forms; `inline` is borderless at rest, for a field inside a row. */
export type TimePickerContext = 'default' | 'inline';

export interface TimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled time, carried on a `Date`: only its hours and minutes are read. Pass `null` for no time. */
  value?: Date | null;
  /** Initial selected time for uncontrolled usage. */
  defaultValue?: Date | null;
  /**
   * Called with the committed time when it's confirmed: Confirm, a click outside the panel, or a
   * second click on the field. Its date is the current value's date, else today's.
   */
  onChange?: (value: Date) => void;
  /** Controlled open state of the popup. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Called with `true` or `false` when the popup asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Field size. Defaults to `md`. */
  size?: TimePickerSize;
  /** Where the field sits: `default` (bordered) or `inline` (borderless at rest). Field passes `inline` when it's inline. */
  context?: TimePickerContext;
  /** Disables the field, so the popup can't open. */
  disabled?: boolean;
  /** Shows the error border and sets `aria-invalid` on the input. */
  invalid?: boolean;
  /** Placeholder shown when there is no selected time. */
  placeholder?: string;
  /** Minutes between the options in the minutes column, counting from `0`. Defaults to `5`. */
  minuteStep?: number;
  /** Formats the time for the field. Defaults to the locale's 12-hour time, such as `04:30 PM`. */
  format?: (value: Date, locale?: string) => string;
  /** BCP 47 locale for the field text. The columns are always 12-hour, with AM and PM. */
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
  /** Id for the input. Field sets it so its label points at the input. */
  id?: string;
  /** Names the input when there's no visible label. */
  'aria-label'?: string;
  /** Ids of the elements that name the input. Field passes its label's id. */
  'aria-labelledby'?: string;
  /** Ids of elements that describe the input, such as Field's message. Set on the input, not the wrapper. */
  'aria-describedby'?: string;
  /** Marks the input invalid, as `invalid` does. Field passes it for an error. */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Sets the input's native `required`. Field passes it when its `required` is set. */
  required?: boolean;
}
