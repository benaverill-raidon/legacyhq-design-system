# Generate Table Component

Use `table-spec.md` as the source of truth.

## Goal

Generate a production-ready Table component (an organism) - a data-table shell for list/index
("All X") pages: a section header (title + description + actions), a filter toolbar (search + filters
+ active-filter pills), a column-config-driven grid (sortable headers, a selection column,
loading/empty states), and a pagination footer. Driven by `columns` + `data`.

---

## Framework

- React
- TypeScript (generic over the row type)

---

## Styling

- CSS Modules
- CSS Variables only; use the generated token CSS
- No hardcoded colours/spacing/radius/typography (row/header heights and the 48px selection column are
  structural px, not token-gated)

---

## Expected Files

```txt
table/
├─ table.tsx
├─ table.types.ts
├─ table.module.css
├─ Table.test.tsx
├─ Table.stories.tsx
├─ table.mdx
└─ index.ts
```

---

## Props (see table.types.ts for the full API)

- `columns: TableColumn<Row>[]`, `data: Row[]`, `getRowId?` (defaults to index), `size?: 'md' | 'sm'`
- `caption?` / `title?` (accessible name), `description?`, `actions?`
- Toolbar: `toolbar?`, `searchable?` + `searchValue?` / `onSearchChange?` / `searchPlaceholder?`,
  `filters?`, `onClearFilters?`, `activeFilters?`
- Sorting: `sort?` / `defaultSort?` / `onSortChange?`, `manualSort?`
- Selection: `selectable?`, `selectedIds?` / `defaultSelectedIds?` / `onSelectionChange?`,
  `getSelectionLabel?`
- Pagination: `page?` / `pageCount?` / `onPageChange?`, `pageSize?`, `manualPagination?`
- `onRowClick?`, `loading?` + `skeletonRowCount?`, `empty?`, `className?`, `id?`
- `TableColumn`: `{ key, header, render?, sortable?, align?, width?, minWidth?, headerLabel?,
  sortValue?, className?, headerClassName? }`

---

## Behaviour (the important part)

- Render a semantic row-oriented `<table>` from `columns` + `data`; a cell shows `column.render(row)`
  or `String(row[key])`.
- Sorting is uncontrolled (`defaultSort`) or controlled (`sort` + `onSortChange`); cycle ascending →
  descending → unsorted; reorder `data` client-side unless `manualSort`.
- Selection is uncontrolled (`defaultSelectedIds`) or controlled (`selectedIds` +
  `onSelectionChange`); header select-all covers the visible rows and goes indeterminate for a partial
  selection.
- Pagination: client-side when `pageSize` is set (slice + own the page); server-driven when
  `manualPagination` (show `pageCount` pages). Search is controlled.
- `onRowClick` fires on a row but not on the selection checkbox cell (stop propagation there).
- `loading` → skeleton rows + `aria-busy`; empty `data` → the `empty` slot (default Empty State).

---

## Accessibility

- Real `<table>` with `thead`/`tbody`/`th scope="col"`/`td` and a visually-hidden `<caption>` (or
  `title`) as the accessible name.
- Sortable headers set `aria-sort` and wrap the label in a `<button>` ("Sort by {column}").
- Selection uses real Checkboxes; header select-all labelled + indeterminate.
- The scrollable grid is a keyboard-focusable `role="region"` with a name (WCAG 2.1.1).

---

## Do NOT

- Do NOT ship a component-per-cell-content-type; cells render arbitrary content via `column.render`.
  The only built-in cell is the selection Checkbox column.
- Do NOT bake domain filter logic into the toolbar; render domain Selects through the `filters` slot.
- Do NOT let selection break when rows reorder - compute row ids from the ORIGINAL data order.

---

## Compose (do not re-build)

Text Field (search), Select (filters), Chip mode=select (active filters), Checkbox (selection),
Button / Icon Button (actions), Skeleton (loading rows), Empty State (empty), Pagination (footer).

---

## Tokens to note

The Figma page is in-progress (✅⏲️) and the grid renders empty in the master (cells live in the
"Parts" library as `figma-parts / column / <type>`). Header cell height 40 (md) / 32 (sm); row height
64 (md) / 40 (sm); cell inline padding `--spacing-sm` with a `--spacing-2xl` outer gutter; card
surface `--color-elevation-surface-raised-default` + `--border-radius-lg`; row selected
`--color-background-brand-primary-subtle-default`; row divider / borders `--color-border-default`.

---

## Storybook

Include `Basic`, `Sortable`, `Selectable`, `Pagination`, `Sizes`, `WithToolbar`, `Loading`, `Empty`,
and `FullShell` (the realistic "All members" list page: header + actions + search + selection +
sorting + pagination).

---

## Tests

Cover render (default + custom cell), sort (client cycle + aria-sort + manualSort), selection
(toggle, select-all, indeterminate, controlled), client pagination (pageSize slices), loading
(skeleton + aria-busy), empty (default + custom slot), row click vs checkbox, search, and
size/className.
