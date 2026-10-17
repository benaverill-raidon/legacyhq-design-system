import type * as React from 'react';

/** Row density: `md` (larger, default) or `sm` (compact). */
export type TableSize = 'md' | 'sm';

export type SortDirection = 'asc' | 'desc';

/** Horizontal alignment of a column's header and cells. */
export type TableAlign = 'start' | 'center' | 'end';

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
  /** Names the column in its sort button and resize handle when `header` is not plain text. Defaults to `header` when it's a string, else `key`. */
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
  /** Row density: `md` (64px rows) or `sm` (40px rows). */
  size?: TableSize;
  /**
   * The table's accessible name, rendered as a visually hidden `<caption>`. Falls back to `title`. A
   * string also names the scroll region. Always give the table a name with one of these.
   */
  caption?: React.ReactNode;

  // --- Header region ---
  /** The title above the table, rendered as an `h2`. Also names the table when there's no `caption`. */
  title?: React.ReactNode;
  /** Supporting text below the title. */
  description?: React.ReactNode;
  /** Actions such as a primary Button, at the end of the toolbar's button group, after `toolbarActions`. Hidden while rows are selected. */
  actions?: React.ReactNode;

  // --- Toolbar region ---
  /** Replaces the whole built-in toolbar: search, `toolbarActions`, `actions`, active filters, and the selection bar. */
  toolbar?: React.ReactNode;
  /** Shows the search Icon Button, which opens a search field. Table doesn't filter `data`: filter it yourself in `onSearchChange`. */
  searchable?: boolean;
  /** The search text. Pass it with `onSearchChange`: the field's clear button, and whether it stays open when it loses focus, depend on it. */
  searchValue?: string;
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
   * The applied filters, in a row below the toolbar's buttons: Chip `mode="filter"` components and an
   * optional Icon Button to add one. You render and control the chips.
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
  /** Accessible name for a row's selection Checkbox, such as "Select Ada Lovelace". Defaults to "Select row" for every row. */
  getSelectionLabel?: (row: Row, index: number) => string;
  /**
   * Bulk actions shown on the right of the selection bar when one or more rows are selected
   * (typically Buttons). The count of selected rows is shown on the left.
   */
  bulkActions?: React.ReactNode;
  /** Formats the selection bar's count. Defaults to "2 selected". */
  selectionCountLabel?: (count: number) => string;

  // --- Pagination ---
  /** The current page, counting from 1, controlled. Pass it with `onPageChange`. */
  page?: number;
  /** The number of pages, for `manualPagination`. */
  pageCount?: number;
  /** Called with the page the person moves to from the footer. */
  onPageChange?: (page: number) => void;
  /** Rows per page. Turns on client-side pagination unless `manualPagination` is set, and sets the footer's page-size Select. */
  pageSize?: number;
  /** You paginate on the server: Table doesn't slice `data`, and shows `pageCount` pages. */
  manualPagination?: boolean;
  /** Accessible name for the footer's previous-page button. Defaults to "Previous page". */
  previousPageLabel?: string;
  /** Accessible name for the footer's next-page button. Defaults to "Next page". */
  nextPageLabel?: string;
  /** Accessible name for the footer's navigation region. Defaults to "<name> pagination", or "Table pagination". */
  paginationLabel?: string;
  /** The footer's page-size label and its Select's accessible name. Defaults to "Items per page". */
  itemsPerPageLabel?: string;
  /** The footer's range text. Defaults to "1–10 of 42 items". */
  getRangeLabel?: (start: number, end: number, total: number) => string;
  /** Accessible name for the footer's page Select. Defaults to "Page". */
  pageLabel?: string;
  /** The text after the page Select. Defaults to "of 5 pages". */
  getPageCountLabel?: (pageCount: number) => string;

  // --- Footer ---
  /** Total number of items, for the footer's range text. Defaults to the number of rows. */
  totalItems?: number;
  /** The page sizes the footer's "Items per page" Select offers. The Select shows only when this is set. */
  itemsPerPageOptions?: number[];
  /** Called with the new page size when the person picks one in the footer. */
  onPageSizeChange?: (pageSize: number) => void;

  // --- Columns ---
  /** Lets people resize columns by dragging a header's trailing edge, or with the Arrow keys on its handle. */
  resizableColumns?: boolean;

  // --- States ---
  /** Shows skeleton rows instead of data, and sets `aria-busy` on the table. */
  loading?: boolean;
  /** How many skeleton rows to show while `loading`. */
  skeletonRowCount?: number;
  /** Content shown when there are no rows. Defaults to a "No results" heading and description. */
  empty?: React.ReactNode;

  /** Added to the root element's classes. */
  className?: string;
  /** The root element's `id`. */
  id?: string;
}
