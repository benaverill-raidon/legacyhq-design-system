import * as React from 'react';
import { PickerTimeIcon } from '../../../assets/icons';
import { Button } from '../../atoms/button';
import { TextField } from '../../molecules/text-field';
import { Popup } from '../../primitives/popup';
import { useEditableCellSize } from '../../primitives/editable-cell-context';
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

/** What can take focus inside the panel, for the Tab handling below. Filtered to tabIndex >= 0. */
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]';

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

// Minutes between steps open on the step before them (10:58 with a 5-minute step opens on 10:55),
// so the staged time is always one of the column's options and never crosses into the next hour.
function pendingFromValue(value: Date | null, minutes: number[]): Pending {
  if (!value) {
    return { hour12: 12, minute: 0, meridiem: 'AM' };
  }
  const hours = value.getHours();
  const snapped = minutes.filter((minute) => minute <= value.getMinutes()).pop() ?? 0;
  return { hour12: to12Hour(hours), minute: snapped, meridiem: hours < 12 ? 'AM' : 'PM' };
}

function isSamePending(a: Pending, b: Pending) {
  return a.hour12 === b.hour12 && a.minute === b.minute && a.meridiem === b.meridiem;
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
    invalid: requestedInvalid = false,
    placeholder,
    minuteStep = 5,
    format = defaultFormat,
    locale,
    alignment = 'bottomStart',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    hoursLabel = 'Hours',
    minutesLabel = 'Minutes',
    meridiemLabel = 'AM/PM',
    amLabel = 'AM',
    pmLabel = 'PM',
    dialogLabel = 'Choose a time',
    id,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    required,
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

  const minutes = React.useMemo(() => buildMinutes(minuteStep), [minuteStep]);

  const [pending, setPending] = React.useState<Pending>(() => pendingFromValue(selected, minutes));
  // The staged selection the panel opened on, so a dismissal can tell whether anything was chosen.
  const openedPending = React.useRef<Pending>(pending);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const frameRef = React.useRef<HTMLElement | null>(null);
  const setTriggerRef = React.useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    frameRef.current = node?.parentElement ?? null;
  }, []);
  const panelId = React.useId();
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

  // Reset the staged selection from the committed value each time the popup opens.
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (isOpen && !wasOpen.current) {
      const next = pendingFromValue(selected, minutes);
      openedPending.current = next;
      setPending(next);
    }
    wasOpen.current = isOpen;
  }, [isOpen, selected, minutes]);

  // Move focus to the selected hour when the popup opens. The panel is portalled to the end of the
  // page, so without this it would come last in the tab order. It waits a frame because Popup keeps
  // the panel hidden until it's positioned, and a hidden element can't take focus. Focus that moved
  // somewhere else on purpose in the meantime stays there.
  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const frame = window.requestAnimationFrame(() => {
      const panel = document.getElementById(panelId);
      const active = document.activeElement;
      if (!panel || (active && panel.contains(active))) return;
      if (active && active !== document.body && active !== inputRef.current) return;
      panel.querySelector<HTMLButtonElement>('[role="listbox"] button[tabindex="0"]')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
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

  // Commit the staged selection (Confirm, or a dismissal after a choice). A time equal to the saved
  // one only closes the panel: onChange isn't called.
  const commit = React.useCallback(
    (returnFocus: boolean) => {
      const unchanged =
        selected !== null &&
        selected.getHours() === pendingDate.getHours() &&
        selected.getMinutes() === pendingDate.getMinutes();
      if (!unchanged) {
        if (!isValueControlled) {
          setInternalValue(pendingDate);
        }
        onChange?.(pendingDate);
      }
      close(returnFocus);
    },
    [selected, isValueControlled, onChange, pendingDate, close],
  );

  // A dismissal (an outside click, a second click on the field, or Tab out of the panel) saves the
  // staged selection only if someone changed it since the panel opened; otherwise it just closes.
  const dismiss = React.useCallback(
    (returnFocus: boolean) => {
      if (isSamePending(pending, openedPending.current)) {
        close(returnFocus);
      } else {
        commit(returnFocus);
      }
    },
    [pending, close, commit],
  );

  // Popup only reports a dismissal from an outside click now (Escape is handled below).
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true);
      } else {
        dismiss(false);
      }
    },
    [setOpen, dismiss],
  );

  // Tab past the panel's last stop, or Shift+Tab before its first, dismisses it and returns focus
  // to the field, as Dropdown Menu does: the tab order runs field, panel, then the rest of the page.
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
        dismiss(true);
      }
    };
    panel.addEventListener('keydown', handleKeyDown);
    return () => panel.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, panelId, dismiss]);

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

  // `:disabled` also catches a disabled fieldset around the picker, which its own prop doesn't.
  const isDisabled = () => disabled || Boolean(inputRef.current?.matches(':disabled'));

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled()) {
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
    <div {...rest} ref={forwardedRef} className={mergeClassNames(styles.root, className)} data-editable-cell={cellSize ?? undefined}>
      <Popup
        open={isOpen}
        onOpenChange={handleOpenChange}
        alignment={alignment}
        anchorRef={frameRef}
        id={panelId}
        padding="none"
        closeOnEscape={false}
        // The field's aria-expanded and aria-controls are set below, so they point at the dialog.
        manageTriggerAria={false}
        content={
          // The panel's content is the dialog, so it can carry its name: Popup's panel takes no label.
          <div id={dialogId} className={styles.panel} role="dialog" aria-label={dialogLabel} data-table-cell={cellSize ?? undefined}>
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
                options={MERIDIEMS.map((meridiem) => ({ value: meridiem, label: meridiem === 'AM' ? amLabel : pmLabel }))}
                selected={pending.meridiem}
                onSelect={(meridiem) => setPending((previous) => ({ ...previous, meridiem }))}
              />
            </div>
            <div className={styles.footer}>
              <Button prominence="tertiary" size="xs" onClick={() => close(true)}>
                {cancelLabel}
              </Button>
              <Button prominence="tertiary" size="xs" onClick={() => commit(true)}>
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
              <PickerTimeIcon size="md" decorative />
            </span>
          }
          onClick={() => {
            if (isDisabled()) {
              return;
            }
            // Re-clicking the field while open dismisses it, which saves a changed selection.
            if (isOpen) {
              dismiss(true);
            } else {
              setOpen(true);
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
          value={selected ? `${pad(selected.getHours())}:${pad(selected.getMinutes())}` : ''}
          onChange={() => {}}
          onFocus={() => inputRef.current?.focus()}
        />
      ) : null}
    </div>
  );
});

TimePicker.displayName = 'TimePicker';
