# Date Picker Calendar

## Purpose

Date Picker Calendar is an organism: the month-grid panel for choosing a single date. It is the
content that fills the popup surface of the (upcoming) Date Picker and Date/Time Picker, and can be
used anywhere a date is picked from a calendar.

## When to use

Use it inside a date field's popup to pick a day, or for any inline "pick a date" surface (a
scheduling panel, a date filter).

## When not to use

Do not use it as a full field + popup; that is the Date Picker, which wraps this calendar. Do not use
it for picking a time (use the Time Picker; Date/Time Picker combines both). For a small set of preset
dates, a Select or Radio group may be simpler.

## Design intent

The panel is **transparent** - the surrounding popup provides the surface and elevation, so the
calendar "fills" it. A month header carries previous-year (`«`), previous-month (`‹`), the month +
year title (`heading-xs`, `content/default`), next-month (`›`), and next-year (`»`) controls; the four
controls are Icon Buttons (`subtle`, size `xs`, square). Below it, a weekday header (`heading-xxs`)
and a six-week day grid.

Day cells map to the Figma `day` states: resting days are `content/subtle` (`body-sm`); hover/press
use the neutral overlay tokens and darken to `content/default`; the selected day fills
`background/selected/default/default` with a `border/selected` outline and `content/selected` text;
today is `content/selected` with a short underline; out-of-month and disabled days are muted to
`content/disabled`. Cells are `border-radius/sm`, and focus uses the shared Focus Ring primitive.

Out-of-month days are shown for context but muted; selecting one moves to that month.

## Accessibility expectations

The grid is a `role="grid"` labelled by the month title (which is `aria-live="polite"` so month
changes are announced). Days use a roving tabindex - only one day is in the tab order. Arrow keys move
by day and week, Home/End jump to the start/end of the week, PageUp/PageDown change month (with Shift,
year), and Enter/Space select. Today is `aria-current="date"`, the selected day's cell is
`aria-selected`, and disabled days are `aria-disabled`. Focus uses the shared Focus Ring.

## Related components

- Date Picker
- Date/Time Picker
- Icon Button
- Focus Ring
