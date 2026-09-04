# Date/Time Picker - Generation Prompt

This is the prompt used to originally generate the Date/Time Picker organism. Kept as a historical
record; update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for behavioral changes
rather than this file.

## Task

Build a `DateTimePicker` organism for the LegacyHQ design system, matching the Figma `date-time-picker`
component set (`Components v1.0.0`, node `4789:411726`).

## What it is

One control that captures a date and a time together - a Date Picker on the left and a Time Picker on
the right, joined into a single field over one `Date` value.

## Requirements

- Tier: organism. Files: `date-time-picker.tsx`, `date-time-picker.types.ts`,
  `date-time-picker.module.css`, `DateTimePicker.stories.tsx`, `DateTimePicker.test.tsx`,
  `date-time-picker.mdx`, `index.ts`.
- CSS Modules + semantic tokens only. No MUI, no Tailwind, no hardcoded colors/typography/spacing.
- `React.forwardRef` on the root. Compose the DatePicker and TimePicker organisms (do not
  reimplement their fields or popups).

### Props

```ts
type DateTimePickerSize = 'sm' | 'md' | 'lg';
type DateTimePickerContext = 'default' | 'inline';

interface DateTimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null; defaultValue?: Date | null; onChange?: (value: Date) => void;
  size?: DateTimePickerSize;          // default 'md'
  context?: DateTimePickerContext;    // default 'default'
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

### Style mapping (from Figma)

- The set is 480px = a date-picker instance (240) + a 1px divider + a time-picker instance (240).
- context (default | inline) and size (sm | md | lg) pass through to both halves.
- Join the two halves into one field: pull the time half in by `-1 * border-width-sm` so the two
  field borders collapse into a single divider, and square the inner corners (date half's right, time
  half's left) so only the outer corners keep the Text Field radius.

### Behavior

- Drive both halves from one shared `Date`. Picking a date keeps the current time (else midnight);
  confirming a time keeps the current date (else today). Fire onChange with the combined Date.
- Pass size/context/disabled/invalid/locale to both; date constraints to the calendar; minuteStep to
  the time selector.
- role=group with an accessible name; each half keeps its own label, dialog popup, and keyboard model.

### Notes / status

- WIP in Figma: only context x size is defined (no combined open/disabled states) - interaction states
  come from the inner pickers. The joined look depends on each picker rendering its field frame as the
  direct child of its root.

## Deliverables

Component files + the full doc set + `date-time-picker.mdx`, an entry under Organisms in `llms.txt`,
and regenerated `registry.json` / `exemplars.json`.
