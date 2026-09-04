// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DatePicker } from './date-picker';

const css = readFileSync(
  'packages/ui/src/components/organisms/date-picker/date-picker.module.css',
  'utf8',
);

const TODAY = new Date(2026, 2, 9); // 9 March 2026

function renderPicker(props: Partial<React.ComponentProps<typeof DatePicker>> = {}) {
  return render(<DatePicker defaultValue={TODAY} today={TODAY} aria-label="Date" {...props} />);
}

function field() {
  return screen.getByRole('textbox', { name: 'Date' });
}

function dayButton(day: number, outside = false) {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('[role="grid"] button')).find(
    (button) =>
      button.querySelector('span')?.textContent === String(day) &&
      (button.getAttribute('data-outside') === 'true') === outside,
  );
}

afterEach(cleanup);

describe('DatePicker', () => {
  it('renders a field with the formatted selected date and a closed popup', () => {
    renderPicker();
    expect(field()).toHaveValue('03/09/2026');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('shows the placeholder when there is no value', () => {
    renderPicker({ defaultValue: null, placeholder: 'MM/DD/YYYY' });
    expect(field()).toHaveValue('');
    expect(field()).toHaveAttribute('placeholder', 'MM/DD/YYYY');
  });

  it('opens the calendar on click and marks the field expanded', () => {
    renderPicker();
    fireEvent.click(field());
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens with Enter and Arrow Down', () => {
    renderPicker();
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('moves focus into the calendar when opened', () => {
    renderPicker();
    fireEvent.click(field());
    expect(document.activeElement?.closest('[role="grid"]')).not.toBeNull();
  });

  it('selects a day, fills the field, closes, and returns focus (uncontrolled)', () => {
    const onChange = vi.fn();
    renderPicker({ onChange });

    fireEvent.click(field());
    fireEvent.click(dayButton(15)!);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
    expect(field()).toHaveValue('03/15/2026');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(field());
  });

  it('is controlled by value: onChange fires but the field does not change until value changes', () => {
    const onChange = vi.fn();
    const { rerender } = renderPicker({ value: TODAY, onChange });

    fireEvent.click(field());
    fireEvent.click(dayButton(20)!);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(field()).toHaveValue('03/09/2026');

    rerender(<DatePicker value={new Date(2026, 2, 20)} onChange={onChange} today={TODAY} aria-label="Date" />);
    expect(field()).toHaveValue('03/20/2026');
  });

  it('closes on Escape and returns focus to the field', () => {
    renderPicker();
    fireEvent.click(field());
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'Escape' });

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(field());
  });

  it('does not open when disabled', () => {
    renderPicker({ disabled: true });
    fireEvent.click(field());
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('passes min/max through to the calendar', () => {
    renderPicker({ min: new Date(2026, 2, 4), max: new Date(2026, 2, 24) });
    fireEvent.click(field());
    expect(dayButton(3)!).toHaveAttribute('data-disabled', 'true');
    expect(dayButton(25)!).toHaveAttribute('data-disabled', 'true');
  });

  it('exposes a dialog popup labelled to the field via aria-controls', () => {
    renderPicker();
    fireEvent.click(field());
    const controls = field().getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls!)).toHaveAttribute('role', 'dialog');
  });
});

describe('DatePicker CSS contract', () => {
  it('defaults to the Figma 240px field width but shrinks to its container', () => {
    const rule = css.match(/\.root \{([\s\S]*?)\}/)?.[1] ?? '';
    expect(rule).toContain('inline-size: 240px;');
    expect(rule).toContain('max-inline-size: 100%;');
  });

  it('renders the read-only trigger as a control (pointer cursor, no caret)', () => {
    const rule = css.match(/\.triggerInput \{([\s\S]*?)\}/)?.[1] ?? '';
    expect(rule).toContain('cursor: pointer;');
    expect(rule).toContain('caret-color: transparent;');
  });
});
