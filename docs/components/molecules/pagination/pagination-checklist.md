# Pagination Checklist

## Component Information

### Name
Pagination

### Category
Molecule

### Related Components
- Toggle Button
- Icon Button
- Progress Indicator

---

## Purpose

### What problem does this component solve?
Lets users navigate a large, paged set of content - stepping forward/backward or jumping straight
to a specific page.

### Why does it need to exist?
Paged tables, search results, and list views repeatedly need the same "N pages, current page,
previous/next" control - Pagination centralizes the page-range/ellipsis logic instead of every call
site reimplementing it.

### What user goal does it support?
- Jump directly to a known page
- Step forward/backward through results
- Understand roughly how much content exists and where they are in it

---

## Usage

### Where will this component be used?
- Paged tables
- Search results
- Any paged list view

### What are the most common use cases?
- Navigating a large results table
- Jumping to a specific page of search results

### When should this component NOT be used?
- Infinite scroll / "load more" content
- Step-based flow progress (use Progress Indicator)
- Only one or two total pages

---

## Content

### What content can be displayed?
- Numeric page numbers (1-based)

### Character Limits
Not applicable - page numbers only, no custom labels.

---

## Variants

No Figma-level variant axis. Configurable via `siblingCount`/`boundaryCount` instead.

---

## States

Required:
- Default (unselected page / enabled nav)
- Selected (current page, `aria-current="page"`)
- Disabled (previous/next at the first/last page)

---

## Accessibility

### Does the control need a label?
Yes - `nav` always has an accessible name, defaulting to `"Pagination"`. Previous/next always have
accessible names (`previousLabel`/`nextLabel`).

### Is aria-current needed?
Yes, always, on the current page button.

---

## Open Questions
- Should a "jump to page" input be added alongside the button range?

---

## Notes
Figma's single demo (`currentPage=1`, `totalPages=20`) shows 12 consecutive pages before
collapsing into an ellipsis + last page - a width-fitting behavior, not a literal algorithm to
reproduce. The component instead implements the standard sibling/boundary-count windowing
algorithm used by most production pagination components, documented in `pagination-spec.md`.

The ellipsis is planned to become a Dropdown Menu trigger listing the hidden pages - intentionally
deferred until the Dropdown Menu organism exists, so Pagination doesn't depend on unbuilt work.
See "Future Enhancements" in `pagination-spec.md`.
