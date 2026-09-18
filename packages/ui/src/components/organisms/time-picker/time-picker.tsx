import * as React from 'react';
import { PickerTimeIcon } from '../../../assets/icons';
import { Button } from '../../atoms/button';
import { TextField } from '../../molecules/text-field';
import { Popup } from '../../primitives/popup';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './time-picker.module.css';
import type { TimePickerProps } from './time-picker.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

type Meridiem = 'AM' | 'PM';
interface Pending {
  hour12: number;
  minute: number;
  meridiem: Meridiem;
}

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MERIDIEMS: Meridiem[] = ['AM', 'PM'];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function to12Hour(hours24: number) {
  return hours24 % 12 || 12;
}

function to24Hour(hour12: number, meridiem: Meridiem) {
  const base = hour12 % 12;
  return meridiem === 'PM' ? base + 12 : base;
}

function buildMinutes(step: number) {
  const safeStep = Number.isFinite(step) && step >= 1 ? Math.trunc(step) : 5;
  const minutes: number[] = [];
  for (let minute = 0; minute < 60; minute += safeStep) {
    minutes.push(minute);
  }
  return minutes;
}

function pendingFromValue(value: Date | null, step: number): Pending {
  if (!value) {
    return { hour12: 12, minute: 0, meridiem: 'AM' };
  }
  const hours = value.getHours();
  const snapped = (Math.round(value.getMinutes() / step) * step) % 60;
  return { hour12: to12Hour(hours), minute: snapped, meridiem: hours < 12 ? 'AM' : 'PM' };
}

function defaultFormat(value: Date, locale?: string) {
  return value.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true });
}

interface Option<T> {
  value: T;
  label: string;
}

function Column<T extends string | number>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  const refs = React.useRef(new Map<T, HTMLButtonElement>());

  // Keep the selected option scrolled into view whenever it changes.
  React.useEffect(() => {
    const element = refs.current.get(selected);
    // scrollIntoView is unavailable in some test environments (jsdom).
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'center' });
    }
  }, [selected]);

  const move = (nextIndex: number) => {
    const clamped = Math.min(options.length - 1, Math.max(0, nextIndex));
    const next = options[clamped].value;
    onSelect(next);
    refs.current.get(next)?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        move(0);
        break;
      case 'End':
        event.preventDefault();
        move(options.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.column} role="listbox" aria-label={label} tabIndex={-1}>
      {options.map((option, index) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={String(option.value)}
            ref={(element) => {
              if (element) {
                refs.current.set(option.value, element);
              } else {
                refs.current.delete(option.value);
              }
            }}
            type="button"
            role="option"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className={mergeClassNames(
              styles.option,
              focusRingClassNames.focusRing,
              focusRingClassNames.focusRingDefault,
            )}
            data-selected={isSelected ? 'true' : undefined}
            onClick={() => {
              onSelect(option.value);
              refs.current.get(option.value)?.focus();
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(function TimePicker(
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
    minuteStep = 5,
    format = defaultFormat,
    locale,
    alignment = 'bottomLeft',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    hoursLabel = 'Hours',
    minutesLabel = 'Minutes',
    meridiemLabel = 'AM/PM',
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

  const minutes = React.useMemo(() => buildMinutes(minuteStep), [minuteStep]);
  const step = minutes.length > 1 ? minutes[1] : 5;

  const [pending, setPending] = React.useState<Pending>(() => pendingFromValue(selected, step));

  const inputRef = React.useRef<HTMLInputElement>(null);
  const frameRef = React.useRef<HTMLElement | null>(null);
  const setTriggerRef = React.useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    frameRef.current = node?.parentElement ?? null;
  }, []);
  const panelId = React.useId();

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  // Reset the staged selection from the committed value each time the popup opens.
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setPending(pendingFromValue(selected, step));
    }
    wasOpen.current = isOpen;
  }, [isOpen, selected, step]);

  // Move focus to the selected hour when the popup opens.
  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const panel = document.getElementById(panelId);
    panel?.querySelector<HTMLButtonElement>('[role="listbox"] button[tabindex="0"]')?.focus();
  }, [isOpen, panelId]);

  // The staged selection as a Date, using the committed value's date part (else today).
  const pendingDate = React.useMemo(() => {
    const base = selected ?? new Date();
    return new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      to24Hour(pending.hour12, pending.meridiem),
      pending.minute,
      0,
      0,
    );
  }, [selected, pending]);

  const close = React.useCallback(
    (returnFocus: boolean) => {
      setOpen(false);
      if (returnFocus) {
        inputRef.current?.focus();
      }
    },
    [setOpen],
  );

  // Commit the staged selection (Confirm, an outside click, or re-clicking the field).
  const commit = React.useCallback(
    (returnFocus: boolean) => {
      if (!isValueControlled) {
        setInternalValue(pendingDate);
      }
      onChange?.(pendingDate);
      close(returnFocus);
    },
    [isValueControlled, onChange, pendingDate, close],
  );

  // Popup only reports a dismissal from an outside click now (Escape is handled below), and an
  // outside click confirms the staged selection.
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true);
      } else {
        commit(false);
      }
    },
    [setOpen, commit],
  );

  // Escape cancels (discards the staged selection). Handled here rather than by Popup so that an
  // outside click can commit while Escape discards.
  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    if (!isOpen && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
    }
  };

  // While open, the field reflects the staged selection live; closed, it shows the committed value.
  const displayValue = isOpen ? format(pendingDate, locale) : selected ? format(selected, locale) : '';

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
        closeOnEscape={false}
        content={
          <div className={styles.panel}>
            <div className={styles.columns}>
              <Column
                label={hoursLabel}
                options={HOURS_12.map((hour) => ({ value: hour, label: pad(hour) }))}
                selected={pending.hour12}
                onSelect={(hour12) => setPending((previous) => ({ ...previous, hour12 }))}
              />
              <Column
                label={minutesLabel}
                options={minutes.map((minute) => ({ value: minute, label: pad(minute) }))}
                selected={pending.minute}
                onSelect={(minute) => setPending((previous) => ({ ...previous, minute }))}
              />
              <Column
                label={meridiemLabel}
                options={MERIDIEMS.map((meridiem) => ({ value: meridiem, label: meridiem }))}
                selected={pending.meridiem}
                onSelect={(meridiem) => setPending((previous) => ({ ...previous, meridiem }))}
              />
            </div>
            <div className={styles.footer}>
              <Button appearance="subtle" size="xs" onClick={() => close(true)}>
                {cancelLabel}
              </Button>
              <Button appearance="subtle" size="xs" onClick={() => commit(true)}>
                {confirmLabel}
              </Button>
            </div>
          </div>
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
              <PickerTimeIcon size="md" decorative />
            </span>
          }
          onClick={() => {
            if (disabled) {
              return;
            }
            // Re-clicking the field while open dismisses it, which confirms the staged selection.
            if (isOpen) {
              commit(true);
            } else {
              setOpen(true);
            }
          }}
          onKeyDown={handleTriggerKeyDown}
        />
      </Popup>
    </div>
  );
});

TimePicker.displayName = 'TimePicker';
