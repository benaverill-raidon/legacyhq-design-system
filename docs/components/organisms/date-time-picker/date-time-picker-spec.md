# Date/Time Picker - Specification

## Overview

Date/Time Picker combines a Date Picker and a Time Picker into one control over a single `Date`. It
belongs to the organism tier and composes the DatePicker and TimePicker organisms (which in turn use
Text Field, Popup, the Date Picker Calendar, and the time columns).

> Status: in progress. The Figma component currently defines only `context` x `size` (no combined
> open/disabled states); interaction states come from the inner pickers.

## Anatomy

1. **Root** - a `div[role=group]` (`data-size`, `data-context`), laid out as an inline row.
2. **Date half** - a `DatePicker` (calendar popup) showing the date part; its inner (right) corners
   are squared.
3. **Time half** - a `TimePicker` (hours/minutes/AM-PM popup) showing the time part; pulled in by
   `-1 * border-width-sm` so the two field borders collapse into one divider, and its inner (left)
   corners are squared.

## Public API

```ts
export type DateTimePickerSize = 'sm' | 'md' | 'lg';
export type DateTimePickerContext = 'default' | 'inline';

export interface DateTimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date) => void;
  size?: DateTimePickerSize;
  context?: DateTimePickerContext;
  disabled?: boolean;
  invalid?: boolean;
  locale?: string;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: Weekday;
  minuteStep?: number;
  today?: Date;
  datePlaceholder?: string;
  timePlaceholder?: string;
  dateFormat?: (date: Date, locale?: string) => string;
  timeFormat?: (value: Date, locale?: string) => string;
  dateLabel?: string;
  timeLabel?: string;
  id?: string;                      // goes to the date input, not the group
  'aria-label'?: string;            // ignored when aria-labelledby is set
  'aria-labelledby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';  // same as invalid, on both inputs
  required?: boolean;               // required on both halves; the form validates each
}
```

## Default Props

```txt
size = 'md'
context = 'default'
weekStartsOn = 0
minuteStep = 5
dateLabel = 'Date'; timeLabel = 'Time'
```

## Behavior

- Compose a DatePicker (left) and a TimePicker (right) over one shared `Date`.
- Picking a date keeps the current time (else midnight); confirming a time keeps the current date
  (else today). `onChange` fires with the combined `Date` whenever either half changes.
- Pass `size` / `context` / `disabled` / `invalid` / `locale` to both halves; date constraints
  (`min` / `max` / `isDateDisabled` / `weekStartsOn` / `today`) to the calendar and `minuteStep` to
  the time selector.
- Join the halves: collapse the shared border (negative margin) and square the inner corners.

## Accessibility

- The root is a `role="group"`; label it (`aria-label` / `aria-labelledby`).
- Each half is an independent field with its own accessible name, `role="dialog"` popup, and keyboard
  model - see the Date Picker and Time Picker specs.
- In a Field: the label names the group (`aria-labelledby`), and the message's `aria-describedby`
  lands on the group `div`. Field's `id` goes to the date input, so the label's `htmlFor` points at
  it and clicking the label focuses the date half (and, as on a Date Picker in a Field, the forwarded
  click opens its calendar); the date input keeps its own name, `dateLabel`. The error
  (`aria-invalid`) and `required` go to both inputs, and each half's hidden validation input makes the
  form check that both a date and a time are set.
- `today` also supplies the date when a time is confirmed with no value.
- No `open`/`onOpenChange`: each half manages its own popup.

## Storybook

- Playground
- Sizes
- Contexts
- Controlled

## Tests

```txt
renders a date field and a time field in a labelled group
selecting a date keeps the time
confirming a time keeps the date
is controlled by value
disables both fields
applies size and context on the group
points Field's label at the date input; the label still names the group
puts its id on the date input, not the group
required: an empty control fails the form's validation
CSS contract: collapsed shared border + squared inner corners
```
