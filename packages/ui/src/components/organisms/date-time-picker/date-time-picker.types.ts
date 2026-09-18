import type * as React from 'react';
import type { Weekday } from '../date-picker-calendar';

export type DateTimePickerSize = 'sm' | 'md' | 'lg';
/** `default` is a bordered control; `inline` is a borderless (subtle) control. */
export type DateTimePickerContext = 'default' | 'inline';

export interface DateTimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected date-and-time. Pass `null` for no selection. */
  value?: Date | null;
  /** Initial selected date-and-time for uncontrolled usage. */
  defaultValue?: Date | null;
  /** Called with the combined date + time whenever either half changes. */
  onChange?: (value: Date) => void;
  /** Field size. Defaults to `md`. */
  size?: DateTimePickerSize;
  /** Field context: `default` (bordered) or `inline` (borderless). Defaults to `default`. */
  context?: DateTimePickerContext;
  /** Disables both fields. */
  disabled?: boolean;
  /** Marks both fields invalid. */
  invalid?: boolean;
  /** BCP 47 locale for the field text and the calendar. */
  locale?: string;
  /** Earliest selectable date (inclusive) - passed to the calendar. */
  min?: Date;
  /** Latest selectable date (inclusive) - passed to the calendar. */
  max?: Date;
  /** Return `true` to disable a specific date - passed to the calendar. */
  isDateDisabled?: (date: Date) => boolean;
  /** First day of the week - passed to the calendar. Defaults to `0` (Sunday). */
  weekStartsOn?: Weekday;
  /** Minute increment for the time column. Defaults to `5`. */
  minuteStep?: number;
  /** The date treated as "today". Defaults to the current date. */
  today?: Date;
  /** Placeholder for the date field. */
  datePlaceholder?: string;
  /** Placeholder for the time field. */
  timePlaceholder?: string;
  /** Formats the date half of the field. */
  dateFormat?: (date: Date, locale?: string) => string;
  /** Formats the time half of the field. */
  timeFormat?: (value: Date, locale?: string) => string;
  /** Accessible label for the date field. Defaults to `Date`. */
  dateLabel?: string;
  /** Accessible label for the time field. Defaults to `Time`. */
  timeLabel?: string;
  /** Accessible label for the combined control. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
