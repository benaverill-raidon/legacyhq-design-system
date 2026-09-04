# Date Picker Calendar - Generation Prompt

This is the prompt used to originally generate the Date Picker Calendar organism. Kept as a historical
record; update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for behavioral changes
rather than this file.

## Task

Build a `DatePickerCalendar` organism for the LegacyHQ design system, matching the Figma
`date-picker-calendar` component (`Components v1.0.0`, node `2417:61761`) and its parts: the `day`
component set (`2417:61410`), `month-header` (`2417:60025`), and `week-header` (`2417:61347`).

## What it is

The month-grid panel for picking a single date - the transparent content that fills the popup surface
of the (upcoming) Date Picker and Date/Time Picker. Month/year navigation, single-date selection,
min/max and per-date disabling, and a full WAI-ARIA grid keyboard model.

## Requirements

- Tier: organism. Files: `date-picker-calendar.tsx`, `date-picker-calendar.types.ts`,
  `date-picker-calendar.module.css`, `DatePickerCalendar.stories.tsx`, `DatePickerCalendar.test.tsx`,
  `date-picker-calendar.mdx`, `index.ts`.
- CSS Modules + semantic tokens only. No MUI, no Tailwind, no hardcoded colors/typography/spacing.
- `React.forwardRef` on the root. Self-contained date math (no date library).
- Compose the Icon Button atom (month/year nav) and the shared Focus Ring.

### Props

```ts
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface DatePickerCalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null;           // controlled selection
  defaultValue?: Date | null;    // uncontrolled selection
  onChange?: (date: Date) => void;
  month?: Date;                  // controlled displayed month
  defaultMonth?: Date;           // uncontrolled; selection, else today
  onMonthChange?: (month: Date) => void;
  min?: Date; max?: Date;        // inclusive range
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: Weekday;        // default 0 (Sunday)
  today?: Date;                  // default current date
  locale?: string;
  previousMonthLabel?: string; nextMonthLabel?: string;
  previousYearLabel?: string; nextYearLabel?: string;
}
```

### Style mapping (from Figma)

- panel: transparent, padding `spacing/lg` (the popup provides the surface).
- header: four icon-buttons (subtle, xs, square) around a `heading-xs` / `content/default` month/year
  title.
- weekday header: `heading-xxs` / `content/default`; day number `body-sm`.
- day cell: radius `border/radius/sm`; default `content/subtle`; hover/press
  `background/neutral/overlay/hover|press` + `content/default`; selected
  `background/selected/default/default` (+ hover/press) + `border/selected` + `content/selected`;
  today `content/selected` + a 2px underline; outside/disabled `content/disabled`; focus via the
  focus-ring primitive.

### Behavior

- Six week rows for the displayed month; adjacent-month days shown muted and selectable.
- Controlled + uncontrolled selection and month.
- min/max (inclusive) disable out-of-range days and block year/month nav when the whole target month
  is out of range; isDateDisabled disables individual dates.
- role="grid" labelled by the aria-live title; roving tabindex; Arrow keys (day/week), Home/End (week),
  PageUp/PageDown (month; Shift = year), Enter/Space (select). today aria-current="date"; selected cell
  aria-selected; disabled aria-disabled.

### Out of scope (future)

- Range selection (the Figma `previous selection` day state) - v1 is single-date.

## Deliverables

Component files + the full doc set + `date-picker-calendar.mdx`, an entry under Organisms in
`llms.txt`, and regenerated `registry.json` / `exemplars.json`.
