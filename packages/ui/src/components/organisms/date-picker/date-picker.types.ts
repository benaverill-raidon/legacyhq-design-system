import type * as React from 'react';
import type { PopupAlignment } from '../../primitives/popup';
import type { Weekday } from '../date-picker-calendar';

export type DatePickerSize = 'sm' | 'md' | 'lg';
/** `default` is the bordered field for forms; `inline` is borderless at rest, for a field inside a row. */
export type DatePickerContext = 'default' | 'inline';

export interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected date. Pass `null` for no selection. */
  value?: Date | null;
  /** Initial selected date for uncontrolled usage. */
  defaultValue?: Date | null;
  /** Called with the date someone picks in the calendar. The popup then closes. */
  onChange?: (date: Date) => void;
  /** Controlled open state of the calendar popup. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Called with `true` or `false` when the popup asks to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Field size. Defaults to `md`. */
  size?: DatePickerSize;
  /** Where the field sits: `default` (bordered) or `inline` (borderless at rest). Field passes `inline` when it's inline. */
  context?: DatePickerContext;
  /** Disables the field, so the popup can't open. */
  disabled?: boolean;
  /** Shows the error border and sets `aria-invalid` on the input. */
  invalid?: boolean;
  /** Placeholder shown when there is no selected date. */
  placeholder?: string;
  /** Formats the selected date for the field. Defaults to the locale's short date, such as `03/09/2026`. */
  format?: (date: Date, locale?: string) => string;
  /** BCP 47 locale for the field text and the calendar's names. Defaults to the browser's. */
  locale?: string;
  /** Where the popup opens relative to the field. Defaults to `bottomLeft`. */
  alignment?: PopupAlignment;
  /** Earliest date that can be picked, inclusive. Passed to the calendar. */
  min?: Date;
  /** Latest date that can be picked, inclusive. Passed to the calendar. */
  max?: Date;
  /** Return `true` to disable a date, in addition to `min` and `max`. Passed to the calendar. */
  isDateDisabled?: (date: Date) => boolean;
  /** First day of the week. Defaults to `0` (Sunday). */
  weekStartsOn?: Weekday;
  /** The date the calendar marks as today, and opens on when nothing is selected. Defaults to the current date. */
  today?: Date;
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
