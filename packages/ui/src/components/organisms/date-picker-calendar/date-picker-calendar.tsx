import * as React from 'react';
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../assets/icons';
import { IconButton } from '../../atoms/icon-button';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './date-picker-calendar.module.css';
import type { DatePickerCalendarProps, Weekday } from './date-picker-calendar.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

// --- date helpers (no external dependency) --------------------------------------------------------

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addMonthsKeepDay(date: Date, amount: number) {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = endOfMonth(target).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

function clampToMonth(date: Date, month: Date) {
  const lastDay = endOfMonth(month).getDate();
  return new Date(month.getFullYear(), month.getMonth(), Math.min(date.getDate(), lastDay));
}

function isSameDay(a: Date | null | undefined, b: Date | null | undefined) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function keyOf(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function startOfWeekOffset(date: Date, weekStartsOn: Weekday) {
  return (date.getDay() - weekStartsOn + 7) % 7;
}

function buildWeeks(month: Date, weekStartsOn: Weekday) {
  const gridStart = addDays(startOfMonth(month), -startOfWeekOffset(startOfMonth(month), weekStartsOn));
  const weeks: Date[][] = [];
  let cursor = gridStart;
  for (let week = 0; week < 6; week += 1) {
    const row: Date[] = [];
    for (let day = 0; day < 7; day += 1) {
      row.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(row);
  }
  return weeks;
}

function buildWeekdays(weekStartsOn: Weekday, locale: string | undefined) {
  // 2021-08-01 is a Sunday, so it anchors the weekday sequence.
  const sunday = new Date(2021, 7, 1);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(sunday, weekStartsOn + index);
    return {
      short: date.toLocaleDateString(locale, { weekday: 'short' }),
      long: date.toLocaleDateString(locale, { weekday: 'long' }),
    };
  });
}

// --- component ------------------------------------------------------------------------------------

export const DatePickerCalendar = React.forwardRef<HTMLDivElement, DatePickerCalendarProps>(
  function DatePickerCalendar(
    {
      value,
      defaultValue,
      onChange,
      month,
      defaultMonth,
      onMonthChange,
      min,
      max,
      isDateDisabled,
      weekStartsOn = 0,
      today,
      locale,
      previousMonthLabel = 'Previous month',
      nextMonthLabel = 'Next month',
      previousYearLabel = 'Previous year',
      nextYearLabel = 'Next year',
      className,
      ...rest
    },
    forwardedRef,
  ) {
    const titleId = React.useId();
    const todayDate = React.useMemo(() => startOfDay(today ?? new Date()), [today]);

    const isValueControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue ?? null);
    const selected = isValueControlled ? value ?? null : internalValue;

    const isMonthControlled = month !== undefined;
    const [internalMonth, setInternalMonth] = React.useState(() =>
      startOfMonth(month ?? defaultMonth ?? selected ?? todayDate),
    );
    const displayedMonth = startOfMonth(isMonthControlled ? (month as Date) : internalMonth);
    const displayedMonthTime = displayedMonth.getTime();

    const [focusedDate, setFocusedDate] = React.useState(() => {
      const base = selected ?? todayDate;
      return isSameMonth(base, displayedMonth) ? base : startOfMonth(displayedMonth);
    });
    const shouldMoveFocus = React.useRef(false);
    const dayRefs = React.useRef(new Map<string, HTMLButtonElement>());

    // Keep the focused date inside the displayed month (e.g. when `month` is controlled externally).
    React.useEffect(() => {
      setFocusedDate((previous) =>
        isSameMonth(previous, displayedMonth) ? previous : clampToMonth(previous, displayedMonth),
      );
    }, [displayedMonthTime]);

    // After keyboard navigation, move DOM focus to the newly focused day.
    React.useEffect(() => {
      if (!shouldMoveFocus.current) {
        return;
      }
      dayRefs.current.get(keyOf(focusedDate))?.focus();
      shouldMoveFocus.current = false;
    });

    const isDisabled = React.useCallback(
      (date: Date) => {
        const day = startOfDay(date);
        if (min && day < startOfDay(min)) {
          return true;
        }
        if (max && day > startOfDay(max)) {
          return true;
        }
        return Boolean(isDateDisabled?.(date));
      },
      [min, max, isDateDisabled],
    );

    const changeMonth = React.useCallback(
      (nextMonth: Date) => {
        const normalized = startOfMonth(nextMonth);
        if (!isMonthControlled) {
          setInternalMonth(normalized);
        }
        onMonthChange?.(normalized);
      },
      [isMonthControlled, onMonthChange],
    );

    // A nav target is blocked when the whole target month falls outside min/max.
    const monthBlockedBackward = (target: Date) => Boolean(min && endOfMonth(target) < startOfDay(min));
    const monthBlockedForward = (target: Date) => Boolean(max && startOfMonth(target) > startOfDay(max));

    const goToMonth = (target: Date) => {
      changeMonth(target);
      setFocusedDate((previous) => clampToMonth(previous, target));
    };

    const selectDate = (date: Date) => {
      if (isDisabled(date)) {
        return;
      }
      if (!isValueControlled) {
        setInternalValue(date);
      }
      if (!isSameMonth(date, displayedMonth)) {
        changeMonth(startOfMonth(date));
      }
      setFocusedDate(date);
      onChange?.(date);
    };

    const moveFocus = (date: Date) => {
      shouldMoveFocus.current = true;
      setFocusedDate(date);
      if (!isSameMonth(date, displayedMonth)) {
        changeMonth(startOfMonth(date));
      }
    };

    const handleDayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, date: Date) => {
      let next: Date | null = null;
      switch (event.key) {
        case 'ArrowLeft':
          next = addDays(date, -1);
          break;
        case 'ArrowRight':
          next = addDays(date, 1);
          break;
        case 'ArrowUp':
          next = addDays(date, -7);
          break;
        case 'ArrowDown':
          next = addDays(date, 7);
          break;
        case 'Home':
          next = addDays(date, -startOfWeekOffset(date, weekStartsOn));
          break;
        case 'End':
          next = addDays(date, 6 - startOfWeekOffset(date, weekStartsOn));
          break;
        case 'PageUp':
          next = addMonthsKeepDay(date, event.shiftKey ? -12 : -1);
          break;
        case 'PageDown':
          next = addMonthsKeepDay(date, event.shiftKey ? 12 : 1);
          break;
        default:
          return;
      }
      event.preventDefault();
      moveFocus(next);
    };

    const weeks = buildWeeks(displayedMonth, weekStartsOn);
    const weekdays = buildWeekdays(weekStartsOn, locale);
    const monthTitle = displayedMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

    const dateLabelFormatter = (date: Date) =>
      date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
      <div {...rest} ref={forwardedRef} className={mergeClassNames(styles.root, className)}>
        <div className={styles.header}>
          <IconButton
            appearance="subtle"
            size="xs"
            shape="square"
            aria-label={previousYearLabel}
            disabled={monthBlockedBackward(addMonths(displayedMonth, -12))}
            onClick={() => goToMonth(addMonths(displayedMonth, -12))}
          >
            <ChevronDoubleLeftIcon />
          </IconButton>
          <IconButton
            appearance="subtle"
            size="xs"
            shape="square"
            aria-label={previousMonthLabel}
            disabled={monthBlockedBackward(addMonths(displayedMonth, -1))}
            onClick={() => goToMonth(addMonths(displayedMonth, -1))}
          >
            <ChevronLeftIcon />
          </IconButton>

          <span id={titleId} className={styles.title} aria-live="polite">
            {monthTitle}
          </span>

          <IconButton
            appearance="subtle"
            size="xs"
            shape="square"
            aria-label={nextMonthLabel}
            disabled={monthBlockedForward(addMonths(displayedMonth, 1))}
            onClick={() => goToMonth(addMonths(displayedMonth, 1))}
          >
            <ChevronRightIcon />
          </IconButton>
          <IconButton
            appearance="subtle"
            size="xs"
            shape="square"
            aria-label={nextYearLabel}
            disabled={monthBlockedForward(addMonths(displayedMonth, 12))}
            onClick={() => goToMonth(addMonths(displayedMonth, 12))}
          >
            <ChevronDoubleRightIcon />
          </IconButton>
        </div>

        <table className={styles.grid} role="grid" aria-labelledby={titleId}>
          <thead>
            <tr className={styles.weekRow}>
              {weekdays.map((weekday) => (
                <th key={weekday.long} scope="col" className={styles.weekday} aria-label={weekday.long}>
                  <span aria-hidden="true">{weekday.short}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={keyOf(week[0])} className={styles.weekRow}>
                {week.map((date) => {
                  const outside = !isSameMonth(date, displayedMonth);
                  const isToday = isSameDay(date, todayDate);
                  const isSelected = isSameDay(date, selected);
                  const disabled = isDisabled(date);
                  const isFocusTarget = isSameDay(date, focusedDate);

                  return (
                    <td
                      key={keyOf(date)}
                      role="gridcell"
                      aria-selected={isSelected || undefined}
                      className={styles.cell}
                    >
                      <button
                        ref={(element) => {
                          if (element) {
                            dayRefs.current.set(keyOf(date), element);
                          } else {
                            dayRefs.current.delete(keyOf(date));
                          }
                        }}
                        type="button"
                        className={mergeClassNames(
                          styles.day,
                          focusRingClassNames.focusRing,
                          focusRingClassNames.focusRingDefault,
                        )}
                        tabIndex={isFocusTarget ? 0 : -1}
                        aria-label={dateLabelFormatter(date)}
                        aria-current={isToday ? 'date' : undefined}
                        aria-disabled={disabled || undefined}
                        data-today={isToday ? 'true' : undefined}
                        data-selected={isSelected ? 'true' : undefined}
                        data-outside={outside ? 'true' : undefined}
                        data-disabled={disabled ? 'true' : undefined}
                        onClick={() => selectDate(date)}
                        onKeyDown={(event) => handleDayKeyDown(event, date)}
                      >
                        <span className={styles.dayNumber}>{date.getDate()}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

DatePickerCalendar.displayName = 'DatePickerCalendar';
