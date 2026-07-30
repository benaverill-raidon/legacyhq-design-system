# Button Group Checklist

## Component Information

### Name
Button Group

### Category
Molecule

### Related Components
- Button
- Icon Button
- Toggle Button

---

## Purpose

### What problem does this component solve?
Lays out a set of related, independent action buttons with consistent spacing and direction.

### Why does it need to exist?
Toolbars, dialog action rows, and form actions repeatedly need the same "N buttons, one gap, one
direction" layout - Button Group names and centralizes that pattern instead of every call site
reinventing a flex row.

### What user goal does it support?
- Scan a set of related actions quickly
- Predict consistent spacing/alignment across the product

---

## Usage

### Where will this component be used?
- Toolbars
- Dialog/modal action rows
- Form action rows

### What are the most common use cases?
- Primary + secondary action pair ("Save" / "Cancel")
- A row of independent toolbar actions
- A stacked column of actions in a compact layout

### When should this component NOT be used?
- Mutually exclusive selection (segmented control)
- A single button (no grouping benefit)
- Visually joined/connected buttons

---

## Content

### What content can be displayed?
- `Button` and/or `IconButton` elements as `children`

### Character Limits
Not applicable - Button Group has no text content of its own.

---

## Variants

### Orientation
- horizontal (default), vertical

---

## States

Required:
- Default

Not Required:
- Hover
- Focus
- Active
- Loading
- Disabled

Button Group itself is non-interactive - all interactive states belong to its child buttons.

---

## Accessibility

### Does the group need a label?
Only when the set of actions isn't already named by surrounding context (a heading, a dialog
title). When a label is present, `role="group"` is applied automatically.

### Is aria-label needed?
Optional - passed through as a native `div` attribute, not a bespoke prop.

---

## Open Questions
- Should a `fullWidth`/stretched-children variant be added if a real use case emerges?
- Should Button Group ever validate that children are Button/IconButton instances?

---

## Notes
Figma's `count` variant axis (2, 3, 4) only demonstrates the pattern - it is not a real prop. The
component accepts any number of children. Figma's `inline`/`stacked` orientation values are renamed
to `horizontal`/`vertical` to match `RadioGroup`'s existing orientation vocabulary.
