import type * as React from 'react';

/** 0 = Sunday, 1 = Monday, ... 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DatePickerCalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected date. Pass `null` for no selection. */
  value?: Date | null;
  /** Initial selected date for uncontrolled usage. */
  defaultValue?: Date | null;
  /** Called with the day someone picks. Not called for a disabled day. */
  onChange?: (date: Date) => void;
  /** Controlled month on view. Any date in the month works. */
  month?: Date;
  /** Initial month on view for uncontrolled usage. Defaults to the selected date's month, else today's. */
  defaultMonth?: Date;
  /** Called with the first day of the month when the month on view changes. */
  onMonthChange?: (month: Date) => void;
  /** Earliest date that can be picked, inclusive. */
  min?: Date;
  /** Latest date that can be picked, inclusive. */
  max?: Date;
  /** Return `true` to disable a date, in addition to `min` and `max`. */
  isDateDisabled?: (date: Date) => boolean;
  /** First day of the week, `0` (Sunday) to `6` (Saturday). Defaults to `0`. */
  weekStartsOn?: Weekday;
  /** The date marked as today. Defaults to the current date. */
  today?: Date;
  /** BCP 47 locale for the month title, weekday names, and each day's accessible name. Defaults to the browser's. It doesn't set the week start. */
  locale?: string;
  /** Accessible label for the previous-month button. Defaults to `Previous month`. */
  previousMonthLabel?: string;
  /** Accessible label for the next-month button. Defaults to `Next month`. */
  nextMonthLabel?: string;
  /** Accessible label for the previous-year button. Defaults to `Previous year`. */
  previousYearLabel?: string;
  /** Accessible label for the next-year button. Defaults to `Next year`. */
  nextYearLabel?: string;
}
