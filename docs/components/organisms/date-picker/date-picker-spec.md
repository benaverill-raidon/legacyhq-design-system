# Date Picker - Specification

## Overview

Date Picker is a date field that opens the Date Picker Calendar in a popup. It belongs to the organism
tier and composes the Text Field molecule (trigger), the Popup primitive (positioning + dismissal),
and the Date Picker Calendar organism (content).

## Anatomy

1. **Root** - a `div` wrapper (defaults to a 240px field width, shrinks to its container).
2. **Trigger** - a read-only `TextField` (input) showing the formatted date + a trailing calendar
   icon; `aria-haspopup="dialog"`. The field frame is measured for popup anchoring.
3. **Popup** - a panel (padding `none`) anchored to the field frame, holding the calendar, which is
   the `role="dialog"`, named by `dialogLabel` (Popup's panel takes no label).
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
  alignment?: PopupAlignment | DeprecatedPopupAlignment;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: Weekday;
  today?: Date;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;      // set on the input, not the wrapper
  'aria-invalid'?: boolean | 'true' | 'false';  // same as invalid
  required?: boolean;               // native required + a hidden input the form validates
  dialogLabel?: string;             // the calendar dialog's name; 'Choose a date'
}
```

## Default Props

```txt
size = 'md'
context = 'default'
disabled = false
invalid = false
alignment = 'bottomStart'
weekStartsOn = 0
format = locale short date (year numeric, month/day 2-digit, e.g. 03/09/2026)
```

## Variants and states

- `context`: passed straight to the Text Field's `context` - `default` (bordered); `inline`
  (borderless).
- `size`: `sm` / `md` / `lg` (Text Field sizes).
- states: `default`, `filled` (value present), `hover`, `open` (field focus treatment pinned via
  `data-force-state="focus"`), `disabled`, `invalid`.

## Behavior

- Read-only field shows the formatted selected date (or placeholder) + a calendar icon.
- Click / Enter / Space / ArrowDown / ArrowUp open the popup; opening moves focus into the calendar
  grid, a frame later (Popup keeps the panel hidden until it's positioned).
- Selecting a day fills the field, closes the popup, and returns focus to the field.
- Escape closes and returns focus; outside click dismisses without moving focus.
- Tab past the panel's last stop (the focusable day), or Shift+Tab before its first, closes it and
  returns focus to the field, as Dropdown Menu does: tab order runs field, calendar, rest of page.
- `required` also renders a hidden native input (`tabIndex=-1`, `aria-hidden`, laid over the field,
  no pointer events) holding the date as `YYYY-MM-DD`, so the form's constraint validation checks it;
  when the browser focuses it for an empty value, focus moves on to the field.
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

- Trigger: read-only input, `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls` pointing
  at the dialog while open (set by Date Picker; Popup's `manageTriggerAria` is off).
- Dialog: the calendar root, `role="dialog"`, named by `dialogLabel` (`Choose a date`). Focus moves
  into the grid on open, and back to the field on select, Escape, or Tab out.
- The calendar provides the grid roles, roving tabindex, and keyboard model.
- Field's wiring (`id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `required`) goes to the
  input, not the wrapper `div`; every other attribute goes to the wrapper. Browsers skip constraint
  validation on a read-only input, so `required` also adds the hidden validation input above: an
  empty required Date Picker stops the form's submit and the browser's message points at the field.
- The default `format` is `toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })`.

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
moves focus into the calendar when opened, once the panel is shown
names the calendar dialog (dialogLabel, default 'Choose a date')
closes and returns focus to the field on Tab / Shift+Tab out of the calendar
selects a day: fills the field, closes, returns focus (uncontrolled)
controlled by value: onChange fires; field changes only on value change
closes on Escape and returns focus
does not open when disabled
passes min/max through to the calendar
points the field at the dialog with aria-controls while open
required: an empty value fails the form's validation; a date, or disabled, passes; focus goes on to the field
CSS contract: 240px default width; read-only trigger cursor + no caret
```
