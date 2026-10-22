# Time Picker - Specification

## Overview

Time Picker is a time field that opens a three-column time selector in a popup. It belongs to the
organism tier and composes the Text Field molecule (trigger), the Popup primitive (positioning +
dismissal), and the Button atom (footer), with custom listbox columns for the hours / minutes / AM-PM
selection.

## Anatomy

1. **Root** - a `div` wrapper (defaults to a 240px field width, shrinks to its container).
2. **Trigger** - a read-only `TextField` (input) showing the formatted time + a trailing clock icon
   (16px in a 24x24 box); `aria-haspopup="dialog"`.
3. **Popup** - a panel (padding `none`) anchored to the field frame. Its content is the
   `role="dialog"`, named by `dialogLabel` (Popup's panel takes no label).
4. **Columns** - three `role="listbox"` columns (hours, minutes, AM/PM), each a scroll container of
   `role="option"` buttons with a roving tabindex.
5. **Footer** - Cancel + Confirm `Button`s (`prominence="tertiary"`, size `xs`); changes are staged
   until confirmed.

## Public API

```ts
export type TimePickerSize = 'sm' | 'md' | 'lg';
export type TimePickerContext = 'default' | 'inline';

export interface TimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: TimePickerSize;
  context?: TimePickerContext;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  minuteStep?: number;
  format?: (value: Date, locale?: string) => string;
  locale?: string;
  alignment?: PopupAlignment | DeprecatedPopupAlignment;
  confirmLabel?: string;
  cancelLabel?: string;
  hoursLabel?: string;
  minutesLabel?: string;
  meridiemLabel?: string;
  amLabel?: string;                 // AM option text
  pmLabel?: string;                 // PM option text
  dialogLabel?: string;             // the panel dialog's name
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;      // set on the input, not the wrapper
  'aria-invalid'?: boolean | 'true' | 'false';  // same as invalid
  required?: boolean;               // native required + a hidden input the form validates
}
```

## Default Props

```txt
size = 'md'
context = 'default'
minuteStep = 5
alignment = 'bottomStart'
format = locale 12-hour time (hour/minute 2-digit, e.g. 04:30 PM)
confirmLabel = 'Confirm'; cancelLabel = 'Cancel'
hoursLabel = 'Hours'; minutesLabel = 'Minutes'; meridiemLabel = 'AM/PM'
amLabel = 'AM'; pmLabel = 'PM'; dialogLabel = 'Choose a time'
```

## Variants and states

- `context`: passed straight to the Text Field's `context` - `default` (bordered); `inline` (borderless).
- `size`: `sm` / `md` / `lg`.
- states: `default`, `filled`, `hover`, `open` (field focus treatment pinned), `disabled`, `invalid`.

## Behavior

- Read-only field shows the formatted time (or placeholder) + a clock icon.
- Click / Enter / Space / ArrowDown / ArrowUp open the popup; opening focuses the selected hour, a
  frame later (Popup keeps the panel hidden until it's positioned).
- Three listbox columns: hours (12-hour: 12, 1-11), minutes (0-59 by `minuteStep`), AM/PM.
- Column changes are staged in local state and previewed live in the field. **Confirm** commits
  (builds a Date - preserving the value's date part, else today - and fires `onChange`, then closes).
  **An outside click, a second click on the field, or Tab out of the panel** dismisses it: it commits
  the same way only if the staged selection changed since the panel opened, else it just closes.
  A commit whose hours and minutes equal the current value closes without calling `onChange`.
  **Cancel or Escape** discards and closes.
- The incoming value's minute opens on the largest minute option at or below it (10:58 with step 5
  opens on 10:55), so the staged time is always an option and never crosses into the next hour. The
  minutes column offers `0, step, 2*step, ...` below 60, so a step that doesn't divide 60 (35: 00, 35)
  offers only minutes that exist.
- Tab past the panel's last stop (Confirm), or Shift+Tab before its first (the chosen hour), is the
  dismissal above and returns focus to the field, as Dropdown Menu does.
- `required` also renders a hidden native input (`tabIndex=-1`, `aria-hidden`, laid over the field,
  no pointer events) holding the time as `HH:mm`, so the form's constraint validation checks it; when
  the browser focuses it for an empty value, focus moves on to the field.
- An invalid `minuteStep` (not finite, or below 1) falls back to 5; a fractional one is truncated.
- The AM/PM option text is `amLabel` / `pmLabel` (English defaults), for translation.
- In a Table editable cell (`data-table-cell` on the panel), options are start-aligned with a
  selected inset rule, and the footer is 40px tall.
- Controlled/uncontrolled `value` and `open`; disabled does not open.

## Layout and tokens

- root width `240px`, `max-inline-size: 100%`; popup panel `240px`, three `1fr` columns, 256px tall.
- option: `body-md`, height `--size-400`, selected `--color-background-selected-default-default` +
  `--color-content-selected`, hover/press neutral overlay; column/footer dividers
  `--color-border-default`.
- open border `--color-border-focus` (via Text Field); clock icon `--color-content-subtle` in a
  `--size-300` (24px) box.

## Accessibility

- Trigger: read-only input, `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls` pointing
  at the dialog while open (set by Time Picker; Popup's `manageTriggerAria` is off).
- Dialog: the panel content, `role="dialog"`, named by `dialogLabel` (`Choose a time`); columns
  `role="listbox"` / options `role="option"` (`aria-selected`).
- Keyboard: ArrowUp/Down + Home/End within a column, Tab between columns; Escape / Cancel discard,
  Confirm commits; Tab out of the panel dismisses (commits a changed selection) and returns focus.
- Focus uses the shared Focus Ring; opening moves focus to the selected hour.
- Field's wiring (`id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `required`) goes to the
  input, not the wrapper. Browsers don't validate `required` on a read-only input, so `required`
  also adds the hidden validation input above.

## Storybook

- Playground
- Sizes
- Contexts
- States (empty / disabled / invalid)
- MinuteStep
- Controlled

## Tests

```txt
renders a field with the formatted time and a closed popup
shows the placeholder when empty
opens three columns with the current time selected
previews the staged selection live in the field but commits only on Confirm
confirms the staged selection on an outside click
discards the staged selection on Escape
cancels without committing and closes
controlled by value: Confirm fires onChange; field changes only on value change
respects minuteStep
moves focus to the chosen hour on open, once the panel is shown
names the dialog (dialogLabel, default 'Choose a time') and points aria-controls at it
shows amLabel / pmLabel as the AM/PM options
Tab / Shift+Tab out of the panel closes it and returns focus; saves only a changed selection
opens 10:58 (step 5) on 10:55; dismissing unchanged doesn't call onChange; empty stays empty
Confirm with an unchanged time doesn't call onChange; with no value it saves 12:00 AM
a step that doesn't divide 60 offers only existing minutes and opens on one
required: an empty value fails the form's validation; a time, or disabled, passes; focus goes on to the field
does not open when disabled
CSS contract: three equal columns + 32px options; selected surface/content tokens
```
