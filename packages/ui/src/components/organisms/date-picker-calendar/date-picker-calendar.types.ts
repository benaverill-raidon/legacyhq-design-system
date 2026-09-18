import type * as React from 'react';

/** 0 = Sunday, 1 = Monday, ... 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DatePickerCalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected date. Pass `null` for no selection. */
  value?: Date | null;
  /** Initial selected date for uncontrolled usage. */
  defaultValue?: Date | null;
  /** Called with the newly selected date. */
  onChange?: (date: Date) => void;
  /** Controlled displayed month (any date within the month is accepted). */
  month?: Date;
  /** Initial displayed month for uncontrolled usage. Defaults to the selected date's month, else today's. */
  defaultMonth?: Date;
  /** Called with the first day of the month when the displayed month changes. */
  onMonthChange?: (month: Date) => void;
  /** Earliest selectable date (inclusive). */
  min?: Date;
  /** Latest selectable date (inclusive). */
  max?: Date;
  /** Return `true` to disable a specific date (in addition to `min`/`max`). */
  isDateDisabled?: (date: Date) => boolean;
  /** First day of the week. Defaults to `0` (Sunday). */
  weekStartsOn?: Weekday;
  /** The date treated as "today" (for the today marker). Defaults to the current date. */
  today?: Date;
  /** BCP 47 locale for the month title and weekday names. Defaults to the runtime locale. */
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
