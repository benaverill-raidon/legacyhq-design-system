# Table

## Overview

### Purpose
Present a large, sortable, filterable set of records - the workhorse of list/index ("All X") pages -
with sorting, selection, and pagination handled.

### Description
A data-table shell: a section header (title + description + actions), a toolbar (search +
filter/configure icon buttons + active-filter Chip mode="filter" pills), a column-config-driven grid
(sortable headers, a selection column, loading/empty states), and a pagination footer. Driven by
`columns` + `data`.

### Category
Organism - composes Text Field, Chip, Checkbox, Icon Button, Button, Skeleton, Empty State,
and Pagination into one complete section with real interaction and accessibility responsibilities.

### Design Reference
- Figma file `Components v1.0.0` (`M0eINB6n1BfrXu7ntYqb1i`), page "Table" (marked in-progress ✅⏲️).
- `table` frame (node `2949:40357`) holds two size components: `size=md` (`2949:40355`) and `size=sm`
  (`2949:40356`) - not a variant set. Verified live via figma-dev-mode 2026-09-10.
- The master's regions: `table / head` (`2949:40307`), `table / filters` (`2948:37536`),
  `table / columns` (`2953:23358`), `container-pagination` (`2948:39041`).
- The grid renders empty in the master; the cells live in the "Parts" library as
  `figma-parts / column / <type>` - a column per cell content type (text, avatar, tag, link, badge,
  checkbox, radio, button, progress-bar, toggle, inline editors, ...). The code expresses these via a
  column's `render`, not one component per type.
- Header cell (`cell / table-head`, `2956:29798`, deep-verified via the Desktop Bridge): background
  `elevation/surface/default` (a subtle grey band), a Title in `heading/xs` SemiBold coloured
  `content/subtle`, an always-visible sort arrow + a column-menu (⋮) dropdown, a drag-handle divider,
  and a bottom border; height 40 (md) / 32 (sm). Body cell (`cell / text`, `2957:59685`): `--spacing-sm`
  inline padding, `body/md`, `content/default`, transparent, bottom row divider; height 64 (md) / 40
  (sm). Row hover/selected states are not specified in the in-progress page (the code uses inferred
  tokens).

---

## Usage Guidelines

### Use When
- A page of records the user scans, sorts, filters, selects, and pages through ("All members",
  "All orders").
- A selectable list with bulk actions; a dense data view (`size="sm"`); a server-paged dataset.

### Do Not Use When
- A simple key/value layout or a short static list (use plain markup / a description list).
- A dashboard of cards (a layout grid, not tabular data).
- A spreadsheet with formulas or range selection (out of scope). Individual inline editors are supported.

---

## Anatomy

```text
Table (div.table, data-size)
├─ div.header                                        [when title / description / actions]
│  ├─ div.headingArea (h2.title heading/lg + p.description body/md subtle, gap-md)
│  └─ div.actions (Buttons + overflow Icon Button)
└─ div.tableBody (data-has-footer; raised surface, no border/radius)
   ├─ div.toolbar                                     [when search / toolbarActions / activeFilters]
   │  ├─ div.toolbarControls (search TextField left + toolbarActions IconButtons right)
   │  └─ div.activeFiltersRow (Chip mode="filter" pills + "+" add + Clear all filters right)
   ├─ div.scroll (role=region, tabIndex 0)
   │  └─ table.grid (data-resized; caption = visually-hidden name; aria-busy while loading)
   │     ├─ thead
   │     │  ├─ tr.selectionRow  [when selectable & selectedCount > 0 - REPLACES the header row]
   │     │  │   ├─ th.selectHeaderCell (Checkbox select-all)
   │     │  │   └─ th.selectionHeaderCell (colSpan) → count (left) + bulkActions (right)
   │     │  └─ tr (the normal header row, otherwise)
   │     │      ├─ th.selectHeaderCell (Checkbox select-all)     [when selectable]
   │     │      └─ th.headerCell (scope=col, aria-sort; sortable → <button> label + sort arrow;
   │     │           span.resizeHandle role=separator at the trailing edge  [when resizable])
   │     └─ tbody
   │        ├─ tr.row (data-selected)
   │        │  ├─ td.selectCell (Checkbox)                   [when selectable]
   │        │  └─ td.cell (data-align, data-emphasis; render(row) or row[key])
   │        ├─ skeleton rows                                  [when loading]
   │        └─ empty row (colSpan, no padding) → informative Empty State  [when no rows]
   └─ div.footer (Pagination, centered)  [when pagination enabled & >1 page]
```

