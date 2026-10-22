// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from '../../molecules/field';
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

  it('moves focus to the chosen hour on open, once the panel is shown', async () => {
    renderPicker();
    field().focus();
    fireEvent.click(field());
    await waitFor(() => expect(within(column('Hours')).getByRole('option', { name: '04' })).toHaveFocus());
  });

  it('names the dialog, with a translatable default, and points the field at it', () => {
    const { unmount } = renderPicker();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(field());
    const dialog = screen.getByRole('dialog', { name: 'Choose a time' });
    expect(dialog).toContainElement(column('Hours'));
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    expect(field()).toHaveAttribute('aria-controls', dialog.id);
    unmount();

    renderPicker({ dialogLabel: 'Elegir una hora' });
    fireEvent.click(field());
    expect(screen.getByRole('dialog', { name: 'Elegir una hora' })).toBeInTheDocument();
  });

  it('shows amLabel and pmLabel as the AM/PM options', () => {
    const onChange = vi.fn();
    renderPicker({ amLabel: 'a. m.', pmLabel: 'p. m.', onChange });
    fireEvent.click(field());

    const meridiem = column('AM/PM');
    expect(within(meridiem).getByRole('option', { name: 'p. m.' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(within(meridiem).getByRole('option', { name: 'a. m.' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect((onChange.mock.calls[0][0] as Date).getHours()).toBe(4);
  });

  it('closes and returns focus to the field when Tab leaves the panel, without saving an unchanged time', async () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    field().focus();
    fireEvent.click(field());
    const hour = within(column('Hours')).getByRole('option', { name: '04' });
    await waitFor(() => expect(hour).toHaveFocus());

    // Tab inside the panel moves on without closing.
    expect(fireEvent.keyDown(hour, { key: 'Tab' })).toBe(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Shift+Tab from the first stop leaves the panel.
    expect(fireEvent.keyDown(hour, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(field()).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('saves a changed time when Tab leaves the panel from Confirm', () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    fireEvent.click(field());
    fireEvent.click(within(column('Hours')).getByRole('option', { name: '07' }));

    const confirm = screen.getByRole('button', { name: 'Confirm' });
    confirm.focus();
    fireEvent.keyDown(confirm, { key: 'Tab' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(field()).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(field()).toHaveValue('07:30 PM');
  });

  it('does not open when disabled', () => {
    renderPicker({ disabled: true });
    fireEvent.click(field());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open inside a disabled fieldset, by click or key', () => {
    render(
      <fieldset disabled>
        <TimePicker defaultValue={FOUR_THIRTY_PM} aria-label="Time" />
      </fieldset>,
    );
    expect(field()).toBeDisabled();
    fireEvent.click(field());
    fireEvent.keyDown(field(), { key: 'Enter' });
    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('TimePicker minute snapping and unchanged dismissals', () => {
  const TEN_FIFTY_EIGHT = new Date(2026, 2, 9, 10, 58);

  it('opens minutes between steps on the step before them, in the same hour', () => {
    renderPicker({ defaultValue: TEN_FIFTY_EIGHT });
    fireEvent.click(field());

    expect(within(column('Hours')).getByRole('option', { name: '10' })).toHaveAttribute('aria-selected', 'true');
    expect(within(column('Minutes')).getByRole('option', { name: '55' })).toHaveAttribute('aria-selected', 'true');
    expect(within(column('AM/PM')).getByRole('option', { name: 'AM' })).toHaveAttribute('aria-selected', 'true');
  });

  it('does not save or call onChange when the panel is opened and dismissed with no change', () => {
    const onChange = vi.fn();
    renderPicker({ defaultValue: TEN_FIFTY_EIGHT, onChange });

    fireEvent.click(field());
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(field());
    fireEvent.click(field()); // a second click on the field
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue('10:58 AM');
  });

  it('leaves an empty field empty when the panel is dismissed with no choice', () => {
    const onChange = vi.fn();
    renderPicker({ defaultValue: null, onChange });

    fireEvent.click(field());
    fireEvent.pointerDown(document.body);

    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveValue('');
  });

  it('Confirm saves the shown time, but not a time equal to the saved one', () => {
    const onChange = vi.fn();
    renderPicker({ onChange });
    fireEvent.click(field());
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    cleanup();

    // With no value, Confirm saves the 12:00 AM the columns start on.
    const onEmptyChange = vi.fn();
    renderPicker({ defaultValue: null, onChange: onEmptyChange });
    fireEvent.click(field());
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onEmptyChange).toHaveBeenCalledTimes(1);
    expect(field()).toHaveValue('12:00 AM');
  });

  it('offers only minutes that exist when the step does not divide 60, and opens on one of them', () => {
    renderPicker({ defaultValue: new Date(2026, 2, 9, 10, 55), minuteStep: 35 });
    fireEvent.click(field());

    const options = within(column('Minutes')).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['00', '35']);
    // 55 used to round to 70 % 60 = 10, which isn't an option, so no minute was chosen.
    expect(within(column('Minutes')).getByRole('option', { name: '35' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('TimePicker required', () => {
  function renderInForm(props: Partial<React.ComponentProps<typeof TimePicker>> = {}) {
    render(
      <form aria-label="Hearing">
        <TimePicker defaultValue={null} aria-label="Time" required {...props} />
      </form>,
    );
    return screen.getByRole('form') as HTMLFormElement;
  }

  it('stops the form from submitting while the time is empty', () => {
    const form = renderInForm();
    expect((field() as HTMLInputElement).willValidate).toBe(false);
    expect(form.checkValidity()).toBe(false);

    fireEvent.click(field());
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(form.checkValidity()).toBe(true);
  });

  it('passes with a time, and when disabled', () => {
    expect(renderInForm({ defaultValue: FOUR_THIRTY_PM }).checkValidity()).toBe(true);
    cleanup();
    expect(renderInForm({ disabled: true }).checkValidity()).toBe(true);
  });

  it('sends focus on to the field when the browser points at the empty value', () => {
    const form = renderInForm();
    form.querySelector<HTMLInputElement>('input[aria-hidden="true"]')!.focus();
    expect(field()).toHaveFocus();
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

  it('takes the wiring Field passes on its input, not its wrapper', () => {
    render(
      <Field label="Start time" message="In your time zone" state="error" required>
        <TimePicker />
      </Field>,
    );

    const input = screen.getByRole('textbox', { name: 'Start time' });
    expect(input).toHaveAccessibleDescription('In your time zone');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
  });
});
