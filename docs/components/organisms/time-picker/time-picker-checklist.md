# Time Picker - Completion Checklist

## Component name

TimePicker

## Description

A time field (read-only Text Field trigger) that opens a three-column time selector (hours / minutes /
AM-PM listboxes) in a Popup, with staged Cancel / Confirm. Sizes, default/inline contexts, controlled
+ uncontrolled value and open state.

## Status

Stable.

## Component tier

Organism.

## Design decisions

- [ ] Trigger = read-only Text Field showing the formatted time + a trailing clock icon (16px in a
      24x24 box); same field pattern as Date Picker.
- [ ] context passes straight to the Text Field's context (default bordered / inline borderless);
      sizes sm/md/lg; open state pins the field focus treatment.
- [ ] Popup with three listbox columns: hours (12-hour), minutes (by minuteStep), AM/PM.
- [ ] Options use the Figma menu-item states (selected = selected surface + selected content; hover =
      neutral overlay). Native scrollbars (vs Figma's custom scrollbar chrome).
- [ ] Staged selection previewed live in the field: Confirm commits (onChange + close); an outside
      click, a second field click, or Tab out commits only a changed selection; Cancel or Escape
      discards. No onChange for a time equal to the current value.
- [ ] A value between steps opens on the step before it (same hour); only existing minutes offered.
- [ ] AM/PM option text from `amLabel` / `pmLabel`; the dialog named by `dialogLabel`.
- [ ] `required` adds a hidden native input that the form validates (a read-only input never is).
- [ ] Value carried on a Date (h:m) for clean Date/Time Picker composition. 12-hour + AM/PM (24-hour
      future).
- [ ] Controlled + uncontrolled value and open; disabled does not open.

## Figma properties

```txt
time-picker (set 4789:410508): context (default | inline) x size (sm | md | lg) x
  state (default | filled | hover | open | disabled)
open state: popup > panelSurface > columns of code-parts/<menu-item> + footer button-group (Cancel/Confirm)
```

## Code props

```ts
type TimePickerSize = 'sm' | 'md' | 'lg';
type TimePickerContext = 'default' | 'inline';

interface TimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: Date | null; defaultValue?: Date | null; onChange?: (value: Date) => void;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  size?: TimePickerSize; context?: TimePickerContext;
  disabled?: boolean; invalid?: boolean;
  minuteStep?: number; placeholder?: string;
  format?: (value: Date, locale?: string) => string; locale?: string;
  alignment?: PopupAlignment;
  confirmLabel?: string; cancelLabel?: string;
  hoursLabel?: string; minutesLabel?: string; meridiemLabel?: string;
  amLabel?: string; pmLabel?: string; dialogLabel?: string;
  id?: string; 'aria-label'?: string; 'aria-labelledby'?: string; required?: boolean;
}
```

## Defaults

```txt
size: md; context: default; minuteStep: 5; alignment: bottomLeft
format: locale 12-hour time (04:30 PM)
```

## Tokens

- [ ] root/panel width 240px; three 1fr columns, 256px tall; option height --size-400.
- [ ] option body-md; selected --color-background-selected-default-default + --color-content-selected;
      hover/press neutral overlay; dividers --color-border-default.
- [ ] open border --color-border-focus (via Text Field); clock icon --color-content-subtle in a
      --size-300 box.

## Accessibility

- [ ] trigger read-only input, aria-haspopup=dialog; aria-expanded + aria-controls (pointing at the dialog).
- [ ] named role=dialog panel; role=listbox columns with role=option (aria-selected); roving tabindex.
- [ ] ArrowUp/Down + Home/End within a column; Tab between columns; Escape/Cancel close + return focus;
      Tab out of the panel closes + returns focus.

## Examples to document

- [ ] Uncontrolled
- [ ] Controlled
- [ ] Inline (borderless)
- [ ] 15-minute step

## Tests

- [ ] Field renders formatted time; placeholder when empty.
- [ ] Opens three columns with current time selected; focus into columns.
- [ ] Live preview; Confirm or a changed outside click commits + closes; Cancel or Escape discards + closes.
- [ ] Unchanged dismissal / Confirm doesn't call onChange; 10:58 opens on 10:55; step 35 offers 00, 35.
- [ ] Tab / Shift+Tab out closes + returns focus; amLabel / pmLabel; dialogLabel; required validation.
- [ ] Controlled value; respects minuteStep; disabled does not open.
- [ ] CSS contract (3 equal columns, 32px options, selected tokens).
- [ ] Uses MUI: no. Uses Tailwind: no.
