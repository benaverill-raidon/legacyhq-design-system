# Time Picker - Generation Prompt

This is the prompt used to originally generate the Time Picker organism. Kept as a historical record;
update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for behavioral changes rather than
this file.

## Task

Build a `TimePicker` organism for the LegacyHQ design system, matching the Figma `time-picker`
component set (`Components v1.0.0`, node `4789:410508`).

## What it is

A time field that opens a three-column time selector (hours, minutes, AM/PM) in a popup. The read-only
field shows the formatted time plus a clock icon; the columns pick the value, and a Confirm commits it.

## Requirements

- Tier: organism. Files: `time-picker.tsx`, `time-picker.types.ts`, `time-picker.module.css`,
  `TimePicker.stories.tsx`, `TimePicker.test.tsx`, `time-picker.mdx`, `index.ts`.
- CSS Modules + semantic tokens only. No MUI, no Tailwind, no hardcoded colors/typography/spacing.
- `React.forwardRef` on the root. Compose the Text Field molecule (trigger), the Popup primitive
  (positioning/dismissal), and the Button atom (footer); custom listbox columns for the selection.

### Props

```ts
type TimePickerSize = 'sm' | 'md' | 'lg';
type TimePickerContext = 'default' | 'inline';

interface TimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null; defaultValue?: Date | null; onChange?: (value: Date) => void;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  size?: TimePickerSize;              // default 'md'
  context?: TimePickerContext;        // default 'default'
  disabled?: boolean; invalid?: boolean;
  minuteStep?: number;               // default 5
  placeholder?: string;
  format?: (value: Date, locale?: string) => string;
  locale?: string;
  alignment?: PopupAlignment;         // default 'bottomLeft'
  confirmLabel?: string; cancelLabel?: string;
  hoursLabel?: string; minutesLabel?: string; meridiemLabel?: string;
  id?: string; 'aria-label'?: string; 'aria-labelledby'?: string;
}
```

### Style mapping (from Figma)

- context default -> Text Field appearance 'default' (bordered); inline -> 'subtle' (borderless).
- size sm/md/lg -> Text Field sizes; open state pins the field focus treatment (data-force-state=focus).
- trailing clock icon 'picker_time' (PickerTimeIcon), 16px in a 24x24 box, content/subtle.
- columns: code-parts/<menu-item> options, height --size-400, body-md; selected =
  background/selected/default/default + content/selected; hover/press = neutral overlay; column and
  footer dividers border/default.
- footer: two Buttons (appearance subtle, size xs): Cancel, Confirm.

### Behavior

- Read-only field displays the formatted time (or placeholder) + clock icon.
- Open a Popup with three listbox columns: hours (12-hour), minutes (by minuteStep), AM/PM.
- Stage column changes and preview them live in the field. Confirm or an outside click commits (build
  a Date from the value's date part, else today, and fire onChange, then close); Cancel or Escape
  discards. Snap the incoming value's minute to the nearest step.
- Controlled + uncontrolled value and open; disabled does not open.
- a11y: role=dialog panel; role=listbox columns / role=option; roving tabindex; ArrowUp/Down + Home/End
  within a column, Tab between columns; Escape/Cancel discard, Confirm/outside click commit; opening
  focuses the selected hour.

### Notes / out of scope

- Value carried on a Date (h:m) for clean composition into a Date/Time Picker.
- 12-hour with AM/PM (24-hour is future). Native scrollbars (vs Figma's custom scrollbar chrome).
- The columns are custom listboxes, not the Menu organism, because selection is staged until Confirm.

## Deliverables

Component files + the full doc set + `time-picker.mdx`, an entry under Organisms in `llms.txt`, and
regenerated `registry.json` / `exemplars.json`.
