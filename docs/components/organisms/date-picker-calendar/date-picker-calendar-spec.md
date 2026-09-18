# Date Picker Calendar - Specification

## Overview

Date Picker Calendar is the month-grid panel for picking a single date. It belongs to the organism
tier, composes the Icon Button atom (month/year nav) and the shared Focus Ring primitive, and carries
self-contained date math (no date library). It is transparent - the surrounding popup provides the
surface.

## Anatomy

1. **Root** - a `div` (padding `spacing/lg`), laid out as a column.
2. **Header** - a flex row: previous-year (`«`), previous-month (`‹`), the title, next-month (`›`),
   next-year (`»`). The four controls are Icon Buttons (`subtle`, `xs`, `square`).
3. **Title** - a `span` (`heading-xs`, `content/default`, `aria-live="polite"`) that labels the grid.
4. **Grid** - a `table role="grid"` (`aria-labelledby` the title): a `thead` of weekday
   `columnheader`s and a `tbody` of six week `row`s.
5. **Day** - a `button` inside a `gridcell`; roving tabindex; state via
   `data-today` / `data-selected` / `data-outside` / `data-disabled`.

## Public API

```ts
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DatePickerCalendarProps
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

## Default Props

```txt
weekStartsOn = 0 (Sunday)
today = current date
defaultMonth = selection, else today's month
previousMonthLabel = 'Previous month'
nextMonthLabel = 'Next month'
previousYearLabel = 'Previous year'
nextYearLabel = 'Next year'
```

## Day states (from Figma `day`)

- **default** (in-month): `content/subtle` text, no background.
- **hover / press**: `background/neutral/overlay/hover` / `.../press`, text `content/default`.
- **focus**: shared Focus Ring (`border/focus`).
- **selected**: `background/selected/default/default` + `border/selected` + `content/selected`
  (hover/press use the selected `hover`/`press` surface tokens).
- **today**: `content/selected` text + a 2px `content/selected` underline.
- **outside** (adjacent month): muted to `content/disabled`, still selectable (selecting switches month).
- **disabled** (min/max or `isDateDisabled`): `content/disabled`, `aria-disabled`, not selectable.

## Layout and tokens

- panel padding `--spacing-lg`; cell size `--size-500` x `--size-400`
- title `heading-xs` / `--color-content-default`; weekday `heading-xxs` / `--color-content-default`
- day number `body-sm`; cell radius `--border-radius-sm`; border `--border-width-sm`
- transitions `--fade-quick` (respect reduced motion)

## Behavior

- Render six weeks for the displayed month; adjacent-month days shown muted.
- Controlled/uncontrolled selection (`value`/`onChange` vs `defaultValue`) and month
  (`month`/`onMonthChange` vs `defaultMonth`).
- `min`/`max` (inclusive) disable out-of-range days and block year/month nav when the whole target
  month is out of range; `isDateDisabled` disables individual dates.
- Roving tabindex; WAI-ARIA grid keyboard model; the focused day is kept inside the displayed month.

## Accessibility

- `role="grid"` labelled by the `aria-live` title; weekday `columnheader`s with full-name labels.
- Arrow keys (day/week), Home/End (week), PageUp/PageDown (month; Shift = year), Enter/Space (select).
- today `aria-current="date"`; selected cell `aria-selected`; disabled days `aria-disabled`.
- Focus uses the shared Focus Ring.

## Storybook

- Playground
- Controlled
- MinMax
- DisabledWeekends
- WeekStartsMonday

## Tests

```txt
renders the month title, weekday headers, and a six-week grid
marks today with aria-current="date"
selects a day on click (uncontrolled) + aria-selected on the cell
controlled by value: onChange fires; selection moves only on value change
navigates months and years from the header
disables out-of-range days and blocks nav past min/max
does not select a disabled date
roving tabindex; arrow keys move the focused day; crossing a boundary changes month
supports weekStartsOn (Monday)
CSS contract: selected surface/border/content; today underline; hover/press overlays; muted outside/disabled
```
