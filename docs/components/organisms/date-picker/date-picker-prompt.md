# Date Picker - Generation Prompt

This is the prompt used to originally generate the Date Picker organism. Kept as a historical record;
update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for behavioral changes rather than
this file.

## Task

Build a `DatePicker` organism for the LegacyHQ design system, matching the Figma `date-picker`
component set (`Components v1.0.0`, node `4788:377097`).

## What it is

A date field that opens the Date Picker Calendar in a popup. The read-only field shows the formatted
selected date plus a calendar icon; the calendar does the picking.

## Requirements

- Tier: organism. Files: `date-picker.tsx`, `date-picker.types.ts`, `date-picker.module.css`,
  `DatePicker.stories.tsx`, `DatePicker.test.tsx`, `date-picker.mdx`, `index.ts`.
- CSS Modules + semantic tokens only. No MUI, no Tailwind, no hardcoded colors/typography/spacing.
- `React.forwardRef` on the root. Compose the Text Field molecule (trigger), the Popup primitive
  (positioning/dismissal), and the Date Picker Calendar organism (content).

### Props

```ts
type DatePickerSize = 'sm' | 'md' | 'lg';
type DatePickerContext = 'default' | 'inline';

interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null; defaultValue?: Date | null; onChange?: (date: Date) => void;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  size?: DatePickerSize;              // default 'md'
  context?: DatePickerContext;        // default 'default'
  disabled?: boolean; invalid?: boolean;
  placeholder?: string;
  format?: (date: Date, locale?: string) => string;
  locale?: string;
  alignment?: PopupAlignment;         // default 'bottomLeft'
  min?: Date; max?: Date; isDateDisabled?: (date: Date) => boolean;
  weekStartsOn?: Weekday; today?: Date;
  id?: string; 'aria-label'?: string; 'aria-labelledby'?: string;
}
```

### Style mapping (from Figma)

- context default -> Text Field appearance 'default' (bordered); inline -> 'subtle' (borderless).
- size sm/md/lg -> Text Field sizes; field frame radius md, border/input outline.
- open state -> pin the field focus treatment (`data-force-state="focus"`): a border/focus box for
  default, a border/focus underline for inline.
- trailing calendar icon `content/subtle`; the popup provides the surface (padding none - the calendar
  brings its own padding).

### Behavior

- Read-only field displays the formatted date (or placeholder) + calendar icon.
- Click / Enter / Space / ArrowDown / ArrowUp open; opening moves focus into the calendar grid.
- Selecting a day fills the field, closes, and returns focus; Escape closes + returns focus; outside
  click dismisses without moving focus.
- Controlled + uncontrolled value and open; min/max/isDateDisabled/weekStartsOn/today/locale pass to
  the calendar; disabled does not open.
- Field is read-only in this version; manual date entry is a future addition.

### Figma composition note

In Figma the trigger is built as `dropdown-menu > popup (surface slot = calendar) > select-trigger >
text-field`. In code, `dropdown-menu` is menu-specific, so the trigger composes the Popup primitive +
Text Field directly and puts the Date Picker Calendar in Popup's content.

## Deliverables

Component files + the full doc set + `date-picker.mdx`, an entry under Organisms in `llms.txt`, and
regenerated `registry.json` / `exemplars.json`.
