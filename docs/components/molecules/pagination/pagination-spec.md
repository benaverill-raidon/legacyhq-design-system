# Pagination

## Overview

### Purpose
Pagination divides a large amount of content into smaller chunks across multiple pages and lets
users jump directly to any page.

### Description
Use Pagination below a paged table, list, or search-results view to navigate between pages.

### Category
Molecule

### Design Reference
- Figma Component: `pagination` (single component, not a variant set - node `2152:14872`, file
  `Components v1.0.0`)
- Structure: `figma-parts / navigator` (previous) + `pages` frame + `figma-parts / navigator`
  (next), 512x32 total
- Each page number wraps the existing `toggle-button` component instance
  (`size=sm (32)`, `tone=subtle` when not selected, `isSelected` true/false)
- Each navigator wraps the existing `icon-button` component instance
  (`shape=square, size=sm, tone=subtle`) with a `chevron_left`/`chevron_right` icon
- The demo sample shows `currentPage=1`, `totalPages=20`, rendering pages 1-12 sequentially,
  then an ellipsis (`code-parts / <pagination-ellipsis>`), then page 20

---

## Usage Guidelines

### Use When
- A paged table, list, or search-results view where jumping to a specific page is useful
- The total page count is known up front

### Do Not Use When
- Content loads via infinite scroll / "load more" (no fixed page count)
- Showing progress through a linear flow - use Progress Indicator
- Only one or two pages exist

---

## Anatomy

```text
Pagination
└─ nav[aria-label="Pagination"]
   └─ ol
      ├─ li → IconButton (previous, chevron_left, disabled on first page)
      ├─ li → ToggleButton (page 1)
      ├─ li → ToggleButton (page 2)
      ├─ li → span (ellipsis, non-interactive "...")     [when pages are collapsed]
      ├─ li → ToggleButton (last page)
      └─ li → IconButton (next, chevron_right, disabled on last page)
```

### Structure Notes
- Root `nav` landmark, `ol` of page controls in visual order (previous, pages/ellipses, next)
- Every page number is a real `ToggleButton`; the current page has `isSelected` and
  `aria-current="page"`
- The ellipsis is non-interactive text, not a button - confirmed directly from the Figma node tree
  (plain "..." text at `--color-content-subtle`, no button wrapper), despite the component-search
  metadata's description suggesting a subtle button
- Previous/next are `IconButton` (`appearance="subtle"`, `size="sm"`, `shape="square"`) with
  `chevron_left`/`chevron_right`, disabled at the first/last page respectively

---

## Design Decisions Beyond the Literal Figma Sample

Figma's `pagination` component is a single fixed demo (`currentPage=1`, `totalPages=20`, 512px
wide) showing 12 consecutive page numbers before collapsing into an ellipsis and a final
page-20 shortcut. Reverse-engineered literally, that would mean "show as many sequential pages as
fit in the available width" - a responsive, width-measuring behavior that isn't practical to
replicate from a single static sample, and isn't how any of this system's other components behave
(none measure container width to decide how much content to render).

Instead, the component implements the standard, widely-used **sibling + boundary count** windowing
algorithm (the same approach used by most production pagination components): always show the
first `boundaryCount` and last `boundaryCount` pages, always show `siblingCount` pages on either
side of the current page, and collapse any gap larger than one page into a single ellipsis. With
the defaults (`siblingCount=1`, `boundaryCount=1`), `currentPage=1`/`totalPages=20` renders
`1 2 … 20` rather than Figma's `1 2 3 … 12 … 20` - a deliberate, documented adaptation, not an
oversight. A consumer who wants something closer to Figma's wide-container sample can raise
`siblingCount`.

---

## Variants

Pagination has no Figma-level variant axis - the single component only demonstrates one visual
pattern. The only rendered states are:

| Element | States |
|---------|--------|
| Page number | default, selected (`aria-current="page"`), disabled (not used by default - see Known Limitations) |
| Previous / Next | default, disabled (at the first/last page) |
| Ellipsis | single, non-interactive state |

---

## Content Rules

### Supported Content
Numeric page numbers only (1-based). No custom page labels.

### Content Length
`totalPages` is expected to be a positive integer. `currentPage` should be within
`[1, totalPages]`.

---

## Properties (API)

| Property | Type | Required | Default |
|-----------|--------|----------|---------|
| currentPage | number | Yes | - |
| totalPages | number | Yes | - |
| onPageChange | `(page: number) => void` | Yes | - |
| siblingCount | number | No | `1` |
| boundaryCount | number | No | `1` |
| previousLabel | string | No | `'Previous page'` |
| nextLabel | string | No | `'Next page'` |
| getPageLabel | `(page: number) => string` | No | `` (page) => `Page ${page}` `` |
| ariaLabel | string | No | `'Pagination'` |
| className | string | No | undefined |

---

## Range Algorithm

Given `currentPage`, `totalPages`, `siblingCount`, and `boundaryCount`, the component computes an
ordered list of `number | 'ellipsis'` entries:

