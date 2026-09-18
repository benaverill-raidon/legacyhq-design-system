# Date/Time Picker - Completion Checklist

## Component name

DateTimePicker

## Description

A combined date + time control: a Date Picker and a Time Picker joined into one field over a single
`Date` value.

## Status

In progress (mirrors the current WIP Figma: context x size).

## Component category

Organism.

## Design decisions

- [ ] Composes the DatePicker (left) and TimePicker (right) organisms - no reimplemented fields/popups.
- [ ] One shared Date: picking a date keeps the time (else midnight); confirming a time keeps the date
      (else today); onChange fires with the combined Date.
- [ ] size + context pass through to both halves (default bordered / inline borderless).
- [ ] Date constraints (min/max/isDateDisabled/weekStartsOn/today) go to the calendar; minuteStep to
      the time selector.
- [ ] Joined look: collapse the shared border (margin-inline-start: -border-width-sm) and square the
      inner corners so only the outer corners stay rounded.
- [ ] role=group with an accessible name; each half keeps its own label / popup / keyboard model.

## Figma properties

```txt
date-time-picker (set 4789:411726): context (default | inline) x size (sm | md | lg)
composed of a date-picker instance + a 1px divider + a time-picker instance (480px total)
WIP: no combined open/disabled/hover/filled states
```

## Code props

```ts
type DateTimePickerSize = 'sm' | 'md' | 'lg';
type DateTimePickerContext = 'default' | 'inline';

interface DateTimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null; defaultValue?: Date | null; onChange?: (value: Date) => void;
  size?: DateTimePickerSize; context?: DateTimePickerContext;
  disabled?: boolean; invalid?: boolean; locale?: string;
  min?: Date; max?: Date; isDateDisabled?: (date: Date) => boolean; weekStartsOn?: Weekday;
  minuteStep?: number; today?: Date;
  datePlaceholder?: string; timePlaceholder?: string;
  dateFormat?: (date: Date, locale?: string) => string;
  timeFormat?: (value: Date, locale?: string) => string;
  dateLabel?: string; timeLabel?: string;
  'aria-label'?: string; 'aria-labelledby'?: string;
}
```

## Defaults

```txt
size: md; context: default; weekStartsOn: 0; minuteStep: 5
dateLabel: Date; timeLabel: Time
```

## Tokens

- [ ] No new tokens - all come from the composed DatePicker / TimePicker.
- [ ] Join: margin-inline-start: calc(-1 * --border-width-sm); inner corners border-radius 0.

## Accessibility

- [ ] role=group labelled; each half has its own accessible name / dialog popup / keyboard model.

## Examples to document

- [ ] Uncontrolled
- [ ] Controlled
- [ ] Inline (borderless)
- [ ] Constrained + coarse minutes

## Tests

- [ ] Renders date + time fields in a labelled group.
- [ ] Selecting a date keeps the time; confirming a time keeps the date; onChange gets combined Date.
- [ ] Controlled value; disables both; size/context on the group.
- [ ] CSS contract (collapsed border + squared inner corners).
- [ ] Uses MUI: no. Uses Tailwind: no.
