import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InlineEdit } from '../../molecules/inline-edit';
import { TextField } from '../../molecules/text-field';
import { Select } from '../../molecules/select';
import { DatePicker } from '../date-picker';
import { TimePicker } from '../time-picker';
import { Table } from './table';

afterEach(cleanup);

describe('Table editable cells', () => {
  it.each(['sm', 'md'] as const)('uses %s cell density without changing surrounding controls', (size) => {
    render(<>
      <TextField aria-label="Standalone" />
      <Table caption="Events" size={size} data={[{ id: 1 }]} searchable searchValue="query" columns={[
        { key: 'edit', header: 'Edit', cellAppearance: 'editable', render: () => <TextField aria-label="Cell" /> },
        { key: 'regular', header: 'Regular', render: () => <TextField aria-label="Regular" /> },
      ]} />
    </>);
    expect(screen.getByLabelText('Cell').parentElement).toHaveAttribute('data-editable-cell', size);
    expect(screen.getByLabelText('Cell').parentElement).toHaveAttribute('data-appearance', 'subtle');
    for (const name of ['Standalone', 'Regular', 'Search...']) {
      expect(screen.getByLabelText(name).parentElement).not.toHaveAttribute('data-editable-cell');
    }
  });

  it('commits and cancels text repeatedly, supports keyboard Cancel, and leaves selection alone', () => {
    const save = vi.fn();
    const selection = vi.fn();
    function Example() {
      const [name, setName] = useState('Review');
      return <Table caption="Events" data={[{ id: 1 }]} getRowId={(r) => r.id} selectable
        defaultSelectedIds={[1]} onSelectionChange={selection} columns={[
          { key: 'name', header: 'Name', cellAppearance: 'editable', render: () =>
            <InlineEdit value={name} onConfirm={(next) => { save(next); setName(next); }}>
              <TextField aria-label="Name" />
            </InlineEdit> },
        ]} />;
    }
    render(<Example />);
    const input = screen.getByLabelText('Name');
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'Planning' } });
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    act(() => cancel.focus());
    fireEvent.keyDown(cancel, { key: 'Enter' });
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(cancel);
    expect(input).toHaveValue('Review');
    act(() => input.focus());
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'Planning' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(save).toHaveBeenCalledExactlyOnceWith('Planning');
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'Discard' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('Planning');
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'Final' } });
    act(() => input.blur());
    expect(save).toHaveBeenLastCalledWith('Final');
    expect(save).toHaveBeenCalledTimes(2);
    expect(selection).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Select row')).toBeChecked();
  });

  it('keeps the select focus indicator while navigating its menu and commits a choice', () => {
    const change = vi.fn();
    render(<Table caption="Events" data={[{}]} columns={[
      { key: 'status', header: 'Status', cellAppearance: 'editable', render: () =>
        <Select aria-label="Status" value="Draft" onChange={change}
          options={['Draft', 'Scheduled'].map((value) => ({ value, label: value }))} /> },
    ]} />);
    const input = screen.getByRole('combobox', { name: 'Status' });
    fireEvent.click(input.parentElement!);
    const item = screen.getByRole('menuitemradio', { name: 'Scheduled' });
    act(() => item.focus());
    expect(input.parentElement).toHaveAttribute('data-force-state', 'focus');
    fireEvent.click(item);
    expect(change).toHaveBeenCalledExactlyOnceWith('Scheduled');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input.parentElement).not.toHaveAttribute('data-force-state');
  });

  it('opens pickers from the cell frame; date commits and time cancel discards the draft', () => {
    const dateChange = vi.fn();
    const timeChange = vi.fn();
    render(<Table caption="Events" data={[{}]} columns={[
      { key: 'date', header: 'Date', cellAppearance: 'editable', render: () =>
        <DatePicker aria-label="Date" value={new Date(2026, 2, 9)} today={new Date(2026, 2, 9)} onChange={dateChange} /> },
      { key: 'time', header: 'Time', cellAppearance: 'editable', render: () =>
        <TimePicker aria-label="Time" value={new Date(2026, 2, 9, 16, 30)} onChange={timeChange} /> },
    ]} />);
    const date = screen.getByLabelText('Date');
    fireEvent.click(date.parentElement!);
    expect(date.parentElement).toHaveAttribute('data-force-state', 'focus');
    expect(screen.getByRole('dialog').querySelector('[data-editable-cell]')).toBeNull();
    fireEvent.click(screen.getByRole('grid').querySelector('button[tabindex="0"]')!);
    expect(dateChange).toHaveBeenCalledTimes(1);
    const time = screen.getByLabelText('Time');
    fireEvent.click(time.parentElement!);
    fireEvent.click(within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '05' }));
    expect(time.parentElement).toHaveAttribute('data-force-state', 'focus');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(timeChange).not.toHaveBeenCalled();
    fireEvent.click(time.parentElement!);
    fireEvent.click(within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '05' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(timeChange).toHaveBeenCalledTimes(1);
    expect(timeChange.mock.calls[0][0].getHours()).toBe(17);
  });
});
