import type * as React from 'react';

/** Row density: `md` (larger, default) or `sm` (compact). */
export type TableSize = 'md' | 'sm';

export type SortDirection = 'asc' | 'desc';

/** Horizontal alignment of a column's header and cells. */
export type TableAlign = 'start' | 'center' | 'end';

/** The heading level of the table's `title`: `h1` to `h6`. */
export type TableHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** A row's stable identity - the value returned by `getRowId`. */
export type RowId = string | number;

export interface TableSort {
  /** The `key` of the sorted column. */
  columnKey: string;
  /** `asc` or `desc`. */
  direction: SortDirection;
}

export interface TableColumn<Row> {
  /**
   * Unique column id. Doubles as the default data accessor: when no `render` is given, the cell shows
   * `row[key]`. Used to identify the column in sort state.
   */
  key: string;
  /** The header label. Plain text unless you also pass `headerLabel` for the accessible name. */
  header: React.ReactNode;
  /**
   * Renders the cell body from the row. Defaults to `String(row[key])`. Compose any content here -
   * Tag, Avatar, Link, Button, etc. - Table does not ship a cell-per-content-type.
   */
  render?: (row: Row, rowIndex: number) => React.ReactNode;
  /** Full-cell inline editor styling for InlineEdit/TextField, Select, DatePicker, or TimePicker.
   * The consumer still owns values and commits through `render`; Table supplies density and styling.
   */
  cellAppearance?: 'default' | 'editable';
  /** Show a sort control on this column's header and let it participate in sorting. */
  sortable?: boolean;
  /** Header + cell alignment. Default `start`. Use `end` for numeric columns. */
  align?: TableAlign;
  /** Fixed column width (number = px). */
  width?: number | string;
  /** Minimum column width (number = px). */
  minWidth?: number | string;
  /** Allow dragging this column's header edge to resize it. Default true (when `resizableColumns`). */
  resizable?: boolean;
  /**
   * Cell text weight: `strong` (a heading weight) for an identifier column, `default` (a body weight)
   * for any other column. Follows the same identifier-vs-else rule as Link's `emphasis`.
   */
  emphasis?: 'strong' | 'default';
  /**
   * Names the column when `header` is not plain text: its header cell, its sort button, and its resize
   * handle. Defaults to `header` when it's a string, else `key`.
   */
  headerLabel?: string;
  /**
   * The value the built-in client-side sort compares (defaults to `row[key]`). Ignored when
   * `manualSort` is set (the consumer sorts server-side).
   */
  sortValue?: (row: Row) => string | number | boolean | null | undefined;
  /** Extra class on this column's `<td>` cells. */
  className?: string;
  /** Extra class on this column's `<th>`. */
  headerClassName?: string;
}

export interface TableProps<Row> {
  /** Column definitions, left to right. Each is a `TableColumn`: see Columns below. */
  columns: Array<TableColumn<Row>>;
  /** The row data. Sorting and pagination are applied to this array, unless `manualSort` or `manualPagination` is set. */
  data: Row[];
  /** Returns a stable id per row, for selection and React keys. Defaults to the row's index in `data`, which changes when `data` is filtered or reordered, so pass a real id. */
  getRowId?: (row: Row, index: number) => RowId;
  /** Row density and title size: `md` (64px rows, a `heading/lg` title) or `sm` (40px rows, a `heading/md` title). */
  size?: TableSize;
  /**
   * The table's accessible name, rendered as a visually hidden `<caption>`. Falls back to `title`. A
   * string also names the scroll region (else `scrollRegionLabel`). Always give the table a name with one of these.
   */
  caption?: React.ReactNode;

  // --- Header region ---
  /**
   * The title above the table: a section heading that labels this table among other content. Its size
   * follows `size`, not `headingLevel`. On a page that's only a table, leave it out and let the page's
   * header name the page. Also names the table when there's no `caption`.
   */
  title?: React.ReactNode;
  /** The heading level of `title`, 1 to 6, to fit the page's outline. Only the outline: the size follows `size`. Defaults to 2. */
  headingLevel?: TableHeadingLevel;
  /** Supporting text below the title. */
  description?: React.ReactNode;
  /** Actions such as a primary Button, at the end of the toolbar's button group, after `toolbarActions`. Hidden while rows are selected. */
  actions?: React.ReactNode;

