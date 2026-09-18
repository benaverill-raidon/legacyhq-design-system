# Date Picker - Specification

## Overview

Date Picker is a date field that opens the Date Picker Calendar in a popup. It belongs to the organism
tier and composes the Text Field molecule (trigger), the Popup primitive (positioning + dismissal),
and the Date Picker Calendar organism (content).

## Anatomy

1. **Root** - a `div` wrapper (defaults to a 240px field width, shrinks to its container).
2. **Trigger** - a read-only `TextField` (input) showing the formatted date + a trailing calendar
   icon; `aria-haspopup="dialog"`. The field frame is measured for popup anchoring.
3. **Popup** - a `role="dialog"` panel (padding `none`) anchored to the field frame, holding the
   calendar.
4. **Calendar** - `DatePickerCalendar`, receiving the selection and date constraints.

## Public API

```ts
export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerContext = 'default' | 'inline';

export interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: DatePickerSize;
  context?: DatePickerContext;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  format?: (date: Date, locale?: string) => string;
  locale?: string;
  alignment?: PopupAlignment;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: Weekday;
  today?: Date;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
```

## Default Props

```txt
size = 'md'
context = 'default'
disabled = false
invalid = false
alignment = 'bottomLeft'
weekStartsOn = 0
format = locale short date (year numeric, month/day 2-digit, e.g. 03/09/2026)
```

## Variants and states

- `context`: `default` -> Text Field appearance `default` (bordered); `inline` -> appearance `subtle`
  (borderless).
- `size`: `sm` / `md` / `lg` (Text Field sizes).
- states: `default`, `filled` (value present), `hover`, `open` (field focus treatment pinned via
  `data-force-state="focus"`), `disabled`, `invalid`.

## Behavior

- Read-only field shows the formatted selected date (or placeholder) + a calendar icon.
- Click / Enter / Space / ArrowDown / ArrowUp open the popup; opening moves focus into the calendar
  grid.
- Selecting a day fills the field, closes the popup, and returns focus to the field.
- Escape closes and returns focus; outside click dismisses without moving focus.
- Controlled/uncontrolled `value` and `open`.
- `min`/`max`/`isDateDisabled`/`weekStartsOn`/`today`/`locale` pass through to the calendar.
- Disabled does not open.

## Layout and tokens

- root width `240px` default, `max-inline-size: 100%`.
- open border `--color-border-focus` (via Text Field's focus treatment).
- calendar icon `--color-content-subtle`.
- popup padding `none` (the calendar carries its own padding); field surface/typography come from
  Text Field.

## Accessibility

- Trigger: read-only input, `aria-haspopup="dialog"`; Popup sets `aria-expanded`/`aria-controls`.
- Panel: `role="dialog"`; focus moves into the calendar grid on open and returns to the field on close.
- The calendar provides the grid roles, roving tabindex, and keyboard model.

## Storybook

- Playground
- Sizes
- Contexts
- States (empty / disabled / invalid)
- WithConstraints
- Controlled

## Tests

```txt
renders a field with the formatted date and a closed popup
shows the placeholder when empty
opens on click and marks the field expanded
opens with Enter and Arrow Down
moves focus into the calendar on open
selects a day: fills the field, closes, returns focus (uncontrolled)
controlled by value: onChange fires; field changes only on value change
closes on Escape and returns focus
does not open when disabled
passes min/max through to the calendar
exposes a role=dialog panel via aria-controls
CSS contract: 240px default width; read-only trigger cursor + no caret
```