1. Always include pages `1..boundaryCount` (clamped to `totalPages`).
2. Always include the last `boundaryCount` pages (clamped to `1`).
3. Include `currentPage - siblingCount` through `currentPage + siblingCount` (clamped to
   `[1, totalPages]`).
4. Sort the combined, de-duplicated set of page numbers.
5. Walk the sorted list. When two consecutive kept pages are exactly 2 apart (one page hidden),
   show that page directly instead of collapsing it - a single hidden page costs the same width as
   an ellipsis but is more informative. When they are more than 2 apart, insert a single
   `'ellipsis'` entry between them.

This is a pure function (`getPaginationRange`), unit-tested independently of rendering.

---

## Accessibility

### Keyboard Support
Native button keyboard behavior for every control (`ToggleButton`/`IconButton` are both real
`<button>` elements) - Tab moves through them in order; Enter/Space activates the focused control.
No roving tabindex or arrow-key navigation is implemented - each button is independently focusable,
same reasoning as Button Group.

### ARIA

- Root: `nav` landmark with `aria-label` (default `'Pagination'`).
- Current page: `aria-current="page"` in addition to `ToggleButton`'s own `isSelected`/
  `aria-pressed`.
- Previous/next: `aria-label` (`previousLabel`/`nextLabel`), `disabled` at the first/last page.
- Ellipsis: rendered as plain text, `aria-hidden="true"` (it conveys no information beyond what's
  already visually obvious from the gap between adjacent numbers).

Example:

```tsx
<Pagination currentPage={page} totalPages={20} onPageChange={setPage} />
```

---

## Design Tokens

### Layout
- Page/nav button size: `size="sm"` on both `ToggleButton` and `IconButton` (`--size-control-sm`,
  32px) - matches Figma's 32x32 slots exactly.
- Gap between controls: `--spacing-xs` (4px) - Figma's `pages` frame itself used 0 itemSpacing
  (each 32px slot already includes its own visual padding), but a small explicit gap between the
  previous/next controls and the page list reads more clearly as three distinct groups; see Known
  Limitations.

### Colors
- Page numbers: inherited entirely from `ToggleButton` (`tone="subtle"`, `isSelected` for the
  current page).
- Previous/Next: inherited entirely from `IconButton` (`appearance="subtle"`).
- Ellipsis: `--color-content-subtle`.

### Typography
- Ellipsis: `--typography-body-md-*` (a plain text label, not a button).

---

## Behaviors

### Default
Renders the previous control, the computed page range (with ellipses), and the next control.
Calls `onPageChange(page)` when a page number, previous, or next control is activated. Previous is
disabled when `currentPage <= 1`; next is disabled when `currentPage >= totalPages`. No state is
held internally - the consumer owns `currentPage`.

---

## Dependencies

### Uses
- ToggleButton (atom) - every page number
- IconButton (atom) - previous/next controls

### Used By
- Paged tables
- Search results
- Any paged list view

---

## Engineering Notes

### Requirements
- React
- TypeScript
- CSS Modules
- CSS Variables

### Constraints
- No hardcoded colors, spacing, or typography
- No MUI dependency
- No Tailwind dependency
- Do not reimplement ToggleButton's or IconButton's own visual states locally
- The range algorithm must be a pure, independently testable function

---

## QA Checklist

### Visual
- [ ] Page buttons and nav buttons match Figma's 32x32 sizing
- [ ] Selected page shows brand-tinted background/border (via `ToggleButton`'s own `isSelected`
      styling)
- [ ] Ellipsis renders as plain muted text, not a button
- [ ] Light mode works
- [ ] Dark mode works

### Functional
- [ ] Renders the correct page range for a variety of currentPage/totalPages/siblingCount/
      boundaryCount combinations
- [ ] Clicking a page number calls onPageChange with that page
- [ ] Clicking previous/next calls onPageChange with currentPage -1/+1
- [ ] Previous is disabled on page 1; next is disabled on the last page
- [ ] Renders correctly when totalPages is small enough that no ellipsis is needed

### Accessibility
- [ ] nav has an accessible name (default "Pagination")
- [ ] The current page has aria-current="page"
- [ ] Previous/next have accessible names
- [ ] The ellipsis is aria-hidden
- [ ] Each control remains independently focusable via Tab

---

## Known Limitations
- No built-in "jump to page" text input.
- The ellipsis is not interactive (matching the literal Figma node) - it does not currently expose
  the pages it collapses.
- Does not measure container width to decide how many pages to show - see "Design Decisions Beyond
  the Literal Figma Sample" above.

## Future Enhancements
- A "jump to page" input variant
- The ellipsis will become a trigger for a **Dropdown Menu** (organism) listing the hidden page
  numbers, so a collapsed range is still directly reachable. Deliberately deferred: Dropdown Menu
  doesn't exist in this design system yet, and Pagination shouldn't depend on an organism that
  hasn't been built. Revisit once Dropdown Menu ships - `getPaginationRange` only returns
  `'ellipsis'` markers today, not which pages each one collapsed, so that will need to change
  alongside the ellipsis markup in `pagination.tsx` (e.g. returning the collapsed page numbers
  instead of a bare string) to give the dropdown something to list.
