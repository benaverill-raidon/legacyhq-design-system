# Table

Table is an organism for presenting a large, sortable, filterable set of records - the workhorse of
list/index ("All X") pages. It renders a section header (title + description + actions), a filter
toolbar (search + filters + active-filter pills), a column-config-driven grid (sortable headers, a
selection column, and loading/empty states), and a pagination footer.

It's an organism because it composes many atoms and molecules - Text Field, Chip, Checkbox,
Icon Button, Button, Skeleton, Empty State, and Pagination - into one complete, self-contained
section with real sorting, selection, and pagination behaviour.

Use Table for a page of records the user scans, sorts, filters, selects, and pages through. Do not
use it for a simple key/value layout or a short static list (use plain markup), a dashboard of cards
(that's a layout grid, not tabular data), or a spreadsheet with formulas and range selection.

## Column-config driven

Pass `columns` and `data`; the table renders the grid. A column is `{ key, header, render?, sortable?,
align?, width? }`. By default a cell shows `String(row[key])`; pass `render` to compose any content -
a Tag, an Avatar, a Link, a Button, a two-line name cell - from existing components. Table does not
ship a cell-per-content-type; `render` is the extension point.

Always pass a stable `getRowId` (it defaults to the row index, which is unstable once rows sort or
paginate) - it's required in practice whenever you use selection.

## Inline editable cells

Set `cellAppearance: 'editable'` on a column and compose its editor through `render`:
`InlineEdit` wrapping `TextField`, or a `Select`, `DatePicker`, or `TimePicker` directly.
Table supplies density and full-cell styling; the consumer owns values and save callbacks.
Always label each editor with its column and row identity.

The cell trigger fills the row, with 16px/8px start/end padding. Hover uses
`--color-background-neutral-overlay-bold-hover` and a 1px `--color-border-input` underline;
editing/open uses a 2px `--color-border-focus` underline. Text editing places 24px Cancel/Confirm
actions inside the cell, 4px apart. Enter confirms, Escape cancels, and blur commits. Picker popups
keep their own sizing and use a 4px trigger gap. The inline time panel aligns options to the start
and marks selected values with a leading rule. Row hover and selection still belong to the row.

See the `EditableCells` and `EditableCellsCompact` Storybook examples. These overrides do not
change controls outside explicitly editable columns.

## Batteries-included, but controllable

- **Sorting** is owned by default: set `defaultSort`, click a sortable header to cycle ascending ->
  descending -> unsorted, and the data reorders client-side. Control it with `sort` + `onSortChange`,
  or set `manualSort` to sort server-side (Table reflects the state and fires the callback but does
  not reorder `data`).
- **Selection** is checkbox-only (rows are never clickable) and owned by default: set `selectable` for
  a leading Checkbox column with a header select-all (indeterminate for a partial selection). Control
  it with `selectedIds` + `onSelectionChange`. When one or more rows are selected, the column headers
  are **replaced** by a selection bar - the select-all Checkbox, the selected count, and your
  `bulkActions`. Every row also shows a subtle neutral hover to aid horizontal scanning.
- **Pagination** is controlled or client-side: pass `pageSize` for client-side slicing (Table
  computes the page count and owns the page), or `manualPagination` with `page` / `pageCount` /
  `onPageChange` for a server-paged API.
- **Search** is always controlled (`searchValue` / `onSearchChange`) - the consumer owns the query.

For a data-heavy, server-backed program, reach for `manualSort` + `manualPagination` and fetch on the
callbacks. For smaller in-memory lists, `pageSize` + `defaultSort` is a near one-liner.

## The toolbar

`searchable` renders a built-in search field (flex-growing up to 600px). `toolbarActions` places
filter and configure Icon Buttons to the right of the search field - the consumer owns the buttons
and their dropdown/popover content. `activeFilters` renders a row of Chip `mode="filter"` components
below the search row, with an optional "+" Icon Button to add more. `onClearFilters` adds a "Clear
all filters" action at the trailing edge. Pass `toolbar` to replace the whole built-in toolbar.

## Sizes

Two t-shirt sizes: `md` (default, larger - 64px rows) and `sm` (compact - 40px rows). Header cells
are 40px (md) / 32px (sm).

## Columns, resizing, and emphasis

Columns resize by default: drag a header's trailing edge, or focus the resize handle and use the
Arrow keys. The first resize freezes the layout, so a resize doesn't reflow the other columns and the
widths stay put as you page through the data. Opt out with `resizableColumns={false}` or per column
with `column.resizable === false`.

Mark the row identifier with `column.emphasis: 'strong'` (heading weight); every other column stays
at the body weight. Follow the same rule for links: a **strong** Link for the identifier, a
**default** Link for other entity links.

## Interaction rules

Apply these consistently:

- **Checkbox = selection.** Never select on a row click; rows are not clickable.
- **Link = navigation/routing.** If a value is an entity, it must be a Link; if a row has a single
  primary destination, expose it as a dedicated Link/action near the trailing edge.
- **Button = action** that changes state - not plain navigation.
- Interactive controls inside a row (links, buttons, menus, checkboxes) behave independently and never
  trigger a row-level interaction.

## States

- **loading** - skeleton placeholder rows, with `aria-busy` on the table.
- **empty** - an Empty State when there are no rows (override with the `empty` slot).
- **row hover / selected** - subtle hover and a brand-tinted selected background.

## Anatomy

- **header** - title (`--typography-heading-lg`), description (`--typography-body-md`,
  `--color-content-subtle`), and right-aligned `actions`. Padding: block `3xl`/`lg`, inline `2xl`.
- **table body** - a raised surface (`--color-elevation-surface-raised-default`, no border or
  radius) holding the toolbar, grid, and footer.
- **toolbar** - row 1: search (flex, max 600px) + `toolbarActions` Icon Buttons (right). Row 2:
  `activeFilters` Chip `mode="filter"` pills + "Clear all filters" action (right). Bottom border
  separator.
- **grid** - a semantic `<table>` with a visually-hidden `<caption>` for its accessible name; sticky
  `heading/xs` header cells with `aria-sort`; body cells (`--typography-body-md`) with a row divider.
- **selection column** - a 48px leading column of Checkboxes (header select-all + per row).
- **footer** - a centered Pagination.

## Accessibility

- It's a real `<table>` - always give it an accessible name via `caption` or `title`.
- Sortable headers set `aria-sort` and wrap the label in a `<button>`; the scrollable grid is a
  keyboard-focusable `role="region"`.
- Keep content you put in cells accessible (label in-cell action buttons).

Related components: Pagination (footer), Text Field / Chip (toolbar), Checkbox (selection),
Button / Icon Button (actions / toolbar), Skeleton (loading), Empty State (empty).
