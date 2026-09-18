// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DateTimePicker } from './date-time-picker';
import styles from './date-time-picker.module.css';

const css = readFileSync(
  'packages/ui/src/components/organisms/date-time-picker/date-time-picker.module.css',
  'utf8',
);

const MARCH_9_430PM = new Date(2026, 2, 9, 16, 30);

function renderPicker(props: Partial<React.ComponentProps<typeof DateTimePicker>> = {}) {
  return render(
    <DateTimePicker defaultValue={MARCH_9_430PM} today={MARCH_9_430PM} aria-label="When" {...props} />,
  );
}

const dateField = () => screen.getByRole('textbox', { name: 'Date' });
const timeField = () => screen.getByRole('textbox', { name: 'Time' });

function calendarDay(day: number) {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('[role="grid"] button')).find(
    (button) =>
      button.querySelector('span')?.textContent === String(day) &&
      button.getAttribute('data-outside') !== 'true',
  );
}

afterEach(cleanup);

describe('DateTimePicker', () => {
  it('renders a date field and a time field in a labelled group', () => {
    renderPicker();
    const group = screen.getByRole('group', { name: 'When' });
    expect(within(group).getAllByRole('textbox')).toHaveLength(2);
    expect(dateField()).toHaveValue('03/09/2026');
    expect(timeField()).toHaveValue('04:30 PM');
  });

  it('selecting a date keeps the time', () => {
    const onChange = vi.fn();
    renderPicker({ onChange });

    fireEvent.click(dateField());
    fireEvent.click(calendarDay(15)!);

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as Date;
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(2);
    expect(next.getDate()).toBe(15);
    expect(next.getHours()).toBe(16);
    expect(next.getMinutes()).toBe(30);

    expect(dateField()).toHaveValue('03/15/2026');
    expect(timeField()).toHaveValue('04:30 PM');
  });

  it('confirming a time keeps the date', () => {
    const onChange = vi.fn();
    renderPicker({ onChange });

    fireEvent.click(timeField());
    fireEvent.click(within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '07' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    const next = onChange.mock.calls[0][0] as Date;
    expect(next.getDate()).toBe(9);
    expect(next.getHours()).toBe(19); // 07 PM
    expect(next.getMinutes()).toBe(30);

    expect(dateField()).toHaveValue('03/09/2026');
    expect(timeField()).toHaveValue('07:30 PM');
  });

  it('is controlled by value', () => {
    const onChange = vi.fn();
    const { rerender } = renderPicker({ value: MARCH_9_430PM, onChange });

    fireEvent.click(dateField());
    fireEvent.click(calendarDay(20)!);

    expect(onChange).toHaveBeenCalledTimes(1);
    // Controlled: fields do not move until value updates.
    expect(dateField()).toHaveValue('03/09/2026');

    rerender(<DateTimePicker value={new Date(2026, 2, 20, 16, 30)} onChange={onChange} today={MARCH_9_430PM} aria-label="When" />);
    expect(dateField()).toHaveValue('03/20/2026');
  });

  it('disables both fields', () => {
    renderPicker({ disabled: true });
    fireEvent.click(dateField());
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    fireEvent.click(timeField());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('applies size and context on the group', () => {
    const { container } = renderPicker({ size: 'lg', context: 'inline' });
    const group = container.querySelector(`.${styles.root}`);
    expect(group).toHaveAttribute('data-size', 'lg');
    expect(group).toHaveAttribute('data-context', 'inline');
  });
});

describe('DateTimePicker CSS contract', () => {
  it('joins the two halves by collapsing the shared border and squaring the inner corners', () => {
    expect(css).toContain('margin-inline-start: calc(-1 * var(--border-width-sm));');
    expect(css).toMatch(/\.date > div \{[\s\S]*?border-start-end-radius: 0;[\s\S]*?border-end-end-radius: 0;/);
    expect(css).toMatch(/\.time > div \{[\s\S]*?border-start-start-radius: 0;[\s\S]*?border-end-start-radius: 0;/);
  });
});
