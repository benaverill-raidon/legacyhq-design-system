// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TimePicker } from './time-picker';

const css = readFileSync(
  'packages/ui/src/components/organisms/time-picker/time-picker.module.css',
  'utf8',
);

const FOUR_THIRTY_PM = new Date(2026, 2, 9, 16, 30); // 04:30 PM

function renderPicker(props: Partial<React.ComponentProps<typeof TimePicker>> = {}) {
  return render(<TimePicker defaultValue={FOUR_THIRTY_PM} aria-label="Time" {...props} />);
}

function field() {
  return screen.getByRole('textbox', { name: 'Time' });
}

function column(name: string) {
  return screen.getByRole('listbox', { name });
}

afterEach(cleanup);

describe('TimePicker', () => {
  it('renders a field with the formatted time and a closed popup', () => {
    renderPicker();
    expect(field()).toHaveValue('04:30 PM');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the placeholder when there is no value', () => {
    renderPicker({ defaultValue: null, placeholder: 'hh:mm AM' });
    expect(field()).toHaveValue('');
    expect(field()).toHaveAttribute('placeholder', 'hh:mm AM');
  });

  it('opens three columns on click with the current time selected', () => {
    renderPicker();
    fireEvent.click(field());

    expect(within(column('Hours')).getByRole('option', { name: '04' })).toHaveAttribute('aria-selected', 'true');
    expect(within(column('Minutes')).getByRole('option', { name: '30' })).toHaveAttribute('aria-selected', 'true');
    expect(within(column('AM/PM')).getByRole('option', { name: 'PM' })).toHaveAttribute('aria-selected', 'true');
  });

  it('previews the staged selection live in the field but commits only on Confirm', () => {
    const onChange = vi.fn();
    renderPicker({ onChange });

    fireEvent.click(field());
    fireEvent.click(within(column('Hours')).getByRole('option', { name: '07' }));

    // The field shows the staged selection live, but nothing is committed yet.
    expect(within(column('Hours')).getByRole('option', { name: '07' })).toHaveAttribute('aria-selected', 'true');
    expect(field()).toHaveValue('07:30 PM');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const committed = onChange.mock.calls[0][0] as Date;
    expect(committed.getHours()).toBe(19); // 07 PM
    expect(committed.getMinutes()).toBe(30);
    expect(field()).toHaveValue('07:30 PM');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('confirms the staged selection on an outside click', () => {
    const onChange = vi.fn();
    renderPicker({ onChange });

    fireEvent.click(field());
    fireEvent.click(within(column('Hours')).getByRole('option', { name: '07' }));
    fireEvent.pointerDown(document.body);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).getHours()).toBe(19);
    expect(field()).toHaveValue('07:30 PM');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('discards the staged selection on Escape', () => {
    const onChange = vi.fn();
    renderPicker({ onChange });

    fireEvent.click(field());
    fireEvent.click(within(column('Hours')).getByRole('option', { name: '07' }));
    fireEvent.keyDown(column('Hours'), { key: 'Escape' });

    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue('04:30 PM');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(field());
  });

  it('cancels without committing and closes', () => {
    const onChange = vi.fn();
    renderPicker({ onChange });

    fireEvent.click(field());
    fireEvent.click(within(column('Hours')).getByRole('option', { name: '09' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue('04:30 PM');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(field());
  });

  it('is controlled by value: Confirm fires onChange but the field changes only on value change', () => {
    const onChange = vi.fn();
    const { rerender } = renderPicker({ value: FOUR_THIRTY_PM, onChange });

    fireEvent.click(field());
    fireEvent.click(within(column('AM/PM')).getByRole('option', { name: 'AM' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(field()).toHaveValue('04:30 PM');

    rerender(<TimePicker value={new Date(2026, 2, 9, 4, 30)} onChange={onChange} aria-label="Time" />);
    expect(field()).toHaveValue('04:30 AM');
  });

  it('respects minuteStep', () => {
    renderPicker({ minuteStep: 15 });
    fireEvent.click(field());
    expect(within(column('Minutes')).getAllByRole('option')).toHaveLength(4); // 00, 15, 30, 45
  });

  it('moves focus into the columns on open', () => {
    renderPicker();
    fireEvent.click(field());
    expect(document.activeElement?.closest('[role="listbox"]')).not.toBeNull();
  });

  it('does not open when disabled', () => {
    renderPicker({ disabled: true });
    fireEvent.click(field());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('TimePicker CSS contract', () => {
  it('lays out three equal columns and 32px options', () => {
    const columns = css.match(/\.columns \{([\s\S]*?)\}/)?.[1] ?? '';
    expect(columns).toContain('grid-template-columns: repeat(3, 1fr);');
    const option = css.match(/\.option \{([\s\S]*?)\}/)?.[1] ?? '';
    expect(option).toContain('block-size: var(--size-400);');
  });

  it('highlights the selected option with the selected surface and content tokens', () => {
    expect(css).toMatch(
      /\.option\[data-selected='true'\] \{[\s\S]*?background: var\(--color-background-selected-default-default\);[\s\S]*?color: var\(--color-content-selected\);/,
    );
  });
});
