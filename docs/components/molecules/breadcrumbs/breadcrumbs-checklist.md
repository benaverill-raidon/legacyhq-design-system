# Breadcrumbs Checklist

## Component Information

### Name
Breadcrumbs

### Category
Molecule

### Related Components
- Link
- Progress Indicator

---

## Purpose

### What problem does this component solve?
Shows a user's location in a nested/hierarchical section and lets them jump back to any ancestor
level in one step.

### Why does it need to exist?
Deep or nested sections (settings, categories, folders) need a consistent, accessible "you are
here" trail instead of every page inventing its own.

### What user goal does it support?
- Understand where the current page sits in a hierarchy
- Navigate back to any ancestor level quickly

---

## Usage

### Where will this component be used?
- Page headers in nested/hierarchical sections

### What are the most common use cases?
- Multi-level settings pages
- Nested folder/category browsing

### When should this component NOT be used?
- Shallow, single-level apps with no real hierarchy
- Linear flow progress with unvisited future steps (use Progress Indicator)
- More than one trail per page

---

## Content

### What content can be displayed?
- A short label per item
- An optional icon before and/or after the label

### Character Limits
No fixed limit - keep labels short enough to avoid wrapping/overflow (no truncation is built in
today).

---

## Variants

No Figma-level variant axis - Breadcrumbs is a single component with one visual pattern per item,
repeated.

---

## States

Required:
- Default (ancestor `Link` items)
- Current (last item, non-interactive text with `aria-current="page"`)

Not Required:
- Any state beyond what `Link` itself already provides for ancestor items

---

## Accessibility

### Does the trail need a label?
Yes - `nav` always has an accessible name, defaulting to `"Breadcrumb"` and overridable via
`ariaLabel`.

### Is aria-current needed?
Yes, always, on the current (last) item - not optional.

---

## Open Questions
- Should a collapsed/overflow ("Home / ... / Security") variant be added for long trails?
- Should truncation or horizontal scroll be added for narrow containers?

---

## Notes
Figma's `breadcrumbs` sample renders every crumb - including the last - as an identical `Link`
instance. The component deliberately diverges from that literal sample by rendering the last item
as non-interactive `aria-current="page"` text, per the WAI-ARIA Breadcrumb Pattern. Whether an item
is "current" is derived from the absence of `href`, not a separate flag.
