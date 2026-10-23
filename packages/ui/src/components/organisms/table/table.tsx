import * as React from 'react';
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, SearchIcon } from '../../../assets/icons';
import { Button } from '../../atoms/button';
import { Checkbox } from '../../atoms/checkbox';
import { IconButton } from '../../atoms/icon-button';
import { Select } from '../../molecules/select';
import { Skeleton } from '../../molecules/skeleton';
import { TextField } from '../../molecules/text-field';
import { EditableCellContext } from '../../primitives/editable-cell-context';
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

/** Whether two lists hold the same row ids, in any order. */
function sameRowIds(a: RowId[], b: RowId[]): boolean {
  if (a.length !== b.length) return false;
  const ids = new Set(a);
  return b.every((rid) => ids.has(rid));
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
  headingLevel = 2,
  description,
  actions,
  toolbar,
  searchable = false,
  searchValue,
  defaultSearchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchLabel = 'Search',
  clearSearchLabel = 'Clear search',
  toolbarActions,
  activeFilters,
  onClearFilters,
  clearFiltersLabel = 'Clear filters',
  sort,
  defaultSort = null,
  onSortChange,
  manualSort = false,
  selectable = false,
  selectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  selectionColumnLabel = 'Select all rows',
  getSelectionLabel = () => 'Select row',
  bulkActions,
  selectionCountLabel = (count) => `${count} selected`,
  page,
  pageCount,
  onPageChange,
  pageSize,
  manualPagination = false,
  previousPageLabel = 'Previous page',
  nextPageLabel = 'Next page',
  paginationLabel,
  getPaginationLabel = (tableName) => (tableName ? `${tableName} pagination` : 'Table pagination'),
  itemsPerPageLabel = 'Items per page:',
  getRangeLabel = (start, end, total) =>
    `${start.toLocaleString()}–${end.toLocaleString()} of ${total.toLocaleString()} items`,
  pageLabel = 'Page',
  getPageCountLabel = (pageCount) => `of ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`,
  totalItems,
  itemsPerPageOptions,
  onPageSizeChange,
  resizableColumns = true,
  getResizeLabel = (columnLabel) => `Resize ${columnLabel}`,
  loading = false,
  skeletonRowCount = 5,
  empty,
  emptyLabel,
  emptyHeadingLabel,
  emptyDescriptionLabel,
  getResultCountLabel = (count) =>
    count === 0 ? 'No results' : `${count.toLocaleString()} ${count === 1 ? 'result' : 'results'}`,
  scrollRegionLabel = 'Table',
  className,
  id,
}: TableProps<Row>) {
  const [internalSort, setInternalSort] = React.useState<TableSort | null>(defaultSort);
  const [internalSelected, setInternalSelected] = React.useState<RowId[]>(defaultSelectedIds);
  const [internalPage, setInternalPage] = React.useState(1);
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});
  const [internalSearch, setInternalSearch] = React.useState(defaultSearchValue);
  const resizeRef = React.useRef<{ key: string; startX: number; startWidth: number } | null>(null);
  const headerCellRefs = React.useRef<Map<string, HTMLTableCellElement>>(new Map());
  const resizeHandleRefs = React.useRef<Map<string, HTMLSpanElement>>(new Map());
  const syncResizeValuesRef = React.useRef<() => void>(() => {});
  const selectCellRef = React.useRef<HTMLTableCellElement | null>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const idPrefix = React.useId();
  const itemsPerPageLabelId = `${idPrefix}-items-per-page`;

  const currentSort = sort !== undefined ? sort : internalSort;
  const currentSelectedIds = selectedIds !== undefined ? selectedIds : internalSelected;
  const currentSearch = searchValue !== undefined ? searchValue : internalSearch;
  const [searchExpanded, setSearchExpanded] = React.useState(() => currentSearch !== '');

  const changeSearch = (next: string) => {
    if (searchValue === undefined) setInternalSearch(next);
    onSearchChange?.(next);
  };

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

  // A new result set goes back to the first page: when the rows in `data` become a different set of
  // ids (rows added or removed, as a search or filter does), the page Table keeps itself resets to 1.
  // Editing or reordering rows keeps the page. A controlled `page` is the caller's to reset, and with
  // manualPagination every page is a new set of rows, so neither is touched. Adjusted during render,
  // so the reset lands with the new rows.
  const rowIds = rows.map((r) => r.id);
  const [pagedRowIds, setPagedRowIds] = React.useState(rowIds);
  if (!sameRowIds(pagedRowIds, rowIds)) {
    setPagedRowIds(rowIds);
    if (clientPaginated && page === undefined && internalPage !== 1) setInternalPage(1);
  }

  const requestedPage = page ?? internalPage;
  const currentPage = Math.min(Math.max(1, requestedPage), resolvedPageCount);

  const visibleRows = clientPaginated
    ? sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedRows;

  // The footer shows while there's more than one page, or while there are page sizes to pick from, so
  // choosing a size that fits every row doesn't take the page-size Select away.
  const hasPageSizeOptions = itemsPerPageOptions != null && itemsPerPageOptions.length > 0;
  const showFooter = (manualPagination || clientPaginated) && (resolvedPageCount > 1 || hasPageSizeOptions);

  // The range is the rows shown: the page's first row, counted from the page size (with
  // manualPagination and no pageSize, the rows passed count as one page), to its last.
  const resolvedTotalItems = totalItems ?? (clientPaginated ? sortedRows.length : visibleRows.length);
  const rowsPerPage = pageSize ?? visibleRows.length;
  const rangeStart = visibleRows.length === 0 ? 0 : Math.min((currentPage - 1) * rowsPerPage + 1, resolvedTotalItems);
  const rangeEnd = visibleRows.length === 0 ? 0 : Math.min(rangeStart + visibleRows.length - 1, resolvedTotalItems);

  const selectedSet = React.useMemo(() => new Set(currentSelectedIds), [currentSelectedIds]);
  const visibleIds = visibleRows.map((r) => r.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((rid) => selectedSet.has(rid));
  const someVisibleSelected = visibleIds.some((rid) => selectedSet.has(rid));

  const commitSelection = (next: RowId[]) => {
    if (next.length > 0 && currentSelectedIds.length === 0 && Object.keys(columnWidths).length === 0) {
      const frozen: Record<string, number> = {};
      if (selectCellRef.current) frozen.__select = Math.round(selectCellRef.current.getBoundingClientRect().width);
      for (const col of columns) {
        const el = headerCellRefs.current.get(col.key);
        if (el) frozen[col.key] = Math.round(el.getBoundingClientRect().width);
      }
      if (Object.keys(frozen).length > 0) setColumnWidths(frozen);
    }
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

  // Column resize via a pointer-captured drag handle on the header edge (plus arrow-key nudges). A
  // column is at least MIN_COLUMN_WIDTH and at most the scroll region's width.
  const MIN_COLUMN_WIDTH = 64;
  const RESIZE_STEP = 16;
  const currentWidth = (key: string) =>
    clampWidth(columnWidths[key] ?? headerCellRefs.current.get(key)?.getBoundingClientRect().width ?? MIN_COLUMN_WIDTH);
  function clampWidth(width: number) {
    const max = scrollRef.current?.clientWidth || Infinity;
    return Math.round(Math.min(Math.max(MIN_COLUMN_WIDTH, width), Math.max(MIN_COLUMN_WIDTH, max)));
  }

  // Each resize handle reports its column's width from the first render: after every render, and when
  // the scroll region resizes, write the width (between the minimum and the region's width) and the
  // maximum to the handles. They're measured from the DOM, so they're set on it directly.
  React.useLayoutEffect(() => {
    const sync = () => {
      const region = scrollRef.current?.clientWidth ?? 0;
      resizeHandleRefs.current.forEach((handle, key) => {
        const width = columnWidths[key] ?? headerCellRefs.current.get(key)?.getBoundingClientRect().width ?? 0;
        const now = clampWidth(width);
        handle.setAttribute('aria-valuenow', String(now));
        handle.setAttribute('aria-valuemax', String(Math.max(region, now)));
      });
    };
    syncResizeValuesRef.current = sync;
    sync();
  });
  React.useEffect(() => {
    const region = scrollRef.current;
    if (!region || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => syncResizeValuesRef.current());
    observer.observe(region);
    return () => observer.disconnect();
  }, []);

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
    const next = clampWidth(active.startWidth + (event.clientX - active.startX));
    setColumnWidths((prev) => ({ ...prev, [active.key]: next }));
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
    const next = clampWidth(base + delta);
    setColumnWidths((prev) => ({ ...prev, [key]: next }));
  };

  const hasResized = Object.keys(columnWidths).length > 0;

  const selectedCount = currentSelectedIds.length;

  // One polite live region announces what changed, not on the first render (adjusting state during
  // render, so the announcement lands with the change): the selection bar's count, and the result
  // count after a search or filter. The result count isn't tracked while loading, and when the table
  // first renders loading, the count its first load brings is taken silently. The selection is announced only while Table
  // shows the selection bar (a custom `toolbar` replaces it).
  const announceSelection = selectable && toolbar == null;
  const resultCount = totalItems ?? data.length;
  const [announcement, setAnnouncement] = React.useState<{ selectedCount: number; resultCount: number | null; text: string }>(
    { selectedCount, resultCount: loading ? null : resultCount, text: '' },
  );
  const resultCountChanged = !loading && announcement.resultCount !== resultCount;
  if (announcement.selectedCount !== selectedCount || resultCountChanged) {
    let text = announcement.text;
    if (resultCountChanged && announcement.resultCount !== null) text = getResultCountLabel(resultCount);
    else if (announcement.selectedCount !== selectedCount && announceSelection) text = selectionCountLabel(selectedCount);
    setAnnouncement({ selectedCount, resultCount: loading ? announcement.resultCount : resultCount, text });
  }

  const columnCount = columns.length + (selectable ? 1 : 0);
  const name = accessibleString(caption, title);
  const captionContent = caption ?? title;

  const hasHeader = title != null || description != null;
  const Heading = `h${headingLevel}` as const;
  const hasBuiltInToolbar = searchable || toolbarActions != null || actions != null || onClearFilters != null || (selectable && selectedCount > 0);
  const hasActiveFilters = activeFilters != null;
  const hasToolbar = toolbar != null || hasBuiltInToolbar || hasActiveFilters;

  return (
    <div className={cx(styles.table, className)} data-size={size} id={id}>
      {hasHeader ? (
        <div className={styles.header}>
          {title != null ? <Heading className={styles.title}>{title}</Heading> : null}
          {description != null ? <p className={styles.description}>{description}</p> : null}
        </div>
      ) : null}

      <div className={styles.tableBody} data-has-footer={showFooter || undefined}>
        {hasToolbar ? (
          <div className={styles.toolbar}>
            {toolbar ?? (
              <>
                {(searchable || toolbarActions != null || actions != null || (selectable && selectedCount > 0)) ? (
                  <div className={styles.toolbarControls}>
                    {selectable && selectedCount > 0 ? (
                      <div className={styles.selectionPill}>
                        <span className={styles.selectionCount}>{selectionCountLabel(selectedCount)}</span>
                        <div className={styles.bulkActions}>{bulkActions}</div>
                      </div>
                    ) : (
                      <div className={styles.toolbarButtonGroup}>
                        {searchable ? (
                          searchExpanded ? (
                            <TextField
                              ref={searchRef}
                              size={size === 'sm' ? 'sm' : 'md'}
                              className={styles.search}
                              iconBefore={<SearchIcon />}
                              iconAfter={
                                <IconButton
                                  appearance="subtle"
                                  size="xs"
                                  aria-label={clearSearchLabel}
                                  style={currentSearch ? undefined : { visibility: 'hidden' }}
                                  tabIndex={currentSearch ? undefined : -1}
                                  onClick={() => {
                                    changeSearch('');
                                    searchRef.current?.focus();
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              }
                              placeholder={searchPlaceholder}
                              aria-label={searchLabel}
                              value={currentSearch}
                              onChange={(event) => changeSearch(event.currentTarget.value)}
                              onBlur={() => { if (!currentSearch) setSearchExpanded(false); }}
                            />
                          ) : (
                            <IconButton
                              appearance="subtle"
                              size={size}
                              onClick={() => {
                                setSearchExpanded(true);
                                requestAnimationFrame(() => searchRef.current?.focus());
                              }}
                              aria-label={searchLabel}
                            >
                              <SearchIcon />
                            </IconButton>
                          )
                        ) : null}
                        {toolbarActions}
                        {actions}
                      </div>
                    )}
                  </div>
                ) : null}
                {hasActiveFilters || onClearFilters != null ? (
                  <div className={styles.activeFiltersRow}>
                    {hasActiveFilters ? (
                      <div className={styles.activeFilters}>{activeFilters}</div>
                    ) : null}
                    {onClearFilters != null ? (
                      <Button prominence="tertiary" size="sm" onClick={onClearFilters}>
                        {clearFiltersLabel}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        <span className={styles.announcer} role="status" aria-live="polite">
          {announcement.text}
        </span>

        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div ref={scrollRef} className={styles.scroll} role="region" aria-label={name ?? scrollRegionLabel} tabIndex={0}>
          <table className={styles.grid} aria-busy={loading || undefined} data-resized={hasResized || undefined}
            data-has-editable-cells={columns.some((column) => column.cellAppearance === 'editable') || undefined}>
            {captionContent != null ? <caption className={styles.caption}>{captionContent}</caption> : null}
            {hasResized ? (
              <colgroup>
                {selectable ? <col style={{ width: columnWidths.__select }} /> : null}
                {columns.map((col) => (
                  <col key={col.key} style={{ width: columnWidths[col.key] ?? col.width }} />
                ))}
              </colgroup>
            ) : null}
            <thead className={styles.thead}>
                <tr>
                  {selectable ? (
                    <th ref={selectCellRef} scope="col" className={styles.selectHeaderCell}>
                      <Checkbox
                        checked={allVisibleSelected}
                        indeterminate={someVisibleSelected && !allVisibleSelected}
                        onCheckedChange={toggleAll}
                        disabled={visibleRows.length === 0}
                        aria-label={selectionColumnLabel}
                      />
                    </th>
                  ) : null}
                  {columns.map((column, columnIndex) => {
                  const isActive = currentSort?.columnKey === column.key;
                  const ariaSort = isActive
                    ? currentSort!.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : column.sortable
                      ? 'none'
                      : undefined;
                  const label =
                    column.headerLabel ?? (typeof column.header === 'string' && column.header !== '' ? column.header : column.key);
                  const isResizable = resizableColumns && column.resizable !== false;
                  // The header cell is named by its label alone, so the resize handle's name inside it
                  // isn't read as part of every cell's column header.
                  const headerLabelId = `${idPrefix}-header-${columnIndex}`;
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
                      aria-label={column.headerLabel}
                      aria-labelledby={column.headerLabel == null ? headerLabelId : undefined}
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
                          aria-label={column.headerLabel}
                        >
                          <span id={headerLabelId} className={styles.headerLabel}>{column.header}</span>
                          <span className={styles.sortIcon} aria-hidden="true">
                            {isActive && currentSort!.direction === 'asc' ? (
                              <ArrowUpIcon size="sm" />
                            ) : (
                              <ArrowDownIcon size="sm" />
                            )}
                          </span>
                        </button>
                      ) : (
                        <span id={headerLabelId} className={styles.headerLabel}>{column.header}</span>
                      )}
                      {isResizable ? (
                        /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
                        <span
                          ref={(el) => {
                            const map = resizeHandleRefs.current;
                            if (el) map.set(column.key, el);
                            else map.delete(column.key);
                          }}
                          className={styles.resizeHandle}
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={getResizeLabel(label)}
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
                    {/* data-align lines each skeleton up where the column's content sits (see the CSS). */}
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
                      <div className={styles.emptyContainer}>
                        {/* `emptyHeadingLabel` is the deprecated name for `emptyLabel`; a deprecated
                            `emptyDescriptionLabel` still shows under it. */}
                        <p className={styles.emptyLabel}>{emptyLabel ?? emptyHeadingLabel ?? 'No items to show'}</p>
                        {emptyDescriptionLabel != null ? <p className={styles.emptyLabel}>{emptyDescriptionLabel}</p> : null}
                      </div>
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
                            aria-label={getSelectionLabel(row, index)}
                          />
                        </td>
                      ) : null}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cx(styles.cell, column.className)}
                          data-align={column.align}
                          data-emphasis={column.emphasis}
                          data-editable={column.cellAppearance === 'editable' ? 'true' : undefined}
                        >
                          <EditableCellContext.Provider value={column.cellAppearance === 'editable' ? size : null}>
                            {column.render
                              ? column.render(row, index)
                              : String((row as Record<string, unknown>)[column.key] ?? '')}
                          </EditableCellContext.Provider>
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {showFooter ? (
          <div className={styles.footer} role="navigation" aria-label={paginationLabel ?? getPaginationLabel(name)}>
            <div className={styles.footerGroup}>
              {hasPageSizeOptions ? (
                <>
                  <span id={itemsPerPageLabelId} className={styles.footerLabel}>{itemsPerPageLabel}</span>
                  <Select
                    size="sm"
                    context="inline"
                    className={styles.footerSelect}
                    options={itemsPerPageOptions.map((opt) => ({ value: String(opt), label: String(opt) }))}
                    value={String(pageSize)}
                    onChange={(v) => { if (v != null) onPageSizeChange?.(Number(v)); }}
                    aria-labelledby={itemsPerPageLabelId}
                  />
                </>
              ) : null}
              <span className={styles.footerLabel}>{getRangeLabel(rangeStart, rangeEnd, resolvedTotalItems)}</span>
            </div>
            <div className={styles.footerGroup}>
              <Select
                size="sm"
                context="inline"
                className={styles.footerSelect}
                options={Array.from({ length: resolvedPageCount }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
                value={String(currentPage)}
                onChange={(v) => { if (v != null) handlePageChange(Number(v)); }}
                aria-label={pageLabel}
              />
              <span className={styles.footerLabel}>{getPageCountLabel(resolvedPageCount)}</span>
              <div className={styles.footerNav}>
                <IconButton
                  appearance="subtle"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label={previousPageLabel}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  appearance="subtle"
                  size="sm"
                  disabled={currentPage >= resolvedPageCount}
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label={nextPageLabel}
                >
                  <ChevronRightIcon />
                </IconButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

Table.displayName = 'Table';