  // --- Toolbar region ---
  /** Replaces the whole built-in toolbar: search, `toolbarActions`, `actions`, active filters, and the selection bar. */
  toolbar?: React.ReactNode;
  /** Shows the search Icon Button, which opens a search field. Table doesn't filter `data`: filter it yourself in `onSearchChange`. */
  searchable?: boolean;
  /** The search text, controlled. Pass it with `onSearchChange`. Without it, Table keeps the text itself. */
  searchValue?: string;
  /** The search text to start with, when `searchValue` isn't controlled. The field starts open when it isn't empty. */
  defaultSearchValue?: string;
  /** Called with the new search text as the person types, and with an empty string when they clear it. */
  onSearchChange?: (value: string) => void;
  /** The search field's placeholder. Defaults to "Search...". Not used as its accessible name. */
  searchPlaceholder?: string;
  /** Accessible name for the search field and the Icon Button that opens it. Defaults to "Search". */
  searchLabel?: string;
  /** Accessible name for the search field's clear button. Defaults to "Clear search". */
  clearSearchLabel?: string;
  /**
   * Toolbar actions after the search, typically a filter Icon Button that opens a Dropdown Menu and a
   * configure Icon Button. Table lays them out; you own the buttons and what they open. Hidden while
   * rows are selected.
   */
  toolbarActions?: React.ReactNode;
  /**
   * The applied filters, in a row below the toolbar's buttons. Pass a Chip Group named with
   * `aria-label` (such as "Active filters") holding Chip `mode="filter"` components, so the filters are
   * announced as a set and focus stays in the group when one is removed. Table lays the row out but
   * doesn't wrap it in a group. You render and control the chips.
   */
  activeFilters?: React.ReactNode;
  /** When set, shows a Clear filters button at the end of the active-filters row, which calls it. */
  onClearFilters?: () => void;
  /** The Clear filters button's text. Defaults to "Clear filters". */
  clearFiltersLabel?: string;

  // --- Sorting ---
  /** The current sort, controlled. Pass it with `onSortChange`; `null` is unsorted. */
  sort?: TableSort | null;
  /** The sort to start with, when `sort` isn't controlled. */
  defaultSort?: TableSort | null;
  /** Called with the next sort when a sortable header is pressed: ascending, then descending, then `null`. */
  onSortChange?: (sort: TableSort | null) => void;
  /** You sort on the server: Table shows the sort state and calls `onSortChange`, but doesn't reorder `data`. */
  manualSort?: boolean;

  // --- Selection (multi-select) ---
  /** Adds a leading column of selection Checkboxes, with a select-all Checkbox in its header. */
  selectable?: boolean;
  /** The selected row ids, controlled. Pass them with `onSelectionChange`. */
  selectedIds?: RowId[];
  /** The selection to start with, when `selectedIds` isn't controlled. */
  defaultSelectedIds?: RowId[];
  /** Called with every selected row id when a selection Checkbox changes. */
  onSelectionChange?: (ids: RowId[]) => void;
  /** Accessible name for the header's select-all Checkbox. Defaults to "Select all rows". */
  selectionColumnLabel?: string;
  /**
   * Accessible name for a row's selection Checkbox, from the row, such as "Select Ada Lovelace".
   * Defaults to "Select row" for every row, so pass it.
   */
  getSelectionLabel?: (row: Row, index: number) => string;
  /**
   * Bulk actions shown on the right of the selection bar when one or more rows are selected
   * (typically Buttons). The count of selected rows is shown on the left.
   */
  bulkActions?: React.ReactNode;
  /** Formats the selection bar's count, which is also announced politely when it changes. Defaults to "2 selected". */
  selectionCountLabel?: (count: number) => string;

