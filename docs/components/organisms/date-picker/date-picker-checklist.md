# Date Picker - Completion Checklist

## Component name

DatePicker

## Description

A date field (read-only Text Field trigger) that opens the Date Picker Calendar in a Popup. Sizes,
default/inline contexts, controlled + uncontrolled value and open state, and date constraints passed
to the calendar.

## Status

Stable.

## Component category

Organism.

## Design decisions

- [ ] Trigger = read-only Text Field showing the formatted date + a trailing calendar icon.
- [ ] context maps to Text Field appearance: default (bordered) / inline (subtle, borderless); size
      passes through (sm/md/lg).
- [ ] Open state rendered by pinning the field focus treatment (`data-force-state="focus"`) - border
      box for default, underline for inline (matches Figma `open`).
- [ ] Popup primitive anchored to the field frame (bottomLeft default), role=dialog, padding none; the
      Date Picker Calendar fills it.
- [ ] Opening moves focus into the grid; select/Escape close and return focus; outside click dismisses.
- [ ] Controlled + uncontrolled value and open.
- [ ] min/max/isDateDisabled/weekStartsOn/today/locale pass through to the calendar.
- [ ] Field is read-only (v1); manual date entry is future.

## Figma properties

```txt
date-picker (set 4788:377097): context (default | inline) x size (sm | md | lg) x
  state (default | filled | hover | open | disabled)
trigger built as dropdown-menu > popup (surface slot) > select-trigger > text-field
```

## Code props

```ts
type DatePickerSize = 'sm' | 'md' | 'lg';
type DatePickerContext = 'default' | 'inline';

interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  size?: DatePickerSize;
  context?: DatePickerContext;
  disabled?: boolean; invalid?: boolean;
  placeholder?: string;
  format?: (date: Date, locale?: string) => string;
  locale?: string;
  alignment?: PopupAlignment;
  min?: Date; max?: Date; isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: Weekday; today?: Date;
  id?: string;
  'aria-label'?: string; 'aria-labelledby'?: string;
}
```

## Defaults

```txt
size: md
context: default
alignment: bottomLeft
weekStartsOn: 0
format: locale short date (03/09/2026)
```

## Tokens

- [ ] root width 240px, max-inline-size 100%.
- [ ] open border `--color-border-focus` (via Text Field focus treatment).
- [ ] calendar icon `--color-content-subtle`; popup padding none.
- [ ] field surface/typography from Text Field; calendar tokens from Date Picker Calendar.

## Accessibility

- [ ] trigger read-only input, aria-haspopup=dialog; aria-expanded/aria-controls via Popup.
- [ ] role=dialog panel; focus into grid on open, back to field on close.
- [ ] Enter/Space/ArrowDown/ArrowUp open; Escape closes; calendar keyboard model inside.

## Examples to document

- [ ] Uncontrolled
- [ ] Controlled
- [ ] Inline (borderless)
- [ ] Sizes
- [ ] Constrained range

## Tests

- [ ] Field renders formatted value; placeholder when empty.
- [ ] Opens on click / Enter / ArrowDown; field expanded; focus into grid.
- [ ] Select fills field + closes + returns focus (uncontrolled); controlled value.
- [ ] Escape closes + returns focus; disabled does not open.
- [ ] min/max passed to calendar; role=dialog via aria-controls.
- [ ] CSS contract (240px width, read-only cursor/caret).
- [ ] Uses MUI: no. Uses Tailwind: no.
