// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
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

const tableCss: string = readFileSync('packages/ui/src/components/organisms/table/table.module.css', 'utf8').replace(/\r\n/g, '\n');

describe('Table', () => {
  it("sizes the title with the table's size, not its heading level", () => {
    // md: heading/lg on the title itself; sm: heading/md, whatever headingLevel says.
    expect(tableCss).toMatch(/\.title \{[^}]*--typography-heading-lg-font-size/);
    expect(tableCss).toMatch(/\.table\[data-size='sm'\] \.title \{[^}]*--typography-heading-md-font-size/);
    render(<Table columns={columns} data={rows} getRowId={getRowId} size="sm" title="Matters" headingLevel={4} />);
    expect(screen.getByRole('heading', { name: 'Matters', level: 4 })).toBeInTheDocument();
  });

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

    const nameHeaderButton = screen.getByRole('button', { name: 'Name' });
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

    fireEvent.click(screen.getByRole('button', { name: 'Name' }));
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

    expect(screen.getByText('No items to show')).toBeInTheDocument();
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
    expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument();
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
          searchPlaceholder="Search people…"
          searchLabel="Search people"
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

    const pageSizeSelect = within(footer).getByRole('combobox', { name: 'Items per page:' });
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

  it('names its icon-only controls with overridable labels, not the placeholder', () => {
    const { rerender } = render(
      <Table columns={columns} data={rows} getRowId={getRowId} caption="People" searchable searchValue="" pageSize={2} />,
    );
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();

    rerender(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="People"
        searchable
        searchValue="ali"
        pageSize={2}
        searchLabel="Buscar"
        clearSearchLabel="Borrar búsqueda"
        previousPageLabel="Página anterior"
        nextPageLabel="Página siguiente"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('textbox', { name: 'Buscar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Borrar búsqueda', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeInTheDocument();
  });

  it('lets the footer text be replaced, for translation', () => {
    render(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="People"
        pageSize={2}
        itemsPerPageOptions={[2, 5]}
        paginationLabel="Paginación"
        itemsPerPageLabel="Elementos por página"
        getRangeLabel={(start, end, total) => `${start}-${end} de ${total}`}
        pageLabel="Página"
        getPageCountLabel={(count) => `de ${count}`}
      />,
    );

    const footer = screen.getByRole('navigation', { name: 'Paginación' });
    // The label is shown as given: Table adds no colon of its own.
    expect(within(footer).getByText('Elementos por página')).toBeInTheDocument();
    expect(within(footer).queryByText('Elementos por página:')).not.toBeInTheDocument();
    expect(within(footer).getByRole('combobox', { name: 'Elementos por página' })).toBeInTheDocument();
    expect(within(footer).getByText('1-2 de 3')).toBeInTheDocument();
    expect(within(footer).getByRole('combobox', { name: 'Página' })).toBeInTheDocument();
    expect(within(footer).getByText('de 2')).toBeInTheDocument();
  });

  it('shows the default page-size label with its colon, naming the page-size Select', () => {
    render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" pageSize={2} itemsPerPageOptions={[2, 5]} />);

    const footer = screen.getByRole('navigation', { name: /pagination/i });
    expect(within(footer).getByText('Items per page:')).toBeInTheDocument();
    expect(within(footer).getByRole('combobox', { name: 'Items per page:' })).toBeInTheDocument();
  });

  it('keeps the footer, and its page-size Select, when one page holds every row', () => {
    function Harness() {
      const [size, setSize] = useState(2);
      return (
        <Table
          columns={columns}
          data={rows}
          getRowId={getRowId}
          caption="People"
          pageSize={size}
          itemsPerPageOptions={[2, 5]}
          onPageSizeChange={setSize}
        />
      );
    }
    render(<Harness />);

    let footer = screen.getByRole('navigation', { name: /pagination/i });
    fireEvent.mouseDown(within(footer).getByRole('combobox', { name: 'Items per page:' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: '5' }));

    // Every row fits on one page, but the person can still pick a smaller page size.
    footer = screen.getByRole('navigation', { name: /pagination/i });
    const pageSizeSelect = within(footer).getByRole('combobox', { name: 'Items per page:' });
    expect(pageSizeSelect).toHaveValue('5');
    expect(within(footer).getByText('1–3 of 3 items')).toBeInTheDocument();
    expect(within(footer).getByText('of 1 page')).toBeInTheDocument();
    expect(within(footer).getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(bodyRowNames()).toHaveLength(3);
  });

  it('hides the footer at one page when there are no page-size options', () => {
    render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" pageSize={5} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('computes the range from the page and page size with manualPagination', () => {
    const pageRows = (pageNumber: number) =>
      Array.from({ length: pageNumber === 3 ? 2 : 5 }, (_, i) => ({
        id: (pageNumber - 1) * 5 + i + 1,
        name: `Person ${(pageNumber - 1) * 5 + i + 1}`,
        score: i,
      }));
    function Harness() {
      const [page, setPage] = useState(1);
      return (
        <Table
          columns={columns}
          data={pageRows(page)}
          getRowId={getRowId}
          caption="People"
          manualPagination
          page={page}
          pageCount={3}
          pageSize={5}
          totalItems={12}
          onPageChange={setPage}
        />
      );
    }
    render(<Harness />);

    const footer = () => screen.getByRole('navigation', { name: /pagination/i });
    expect(within(footer()).getByText('1–5 of 12 items')).toBeInTheDocument();

    fireEvent.click(within(footer()).getByRole('button', { name: 'Next page' }));
    expect(within(footer()).getByText('6–10 of 12 items')).toBeInTheDocument();

    fireEvent.click(within(footer()).getByRole('button', { name: 'Next page' }));
    expect(within(footer()).getByText('11–12 of 12 items')).toBeInTheDocument();
  });

  it('uses the rows passed as the page size with manualPagination when pageSize is not set', () => {
    render(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="People"
        manualPagination
        page={2}
        pageCount={4}
        totalItems={12}
      />,
    );

    expect(screen.getByText('4–6 of 12 items')).toBeInTheDocument();
  });

  it('shows an empty range when there are no rows', () => {
    render(
      <Table columns={columns} data={[]} getRowId={getRowId} caption="People" pageSize={5} itemsPerPageOptions={[5, 10]} />,
    );

    expect(screen.getByText('0–0 of 0 items')).toBeInTheDocument();
  });

  it('keeps its own search text when searchValue is not passed', () => {
    const onSearchChange = vi.fn();
    render(
      <Table columns={columns} data={rows} getRowId={getRowId} caption="People" searchable onSearchChange={onSearchChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    const search = screen.getByRole('textbox', { name: 'Search' });
    fireEvent.change(search, { target: { value: 'ali' } });
    expect(search).toHaveValue('ali');
    expect(onSearchChange).toHaveBeenLastCalledWith('ali');

    // The field stays open with its text when it loses focus, and its clear button works.
    fireEvent.blur(search);
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('ali');
    const clear = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(clear);
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('');
    expect(onSearchChange).toHaveBeenLastCalledWith('');

    // Empty again, it closes when it loses focus.
    fireEvent.blur(screen.getByRole('textbox', { name: 'Search' }));
    expect(screen.queryByRole('textbox', { name: 'Search' })).not.toBeInTheDocument();
  });

  it('starts uncontrolled search from defaultSearchValue, open', () => {
    render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" searchable defaultSearchValue="bob" />);

    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('bob');
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('names each column header by its column name alone', () => {
    render(
      <Table
        columns={[
          ...columns,
          { key: 'notes', header: 'Notes' },
          { key: 'icon', header: <span aria-hidden="true">★</span>, headerLabel: 'Favorite', sortable: true },
        ]}
        data={rows}
        getRowId={getRowId}
        caption="People"
      />,
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((header) => header.getAttribute('aria-sort'))).toEqual(['none', 'none', null, 'none']);
    expect(headers[0]).toHaveAccessibleName('Name');
    expect(headers[1]).toHaveAccessibleName('Score');
    expect(headers[2]).toHaveAccessibleName('Notes');
    expect(headers[3]).toHaveAccessibleName('Favorite');
    // The sort button is named by the visible header (or headerLabel); its state is aria-sort on the header.
    expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Favorite' })).toBeInTheDocument();
  });

  it('gives each resize handle its value, minimum, and maximum from the start', () => {
    render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" />);

    const handle = screen.getByRole('separator', { name: 'Resize Name' });
    const now = Number(handle.getAttribute('aria-valuenow'));
    const min = Number(handle.getAttribute('aria-valuemin'));
    const max = Number(handle.getAttribute('aria-valuemax'));
    expect(handle).toHaveAttribute('aria-valuenow');
    expect(handle).toHaveAttribute('aria-valuemax');
    expect(min).toBe(64);
    expect(now).toBeGreaterThanOrEqual(min);
    expect(max).toBeGreaterThanOrEqual(now);

    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    const widened = Number(handle.getAttribute('aria-valuenow'));
    expect(widened).toBe(now + 16);
    expect(Number(handle.getAttribute('aria-valuemax'))).toBeGreaterThanOrEqual(widened);
  });

  it('keeps a resized column within the scroll region', () => {
    const regionWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
    try {
      render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" />);
      const handle = screen.getByRole('separator', { name: 'Resize Name' });
      expect(handle).toHaveAttribute('aria-valuemax', '200');
      for (let i = 0; i < 12; i += 1) fireEvent.keyDown(handle, { key: 'ArrowRight' });
      expect(handle).toHaveAttribute('aria-valuenow', '200');
    } finally {
      regionWidth.mockRestore();
    }
  });

  it('renders the title at headingLevel, h2 by default', () => {
    const { rerender } = render(<Table columns={columns} data={rows} getRowId={getRowId} title="Members" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Members' })).toBeInTheDocument();

    rerender(<Table columns={columns} data={rows} getRowId={getRowId} title="Members" headingLevel={3} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Members' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('announces selection count changes politely, not the initial selection', () => {
    render(
      <Table columns={columns} data={rows} getRowId={getRowId} caption="People" selectable defaultSelectedIds={[1, 2]} />,
    );

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('');

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[2]);
    expect(status).toHaveTextContent('3 selected');

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    expect(status).toHaveTextContent('0 selected');
  });

  it('lets its built-in text be replaced, for translation', () => {
    const { rerender } = render(
      <Table
        columns={columns}
        data={[]}
        getRowId={getRowId}
        caption={<span>Personas</span>}
        emptyLabel="No hay elementos"
        scrollRegionLabel="Tabla"
        getResizeLabel={(column) => `Cambiar el ancho de ${column}`}
      />,
    );

    expect(screen.getByText('No hay elementos')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Tabla' })).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: 'Cambiar el ancho de Name' })).toBeInTheDocument();

    rerender(<Table columns={columns} data={[]} getRowId={getRowId} caption={<span>People</span>} />);
    expect(screen.getByText('No items to show')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Table' })).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: 'Resize Name' })).toBeInTheDocument();
  });

  it('goes back to the first page when the rows become a different set, in uncontrolled paging', () => {
    const many: Row[] = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}`, score: i }));
    const { rerender } = render(<Table columns={columns} data={many} getRowId={getRowId} caption="People" pageSize={2} />);
    const footer = () => screen.getByRole('navigation', { name: /pagination/i });

    fireEvent.click(within(footer()).getByRole('button', { name: 'Next page' }));
    expect(bodyRowNames()).toEqual(['Row 3', 'Row 4']);

    // Editing a row keeps the set of ids, so the page stays.
    const edited = many.map((row) => (row.id === 3 ? { ...row, name: 'Row 3 (edited)' } : row));
    rerender(<Table columns={columns} data={edited} getRowId={getRowId} caption="People" pageSize={2} />);
    expect(bodyRowNames()).toEqual(['Row 3 (edited)', 'Row 4']);

    // A filter that leaves page 2 in place, but with other rows on it, goes back to page 1.
    const filtered = many.filter((row) => row.id !== 1);
    rerender(<Table columns={columns} data={filtered} getRowId={getRowId} caption="People" pageSize={2} />);
    expect(bodyRowNames()).toEqual(['Row 2', 'Row 3']);
    expect(within(footer()).getByRole('combobox', { name: 'Page' })).toHaveValue('1');
  });

  it('leaves a controlled page alone when the rows change', () => {
    const many: Row[] = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}`, score: i }));
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Table columns={columns} data={many} getRowId={getRowId} caption="People" pageSize={2} page={2} onPageChange={onPageChange} />,
    );
    rerender(
      <Table columns={columns} data={many.slice(1)} getRowId={getRowId} caption="People" pageSize={2} page={2} onPageChange={onPageChange} />,
    );
    expect(bodyRowNames()).toEqual(['Row 4', 'Row 5']);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('lines skeleton rows up with the column, like its cells', () => {
    expect(tableCss).toMatch(/\.cell\[data-align='center'\] \.skeletonText \{[^}]*margin-inline: auto;/);
    expect(tableCss).toMatch(/\.cell\[data-align='end'\] \.skeletonText \{[^}]*margin-inline-start: auto;/);
    render(<Table columns={columns} data={[]} getRowId={getRowId} caption="People" loading skeletonRowCount={1} />);
    const cells = within(screen.getByRole('table')).getAllByRole('cell');
    expect(cells[1]).toHaveAttribute('data-align', 'end');
  });

  it('builds the footer name and the row Checkbox names from props, for translation', () => {
    const { rerender } = render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" pageSize={2} selectable />);
    expect(screen.getByRole('navigation', { name: 'People pagination' })).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox', { name: 'Select row' })).toHaveLength(2);

    rerender(<Table columns={columns} data={rows} getRowId={getRowId} caption={<span>People</span>} pageSize={2} selectable />);
    expect(screen.getByRole('navigation', { name: 'Table pagination' })).toBeInTheDocument();

    rerender(
      <Table
        columns={columns}
        data={rows}
        getRowId={getRowId}
        caption="Personas"
        pageSize={2}
        selectable
        getPaginationLabel={(name) => (name ? `Paginación de ${name}` : 'Paginación')}
        getSelectionLabel={() => 'Seleccionar fila'}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Paginación de Personas' })).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox', { name: 'Seleccionar fila' })).toHaveLength(2);
  });

  it('says there is nothing to show in one neutral statement, on the surface beneath it', () => {
    render(<Table columns={columns} data={[]} getRowId={getRowId} caption="People" />);
    const cell = within(screen.getByRole('table')).getByRole('cell');
    expect(cell).toHaveTextContent(/^No items to show$/);
    // Transparent, as a passed Empty State is: no fill of its own.
    expect(tableCss).toMatch(/\.emptyContainer \{(?![^}]*background)[^}]*\}/);
  });

  it('takes emptyLabel, and still takes the deprecated emptyHeadingLabel and emptyDescriptionLabel', () => {
    const { rerender } = render(<Table columns={columns} data={[]} getRowId={getRowId} caption="People" emptyLabel="No hay elementos" />);
    const emptyCell = () => within(screen.getByRole('table')).getByRole('cell');
    expect(emptyCell()).toHaveTextContent(/^No hay elementos$/);
    const withNewName = emptyCell().innerHTML;

    rerender(<Table columns={columns} data={[]} getRowId={getRowId} caption="People" emptyHeadingLabel="No hay elementos" />);
    expect(emptyCell().innerHTML).toBe(withNewName);

    rerender(
      <Table columns={columns} data={[]} getRowId={getRowId} caption="People" emptyHeadingLabel="Sin resultados" emptyDescriptionLabel="Todavía no hay nada aquí." />,
    );
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByText('Todavía no hay nada aquí.')).toBeInTheDocument();
  });

  it('announces the result count politely when it changes, not on the first render or while loading', () => {
    const { rerender } = render(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" searchable />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('');

    rerender(<Table columns={columns} data={[]} getRowId={getRowId} caption="People" searchable />);
    expect(status).toHaveTextContent(/^No results$/);

    rerender(<Table columns={columns} data={rows.slice(0, 1)} getRowId={getRowId} caption="People" searchable />);
    expect(status).toHaveTextContent(/^1 result$/);

    rerender(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" searchable loading />);
    expect(status).toHaveTextContent(/^1 result$/);

    rerender(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" searchable />);
    expect(status).toHaveTextContent(/^3 results$/);

    rerender(
      <Table columns={columns} data={rows.slice(0, 2)} getRowId={getRowId} caption="People" searchable getResultCountLabel={(n) => `${n} resultados`} />,
    );
    expect(status).toHaveTextContent(/^2 resultados$/);
  });

  it('counts totalItems as the results, and stays quiet after a first load', () => {
    const { rerender } = render(<Table columns={columns} data={[]} getRowId={getRowId} caption="People" loading />);
    rerender(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('');

    rerender(<Table columns={columns} data={rows} getRowId={getRowId} caption="People" manualPagination pageCount={4} totalItems={40} />);
    expect(status).toHaveTextContent(/^40 results$/);
  });
});
