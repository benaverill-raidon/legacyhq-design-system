import * as React from 'react';
import { CalendarIcon } from '../../../assets/icons';
import { Popup } from '../../primitives/popup';
import { TextField } from '../../molecules/text-field';
import { DatePickerCalendar } from '../date-picker-calendar';
import styles from './date-picker.module.css';
import type { DatePickerProps } from './date-picker.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

let panelIdCounter = 0;

function defaultFormat(date: Date, locale?: string) {
  return date.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue,
    onChange,
    open,
    defaultOpen,
    onOpenChange,
    size = 'md',
    context = 'default',
    disabled = false,
    invalid = false,
    placeholder,
    format = defaultFormat,
    locale,
    alignment = 'bottomLeft',
    min,
    max,
    isDateDisabled,
    weekStartsOn = 0,
    today,
    id,
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

  const isOpenControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isOpen = (isOpenControlled ? open : internalOpen) && !disabled;

  const inputRef = React.useRef<HTMLInputElement>(null);
  // Popup measures the field frame (TextField's root), not the inset input, so the panel aligns to
  // the whole field.
  const frameRef = React.useRef<HTMLElement | null>(null);
  const setTriggerRef = React.useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    frameRef.current = node?.parentElement ?? null;
  }, []);
  const panelId = React.useMemo(() => `date-picker-panel-${(panelIdCounter += 1)}`, []);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next);
      // On dismiss from inside the panel (Escape / selection), return focus to the field.
      if (!next) {
        const panel = document.getElementById(panelId);
        if (panel && document.activeElement && panel.contains(document.activeElement)) {
          inputRef.current?.focus();
        }
      }
    },
    [setOpen, panelId],
  );

  const handleSelect = React.useCallback(
    (date: Date) => {
      if (!isValueControlled) {
        setInternalValue(date);
      }
      onChange?.(date);
      setOpen(false);
      inputRef.current?.focus();
    },
    [isValueControlled, onChange, setOpen],
  );

  // When the popup opens, move focus to the calendar's focusable day.
  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const panel = document.getElementById(panelId);
    panel?.querySelector<HTMLButtonElement>('[role="grid"] button[tabindex="0"]')?.focus();
  }, [isOpen, panelId]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    if (!isOpen && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const displayValue = selected ? format(selected, locale) : '';

  return (
    <div {...rest} ref={forwardedRef} className={mergeClassNames(styles.root, className)}>
      <Popup
        open={isOpen}
        onOpenChange={handleOpenChange}
        alignment={alignment}
        anchorRef={frameRef}
        id={panelId}
        role="dialog"
        padding="none"
        content={
          <DatePickerCalendar
            value={selected}
            defaultMonth={selected ?? today}
            onChange={handleSelect}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            weekStartsOn={weekStartsOn}
            today={today}
            locale={locale}
          />
        }
      >
        <TextField
          ref={setTriggerRef}
          id={id}
          className={styles.trigger}
          inputClassName={styles.triggerInput}
          size={size}
          appearance={context === 'inline' ? 'subtle' : 'default'}
          invalid={invalid}
          disabled={disabled}
          readOnly
          value={displayValue}
          placeholder={placeholder}
          aria-haspopup="dialog"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          data-force-state={isOpen ? 'focus' : undefined}
          iconAfter={
            <span className={styles.iconBox} aria-hidden="true">
              <CalendarIcon size="md" decorative />
            </span>
          }
          onClick={() => {
            if (!disabled) {
              setOpen(!isOpen);
            }
          }}
          onKeyDown={handleTriggerKeyDown}
        />
      </Popup>
    </div>
  );
});

DatePicker.displayName = 'DatePicker';
