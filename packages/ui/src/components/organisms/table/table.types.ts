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
  /** Accessible label for the column when `header` is not plain text (used by the sort button). */
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
  /** Column definitions, left to right. */
  columns: Array<TableColumn<Row>>;
  /** The row data. Sorting/pagination are applied to this array (unless `manual*` is set). */
  data: Row[];
  /** Stable id per row (for selection + React keys). Defaults to the row index. */
  getRowId?: (row: Row, index: number) => RowId;
  /** Row density. Default `md`. */
  size?: TableSize;
  /**
   * Accessible name for the `<table>`, rendered as a visually-hidden `<caption>`. Falls back to
   * `title`. Always give the table a name via one of these.
   */
  caption?: React.ReactNode;

  // --- Header region ---
  /** Table title (heading), shown above the table. */
  title?: React.ReactNode;
  /** Supporting description below the title. */
  description?: React.ReactNode;
  /** Right-aligned header actions (typically Buttons + an overflow Icon Button). */
  actions?: React.ReactNode;

  // --- Toolbar region ---
  /** Replaces the entire built-in toolbar (search + filters + clear + active filters) with your own. */
  toolbar?: React.ReactNode;
  /** Show the built-in search field. */
  searchable?: boolean;
  /** Controlled search value. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /**
   * Right-aligned toolbar actions beside the search field — typically the filter Icon Button (opens a
   * filter dropdown menu) and the configure Icon Button (opens a settings popover). The Table
   * renders the layout; the consumer owns the buttons and their dropdown/popover content.
   */
  toolbarActions?: React.ReactNode;
  /**
   * Applied filter chips rendered below the search row. Pass Chip `mode="filter"` components and
   * an optional "+" IconButton to add more filters. The consumer renders the chips directly so
   * filter-chip segments (operator, value, remove) stay fully controlled.
   */
  activeFilters?: React.ReactNode;
  /** When provided, renders a "Clear filters" action at the trailing edge of the chip row. */
  onClearFilters?: () => void;
  clearFiltersLabel?: string;

  // --- Sorting ---
  /** Controlled sort. Pair with `onSortChange`. */
  sort?: TableSort | null;
  /** Initial sort for the uncontrolled case. */
  defaultSort?: TableSort | null;
  onSortChange?: (sort: TableSort | null) => void;
  /** The consumer sorts server-side; Table reflects sort state but does not reorder `data`. */
  manualSort?: boolean;

  // --- Selection (multi-select) ---
  /** Enable the leading selection checkbox column with a header select-all. */
  selectable?: boolean;
  /** Controlled selected row ids. Pair with `onSelectionChange`. */
  selectedIds?: RowId[];
  /** Initial selection for the uncontrolled case. */
  defaultSelectedIds?: RowId[];
  onSelectionChange?: (ids: RowId[]) => void;
  /** Accessible label for the header select-all checkbox. Default "Select all rows". */
  selectionColumnLabel?: string;
  /** Accessible label for a row's selection checkbox. Default "Select row". */
  getSelectionLabel?: (row: Row, index: number) => string;
  /**
   * Bulk actions shown on the right of the selection bar when one or more rows are selected
   * (typically Buttons). The count of selected rows is shown on the left.
   */
  bulkActions?: React.ReactNode;
  /** Formats the selection-bar count label. Default `(n) => `${n} selected``. */
  selectionCountLabel?: (count: number) => string;

  // --- Pagination ---
  /** Controlled current page (1-based). */
  page?: number;
  /** Total page count (required for `manualPagination`). */
  pageCount?: number;
  onPageChange?: (page: number) => void;
  /** Rows per page. Enables client-side pagination when `manualPagination` is not set. */
  pageSize?: number;
  /** The consumer paginates server-side; Table does not slice `data` and shows `pageCount` pages. */
  manualPagination?: boolean;

  // --- Footer ---
  /** Total number of items (used in the footer's "X–Y of Z items" label). */
  totalItems?: number;
  /** Available page-size options shown in the "Items per page" dropdown. */
  itemsPerPageOptions?: number[];
  /** Called when the user picks a different page size from the footer dropdown. */
  onPageSizeChange?: (pageSize: number) => void;

  // --- Columns ---
  /** Allow dragging column-header edges to resize columns. Default true. */
  resizableColumns?: boolean;

  // --- States ---
  /** Show skeleton placeholder rows instead of data. */
  loading?: boolean;
  /** Skeleton row count while `loading`. Default 5. */
  skeletonRowCount?: number;
  /** Content shown when there are no rows. Defaults to a simple Empty State. */
  empty?: React.ReactNode;

  /** Composes with the root element's class list. */
  className?: string;
  id?: string;
}