### Structure Notes
- A real, row-oriented `<table>`; Figma's column-oriented layout is expressed as the `columns` config.
- Header cells are `position: sticky` at the top of the scroll region; the row/header heights and the
  48px selection column are structural px (not token-gated).
- The table body wraps toolbar + grid + footer (no border or radius); the header sits above it with
  its own padding (block: 3xl/lg, inline: 2xl).

---

## Behaviour

- **Data-driven.** Renders from `columns` + `data`; a cell shows `column.render(row)` or `row[key]`.
- **Sorting.** Uncontrolled (`defaultSort`) or controlled (`sort` + `onSortChange`); cycles ascending
  → descending → unsorted. The built-in sort reorders `data` client-side unless `manualSort`.
- **Selection.** Checkbox-only (rows are never clickable). Uncontrolled (`defaultSelectedIds`) or
  controlled (`selectedIds` + `onSelectionChange`); the header select-all covers the visible
  (current-page) rows and goes indeterminate for a partial selection. When one or more rows are
  selected, the column-header `<th>` cells are **replaced** by the selection bar - the select-all
  Checkbox stays, then the count (left) + `bulkActions` (right).
- **Hover.** Every row shows a `neutral-overlay-bold` hover (aids horizontal scanning), distinct from
  the brand-tinted selected state. A single row - or the last row when there's no pagination footer -
  drops its bottom divider.
- **Resizing.** Columns resize by default (`resizableColumns`): drag the header-edge separator or
  focus it and use ArrowLeft / ArrowRight. Hover shows a colour change on the handle; press/active
  extends it with 2px (--spacing-xxs) padding top and bottom. The first resize freezes every
  column's width (the grid becomes `table-layout: fixed`), so resizing one column doesn't reflow the
  others and the widths persist across page/data changes. Opt out with `resizableColumns={false}` or
  `column.resizable === false`.
- **Emphasis.** `column.emphasis='strong'` renders an identifier cell at the heading weight; other
  cells stay at the body weight.
- **Pagination.** Client-side when `pageSize` is set (Table slices + owns the page); server-driven
  when `manualPagination` (Table shows `pageCount` pages). Search is controlled.
- **Toolbar.** Row 1: search field (flex-growing up to 600px) + `toolbarActions` Icon Buttons
  (right-aligned). Row 2: `activeFilters` Chip `mode="filter"` pills + optional "+" add-filter Icon
  Button + "Clear all filters" action (trailing edge, only when `onClearFilters` is provided).
  Bottom border separates toolbar from the grid.
- **States.** `loading` → skeleton rows + `aria-busy`; empty `data` → the `empty` slot (default: an
  informative/sunken Empty State).

---

## Interaction rules

- **Checkbox = selection.** Never select on a row click; rows are not clickable.
- **Link = navigation.** If a value is an entity, it must be a Link; a single primary destination can
  also be a dedicated Link/action near the row's trailing edge. The identifier uses a strong Link;
  other entity links use the default emphasis.
- **Button = action** (state change), not plain navigation.
- Controls inside a row (links, buttons, menus, checkboxes) behave independently and never trigger a
  row-level interaction.

---

## Inline editable cells (verified 2026-09-21)

Figma Console inspection covered `2927:36490` (text), `2927:36509` (select), `2927:36528` (date),
and `2927:36547` (time), including default, hover, and typing/open at both densities. The date/time
open variants still carry duplicate `state=hover` names; their nested trigger strokes and popup
visibility identify the actual open state.

Use `column.cellAppearance = 'editable'` with consumer-owned editors in `render`. Existing controls
inherit table density and trigger styling through an internal context; portaled Popup contents reset
that context. Text uses InlineEdit + TextField; the other three render their own picker directly.

- Rows remain 40px / 64px. Editable tables use separate borders with zero spacing and painted body
  dividers so editor underlines and regular-cell dividers share the same pixel boundary.
- Trigger padding: 16px start, 8px end; body/md typography and a 24px trailing glyph box.
- Resting triggers are transparent with the row divider; hover is neutral-overlay-bold-hover with
  a 1px border-input underline and square corners.
- Typing/open is transparent with a 2px border-focus underline and square corners, including while
  focus moves into a popup or to an inline action.
- Text actions are 24px Cancel/Confirm buttons, 4px apart, centered vertically and inset 8px.
- Popups sit 4px below the trigger. The inline time panel uses leading-aligned options with a
  selected leading rule and a 40px footer.
- Row hover/selection stay on `<tr>`. Standalone controls retain their existing appearance.

## Tokens

