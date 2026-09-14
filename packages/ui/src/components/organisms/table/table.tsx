import * as React from 'react';
import { ArrowDownIcon, ArrowUpIcon, SearchIcon } from '../../../assets/icons';
import { Button } from '../../atoms/button';
import { Checkbox } from '../../atoms/checkbox';
import { Pagination } from '../../molecules/pagination';
import { Skeleton } from '../../molecules/skeleton';
import { TextField } from '../../molecules/text-field';
import { EmptyState } from '../empty-state';
import styles from './table.module.css';
import type { RowId, TableProps, TableSort } from './table.types';

function cx(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/** Comparator for the built-in client-side sort: nulls last, numbers numerically, else locale text. */
function defaultCompare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? 1 : -1;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function accessibleString(...values: React.ReactNode[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') return value;
  }
  return undefined;
}

export function Table<Row>({
  columns,
  data,
  getRowId = (_row, index) => index,
  size = 'md',
  caption,
  title,
  description,
  actions,
  toolbar,
  searchable = false,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  toolbarActions,
  activeFilters,
  onClearFilters,
  clearFiltersLabel = 'Clear all filters',
  sort,
  defaultSort = null,
  onSortChange,
  manualSort = false,
  selectable = false,
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  selectionColumnLabel = 'Select all rows',
  getSelectionLabel,
  bulkActions,
  selectionCountLabel = (count) => `${count} selected`,
  page,
  pageCount,
  onPageChange,
  pageSize,
  manualPagination = false,
  resizableColumns = true,
  loading = false,
  skeletonRowCount = 5,
  empty,
  className,
  id,
}: TableProps<Row>) {
  const [internalSort, setInternalSort] = React.useState<TableSort | null>(defaultSort);
  const [internalSelected, setInternalSelected] = React.useState<RowId[]>(defaultSelectedIds);
  const [internalPage, setInternalPage] = React.useState(1);
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});
  const resizeRef = React.useRef<{ key: string; startX: number; startWidth: number } | null>(null);
  const headerCellRefs = React.useRef<Map<string, HTMLTableCellElement>>(new Map());

  const currentSort = sort !== undefined ? sort : internalSort;
  const currentSelectedIds = selectedIds !== undefined ? selectedIds : internalSelected;

  const rows = React.useMemo(
    () => data.map((row, index) => ({ row, index, id: getRowId(row, index) })),
    [data, getRowId],
  );

  const sortedRows = React.useMemo(() => {
    if (manualSort || !currentSort) return rows;
    const column = columns.find((c) => c.key === currentSort.columnKey);
    if (!column) return rows;
    const accessor = column.sortValue ?? ((row: Row) => (row as Record<string, unknown>)[column.key]);
    const direction = currentSort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => defaultCompare(accessor(a.row), accessor(b.row)) * direction);
  }, [rows, columns, currentSort, manualSort]);

  const clientPaginated = !manualPagination && pageSize != null;
  const resolvedPageCount = manualPagination
    ? Math.max(1, pageCount ?? 1)
    : clientPaginated
      ? Math.max(1, Math.ceil(sortedRows.length / pageSize))
      : 1;

  const requestedPage = page ?? internalPage;
  const currentPage = Math.min(Math.max(1, requestedPage), resolvedPageCount);

  const visibleRows = clientPaginated
    ? sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedRows;

  const showPagination = manualPagination ? (pageCount ?? 0) > 1 : clientPaginated && resolvedPageCount > 1;

  const selectedSet = React.useMemo(() => new Set(currentSelectedIds), [currentSelectedIds]);
  const visibleIds = visibleRows.map((r) => r.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((rid) => selectedSet.has(rid));
  const someVisibleSelected = visibleIds.some((rid) => selectedSet.has(rid));

  const commitSelection = (next: RowId[]) => {
    if (selectedIds === undefined) setInternalSelected(next);
    onSelectionChange?.(next);
  };

  const toggleAll = (checked: boolean) => {
    const next = new Set(currentSelectedIds);
    for (const rid of visibleIds) {
      if (checked) next.add(rid);
      else next.delete(rid);
    }
    commitSelection([...next]);
  };

  const toggleRow = (rid: RowId, checked: boolean) => {
    const next = new Set(currentSelectedIds);
    if (checked) next.add(rid);
    else next.delete(rid);
    commitSelection([...next]);
  };

  const handleSort = (columnKey: string) => {
    let next: TableSort | null;
    if (!currentSort || currentSort.columnKey !== columnKey) next = { columnKey, direction: 'asc' };
    else if (currentSort.direction === 'asc') next = { columnKey, direction: 'desc' };
    else next = null;
    if (sort === undefined) setInternalSort(next);
    onSortChange?.(next);
  };

  const handlePageChange = (nextPage: number) => {
    if (page === undefined) setInternalPage(nextPage);
    onPageChange?.(nextPage);
  };

  // Column resize via a pointer-captured drag handle on the header edge (plus arrow-key nudges).
  const MIN_COLUMN_WIDTH = 64;
  const RESIZE_STEP = 16;
  const currentWidth = (key: string) =>
    columnWidths[key] ?? headerCellRefs.current.get(key)?.getBoundingClientRect().width ?? MIN_COLUMN_WIDTH;

  const freezeColumnWidths = () => {
    setColumnWidths((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const frozen: Record<string, number> = {};
      for (const col of columns) {
        const el = headerCellRefs.current.get(col.key);
        if (el) frozen[col.key] = Math.round(el.getBoundingClientRect().width);
      }
      return frozen;
    });
  };

  const startResize = (key: string) => (event: React.PointerEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const startWidth = currentWidth(key);
    freezeColumnWidths();
    resizeRef.current = { key, startX: event.clientX, startWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveResize = (event: React.PointerEvent<HTMLSpanElement>) => {
    const active = resizeRef.current;
    if (!active) return;
    const next = Math.max(MIN_COLUMN_WIDTH, active.startWidth + (event.clientX - active.startX));
    setColumnWidths((prev) => ({ ...prev, [active.key]: Math.round(next) }));
  };
  const endResize = (event: React.PointerEvent<HTMLSpanElement>) => {
    resizeRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const nudgeResize = (key: string, event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const base = currentWidth(key);
    const delta = event.key === 'ArrowRight' ? RESIZE_STEP : -RESIZE_STEP;
    freezeColumnWidths();
    setColumnWidths((prev) => ({ ...prev, [key]: Math.max(MIN_COLUMN_WIDTH, Math.round(base + delta)) }));
  };

  const hasResized = Object.keys(columnWidths).length > 0;

  const columnCount = columns.length + (selectable ? 1 : 0);
  const selectedCount = currentSelectedIds.length;
  const name = accessibleString(caption, title);
  const captionContent = caption ?? title;

  const hasHeader = title != null || description != null || actions != null;
  const hasBuiltInToolbar = searchable || toolbarActions != null || onClearFilters != null;
  const hasActiveFilters = activeFilters != null;
  const hasToolbar = toolbar != null || hasBuiltInToolbar || hasActiveFilters;

  return (
    <div className={cx(styles.table, className)} data-size={size} id={id}>
      {hasHeader ? (
        <div className={styles.header}>
          <div className={styles.headingArea}>
            {title != null ? <h2 className={styles.title}>{title}</h2> : null}
            {description != null ? <p className={styles.description}>{description}</p> : null}
          </div>
          {actions != null ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      ) : null}

      <div className={styles.tableBody} data-has-footer={showPagination || undefined}>
        {hasToolbar ? (
          <div className={styles.toolbar}>
            {toolbar ?? (
              <>
                <div className={styles.toolbarControls}>
                  {searchable ? (
                    <TextField
                      type="search"
                      size={size === 'sm' ? 'sm' : 'md'}
                      className={styles.search}
                      iconBefore={<SearchIcon />}
                      placeholder={searchPlaceholder}
                      aria-label={searchPlaceholder}
                      value={searchValue}
                      onChange={(event) => onSearchChange?.(event.currentTarget.value)}
                    />
                  ) : null}
                  {toolbarActions != null ? (
                    <div className={styles.toolbarActions}>{toolbarActions}</div>
                  ) : null}
                </div>
                {hasActiveFilters || onClearFilters != null ? (
                  <div className={styles.activeFiltersRow}>
                    {hasActiveFilters ? (
                      <div className={styles.activeFilters}>{activeFilters}</div>
                    ) : null}
                    {onClearFilters != null ? (
                      <Button appearance="subtle" size="sm" onClick={onClearFilters}>
                        {clearFiltersLabel}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div className={styles.scroll} role="region" aria-label={name ?? 'Table'} tabIndex={0}>
          <table className={styles.grid} aria-busy={loading || undefined} data-resized={hasResized || undefined}>
            {captionContent != null ? <caption className={styles.caption}>{captionContent}</caption> : null}
            <thead className={styles.thead}>
              {selectable && selectedCount > 0 ? (
                <tr className={styles.selectionRow}>
                  <th scope="col" className={styles.selectHeaderCell}>
                    <Checkbox
                      checked={allVisibleSelected}
                      indeterminate={someVisibleSelected && !allVisibleSelected}
                      onCheckedChange={toggleAll}
                      disabled={visibleRows.length === 0}
                      aria-label={selectionColumnLabel}
                    />
                  </th>
                  <th scope="col" colSpan={columns.length} className={styles.selectionHeaderCell}>
                    <div className={styles.selectionBar}>
                      <span className={styles.selectionCount}>{selectionCountLabel(selectedCount)}</span>
                      {bulkActions != null ? <div className={styles.bulkActions}>{bulkActions}</div> : null}
                    </div>
                  </th>
                </tr>
              ) : (
                <tr>
                  {selectable ? (
                    <th scope="col" className={styles.selectHeaderCell}>
                      <Checkbox
                        checked={allVisibleSelected}
                        indeterminate={someVisibleSelected && !allVisibleSelected}
                        onCheckedChange={toggleAll}
                        disabled={visibleRows.length === 0}
                        aria-label={selectionColumnLabel}
                      />
                    </th>
                  ) : null}
                  {columns.map((column) => {
                  const isActive = currentSort?.columnKey === column.key;
                  const ariaSort = isActive
                    ? currentSort!.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : column.sortable
                      ? 'none'
                      : undefined;
                  const label = column.headerLabel ?? (typeof column.header === 'string' ? column.header : column.key);
                  const isResizable = resizableColumns && column.resizable !== false;
                  return (
                    <th
                      key={column.key}
                      ref={(el) => {
                        const map = headerCellRefs.current;
                        if (el) map.set(column.key, el);
                        else map.delete(column.key);
                      }}
                      scope="col"
                      aria-sort={ariaSort}
                      className={cx(styles.headerCell, column.headerClassName)}
                      data-align={column.align}
                      data-resizable={isResizable || undefined}
                      style={{ width: columnWidths[column.key] ?? column.width, minWidth: column.minWidth }}
                    >
                      {column.sortable ? (
                        <button
                          type="button"
                          className={styles.sortButton}
                          onClick={() => handleSort(column.key)}
                          data-active={isActive || undefined}
                          aria-label={`Sort by ${label}`}
                        >
                          <span className={styles.headerLabel}>{column.header}</span>
                          <span className={styles.sortIcon} aria-hidden="true">
                            {isActive && currentSort!.direction === 'asc' ? (
                              <ArrowUpIcon size="sm" />
                            ) : (
                              <ArrowDownIcon size="sm" />
                            )}
                          </span>
                        </button>
                      ) : (
                        <span className={styles.headerLabel}>{column.header}</span>
                      )}
                      {isResizable ? (
                        /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
                        <span
                          className={styles.resizeHandle}
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize ${label}`}
                          aria-valuenow={columnWidths[column.key]}
                          aria-valuemin={MIN_COLUMN_WIDTH}
                          tabIndex={0}
                          onPointerDown={startResize(column.key)}
                          onPointerMove={moveResize}
                          onPointerUp={endResize}
                          onKeyDown={(event) => nudgeResize(column.key, event)}
                        />
                      ) : /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
                      null}
                    </th>
                  );
                })}
                </tr>
              )}
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`} className={styles.row}>
                    {selectable ? (
                      <td className={styles.selectCell}>
                        <Skeleton shape="rectangle" className={styles.skeletonCheckbox} />
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td key={column.key} className={styles.cell} data-align={column.align}>
                        <Skeleton className={styles.skeletonText} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className={styles.emptyCell}>
                    {empty ?? (
                      <EmptyState type="informative" heading="No results">
                        There is nothing to show here yet.
                      </EmptyState>
                    )}
                  </td>
                </tr>
              ) : (
                visibleRows.map(({ row, index, id: rowId }) => {
                  const isSelected = selectedSet.has(rowId);
                  return (
                    <tr key={rowId} className={styles.row} data-selected={isSelected || undefined}>
                      {selectable ? (
                        <td className={styles.selectCell}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => toggleRow(rowId, checked)}
                            aria-label={getSelectionLabel?.(row, index) ?? 'Select row'}
                          />
                        </td>
                      ) : null}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cx(styles.cell, column.className)}
                          data-align={column.align}
                          data-emphasis={column.emphasis}
                        >
                          {column.render
                            ? column.render(row, index)
                            : String((row as Record<string, unknown>)[column.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {showPagination ? (
          <div className={styles.footer}>
            <Pagination
              currentPage={currentPage}
              totalPages={resolvedPageCount}
              onPageChange={handlePageChange}
              ariaLabel={name ? `${name} pagination` : 'Table pagination'}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

Table.displayName = 'Table';
