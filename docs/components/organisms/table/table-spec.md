# Table

## Overview

### Purpose
Present a large, sortable, filterable set of records - the workhorse of list/index ("All X") pages -
with sorting, selection, and pagination handled.

### Description
A data-table shell: a section header (title + description), a toolbar (search +
filter/configure icon buttons + actions + active-filter Chip mode="filter" pills), a column-config-driven
grid (sortable headers, a selection column, loading/empty states), and a pagination footer. Driven by
`columns` + `data`.

### Tier
Organism - composes Text Field, Select, Checkbox, Icon Button, Button, and Skeleton (and hosts
consumer-rendered Chips) into one complete section with real interaction and accessibility
responsibilities. The footer is Table's own (Selects + Icon Buttons), not the Pagination molecule,
and the default empty content is Table's own markup, not Empty State.

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
├─ div.header                                        [when title / description]
│  ├─ h{headingLevel}.title (heading/lg at md, heading/md at sm; h2 by default)
│  └─ p.description (body/md, content/subtle)
└─ div.tableBody (data-has-footer; no border/radius)
   ├─ div.toolbar                                     [when toolbar / search / toolbarActions / actions /
   │  │                                                onClearFilters / activeFilters / a selection]
   │  ├─ div.toolbarControls (right-aligned)
   │  │  ├─ div.toolbarButtonGroup: search IconButton → TextField (280px), toolbarActions, actions
   │  │  └─ div.selectionPill  [while rows are selected - REPLACES the button group]
   │  │     ├─ span.selectionCount (selectionCountLabel)
   │  │     └─ div.bulkActions (bulkActions)
   │  └─ div.activeFiltersRow (div.activeFilters: activeFilters, a named Chip Group the consumer
   │                           passes + Clear filters Button at the end)
   ├─ span.announcer (role=status, aria-live=polite; visually hidden; result and selection counts)
   ├─ div.scroll (role=region, tabIndex 0, border-block-start)
   │  └─ table.grid (data-resized, data-has-editable-cells; caption = visually-hidden name; aria-busy while loading)
   │     ├─ colgroup                                       [once a column is resized or a row selected]
   │     ├─ thead.thead > tr
   │     │   ├─ th.selectHeaderCell (Checkbox select-all)     [when selectable]
   │     │   └─ th.headerCell (scope=col, aria-sort, aria-labelledby → its span.headerLabel, or
   │     │        aria-label = headerLabel; sortable → button.sortButton label + sort arrow;
   │     │        span.resizeHandle role=separator, aria-valuenow/min/max, at the trailing edge  [when resizable])
   │     └─ tbody
   │        ├─ tr.row (data-selected)
   │        │  ├─ td.selectCell (Checkbox)                   [when selectable]
   │        │  └─ td.cell (data-align, data-emphasis, data-editable; render(row) or row[key])
   │        ├─ skeleton rows (each Skeleton placed by the column's align)  [when loading]
   │        └─ empty row (td.emptyCell colSpan) → `empty`, or div.emptyContainer
   │             (p.emptyLabel: emptyLabel, "No items to show"; transparent)  [when no rows]
   └─ div.footer (role=navigation)  [when more than one page, or itemsPerPageOptions]
      ├─ div.footerGroup: itemsPerPageLabel ("Items per page:") naming its Select [when itemsPerPageOptions], range text
      └─ div.footerGroup: page Select, page-count text, div.footerNav (previous / next Icon Buttons)
```

### Structure Notes
- A real, row-oriented `<table>`; Figma's column-oriented layout is expressed as the `columns` config.
- Header cells are `position: sticky` at the top of the scroll region; the row/header heights, the
  40px selection column, and the 280px search field are structural px (not token-gated).
- The table body wraps toolbar + grid + footer (no border or radius); the header sits above it with
  its own padding (block: 3xl/lg, inline: 2xl).

---

## Behaviour

- **Data-driven.** Renders from `columns` + `data`; a cell shows `column.render(row)` or `row[key]`.
- **Sorting.** Uncontrolled (`defaultSort`) or controlled (`sort` + `onSortChange`); cycles ascending
  → descending → unsorted. The built-in sort reorders `data` client-side unless `manualSort`.
- **Selection.** Checkbox-only (rows are never clickable). Uncontrolled (`defaultSelectedIds`) or
  controlled (`selectedIds` + `onSelectionChange`); the header select-all covers the visible
  (current-page) rows and goes indeterminate for a partial selection; it's disabled when no rows are
  visible. When one or more rows are selected, the selection bar (`div.selectionPill`: the count,
  then `bulkActions`) **replaces** the toolbar's button group (search, `toolbarActions`, `actions`).
  The column headers stay. The first selection freezes the column widths, as a resize does.
  Selection is kept by id across pages, sorts, and filters (decided 2026-10-20): Table never prunes
  `selectedIds` to the rows in `data`, so a row a filter now hides stays selected, the count includes
  it, and `bulkActions` act on every selected id. A bulk action's confirmation names the count it
  will act on (for example "Archive 12 matters?").
- **Hover.** Every row shows a `neutral-overlay-bold` hover (aids horizontal scanning), distinct from
  the brand-tinted selected state. A single row - or the last row when there's no pagination footer -
  drops its bottom divider.
- **Resizing.** Columns resize by default (`resizableColumns`): drag the header-edge separator or
  focus it and use ArrowLeft / ArrowRight. Hover shows a colour change on the handle; press/active
  extends it with 2px (--spacing-xxs) padding top and bottom. The first resize freezes every
  column's width (the grid becomes `table-layout: fixed`), so resizing one column doesn't reflow the
  others and the widths persist across page/data changes. A column is 64px at the least and the
  scroll region's width at the most; the handle reports its width (`aria-valuenow`) from the first
  render, with those bounds as `aria-valuemin` / `aria-valuemax`. Opt out with
  `resizableColumns={false}` or `column.resizable === false`.
- **Emphasis.** `column.emphasis='strong'` renders an identifier cell at the heading weight; other
  cells stay at the body weight.
- **Pagination.** Client-side when `pageSize` is set (Table slices + owns the page); server-driven
  when `manualPagination` (Table shows `pageCount` pages). The footer renders when there's more than
  one page or when `itemsPerPageOptions` is set, so choosing a page size that fits every row keeps
  the page-size Select. The range is the page's first row to its last: `(page - 1) * pageSize + 1` to
  that plus the rows shown, minus one, capped at the total (`0–0` with no rows). With
  `manualPagination`, pass `pageSize` and `totalItems`; without `pageSize` the rows passed count as one
  page. `onPageSizeChange` reports a pick; the consumer updates `pageSize`.
- **Page reset.** A new result set starts from the first page. With client-side paging and an
  uncontrolled page, Table goes back to page 1 when the rows in `data` become a different set of ids
  (`getRowId`): rows added or removed, as a search, filter, or delete does. Editing rows in place or
  reordering them keeps the page. A controlled `page` is never changed (the consumer sets it back to
  1 when the search or a filter changes), and neither is the page with `manualPagination`, where
  every page is a new set of rows. With the default index ids, a filter that keeps the row count
  isn't seen as a new set, so pass a real `getRowId`. (Before 2026-10-22 the page was only clamped
  to the page count.)
- **Search.** `searchable` renders a search Icon Button that expands into a 280px Text Field and
  focuses it; the field collapses on blur when the search text is empty, and its clear button shows
  only when it isn't. Table never filters `data`. The text is uncontrolled by default (Table keeps it;
  `defaultSearchValue` starts it, and the field starts open when that isn't empty) or controlled with
  `searchValue`; `onSearchChange` reports every change either way.
- **Announcements.** One visually hidden polite live region, never on the first render:
  - the result count, `getResultCountLabel(count)` ("No results", "1 result", "12 results"), when it
    changes, as after a search or a filter. The count is `totalItems`, or else `data.length`. It
    isn't tracked while `loading`, and the first count after a load that started out loading is
    taken silently;
  - while Table shows its own selection bar (`selectable`, no `toolbar`), `selectionCountLabel(count)`
    when the selected count changes, including to 0.
  If both change in one render, the result count is announced.
- **Built-in text.** Every piece of it is a prop with an English default, so it can be translated:
  `getPaginationLabel(tableName)` ("Members pagination", or "Table pagination" when the name isn't a
  string; `paginationLabel` gives it as is), `itemsPerPageLabel` (shown as given; the default "Items
  per page:" carries its colon), `getRangeLabel(start, end, total)`, `pageLabel`,
  `getPageCountLabel(pageCount)` ("of 1 page", "of 5 pages"), `previousPageLabel`, `nextPageLabel`,
  `getResizeLabel(columnLabel)`, `getSelectionLabel(row, index)` ("Select row"), `emptyLabel`,
  `getResultCountLabel(count)`, and `scrollRegionLabel`. `emptyHeadingLabel` (now `emptyLabel`) and
  `emptyDescriptionLabel` (shown under it) are deprecated and still accepted.
- **Column header names.** Each `th` is named by its label alone (`aria-labelledby` its label span, or
  `aria-label` = `headerLabel`), so the resize handle's name inside it isn't read as part of each
  cell's column. A sort button is named by the same label; the sort state is `aria-sort` on the `th`.
- **Toolbar.** Row 1: a right-aligned button group - search, then `toolbarActions` Icon Buttons,
  then `actions` - or the selection bar while rows are selected. Row 2: `activeFilters` (a Chip Group
  named with `aria-label`, such as "Active filters", holding Chip `mode="filter"` pills; Table lays it
  out but doesn't wrap it, so a consumer's group isn't nested in a second one) + a "Clear filters" Button
  (`clearFiltersLabel`; trailing edge, only when `onClearFilters` is provided). `toolbar` replaces
  both rows, including the selection bar. The scroll region's top border separates the toolbar from
  the grid.
- **States.** `loading` → skeleton rows + `aria-busy`, each Skeleton placed where its column's
  content sits (centered or at the end for `align: 'center'` / `'end'`); empty `data` → the `empty`
  slot. The default is one neutral statement, `emptyLabel` ("No items to show"), true whether nothing
  exists yet or a search found nothing, in `body/md` `content/subtle` on the table's own surface
  (transparent, as a passed Empty State is). Decided 2026-10-22; it replaced a "No results" heading
  over "There is nothing to show here yet." on the deep surface.

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
| Header cell background | `--color-elevation-surface-sunken-default` (Figma's header cell reads `elevation/surface/default`; see Design Reference) |
| Header cell text | `--color-content-subtle` (SemiBold) |
| Selection bar | background `--color-background-selected-default-default`, border `--border-width-sm` `--color-border-selected`, text `--color-content-selected`, radius `--border-radius-lg` |
| Toolbar / grid separator | `--border-width-sm` `--color-border-default` (border-block-start on the scroll region) |
| Cell text / description | `--color-content-default` / `--color-content-subtle` |
| Sort arrow (idle / active) | `--color-content-subtle` / `--color-content-default` |
| Resize handle divider | `--color-border-default` 1px → hover: `--color-border-bold` 1px (colour only); press/focus: `--color-border-bold` 1px + extends with `--spacing-xxs` inset |
| Row hover, all rows *(inferred - not in Figma)* | `--color-background-neutral-overlay-bold-hover` |
| Row selected / selected+hover *(inferred)* | `--color-background-brand-primary-subtle-default` / `-hover` |
| Row divider / header border | `--color-border-default` (dropped for a lone row, or the last row with no footer) |
| Empty cell padding | none; the default empty content pads itself (`--spacing-3xl` / `--spacing-xl`) and has no fill |
| Default empty text | `--typography-body-md-*`, `--color-content-subtle` |
| Focus ring | `--color-border-focus`, `--border-width-md` |
| Title (md / sm) / header cell / body cell type | `--typography-heading-lg-*` / `--typography-heading-md-*` / `--typography-heading-xs-*` / `--typography-body-md-*` |
| Header padding | block `--spacing-3xl` / `--spacing-lg`, inline `--spacing-2xl` |
| Heading gap | `--spacing-md` (12px) |
| Cell inline padding | `--spacing-sm` |
| Outer gutter (md / sm) | `--spacing-2xl` (24px) / `--spacing-lg` (16px) |
| Toolbar padding | block `--spacing-2xl` / `--spacing-sm`, inline `--spacing-2xl` (md); block `--spacing-lg` / `--spacing-sm`, inline `--spacing-lg` (sm) |
| Toolbar row gap | `--spacing-xs` |
| Search field width | 280px (max 100%) |
| Footer padding | block `--spacing-lg` (md) / `--spacing-sm` (sm), inline `--spacing-lg` |
| Header cell height (md / sm) | 40px / 32px |
| Row height (md / sm) | 64px / 40px |
| Selection column width | 40px |

---

## Design Decisions

- **The title is a section heading, and its size follows the table's size.** It labels a table among
  other content (a dashboard, a section of a page): `heading/lg` at `md`, `heading/md` at `sm`. A page
  that's only a table uses the page's own header and leaves the Table's title out, so the title never
  has to be the page's top heading. `headingLevel` sets only the outline. Decided with the owner
  2026-10-22.
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
- **The toolbar is a shell, not a filter engine.** It renders search + `toolbarActions` (filter /
  configure Icon Buttons) + `actions` + active-filter Chips + Clear filters; the filter menus and the
  filtering itself are consumer-supplied, since specific Status/Type filters do not generalise.
- **Reuses existing components; no new tokens.** Search (Text Field + Icon Button), selection
  (Checkbox), Clear filters (Button), loading (Skeleton), and the footer's Selects and Icon Buttons
  are existing components; colour/spacing/typography use existing semantic tokens.
- **No row groups (for now).** Grouped rows - a roadmap's stages, for example - are separate tables,
  each with its own scroll region (and tab stop) and its own `activeFilters`; Templates / Roadmap
  builds its stages this way. This is a designed boundary (a `knownLimitations` entry in the
  contract), not a gap, until the Roadmap designs land and show whether grouped rows need to be one
  table.

---

## Acceptance Criteria

- Renders a semantic `role="table"` named by `caption`/`title`; columns render `row[key]` by default
  or `column.render`.
- Sortable headers cycle asc/desc/none, set `aria-sort`, and reorder data client-side (unless
  `manualSort`, which only fires `onSortChange`).
- `selectable` adds a Checkbox column with a header select-all that goes indeterminate; selection is
  controllable.
- `pageSize` paginates client-side; `manualPagination` shows `pageCount` pages, with the range text
  placed by `page` and `pageSize`; the footer stays while there are page sizes to pick from.
- Search works uncontrolled (`defaultSearchValue`) or controlled (`searchValue`).
- Column headers are named by their label alone; resize handles report value, minimum, and maximum
  from the start; selection count changes are announced politely; `title` renders at `headingLevel`.
- `loading` shows skeleton rows + `aria-busy`, aligned like their columns; an empty data set shows
  the empty slot, by default "No items to show" on the table's surface.
- A changed result count is announced politely; an uncontrolled client-side page goes back to 1
  when the rows become a different set.
- Rows have no click behavior; selection is checkbox-only.
- Composes `className` + `data-size`; uses only semantic tokens; works in light and dark themes.
- Storybook includes Basic, Sortable, Selectable, Pagination, Sizes, WithToolbar, Loading, Empty, and
  FullShell.
- Tests cover render/default+custom cell, sort (client + manual), selection + select-all/indeterminate +
  checkbox-only, the selection bar and its announcement, resize handles and their values, column
  header names, emphasis, client and manual pagination ranges, the one-page footer, the page reset on
  a new result set (and a controlled page left alone), loading and skeleton alignment, empty and its
  deprecated label names, the result-count announcement, controlled and uncontrolled search, toolbar
  slots, built-in text props, heading level, and size/className.
