# Skeleton Checklist

## Component Information

### Name
Skeleton

### Category
Molecule

### Related Components
- Spinner
- ProgressBar

---

## Purpose

### What problem does this component solve?
Gives content a pulsing placeholder shape while it loads, preserving the layout the real content
will fill and reducing perceived load time and layout shift.

### Why does it need to exist?
Cards, list rows, and page sections need a way to show "this is loading" that already communicates
the shape of what's coming, rather than a spinner (no implied layout) or a jarring blank-to-content
swap.

### What user goal does it support?
- Perceive that content is on its way without a jarring blank state
- Recognize the eventual layout before the real content arrives

---

## Usage

### Where will this component be used?
- Cards
- List rows
- Page sections during initial data fetch

### What are the most common use cases?
- A text line placeholder
- An avatar-shaped circular placeholder
- A full card sketch (image block + text lines)

### When should this component NOT be used?
- The final shape is unknown (use Spinner)
- Progress is measurable (use ProgressBar)

---

## Content

### What content can be displayed?
None - Skeleton has no children slot; it is the placeholder itself.

### Character Limits
Not applicable - no text content.

---

## Variants

### Appearance
- default, subtle

### Shape
- rectangle, circle

---

## States

Required:
- Default (pulsing)

Not Required:
- Hover
- Focus
- Active
- Disabled

Skeleton is non-interactive.

---

## Accessibility

### Does it need additional context?
Default: no - `aria-hidden`, assumed to have surrounding loading context already.

When Skeleton (or a group of them) is the sole loading indicator: pass `label`.

### Is a label needed?
Optional, only meaningful when the Skeleton is the only signal that content is loading.

---

## Open Questions
- Should a multi-line "text" preset be added if a recurring pattern emerges across products?

---

## Notes
The Figma prototype smart-animates between the `default` and `subtle` variants on a timer as a way
to preview a pulsing effect inside Figma - the component instead implements a self-contained CSS
opacity pulse so a single Skeleton animates regardless of which `appearance` is selected, matching
how every other loading indicator (Spinner) in this system already reads as a real, continuously
animating unit rather than one that needs an external toggle.