  // --- Pagination ---
  /**
   * The current page, counting from 1, controlled. Pass it with `onPageChange`, and set it back to 1
   * yourself when a search or filter changes `data`. Without it, Table keeps the page, and goes back to
   * the first page when the rows in `data` become a different set.
   */
  page?: number;
  /** The number of pages, for `manualPagination`. */
  pageCount?: number;
  /** Called with the page the person moves to from the footer. */
  onPageChange?: (page: number) => void;
  /**
   * Rows per page. Turns on client-side pagination unless `manualPagination` is set, and sets the footer's
   * page-size Select. With `manualPagination`, it places the range text; without it, the rows passed
   * count as one page.
   */
  pageSize?: number;
  /** You paginate on the server: Table doesn't slice `data`, and shows `pageCount` pages. */
  manualPagination?: boolean;
  /** Accessible name for the footer's previous-page button. Defaults to "Previous page". */
  previousPageLabel?: string;
  /** Accessible name for the footer's next-page button. Defaults to "Next page". */
  nextPageLabel?: string;
  /** Accessible name for the footer's navigation region, as given. Wins over `getPaginationLabel`. */
  paginationLabel?: string;
  /**
   * Accessible name for the footer's navigation region, from the table's name (a string `caption` or
   * `title`), when `paginationLabel` isn't set. Defaults to "Members pagination", or "Table
   * pagination" when the table's name isn't a string.
   */
  getPaginationLabel?: (tableName: string | undefined) => string;
  /** The footer's page-size label, shown as given, which also names its Select. Defaults to "Items per page:". */
  itemsPerPageLabel?: string;
  /**
   * The footer's range text, from the first and last row shown and the total. Defaults to
   * "11–20 of 42 items", or "0–0 of 0 items" with no rows.
   */
  getRangeLabel?: (start: number, end: number, total: number) => string;
  /** Accessible name for the footer's page Select. Defaults to "Page". */
  pageLabel?: string;
  /** The text after the page Select. Defaults to "of 5 pages", or "of 1 page". */
  getPageCountLabel?: (pageCount: number) => string;

  // --- Footer ---
  /**
   * Total number of items, for the footer's range text. Defaults to the number of rows in `data`, so pass
   * it with `manualPagination`.
   */
  totalItems?: number;
  /**
   * The page sizes the footer's "Items per page" Select offers. The Select shows only when this is set,
   * and keeps the footer shown when every row fits on one page, so the person can pick a smaller size.
   */
  itemsPerPageOptions?: number[];
  /** Called with the new page size when the person picks one in the footer. */
  onPageSizeChange?: (pageSize: number) => void;

  // --- Columns ---
  /** Lets people resize columns by dragging a header's trailing edge, or with the Arrow keys on its handle. */
  resizableColumns?: boolean;
  /** Accessible name for a column's resize handle, from the column's name. Defaults to "Resize Name". */
  getResizeLabel?: (columnLabel: string) => string;

  // --- States ---
  /** Shows skeleton rows instead of data, and sets `aria-busy` on the table. */
  loading?: boolean;
  /** How many skeleton rows to show while `loading`. */
  skeletonRowCount?: number;
  /**
   * Content shown when there are no rows, such as an Empty State that says why and what to do next.
   * Defaults to `emptyLabel`.
   */
  empty?: React.ReactNode;
  /**
   * The text shown when there are no rows and `empty` isn't set: one statement, true whether nothing
   * exists yet or a search found nothing. Defaults to "No items to show".
   */
  emptyLabel?: string;
  /** @deprecated Renamed to `emptyLabel`: the default empty content is one statement, not a heading. Still accepted. */
  emptyHeadingLabel?: string;
  /**
   * @deprecated The default empty content is one statement, `emptyLabel`. Still accepted, and shown
   * under it; for a heading and a description, pass an Empty State as `empty`.
   */
  emptyDescriptionLabel?: string;
  /**
   * The result count, announced politely when it changes after the first render, such as after a
   * search or a filter: `totalItems`, or else the number of rows in `data`. Not announced while
   * `loading`. Defaults to "No results", "1 result", or "12 results".
   */
  getResultCountLabel?: (count: number) => string;
  /** Accessible name for the scroll region around the table when neither `caption` nor `title` is a string. Defaults to "Table". */
  scrollRegionLabel?: string;

  /** Added to the root element's classes. */
  className?: string;
  /** The root element's `id`. */
  id?: string;
}
