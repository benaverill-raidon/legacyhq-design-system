# Badge Checklist

## Component Information

### Name
Badge

### Category
Atom

### Related Components
- Tag
- Lozenge
- Tooltip

---

## Purpose

### What problem does this component solve?
Provides a compact visual indicator for numeric values such as tallies, counts, and scores.

### Why does it need to exist?
Allows users to quickly scan and compare small numeric values without distracting from surrounding content.

### What user goal does it support?
- Understand counts quickly
- Identify changes or totals
- Scan interfaces efficiently

---

## Usage

### Where will this component be used?
- Navigation
- Tables
- Lists
- Cards
- Buttons
- Status summaries

### What are the most common use cases?
- Notification counts
- Score values
- Totals
- Small indicators

### When should this component NOT be used?
- Long text labels
- Status labels requiring explanation
- Primary actions
- Multi-line content

---

## Content

### What content can be displayed?
- Numeric values
- Positive values (+1)
- Negative values (-1)

### Character Limits
Recommended:
- 1–4 characters

Examples:
- 1
- +1
- -1

---

## Variants

### Tone
- default
- inverse
- brand
- success
- error

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

Badge is non-interactive.

---

## Accessibility

### Does the value need additional context?
Example:

Visible:
1

Accessible:
1 unread notification

### Is aria-label needed?
Optional

---

## Open Questions
- Should Badge support non-numeric values?
- Should overflow formatting (99+) be supported?
- Should icons ever be supported?

---

## Notes
The Badge component is intentionally small and simple.

Do not add functionality unless a real use case requires it.
