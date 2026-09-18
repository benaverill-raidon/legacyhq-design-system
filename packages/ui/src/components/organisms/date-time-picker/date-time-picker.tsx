import * as React from 'react';
import { DatePicker } from '../date-picker';
import { TimePicker } from '../time-picker';
import styles from './date-time-picker.module.css';
import type { DateTimePickerProps } from './date-time-picker.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>(
  function DateTimePicker(
    {
      value,
      defaultValue,
      onChange,
      size = 'md',
      context = 'default',
      disabled = false,
      invalid = false,
      locale,
      min,
      max,
      isDateDisabled,
      weekStartsOn = 0,
      minuteStep = 5,
      today,
      datePlaceholder,
      timePlaceholder,
      dateFormat,
      timeFormat,
      dateLabel = 'Date',
      timeLabel = 'Time',
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    forwardedRef,
  ) {
    const isValueControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<Date | null>(defaultValue ?? null);
    const selected = isValueControlled ? value ?? null : internalValue;

    const commit = React.useCallback(
      (next: Date) => {
        if (!isValueControlled) {
          setInternalValue(next);
        }
        onChange?.(next);
      },
      [isValueControlled, onChange],
    );

    // Selecting a date keeps the current time (else midnight).
    const handleDateChange = React.useCallback(
      (date: Date) => {
        const next = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          selected ? selected.getHours() : 0,
          selected ? selected.getMinutes() : 0,
          0,
          0,
        );
        commit(next);
      },
      [selected, commit],
    );

    // Confirming a time keeps the current date (else today).
    const handleTimeChange = React.useCallback(
      (time: Date) => {
        const base = selected ?? today ?? new Date();
        const next = new Date(
          base.getFullYear(),
          base.getMonth(),
          base.getDate(),
          time.getHours(),
          time.getMinutes(),
          0,
          0,
        );
        commit(next);
      },
      [selected, today, commit],
    );

    return (
      <div
        {...rest}
        ref={forwardedRef}
        role="group"
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={mergeClassNames(styles.root, className)}
        data-size={size}
        data-context={context}
      >
        <DatePicker
          className={styles.date}
          value={selected}
          onChange={handleDateChange}
          size={size}
          context={context}
          disabled={disabled}
          invalid={invalid}
          locale={locale}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          weekStartsOn={weekStartsOn}
          today={today}
          placeholder={datePlaceholder}
          format={dateFormat}
          aria-label={dateLabel}
        />
        <TimePicker
          className={styles.time}
          value={selected}
          onChange={handleTimeChange}
          size={size}
          context={context}
          disabled={disabled}
          invalid={invalid}
          locale={locale}
          minuteStep={minuteStep}
          placeholder={timePlaceholder}
          format={timeFormat}
          aria-label={timeLabel}
        />
      </div>
    );
  },
);

DateTimePicker.displayName = 'DateTimePicker';
