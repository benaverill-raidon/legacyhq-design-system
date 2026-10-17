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
3. **Popup** - a `role="dialog"` panel (padding `none`) anchored to the field frame.
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
  alignment?: PopupAlignment;
  confirmLabel?: string;
  cancelLabel?: string;
  hoursLabel?: string;
  minutesLabel?: string;
  meridiemLabel?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;      // set on the input, not the wrapper
  'aria-invalid'?: boolean | 'true' | 'false';  // same as invalid
  required?: boolean;               // the input's native required
}
```

## Default Props

```txt
size = 'md'
context = 'default'
minuteStep = 5
alignment = 'bottomLeft'
format = locale 12-hour time (hour/minute 2-digit, e.g. 04:30 PM)
confirmLabel = 'Confirm'; cancelLabel = 'Cancel'
hoursLabel = 'Hours'; minutesLabel = 'Minutes'; meridiemLabel = 'AM/PM'
```

## Variants and states

- `context`: passed straight to the Text Field's `context` - `default` (bordered); `inline` (borderless).
- `size`: `sm` / `md` / `lg`.
- states: `default`, `filled`, `hover`, `open` (field focus treatment pinned), `disabled`, `invalid`.

## Behavior

- Read-only field shows the formatted time (or placeholder) + a clock icon.
- Click / Enter / Space / ArrowDown / ArrowUp open the popup; opening focuses the selected hour.
- Three listbox columns: hours (12-hour: 12, 1-11), minutes (0-59 by `minuteStep`), AM/PM.
- Column changes are staged in local state and previewed live in the field. **Confirm, an outside
  click, or a second click on the field** commits (builds a Date - preserving the value's date part, else today - and fires
  `onChange`, then closes); **Cancel or Escape** discards and closes.
- The incoming value's minute is snapped to the nearest step for the initial selection
  (`Math.round(minute / step) * step % 60`). Known bug: a minute that rounds up to 60 wraps to `00`
  without carrying the hour (10:58 with step 5 opens on 10:00), and an outside click commits the
  staged value even when nothing changed, so opening and clicking away saves 10:00. A step that
  doesn't divide 60 can also snap to a minute that isn't an option.
- An invalid `minuteStep` (not finite, or below 1) falls back to 5; a fractional one is truncated.
- The AM/PM option text is hard-coded English (`'AM'`/`'PM'`); only the column labels and buttons
  are props.
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

- Trigger: read-only input, `aria-haspopup="dialog"`; Popup sets `aria-expanded`/`aria-controls`.
- Panel: `role="dialog"`; columns `role="listbox"` / options `role="option"` (`aria-selected`).
- Keyboard: ArrowUp/Down + Home/End within a column, Tab between columns; Escape / Cancel discard,
  Confirm / outside click commit.
- Focus uses the shared Focus Ring; opening moves focus to the selected hour.
- Field's wiring (`id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `required`) goes to the
  input, not the wrapper. Browsers don't validate `required` on a read-only input.
- Known gaps (2026-10-17): the dialog panel has no accessible name; tabbing out of the panel leaves
  it open.

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
moves focus into the columns on open
does not open when disabled
CSS contract: three equal columns + 32px options; selected surface/content tokens
```
