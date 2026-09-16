import { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Table } from './table';
import type { TableColumn } from './table.types';

interface Row {
  id: number;
  name: string;
  score: number;
}

const rows: Row[] = [
  { id: 1, name: 'Charlie', score: 30 },
  { id: 2, name: 'Alice', score: 10 },
  { id: 3, name: 'Bob', score: 20 },
];

const columns: Array<TableColumn<Row>> = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'score', header: 'Score', sortable: true, align: 'end' },
];

const getRowId = (row: Row) => row.id;

function bodyRowNames() {
  const table = screen.getByRole('table');
  const bodyRows = within(table).getAllByRole('row').slice(1); // drop the header row
  return bodyRows.map((row) => within(row).getAllByRole('cell')[0]?.textContent);
}

afterEach(cleanup);

describe('Table', () => {
  it('renders columns and data, named by its caption', () => {
    render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" />);

    expect(screen.getByRole('table')).toHaveAccessibleName('People');
    expect(screen.getByRole('columnheader', { name: /Name/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Charlie' })).toBeInTheDocument();
    // Default cell render uses row[key].
    expect(screen.getByRole('cell', { name: '30' })).toBeInTheDocument();
  });

  it('uses a column render function when provided', () => {
    render(
      <Table
        columns={[{ key: 'name', header: 'Name', render: (r) => <span>Hi {r.name}</span> }]}
        data={rows}
        getRowId={getRowId}
        caption="People"
      />,
    );

    expect(screen.getByText('Hi Alice')).toBeInTheDocument();
  });

  it('sorts client-side when a sortable header is clicked, cycling asc -> desc -> unsorted', () => {
    render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" />);

    // Unsorted: original order.
    expect(bodyRowNames()).toEqual(['Charlie', 'Alice', 'Bob']);

    const nameHeaderButton = screen.getByRole('button', { name: 'Sort by Name' });
    fireEvent.click(nameHeaderButton);
    expect(bodyRowNames()).toEqual(['Alice', 'Bob', 'Charlie']);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');

    fireEvent.click(nameHeaderButton);
    expect(bodyRowNames()).toEqual(['Charlie', 'Bob', 'Alice']);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending');

    fireEvent.click(nameHeaderButton);
    expect(bodyRowNames()).toEqual(['Charlie', 'Alice', 'Bob']);
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'none');
  });

  it('calls onSortChange and does not reorder data when manualSort is set', () => {
    const onSortChange = vi.fn();
    render(
      <Table columns={columns} data={rows} getRowId={getRowId} caption="People" manualSort onSortChange={onSortChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sort by Name' }));
    expect(onSortChange).toHaveBeenCalledWith({ columnKey: 'name', direction: 'asc' });
    // manualSort: order unchanged (the consumer re-fetches).
    expect(bodyRowNames()).toEqual(['Charlie', 'Alice', 'Bob']);
  });

  it('supports row selection with a header select-all', () => {
    const onSelectionChange = vi.fn();
    render(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="People"
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );

    const selectAll = screen.getByRole('checkbox', { name: 'Select all rows' });
    fireEvent.click(selectAll);
    expect(onSelectionChange).toHaveBeenCalledWith([1, 2, 3]);

    // All row checkboxes reflect selection.
    const rowCheckboxes = screen.getAllByRole('checkbox', { name: 'Select row' });
    expect(rowCheckboxes).toHaveLength(3);
    rowCheckboxes.forEach((box) => expect(box).toBeChecked());
  });

  it('shows an indeterminate select-all when only some rows are selected', () => {
    render(
      <Table columns={columns} data={rows} getRowId={getRowId} caption="People" selectable defaultSelectedIds={[1]} />,
    );

    const selectAll = screen.getByRole('checkbox', { name: 'Select all rows' }) as HTMLInputElement;
    expect(selectAll.indeterminate).toBe(true);
  });

  it('paginates client-side when pageSize is set', () => {
    render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" pageSize={2} />);

    // Only the first page (2 rows) renders.
    expect(bodyRowNames()).toHaveLength(2);
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });

  it('renders skeleton rows while loading and marks the table busy', () => {
    render(
      <Table columns={columns} data={rows} getRowId={getRowId} caption="People" loading skeletonRowCount={4} />,
    );

    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-busy', 'true');
    // 4 skeleton rows, no data.
    expect(within(table).getAllByRole('row')).toHaveLength(1 + 4);
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no rows', () => {
    render(<Table columns={columns} data={[]} getRowId={getRowId} caption="People" />);

    expect(screen.getByText('There is nothing to show here yet.')).toBeInTheDocument();
  });

  it('renders a custom empty slot', () => {
    render(<Table columns={columns} data={[]} getRowId={getRowId} caption="People" empty={<span>Nothing here</span>} />);

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('selects only through checkboxes - clicking a cell does not select the row', () => {
    const onSelectionChange = vi.fn();
    render(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="People"
        selectable
        onSelectionChange={onSelectionChange}
      />,
    );

    fireEvent.click(screen.getByRole('cell', { name: 'Charlie' }));
    expect(onSelectionChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]);
    expect(onSelectionChange).toHaveBeenCalledWith([1]);
  });

  it('shows a selection bar with the count and bulk actions when rows are selected', () => {
    render(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="People"
        selectable
        defaultSelectedIds={[1, 2]}
        bulkActions={
          <button type="button">Delete</button>
        }
      />,
    );

    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    // The selection bar lives in the toolbar; column headers stay visible.
    expect(screen.getByRole('button', { name: 'Sort by Name' })).toBeInTheDocument();
    // The select-all checkbox stays in the header.
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeInTheDocument();
  });

  it('renders a resize handle per data column, and none when resizing is disabled', () => {
    const { rerender } = render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" />);
    expect(screen.getAllByRole('separator', { name: /Resize/ })).toHaveLength(columns.length);

    rerender(
      <Table columns={columns} data={rows} getRowId={getRowId} caption="People" resizableColumns={false} />,
    );
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('applies the identifier emphasis to a column cell', () => {
    render(
      <Table
        columns={[
          { key: 'name', header: 'Name', emphasis: 'strong' },
          { key: 'score', header: 'Score' },
        ]}
        data={rows}
        getRowId={getRowId}
        caption="People"
      />,
    );

    expect(screen.getByRole('cell', { name: 'Charlie' })).toHaveAttribute('data-emphasis', 'strong');
  });

  it('renders the built-in search and forwards changes', () => {
    function Harness() {
      const [value, setValue] = useState('');
      return (
        <Table
          columns={columns}
          data={rows}
          getRowId={getRowId}
          caption="People"
          searchable
          searchValue={value}
          onSearchChange={setValue}
          searchPlaceholder="Search people"
        />
      );
    }
    render(<Harness />);

    // Search starts collapsed as an IconButton; click to expand
    fireEvent.click(screen.getByRole('button', { name: 'Search people' }));

    const search = screen.getByRole('textbox', { name: 'Search people' });
    fireEvent.change(search, { target: { value: 'ali' } });
    expect(search).toHaveValue('ali');
  });

  it('renders toolbarActions in the toolbar', () => {
    render(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="People"
        searchable
        searchValue=""
        toolbarActions={<button type="button">Filter</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Filter' })).toBeInTheDocument();
  });

  it('renders activeFilters as a ReactNode slot and onClearFilters shows the clear button', () => {
    const onClear = vi.fn();
    render(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="People"
        activeFilters={<span>Role: Admin</span>}
        onClearFilters={onClear}
        clearFiltersLabel="Clear all"
      />,
    );

    expect(screen.getByText('Role: Admin')).toBeInTheDocument();
    const clearButton = screen.getByRole('button', { name: 'Clear all' });
    expect(clearButton).toBeInTheDocument();
    fireEvent.click(clearButton);
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('does not render clear filters when onClearFilters is not provided', () => {
    render(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="People"
        activeFilters={<span>Status: Active</span>}
      />,
    );

    expect(screen.getByText('Status: Active')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('renders footer with items-per-page selector and page navigation', () => {
    const onPageSizeChange = vi.fn();
    render(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="People"
        pageSize={2}
        itemsPerPageOptions={[2, 5, 10]}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    const footer = screen.getByRole('navigation', { name: /pagination/i });
    expect(within(footer).getByText(/Items per page/)).toBeInTheDocument();
    expect(within(footer).getByText(/1–2 of 3 items/)).toBeInTheDocument();
    expect(within(footer).getByText(/of 2 pages/)).toBeInTheDocument();

    const pageSizeSelect = within(footer).getByRole('combobox', { name: 'Items per page' });
    expect(pageSizeSelect).toHaveValue('2');

    fireEvent.mouseDown(pageSizeSelect);
    fireEvent.click(screen.getByRole('menuitemradio', { name: '5' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(5);

    const nextButton = within(footer).getByLabelText('Next page');
    fireEvent.click(nextButton);
    expect(within(footer).getByRole('combobox', { name: 'Page' })).toHaveValue('2');
  });

  it('applies the size data attribute and composes className', () => {
    const { container } = render(
      <Table columns={columns} data={rows} getRowId={getRowId} caption="People" size="sm" className="custom" />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'sm');
    expect(root).toHaveClass('custom');
  });
});
