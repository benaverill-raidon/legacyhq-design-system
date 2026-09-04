# Date Picker Calendar - Completion Checklist

## Component name

DatePickerCalendar

## Description

The month-grid panel for picking a single date - the transparent content that fills the date /
date-time picker popup surface. Month/year navigation, selection, min/max, per-date disabling, and a
full keyboard grid.

## Status

Stable.

## Component category

Organism.

## Design decisions

- [ ] Transparent panel (the popup provides the surface); padding `spacing/lg`.
- [ ] Month header = four Icon Buttons (subtle, xs, square): prev-year `«`, prev-month `‹`, next-month
      `›`, next-year `»`, around a `heading-xs` month/year title.
- [ ] Weekday header (`heading-xxs`) + a six-week day grid; adjacent-month days shown muted.
- [ ] Day cells: `content/subtle` default, hover/press neutral-overlay + `content/default`, selected =
      selected surface + `border/selected` + `content/selected`, today = `content/selected` + underline,
      disabled/outside = `content/disabled`. Radius `border/radius/sm`; focus via the Focus Ring primitive.
- [ ] Controlled + uncontrolled selection and month.
- [ ] min/max (inclusive) + isDateDisabled; nav blocked once the whole target month is out of range.
- [ ] Self-contained date math (no date library); locale drives month/weekday names; weekStartsOn.
- [ ] Single-date selection; range ('previous selection' Figma state) is future.

## Figma properties

```txt
date-picker-calendar (2417:61761): single component (no variants)
day part (set 2417:61410): state (default | hover | press | previous selection) x isSelected x
  isFocused x isDisabled x today
month-header (2417:60025): icon-button x4 + title
week-header (2417:61347): 7 day-of-week labels
```

## Code props

```ts
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface DatePickerCalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: Weekday;
  today?: Date;
  locale?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
  previousYearLabel?: string;
  nextYearLabel?: string;
}
```

## Defaults

```txt
weekStartsOn: 0 (Sunday)
today: current date
defaultMonth: selection, else today
nav labels: Previous/Next month, Previous/Next year
```

## Tokens

- [ ] panel padding `--spacing-lg`; cell `--size-500` x `--size-400`; radius `--border-radius-sm`.
- [ ] title `heading-xs`/`--color-content-default`; weekday `heading-xxs`/`--color-content-default`;
      day number `body-sm`.
- [ ] day default `--color-content-subtle`; hover/press `--color-background-neutral-overlay-bold-hover`/
      `-press` + `--color-content-default`.
- [ ] selected `--color-background-selected-default-default` (+ `-hover`/`-press`) +
      `--color-border-selected` + `--color-content-selected`.
- [ ] today `--color-content-selected` (text + underline); outside/disabled `--color-content-disabled`.
- [ ] transitions `--fade-quick`; reduced motion honored.

## Accessibility

- [ ] `role="grid"` labelled by the aria-live title; weekday columnheaders with full-name labels.
- [ ] roving tabindex; Arrow/Home/End/PageUp/PageDown/Enter/Space.
- [ ] today `aria-current="date"`; selected cell `aria-selected`; disabled `aria-disabled`.
- [ ] shared Focus Ring.

## Examples to document

- [ ] Uncontrolled
- [ ] Controlled
- [ ] Min / max range
- [ ] Disable specific dates
- [ ] Week starts Monday

## Tests

- [ ] Title + weekday headers + six-week grid; today aria-current.
- [ ] Click selects (uncontrolled) + aria-selected; controlled value.
- [ ] Month/year nav; min/max disabling + blocked nav; isDateDisabled.
- [ ] Roving tabindex; arrow-key movement; boundary crossing changes month.
- [ ] weekStartsOn (Monday); CSS contract (selected, today, overlays, muted).
- [ ] Uses MUI: no. Uses Tailwind: no.
