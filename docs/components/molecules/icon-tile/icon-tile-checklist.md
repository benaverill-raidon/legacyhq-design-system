# Icon Tile Checklist

## Component Information

### Name
Icon Tile

### Category
Molecule

### Related Components
- Icon
- Avatar
- Icon Button

---

## Purpose

### What problem does this component solve?
Gives an icon greater visual emphasis - a colored, sized container - than a bare icon or an
Icon Button affords, without implying interactivity.

### Why does it need to exist?
Feature call-outs, empty states, and category-led list/card layouts need a scannable colored icon
graphic that is explicitly not a button.

### What user goal does it support?
- Recognize a feature or category at a glance via color + icon
- Scan a list of options that are color-coded by type

---

## Usage

### Where will this component be used?
- Feature/benefit sections
- Empty states
- Cards
- List items

### What are the most common use cases?
- A colored icon leading a feature description
- A colored icon as the sole visual in an empty state
- A colored icon indicating a category in a list

### When should this component NOT be used?
- As a clickable action (use Icon Button)
- As a count or text indicator (use Badge or Tag)
- Where hover/focus/pressed/disabled states are needed

---

## Content

### What content can be displayed?
- Exactly one icon (`children`)

### Character Limits
Not applicable - no text content.

---

## Variants

### Tone
- gray, brand, red, orange, yellow, green, teal, blue, purple, magenta

### Appearance
- default, bold

### Shape
- square, round

### Size
- xxs, xs, sm, md, lg

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

Icon Tile is non-interactive.

---

## Accessibility

### Does the icon need additional context?
Default: no - `aria-hidden`, assumed decorative alongside labeled text.

When the tile is the only carrier of meaning: `decorative={false}` + `ariaLabel`.

### Is aria-label needed?
Optional, only meaningful when `decorative={false}`.

---

## Open Questions
- Should Icon Tile ever support an `xl` size if Figma adds one?
- Should a border/outline variant be added for use on low-contrast surfaces?

---

## Notes
The Figma component models `tone` and `appearance` (bold) as one flattened 20-value `appearance`
variant. The React API splits these into two independent props to follow this design system's
existing convention (see Button) of separating visual weight from semantic meaning.
