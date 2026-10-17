import * as React from 'react';
import { CalendarIcon } from '../../../assets/icons';
import { Popup } from '../../primitives/popup';
import { useEditableCellSize } from '../../primitives/editable-cell-context';
import { TextField } from '../../molecules/text-field';
import { DatePickerCalendar } from '../date-picker-calendar';
import styles from './date-picker.module.css';
import type { DatePickerProps } from './date-picker.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

let panelIdCounter = 0;

/** What can take focus inside the panel, for the Tab handling below. Filtered to tabIndex >= 0. */
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]';

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

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
    invalid: requestedInvalid = false,
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
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    required,
    dialogLabel = 'Choose a date',
    ...rest
  },
  forwardedRef,
) {
  // Field's wiring goes to the input, not the wrapper div that takes the other attributes.
  const invalid = requestedInvalid || ariaInvalid === true || ariaInvalid === 'true';
  const cellSize = useEditableCellSize();
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
  const dialogId = `${panelId}-dialog`;

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
      // On dismiss from inside the panel (Escape), return focus to the field.
      if (!next) {
        const panel = document.getElementById(panelId);
        if (panel && document.activeElement && panel.contains(document.activeElement)) {
          inputRef.current?.focus();
        }
      }
    },
    [setOpen, panelId],
  );

  const closeToField = React.useCallback(() => {
    setOpen(false);
    inputRef.current?.focus();
  }, [setOpen]);

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

  // When the popup opens, move focus to the calendar's focusable day. The panel is portalled to the
  // end of the page, so without this it would come last in the tab order. It waits a frame because
  // Popup keeps the panel hidden until it's positioned, and a hidden element can't take focus. Focus
  // that moved somewhere else on purpose in the meantime stays there.
  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const frame = window.requestAnimationFrame(() => {
      const panel = document.getElementById(panelId);
      const active = document.activeElement;
      if (!panel || (active && panel.contains(active))) return;
      if (active && active !== document.body && active !== inputRef.current) return;
      panel.querySelector<HTMLButtonElement>('[role="grid"] button[tabindex="0"]')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, panelId]);

  // Tab past the panel's last stop, or Shift+Tab before its first, closes it and returns focus to
  // the field, as Dropdown Menu does: the tab order runs field, calendar, then the rest of the page.
  React.useEffect(() => {
    const panel = isOpen ? document.getElementById(panelId) : null;
    if (!panel) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      // Walks every element so the stops come in document order.
      const tabbables = [...panel.querySelectorAll<HTMLElement>('*')].filter(
        (element) => element.matches(FOCUSABLE) && element.tabIndex >= 0,
      );
      const active = document.activeElement as HTMLElement | null;
      const leaving =
        !tabbables.length ||
        !tabbables.includes(active as HTMLElement) ||
        active === (event.shiftKey ? tabbables[0] : tabbables[tabbables.length - 1]);
      if (leaving) {
        event.preventDefault();
        closeToField();
      }
    };
    panel.addEventListener('keydown', handleKeyDown);
    return () => panel.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, panelId, closeToField]);

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
    <div {...rest} ref={forwardedRef} className={mergeClassNames(styles.root, className)} data-editable-cell={cellSize ?? undefined}>
      <Popup
        open={isOpen}
        onOpenChange={handleOpenChange}
        alignment={alignment}
        anchorRef={frameRef}
        id={panelId}
        padding="none"
        // The field's aria-expanded and aria-controls are set below, so they point at the dialog.
        manageTriggerAria={false}
        content={
          // The calendar is the dialog, so it can carry its name: Popup's panel takes no label.
          <DatePickerCalendar
            id={dialogId}
            role="dialog"
            aria-label={dialogLabel}
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
          context={context}
          invalid={invalid}
          disabled={disabled}
          readOnly
          value={displayValue}
          placeholder={placeholder}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? dialogId : undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          required={required}
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
      {required ? (
        // A read-only input is never validated, so the browser would skip the field's `required`.
        // This hidden input holds the value only so the form's own validation checks it; if it's
        // empty on submit, the browser focuses it and the focus goes on to the field.
        <input
          className={styles.validation}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          required
          disabled={disabled}
          value={selected ? toDateValue(selected) : ''}
          onChange={() => {}}
          onFocus={() => inputRef.current?.focus()}
        />
      ) : null}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';
