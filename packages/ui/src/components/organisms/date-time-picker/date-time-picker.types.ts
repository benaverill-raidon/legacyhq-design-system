import type * as React from 'react';
import type { Weekday } from '../date-picker-calendar';

export type DateTimePickerSize = 'sm' | 'md' | 'lg';
/** `default` is the bordered control for forms; `inline` is borderless at rest, for a control inside a row. */
export type DateTimePickerContext = 'default' | 'inline';

export interface DateTimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled date and time. Pass `null` for none. */
  value?: Date | null;
  /** Initial date and time for uncontrolled usage. */
  defaultValue?: Date | null;
  /** Called with the combined date and time when a date is picked or a time is confirmed. */
  onChange?: (value: Date) => void;
  /** Field size, for both halves. Defaults to `md`. */
  size?: DateTimePickerSize;
  /** Where the control sits, for both halves: `default` (bordered) or `inline` (borderless at rest). Defaults to `default`. */
  context?: DateTimePickerContext;
  /** Disables both fields. */
  disabled?: boolean;
  /** Shows the error border on both fields and sets `aria-invalid` on both inputs. */
  invalid?: boolean;
  /** BCP 47 locale for both fields' text and the calendar's names. Defaults to the browser's. */
  locale?: string;
  /** Earliest date that can be picked, inclusive. Passed to the calendar. */
  min?: Date;
  /** Latest date that can be picked, inclusive. Passed to the calendar. */
  max?: Date;
  /** Return `true` to disable a date, in addition to `min` and `max`. Passed to the calendar. */
  isDateDisabled?: (date: Date) => boolean;
  /** First day of the calendar's week, `0` (Sunday) to `6` (Saturday). Defaults to `0`. */
  weekStartsOn?: Weekday;
  /** Minutes between the options in the time's minutes column. Defaults to `5`. */
  minuteStep?: number;
  /** The date the calendar marks as today, and the date a confirmed time takes when there's no value yet. Defaults to the current date. */
  today?: Date;
  /** Placeholder for the date field. */
  datePlaceholder?: string;
  /** Placeholder for the time field. */
  timePlaceholder?: string;
  /** Formats the date half. Defaults to Date Picker's format. */
  dateFormat?: (date: Date, locale?: string) => string;
  /** Formats the time half. Defaults to Time Picker's format. */
  timeFormat?: (value: Date, locale?: string) => string;
  /** Accessible label for the date field. Defaults to `Date`. */
  dateLabel?: string;
  /** Accessible label for the time field. Defaults to `Time`. */
  timeLabel?: string;
  /**
   * Accessible name for the date half's calendar dialog: Date Picker's `dialogLabel`. Defaults to
   * `Choose a date`; pass a translation.
   */
  dateDialogLabel?: string;
  /**
   * Accessible name for the time half's panel: Time Picker's `dialogLabel`. Defaults to `Choose a
   * time`; pass a translation.
   */
  timeDialogLabel?: string;
  /** Accessible name, and tooltip, of the calendar's previous-month button, passed to Date Picker. Defaults to `Previous month`. */
  previousMonthLabel?: string;
  /** Accessible name, and tooltip, of the calendar's next-month button, passed to Date Picker. Defaults to `Next month`. */
  nextMonthLabel?: string;
  /** Accessible name, and tooltip, of the calendar's previous-year button, passed to Date Picker. Defaults to `Previous year`. */
  previousYearLabel?: string;
  /** Accessible name, and tooltip, of the calendar's next-year button, passed to Date Picker. Defaults to `Next year`. */
  nextYearLabel?: string;
  /** Label for the time panel's Confirm button, passed to Time Picker. Defaults to `Confirm`. */
  confirmLabel?: string;
  /** Label for the time panel's Cancel button, passed to Time Picker. Defaults to `Cancel`. */
  cancelLabel?: string;
  /** Accessible label for the time panel's hours column, passed to Time Picker. Defaults to `Hours`. */
  hoursLabel?: string;
  /** Accessible label for the time panel's minutes column, passed to Time Picker. Defaults to `Minutes`. */
  minutesLabel?: string;
  /** Accessible label for the time panel's AM/PM column, passed to Time Picker. Defaults to `AM/PM`. */
  meridiemLabel?: string;
  /** Text of the morning option in the AM/PM column, passed to Time Picker. Defaults to `AM`. */
  amLabel?: string;
  /** Text of the afternoon option in the AM/PM column, passed to Time Picker. Defaults to `PM`. */
  pmLabel?: string;
  /**
   * Id for the date input, not the group. Field sets it, so clicking Field's label focuses the date
   * field while the label still names the group through `aria-labelledby`.
   */
  id?: string;
  /** Names the group when there's no visible label. Ignored when `aria-labelledby` is set. */
  'aria-label'?: string;
  /** Ids of the elements that name the group. Field passes its label's id. */
  'aria-labelledby'?: string;
  /** Marks both inputs invalid, as `invalid` does. Field passes it for an error. */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Sets the native `required` on both inputs. Field passes it when its `required` is set. */
  required?: boolean;
}
