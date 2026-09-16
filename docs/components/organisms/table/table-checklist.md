# Table Checklist

## Component Information

### Name
Table

### Category
Organism

### Related Components
- Pagination (footer), Checkbox (selection), Text Field / Chip mode="filter" (toolbar)
- Button / Icon Button (header + toolbar actions)
- Skeleton (loading rows), Empty State (empty)

---

## Purpose

### What problem does this component solve?
Presents a large set of records the user scans, sorts, filters, selects, and pages through, with the
grid semantics, sorting, selection, and pagination handled once - the workhorse of "All X" list pages.

### Why does it need to exist?
Every data-heavy product has many near-identical list/index pages. Getting the table semantics
(`<table>`, `aria-sort`, an accessible name), the sort/select/paginate wiring, and the loading/empty
states right in one place keeps those pages consistent and correct.

### What user goal does it support?
- Find a record (search / filter / sort) and act on it (open, edit, bulk-select)
- Scan and compare rows of structured data

---

## Usage

### Where will this component be used?
- List/index pages ("All members", "All orders", "All invoices"), selectable lists with bulk actions,
  dense data views.

### What are the most common use cases?
- A searchable, sortable, paginated list page with header actions
- A selectable list with a header select-all and per-row checkboxes
- A server-driven table (manualSort + manualPagination) over a paged API

### When should this component NOT be used?
- A simple key/value layout or short static list (plain markup)
- A dashboard of cards (a layout grid, not tabular data)
- A spreadsheet-style editable grid (out of scope)

---

## Content

### What content can be displayed?
- Header: a title, a description, and actions (Buttons + an overflow Icon Button)
- Toolbar: search field (flex, max 600px) + filter/configure Icon Buttons + active Chip mode="filter"
  pills + "Clear all filters" action
- Grid: sortable column headers, a selection column, and cells rendering any content via `render`
- Footer: Pagination

### Character Limits
None - long cell content wraps or is rendered by the consumer; the grid scrolls horizontally.

---

## Variants

### Size
- md (default, 64px rows / 40px header), sm (compact, 40px rows / 32px header)

---

## States

Required:
- default, loading (skeleton rows + aria-busy), empty (Empty State)
- row hover, row selected, sorted (aria-sort on the header)

Not Required:
- Sorting, selection, and page are owned by default (uncontrolled) unless the consumer controls them.

---

## Accessibility

### Does it have the right table semantics?
Yes - a real `<table>` with `thead`/`tbody`/`th scope="col"`/`td` and a visually-hidden `<caption>`
(or the `title`) as the accessible name.

### Is sorting accessible?
Yes - sortable headers set `aria-sort` (ascending/descending/none) and wrap the label in a `<button>`
labelled "Sort by {column}".

### Is selection accessible?
Yes - real Checkboxes; the header select-all is labelled and goes indeterminate for a partial
selection.

### Can it be operated by keyboard?
Yes - toolbar controls, sort buttons, checkboxes, in-cell controls, and pagination are all reachable;
the scrollable grid is a keyboard-focusable `role="region"` (WCAG 2.1.1).

### What must the consumer still do?
Give the table an accessible name; pass a stable `getRowId` when selecting; keep in-cell content
(action buttons, links) accessible.

---

## Open Questions
- Should Table grow a single-select (radio) mode and a per-column options (⋮) menu next?
- Should it offer column resize/reorder and a sticky first column for very wide tables?
- Should it ship a built-in bulk-actions bar tied to the current selection?

---

## Notes
Column-config driven (`columns` + `data`); cells render arbitrary content via `column.render` rather
than a component-per-content-type. Batteries-included but controllable: sorting and selection are
owned by default with controlled overrides; pagination is client-side (`pageSize`) or server-driven
(`manualPagination`); search is controlled. Columns resize by default (drag / Arrow keys). Selection
is checkbox-only (rows are never clickable); selecting rows shows a selection bar (count +
`bulkActions`). Follow the interaction rules: checkbox = selection, Link = navigation (strong Link for
the identifier, default for other entity links), Button = action; in-row controls act independently.
The empty state uses the shared Empty State in its informative (sunken) treatment. Composes existing
components and uses only semantic tokens - no new tokens. The Figma page is still in-progress (✅⏲️);
single-select, the column ⋮ menu, column reorder, sticky columns, and row expansion are deferred. See
`table-spec.md` for the full reasoning.
