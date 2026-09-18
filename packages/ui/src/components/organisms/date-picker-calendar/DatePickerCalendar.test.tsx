// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DatePickerCalendar } from './date-picker-calendar';

const css = readFileSync(
  'packages/ui/src/components/organisms/date-picker-calendar/date-picker-calendar.module.css',
  'utf8',
);

const TODAY = new Date(2026, 2, 9); // 9 March 2026

function renderCalendar(props: Partial<React.ComponentProps<typeof DatePickerCalendar>> = {}) {
  return render(<DatePickerCalendar defaultMonth={TODAY} today={TODAY} {...props} />);
}

function dayButton(container: HTMLElement, day: number, outside = false) {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) =>
      button.querySelector('span')?.textContent === String(day) &&
      (button.getAttribute('data-outside') === 'true') === outside,
  );
}

afterEach(cleanup);

describe('DatePickerCalendar', () => {
  it('renders the month title, weekday headers, and a 6-week grid', () => {
    const { container } = renderCalendar();

    expect(screen.getByText('March 2026')).toBeInTheDocument();
    const grid = screen.getByRole('grid');
    expect(within(grid).getAllByRole('columnheader')).toHaveLength(7);
    // 6 weeks x 7 days.
    expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(42);
  });

  it('marks today with aria-current="date"', () => {
    const { container } = renderCalendar();
    const nine = dayButton(container, 9)!;
    expect(nine).toHaveAttribute('aria-current', 'date');
    expect(nine).toHaveAttribute('data-today', 'true');
  });

  it('selects a day on click (uncontrolled) and marks its cell aria-selected', () => {
    const onChange = vi.fn();
    const { container } = renderCalendar({ onChange });

    const fifteen = dayButton(container, 15)!;
    fireEvent.click(fifteen);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
    expect(fifteen).toHaveAttribute('data-selected', 'true');
    expect(fifteen.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
  });

  it('is controlled by value: onChange fires but selection does not move until value changes', () => {
    const onChange = vi.fn();
    const { container, rerender } = renderCalendar({ value: TODAY, onChange });

    fireEvent.click(dayButton(container, 20)!);
    expect(onChange).toHaveBeenCalledTimes(1);
    // Still selected on the 9th (controlled value unchanged).
    expect(dayButton(container, 9)!).toHaveAttribute('data-selected', 'true');
    expect(dayButton(container, 20)!).not.toHaveAttribute('data-selected');

    rerender(<DatePickerCalendar defaultMonth={TODAY} today={TODAY} value={new Date(2026, 2, 20)} onChange={onChange} />);
    expect(dayButton(container, 20)!).toHaveAttribute('data-selected', 'true');
  });

  it('navigates months and years from the header', () => {
    renderCalendar();

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('April 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText('March 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
    expect(screen.getByText('March 2027')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('disables out-of-range days and blocks nav past min/max', () => {
    const { container } = renderCalendar({ min: new Date(2026, 2, 4), max: new Date(2026, 2, 24) });

    expect(dayButton(container, 3)!).toHaveAttribute('data-disabled', 'true');
    expect(dayButton(container, 25)!).toHaveAttribute('data-disabled', 'true');
    expect(dayButton(container, 10)!).not.toHaveAttribute('data-disabled');

    // The whole previous/next year is outside the range.
    expect(screen.getByRole('button', { name: 'Previous year' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next year' })).toBeDisabled();
  });

  it('does not select a disabled date', () => {
    const onChange = vi.fn();
    const { container } = renderCalendar({
      isDateDisabled: (date) => date.getDate() === 12,
      onChange,
    });

    const twelve = dayButton(container, 12)!;
    expect(twelve).toHaveAttribute('data-disabled', 'true');
    fireEvent.click(twelve);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('uses roving tabindex: only the focused day is tabbable', () => {
    const { container } = renderCalendar();
    expect(dayButton(container, 9)!).toHaveAttribute('tabindex', '0');
    expect(dayButton(container, 10)!).toHaveAttribute('tabindex', '-1');
  });

  it('moves the focused day with the arrow keys', () => {
    const { container } = renderCalendar();
    const nine = dayButton(container, 9)!;
    nine.focus();
    fireEvent.keyDown(nine, { key: 'ArrowRight' });

    const ten = dayButton(container, 10)!;
    expect(ten).toHaveAttribute('tabindex', '0');
    expect(document.activeElement).toBe(ten);
  });

  it('changes month when arrow navigation crosses the boundary', () => {
    const { container } = renderCalendar({ defaultValue: new Date(2026, 2, 31) });
    const thirtyOne = dayButton(container, 31)!;
    thirtyOne.focus();
    fireEvent.keyDown(thirtyOne, { key: 'ArrowRight' });

    expect(screen.getByText('April 2026')).toBeInTheDocument();
    expect(dayButton(container, 1)!).toHaveAttribute('tabindex', '0');
  });

  it('supports starting the week on Monday', () => {
    const grid = renderCalendar({ weekStartsOn: 1 }).container.querySelector('[role="grid"]')!;
    const firstHeader = within(grid as HTMLElement).getAllByRole('columnheader')[0];
    expect(firstHeader).toHaveTextContent('Mon');
    expect(firstHeader).toHaveAttribute('aria-label', 'Monday');
  });
});

describe('DatePickerCalendar CSS contract', () => {
  it('styles the selected day with the selected surface, border, and content tokens', () => {
    const rule = css.match(/\.day\[data-selected='true'\] \{([\s\S]*?)\}/)?.[1] ?? '';
    expect(rule).toContain('background: var(--color-background-selected-default-default);');
    expect(rule).toContain('border-color: var(--color-border-selected);');
    expect(rule).toContain('color: var(--color-content-selected);');
  });

  it('marks today with the selected content colour and an underline', () => {
    expect(css).toMatch(/\.day\[data-today='true'\] \{[\s\S]*?color: var\(--color-content-selected\);/);
    expect(css).toMatch(/\.day\[data-today='true'\]::after \{[\s\S]*?background: var\(--color-content-selected\);/);
  });

  it('uses the neutral overlay tokens for hover and press', () => {
    expect(css).toContain('background: var(--color-background-neutral-overlay-bold-hover);');
    expect(css).toContain('background: var(--color-background-neutral-overlay-bold-press);');
  });

  it('mutes out-of-month and disabled days with the disabled content token', () => {
    expect(css).toMatch(/\.day\[data-outside='true'\] \{[\s\S]*?color: var\(--color-content-disabled\);/);
    expect(css).toMatch(/\.day\[data-disabled='true'\] \{[\s\S]*?color: var\(--color-content-disabled\);/);
  });
});
