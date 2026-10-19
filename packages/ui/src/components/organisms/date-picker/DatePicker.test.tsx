// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from '../../molecules/field';
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

  it('moves focus into the calendar when opened, once the panel is shown', async () => {
    renderPicker();
    field().focus();
    fireEvent.click(field());
    await waitFor(() => expect(dayButton(9)).toHaveFocus());
  });

  it('names the calendar dialog, with a translatable default', () => {
    const { unmount } = renderPicker();
    fireEvent.click(field());
    expect(screen.getByRole('dialog', { name: 'Choose a date' })).toContainElement(screen.getByRole('grid'));
    unmount();

    renderPicker({ dialogLabel: 'Elegir una fecha' });
    fireEvent.click(field());
    expect(screen.getByRole('dialog', { name: 'Elegir una fecha' })).toBeInTheDocument();
  });

  it('closes and returns focus to the field when Tab leaves the calendar', async () => {
    renderPicker();
    field().focus();
    fireEvent.click(field());
    await waitFor(() => expect(dayButton(9)).toHaveFocus());

    // The day is the last stop: Tab leaves the panel.
    expect(fireEvent.keyDown(dayButton(9)!, { key: 'Tab' })).toBe(false);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(field()).toHaveFocus();
  });

  it('closes and returns focus to the field when Shift+Tab leaves the calendar', async () => {
    renderPicker();
    field().focus();
    fireEvent.click(field());
    await waitFor(() => expect(dayButton(9)).toHaveFocus());

    // Tab within the panel (from the first header button) doesn't close it.
    const previousYear = screen.getByRole('button', { name: 'Previous year' });
    previousYear.focus();
    expect(fireEvent.keyDown(previousYear, { key: 'Tab' })).toBe(true);
    expect(screen.getByRole('grid')).toBeInTheDocument();

    fireEvent.keyDown(previousYear, { key: 'Tab', shiftKey: true });
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(field()).toHaveFocus();
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

  it('closes on Escape and returns focus to the field', async () => {
    renderPicker();
    field().focus();
    fireEvent.click(field());
    await waitFor(() => expect(dayButton(9)).toHaveFocus());
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

  it('points the field at the dialog with aria-controls while open', () => {
    renderPicker();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(field()).not.toHaveAttribute('aria-controls');
    fireEvent.click(field());
    const controls = field().getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls!)).toBe(screen.getByRole('dialog', { name: 'Choose a date' }));
  });
});

describe('DatePicker required', () => {
  function renderInForm(props: Partial<React.ComponentProps<typeof DatePicker>> = {}) {
    render(
      <form aria-label="Filing">
        <DatePicker defaultValue={null} today={TODAY} aria-label="Date" required {...props} />
      </form>,
    );
    return screen.getByRole('form') as HTMLFormElement;
  }

  it('stops the form from submitting while the date is empty', () => {
    const form = renderInForm();
    // The read-only field itself is never validated by the browser.
    expect((field() as HTMLInputElement).willValidate).toBe(false);
    expect(form.checkValidity()).toBe(false);

    fireEvent.click(field());
    fireEvent.click(dayButton(15)!);
    expect(form.checkValidity()).toBe(true);
  });

  it('passes with a date, and when disabled', () => {
    expect(renderInForm({ defaultValue: TODAY }).checkValidity()).toBe(true);
    cleanup();
    expect(renderInForm({ disabled: true }).checkValidity()).toBe(true);
  });

  it('sends focus on to the field when the browser points at the empty value', () => {
    const form = renderInForm();
    const holder = form.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!;
    expect(holder).toHaveAttribute('tabindex', '-1');
    holder.focus();
    expect(field()).toHaveFocus();
  });

  it('adds nothing when not required', () => {
    const form = renderInForm({ required: false });
    expect(form.querySelectorAll('input')).toHaveLength(1);
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

  it('takes the wiring Field passes on its input, not its wrapper', () => {
    render(
      <Field label="Due date" message="The court's filing deadline" state="error" required>
        <DatePicker />
      </Field>,
    );

    const input = screen.getByRole('textbox', { name: 'Due date' });
    expect(input).toHaveAccessibleDescription("The court's filing deadline");
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
  });
});