| Aspect | Token |
|---|---|
| Table body surface | `--color-elevation-surface-raised-default` (white, no border/radius) |
| Header cell background | `--color-elevation-surface-default` (a subtle grey band) |
| Header cell text | `--color-content-subtle` (SemiBold) |
| Selection bar background | `--color-background-brand-primary-subtle-default` |
| Toolbar separator | `--border-width-sm` `--color-border-default` (border-block-end) |
| Cell text / description | `--color-content-default` / `--color-content-subtle` |
| Sort arrow (idle / active) | `--color-content-subtle` / `--color-content-default` |
| Resize handle divider | `--color-border-default` 1px → hover: `--color-border-bold` 1px (colour only); press/focus: `--color-border-bold` 1px + extends with `--spacing-xxs` inset |
| Row hover, all rows *(inferred - not in Figma)* | `--color-background-neutral-overlay-bold-hover` |
| Row selected / selected+hover *(inferred)* | `--color-background-brand-primary-subtle-default` / `-hover` |
| Row divider / header border | `--color-border-default` (dropped for a lone row, or the last row with no footer) |
| Empty cell padding | none (the Empty State's sunken background meets the card edges) |
| Focus ring | `--color-border-focus`, `--border-width-md` |
| Title / header cell / body cell type | `--typography-heading-lg-*` / `--typography-heading-xs-*` / `--typography-body-md-*` |
| Header padding | block `--spacing-3xl` / `--spacing-lg`, inline `--spacing-2xl` |
| Heading gap | `--spacing-md` (12px) |
| Cell inline padding | `--spacing-sm` |
| Outer gutter (md / sm) | `--spacing-2xl` (24px) / `--spacing-lg` (16px) |
| Toolbar padding | block `--spacing-lg` / `--spacing-xl`, inline `--spacing-2xl` |
| Toolbar row gap | `--spacing-md` (12px) |
| Search max width | 600px (flex-growing) |
| Footer padding | `--spacing-lg` `--spacing-2xl` |
| Header cell height (md / sm) | 40px / 32px |
| Row height (md / sm) | 64px / 40px |
| Selection column width | 40px |

---

## Design Decisions

- **Column-config driven, not slot-composed.** Figma lays the grid out column-by-column; the code
  takes `columns` + `data` and renders a semantic row-oriented `<table>`. This scales to a data-heavy
  program with many similar "All X" pages far better than hand-composed rows.
- **Cells render arbitrary content via `column.render`.** Figma's 20+ `column / <type>` parts (Tag,
  Avatar, Link, Badge, Button, ...) are examples of cell content, not a component-per-type contract.
  Baking a renderer for each would be a combinatorial, low-value surface. The one structural exception
  is the selection Checkbox column.
- **Batteries-included but controllable.** Sorting and selection are owned by default with controlled
  overrides; pagination is client-side (`pageSize`) or server-driven (`manualPagination`). This makes
  the common list page a near one-liner while supporting server-paged data - the right split for
  LegacyHQ's data-heavy "All X" pages.
- **The toolbar is a shell, not a filter engine.** It renders search + a `filters` slot + Clear
  filters + active-filter Chips; the domain-specific Selects are consumer-supplied, since specific
  Status/Type filters do not generalise.
- **Reuses existing components; no new tokens.** Search (Text Field), filters (Select), active filters
  (Chip), selection (Checkbox), actions (Button / Icon Button), loading (Skeleton), empty (Empty
  State), and the footer (Pagination) are all existing components; colour/spacing/typography use
  existing semantic tokens.

---

## Acceptance Criteria

- Renders a semantic `role="table"` named by `caption`/`title`; columns render `row[key]` by default
  or `column.render`.
- Sortable headers cycle asc/desc/none, set `aria-sort`, and reorder data client-side (unless
  `manualSort`, which only fires `onSortChange`).
- `selectable` adds a Checkbox column with a header select-all that goes indeterminate; selection is
  controllable.
- `pageSize` paginates client-side; `manualPagination` shows `pageCount` pages; search is controlled.
- `loading` shows skeleton rows + `aria-busy`; an empty data set shows the empty slot.
- `onRowClick` fires on a row but not on the selection checkbox.
- Composes `className` + `data-size`; uses only semantic tokens; works in light and dark themes.
- Storybook includes Basic, Sortable, Selectable, Pagination, Sizes, WithToolbar, Loading, Empty, and
  FullShell.
- Tests cover render/default+custom cell, sort (client + manual), selection + select-all/indeterminate,
  client pagination, loading, empty, row click vs checkbox, search, and size/className.
