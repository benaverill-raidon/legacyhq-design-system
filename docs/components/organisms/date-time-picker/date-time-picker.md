# Date/Time Picker

## Purpose

Date/Time Picker is an organism that combines a Date Picker and a Time Picker into one control - a
date half on the left and a time half on the right - over a single `Date` value.

## When to use

Use it to capture a specific moment: a date and a time together (a meeting start, a deadline, a
reminder).

## When not to use

Do not use it when only a date is needed (use Date Picker) or only a time is needed (use Time Picker).

## Design intent

The control composes the real Date Picker and Time Picker side by side (480px = two 240px halves in
Figma). The two field frames collapse into a single shared border so the control reads as one field:
a single rounded outline with squared inner corners and a divider between the halves. `size` and
`context` pass through to both halves so they stay in step; `default` is bordered, `inline` is
borderless (subtle).

Both halves are driven by one `Date`. Picking a date keeps the current time; confirming a time keeps
the current date; `onChange` fires with the combined `Date`. Date constraints (`min`, `max`,
`isDateDisabled`, `weekStartsOn`) go to the calendar and `minuteStep` to the time selector.

> Note: the Figma component is in progress - it defines only `context` x `size` (no combined
> open/disabled states), so interaction states come from the inner Date Picker and Time Picker.

## Accessibility expectations

The control is a `role="group"` and should be labelled (`aria-label` or `aria-labelledby`). Each half
is an independent field with its own accessible name (`dateLabel` / `timeLabel`, defaulting to
`Date` / `Time`), its own popup (`role="dialog"`), and its own keyboard model - see the Date Picker
and Time Picker docs.

## Related components

- Date Picker
- Time Picker
- Date Picker Calendar
