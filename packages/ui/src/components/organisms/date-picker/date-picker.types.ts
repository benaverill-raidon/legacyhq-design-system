import type * as React from 'react';
import type { PopupAlignment } from '../../primitives/popup';
import type { Weekday } from '../date-picker-calendar';

export type DatePickerSize = 'sm' | 'md' | 'lg';
/** `default` is a bordered field; `inline` is a borderless (subtle) field. */
export type DatePickerContext = 'default' | 'inline';

export interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected date. Pass `null` for no selection. */
  value?: Date | null;
  /** Initial selected date for uncontrolled usage. */
  defaultValue?: Date | null;
  /** Called with the newly selected date. */
  onChange?: (date: Date) => void;
  /** Controlled open state of the calendar popup. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Called when the popup requests to open or close. */
  onOpenChange?: (open: boolean) => void;
  /** Field size. Defaults to `md`. */
  size?: DatePickerSize;
  /** Field context: `default` (bordered) or `inline` (borderless). Defaults to `default`. */
  context?: DatePickerContext;
  /** Disables the field and popup. */
  disabled?: boolean;
  /** Marks the field invalid. */
  invalid?: boolean;
  /** Placeholder shown when there is no selected date. */
  placeholder?: string;
  /** Formats the selected date for the field. Defaults to a locale short date (e.g. `03/09/2026`). */
  format?: (date: Date, locale?: string) => string;
  /** BCP 47 locale for the field text and the calendar. */
  locale?: string;
  /** Where the popup opens relative to the field. Defaults to `bottomLeft`. */
  alignment?: PopupAlignment;
  /** Earliest selectable date (inclusive). */
  min?: Date;
  /** Latest selectable date (inclusive). */
  max?: Date;
  /** Return `true` to disable a specific date. */
  isDateDisabled?: (date: Date) => boolean;
  /** First day of the week. Defaults to `0` (Sunday). */
  weekStartsOn?: Weekday;
  /** The date treated as "today". Defaults to the current date. */
  today?: Date;
  /** Id for the field input. */
  id?: string;
  /** Accessible label for the field. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
