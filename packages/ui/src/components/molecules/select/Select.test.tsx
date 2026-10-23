// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditableCellContext } from '../../primitives/editable-cell-context';
import { Field } from '../field';
import { Select } from './select';
import type { SelectOption } from './select.types';
import textFieldStyles from '../text-field/text-field.module.css';
import selectStyles from './select.module.css';

const selectCss = readFileSync('packages/ui/src/components/molecules/select/select.module.css', 'utf8');

afterEach(cleanup);

const OPTIONS: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'in-review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived', disabled: true },
];

function combobox() {
  return screen.getByRole('combobox');
}

function open() {
  fireEvent.mouseDown(combobox());
}

describe('Select', () => {
  describe('single-select', () => {
    it('renders a combobox trigger showing the placeholder when nothing is selected', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} placeholder="Choose a status" />);

      expect(combobox()).toHaveAttribute('placeholder', 'Choose a status');
      expect(combobox()).toHaveValue('');
    });

    it('opens the menu on interaction and lists the options as radio items', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} />);
      open();

      const menu = screen.getByRole('menu');
      expect(within(menu).getByRole('menuitemradio', { name: 'Draft' })).toBeInTheDocument();
      expect(within(menu).getByRole('menuitemradio', { name: 'Approved' })).toBeInTheDocument();
    });

    it('calls onChange and closes when an option is chosen', () => {
      const onChange = vi.fn();
      render(<Select options={OPTIONS} value={null} onChange={onChange} />);
      open();
      fireEvent.click(screen.getByRole('menuitemradio', { name: 'In review' }));

      expect(onChange).toHaveBeenCalledWith('in-review');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('shows the selected option label in the trigger when closed', () => {
      render(<Select options={OPTIONS} value="approved" onChange={vi.fn()} />);

      expect(combobox()).toHaveValue('Approved');
    });

    it("shows the chosen option's icon before the value in the trigger, hidden from assistive technology", () => {
      const withIcons: SelectOption[] = [
        { value: 'draft', label: 'Draft', icon: <svg data-testid="draft-icon" /> },
        { value: 'approved', label: 'Approved', icon: <svg data-testid="approved-icon" /> },
        { value: 'plain', label: 'Plain' },
      ];
      const { rerender } = render(<Select options={withIcons} value="approved" onChange={vi.fn()} />);
      const frame = combobox().parentElement as HTMLElement;
      const before = frame.querySelector(`.${textFieldStyles.before}`);

      expect(before).toHaveAttribute('aria-hidden', 'true');
      expect(within(before as HTMLElement).getByTestId('approved-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('draft-icon')).not.toBeInTheDocument();
      // The accessible value is still the label alone.
      expect(combobox()).toHaveValue('Approved');

      rerender(<Select options={withIcons} value="plain" onChange={vi.fn()} />);
      expect(frame.querySelector(`.${textFieldStyles.before}`)).not.toBeInTheDocument();

      rerender(<Select options={withIcons} value={null} onChange={vi.fn()} />);
      expect(frame.querySelector(`.${textFieldStyles.before}`)).not.toBeInTheDocument();
    });

    it("keeps the chosen option's icon in its own color in the trigger, as in its menu row", () => {
      const withStatus: SelectOption[] = [
        { value: 'approved', label: 'Approved', icon: <span data-testid="approved-icon" data-color="success" /> },
      ];
      render(<Select options={withStatus} value="approved" onChange={vi.fn()} />);
      const icon = screen.getByTestId('approved-icon');
      // Text Field's leading slot holds it and leaves its named color alone; Select's wrapper is
      // there only for the disabled grey.
      expect(icon.parentElement).toHaveClass(selectStyles.optionIcon);
      expect(icon.parentElement?.parentElement).toHaveClass(textFieldStyles.before);
      expect(selectCss).not.toMatch(/\[data-color='[a-z]+'\]/);
    });

    it("greys the chosen option's icon when disabled, like the caret", () => {
      // Stronger than Icon's single color class, so it wins over a named color too. Keyed off the
      // input's :disabled, so a disabled fieldset greys it as the prop does.
      expect(selectCss).toMatch(
        /\.trigger:where\(:has\(input:disabled\)\) \.optionIcon :global\(\[data-color\]\) \{\s*color: var\(--color-content-disabled\);/,
      );
    });

    it('marks the selected option checked', () => {
      render(<Select options={OPTIONS} value="approved" onChange={vi.fn()} />);
      open();

      expect(screen.getByRole('menuitemradio', { name: 'Approved' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('menuitemradio', { name: 'Draft' })).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('typeahead', () => {
    it('filters options by a case-insensitive substring of the label', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} />);
      fireEvent.change(combobox(), { target: { value: 're' } });

      const menu = screen.getByRole('menu');
      expect(within(menu).getByRole('menuitemradio', { name: 'In review' })).toBeInTheDocument();
      expect(within(menu).queryByRole('menuitemradio', { name: 'Draft' })).not.toBeInTheDocument();
    });

    it('shows the empty message when the query matches nothing', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} emptyMessage="No statuses found" />);
      fireEvent.change(combobox(), { target: { value: 'zzz' } });

      expect(screen.getByText('No statuses found')).toBeInTheDocument();
    });

    it('does not filter internally when search is controlled externally', () => {
      const onSearchChange = vi.fn();
      render(
        <Select options={OPTIONS} value={null} onChange={vi.fn()} searchValue="zzz" onSearchChange={onSearchChange} />,
      );
      open();

      // Externally controlled: Select renders every option and lets the caller do the filtering.
      expect(screen.getByRole('menuitemradio', { name: 'Draft' })).toBeInTheDocument();
      fireEvent.change(combobox(), { target: { value: 'dr' } });
      expect(onSearchChange).toHaveBeenCalledWith('dr');
    });
  });

  describe('multi-select', () => {
    it('renders a removable chip per selected value, not the labels in the input', () => {
      render(<Select inputType="multi" options={OPTIONS} value={['draft', 'approved']} onChange={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Remove Draft' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove Approved' })).toBeInTheDocument();
      expect(combobox()).toHaveValue('');
    });

    it('lists options as checkbox items and toggles without closing', () => {
      const onChange = vi.fn();
      render(<Select inputType="multi" options={OPTIONS} value={['draft']} onChange={onChange} />);
      open();

      fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Approved' }));
      expect(onChange).toHaveBeenCalledWith(['draft', 'approved']);
      // stays open for the next pick
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('deselects an already-selected value when its row is re-picked', () => {
      const onChange = vi.fn();
      render(<Select inputType="multi" options={OPTIONS} value={['draft', 'approved']} onChange={onChange} />);
      open();

      fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Draft' }));
      expect(onChange).toHaveBeenCalledWith(['approved']);
    });

    it('removes a value when its chip remove button is clicked', () => {
      const onChange = vi.fn();
      render(<Select inputType="multi" options={OPTIONS} value={['draft', 'approved']} onChange={onChange} />);

      fireEvent.click(screen.getByRole('button', { name: 'Remove Draft' }));
      expect(onChange).toHaveBeenCalledWith(['approved']);
    });

    it("names the chips' remove buttons with getRemoveLabel, for translation", () => {
      const onChange = vi.fn();
      render(
        <Select
          inputType="multi"
          options={OPTIONS}
          value={['draft', 'approved']}
          onChange={onChange}
          getRemoveLabel={(label) => `Retirer ${label}`}
        />,
      );

      expect(screen.queryByRole('button', { name: 'Remove Draft' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Retirer Draft' }));
      expect(onChange).toHaveBeenCalledWith(['approved']);
      expect(screen.getByRole('button', { name: 'Retirer Approved' })).toBeInTheDocument();
    });

    it("passes removeTooltipLabel to the chips' remove tooltips, with an English default", () => {
      vi.useFakeTimers();
      try {
        const hover = (element: HTMLElement) => {
          fireEvent.pointerEnter(element);
          act(() => {
            vi.advanceTimersByTime(300);
          });
        };
        const { unmount } = render(<Select inputType="multi" options={OPTIONS} value={['draft']} onChange={vi.fn()} />);
        hover(screen.getByRole('button', { name: 'Remove Draft' }));
        expect(screen.getByRole('tooltip')).toHaveTextContent('Remove');
        unmount();

        render(
          <Select inputType="multi" options={OPTIONS} value={['draft']} onChange={vi.fn()} removeTooltipLabel="Retirer" />,
        );
        hover(screen.getByRole('button', { name: 'Remove Draft' }));
        expect(screen.getByRole('tooltip')).toHaveTextContent('Retirer');
      } finally {
        vi.useRealTimers();
      }
    });

    it('removes the last chip on Backspace when the query is empty', () => {
      const onChange = vi.fn();
      render(<Select inputType="multi" options={OPTIONS} value={['draft', 'approved']} onChange={onChange} />);

      fireEvent.keyDown(combobox(), { key: 'Backspace' });
      expect(onChange).toHaveBeenCalledWith(['draft']);
    });

    it('does not Backspace-remove while the query is non-empty', () => {
      const onChange = vi.fn();
      render(<Select inputType="multi" options={OPTIONS} value={['draft']} onChange={onChange} />);
      fireEvent.change(combobox(), { target: { value: 'ap' } });

      fireEvent.keyDown(combobox(), { key: 'Backspace' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('grouping', () => {
    it('renders a section heading per group', () => {
      const grouped: SelectOption[] = [
        { value: 'a', label: 'Alpha', group: 'Letters' },
        { value: 'b', label: 'Beta', group: 'Letters' },
        { value: '1', label: 'One', group: 'Numbers' },
      ];
      render(<Select options={grouped} value={null} onChange={vi.fn()} />);
      open();

      expect(screen.getByText('Letters')).toBeInTheDocument();
      expect(screen.getByText('Numbers')).toBeInTheDocument();
    });
  });

  describe('states', () => {
    it('does not open when disabled', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} disabled />);
      open();

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(combobox()).toBeDisabled();
    });

    it('does not open inside a disabled fieldset, from the input, the frame, or the caret', () => {
      const { container } = render(
        <fieldset disabled>
          <Select options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Status" />
        </fieldset>,
      );
      expect(combobox()).toBeDisabled();

      open();
      fireEvent.mouseDown(container.querySelector(`.${textFieldStyles.root}`) as Element);
      fireEvent.mouseDown(container.querySelector(`.${selectStyles.caret}`) as Element);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it.each([
      ['the disabled prop', (select: React.ReactElement) => select, true],
      ['a disabled fieldset', (select: React.ReactElement) => <fieldset disabled>{select}</fieldset>, false],
    ])('never opens its menu by pointer or keyboard when disabled by %s, in a form or a table cell', (_, wrap, disabledProp) => {
      for (const cell of [null, 'md'] as const) {
        const onChange = vi.fn();
        const { container, unmount } = render(
          <EditableCellContext.Provider value={cell}>
            {wrap(<Select options={OPTIONS} value="draft" onChange={onChange} aria-label="Status" disabled={disabledProp} />)}
          </EditableCellContext.Provider>,
        );
        const input = combobox();
        expect(input).toBeDisabled();

        fireEvent.mouseDown(input);
        fireEvent.click(input);
        fireEvent.mouseDown(container.querySelector(`.${textFieldStyles.root}`) as Element);
        fireEvent.click(container.querySelector(`.${textFieldStyles.root}`) as Element);
        fireEvent.mouseDown(container.querySelector(`.${selectStyles.caret}`) as Element);
        for (const key of ['ArrowDown', 'ArrowUp', 'Enter', ' ']) fireEvent.keyDown(input, { key });
        fireEvent.change(input, { target: { value: 'App' } });

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(onChange).not.toHaveBeenCalled();
        unmount();
      }
    });

    it('sets aria-invalid when invalid', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} invalid />);

      expect(combobox()).toHaveAttribute('aria-invalid', 'true');
    });

    it('opens on ArrowDown when closed', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} />);
      fireEvent.keyDown(combobox(), { key: 'ArrowDown' });

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('maps size and context to the TextField trigger', () => {
      const { rerender } = render(<Select options={OPTIONS} value={null} onChange={vi.fn()} size="lg" context="inline" />);

      const frame = combobox().closest(`.${textFieldStyles.root}`);
      expect(frame).toHaveClass(textFieldStyles.size_lg);
      expect(frame).toHaveClass(textFieldStyles.context_inline);

      rerender(<Select options={OPTIONS} value={null} onChange={vi.fn()} size="sm" />);
      expect(combobox().closest(`.${textFieldStyles.root}`)).toHaveClass(textFieldStyles.size_sm);
    });
  });

  describe('accessibility', () => {
    it('is a combobox with a menu popup and list autocomplete', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Status" />);

      const input = screen.getByRole('combobox', { name: 'Status' });
      expect(input).toHaveAttribute('aria-haspopup', 'menu');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('exposes aria-expanded reflecting the open state', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} />);
      expect(combobox()).toHaveAttribute('aria-expanded', 'false');

      open();
      expect(combobox()).toHaveAttribute('aria-expanded', 'true');
    });

    it('supports a custom id and className on the trigger', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} id="status-select" className="custom-select" />);

      expect(combobox()).toHaveAttribute('id', 'status-select');
      expect(combobox().closest(`.${textFieldStyles.root}`)).toHaveClass('custom-select');
    });
  });

  describe('focus', () => {
    function openAndEnterMenu() {
      combobox().focus();
      open();
      fireEvent.keyDown(combobox(), { key: 'ArrowDown' });
      const first = screen.getAllByRole('menuitemradio')[0];
      expect(first).toHaveFocus();
      return first;
    }

    it('returns focus to the field on Escape from inside the menu', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Status" />);
      const item = openAndEnterMenu();

      fireEvent.keyDown(item, { key: 'Escape' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(combobox()).toHaveFocus();
    });

    it('returns focus to the field after a single-select pick', () => {
      const onChange = vi.fn();
      render(<Select options={OPTIONS} value={null} onChange={onChange} aria-label="Status" />);
      openAndEnterMenu();

      fireEvent.click(screen.getByRole('menuitemradio', { name: 'In review' }));

      expect(onChange).toHaveBeenCalledWith('in-review');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(combobox()).toHaveFocus();
    });

    it.each([false, true])('closes the menu and returns focus to the field on Tab inside it (shift=%s)', (shiftKey) => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Status" />);
      const item = openAndEnterMenu();

      const notPrevented = fireEvent.keyDown(item, { key: 'Tab', shiftKey });

      expect(notPrevented).toBe(false);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(combobox()).toHaveFocus();
    });

    it('closes the menu when focus moves out of the field', () => {
      render(
        <>
          <Select options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Status" />
          <button type="button">Next</button>
        </>,
      );
      combobox().focus();
      open();
      expect(screen.getByRole('menu')).toBeInTheDocument();

      act(() => screen.getByRole('button', { name: 'Next' }).focus());

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('keeps the menu open while focus moves within the field, such as to a chip', () => {
      render(<Select inputType="multi" options={OPTIONS} value={['draft']} onChange={vi.fn()} aria-label="Statuses" />);
      combobox().focus();
      open();

      act(() => screen.getByRole('button', { name: 'Remove Draft' }).focus());

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('keeps the menu open when the field loses focus to nothing in particular', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Status" />);
      combobox().focus();
      open();

      fireEvent.focusOut(combobox(), { relatedTarget: null });

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('naming the menu', () => {
    it('names the menu from a native label pointing at the field', () => {
      render(
        <>
          <label htmlFor="status-field">Status</label>
          <Select id="status-field" options={OPTIONS} value={null} onChange={vi.fn()} />
        </>,
      );
      open();

      expect(screen.getByRole('menu', { name: 'Status' })).toBeInTheDocument();
    });

    it('names the menu by reference when the native label has an id', () => {
      render(
        <>
          <label id="status-label" htmlFor="status-field">
            Status
          </label>
          <Select id="status-field" options={OPTIONS} value={null} onChange={vi.fn()} />
        </>,
      );
      open();

      const menu = screen.getByRole('menu', { name: 'Status' });
      expect(menu).toHaveAttribute('aria-labelledby', 'status-label');
    });

    it('names the menu from a wrapping label', () => {
      render(
        // eslint-disable-next-line jsx-a11y/label-has-associated-control
        <label>
          Status
          <Select options={OPTIONS} value="draft" onChange={vi.fn()} />
        </label>,
      );
      open();

      expect(screen.getByRole('menu', { name: 'Status' })).toBeInTheDocument();
    });

    it('prefers aria-label and aria-labelledby over a native label', () => {
      render(
        <>
          <label htmlFor="status-field">Status</label>
          <Select id="status-field" options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Matter status" />
        </>,
      );
      open();

      expect(screen.getByRole('menu', { name: 'Matter status' })).toBeInTheDocument();
    });
  });

  it('rotates the caret only while open, via a class rather than inline style', () => {
    // Guards the one bit of CSS Select owns.
    expect(selectCss).toMatch(/\.caretOpen\s*\{[^}]*transform:\s*rotate\(180deg\)/);
  });

  it('colors the caret content/subtle at rest and content/disabled when disabled (Figma-verified)', () => {
    // Verified live against Figma's select-trigger caret_down vector: content/subtle default,
    // content/disabled when isDisabled. The CaretDownIcon inherits this through Icon's default
    // `color="inherit"`.
    expect(selectCss).toMatch(/\.caret\s*\{[^}]*color:\s*var\(--field-icon-color,\s*var\(--color-content-subtle\)\)/);
    expect(selectCss).toMatch(/\.caretDisabled,\s*\.trigger:where\(:has\(input:disabled\)\) \.caret\s*\{[^}]*color:\s*var\(--color-content-disabled\)/);
  });

  it('applies the disabled caret class only when the field is disabled', () => {
    const { container, rerender } = render(<Select options={OPTIONS} value={null} onChange={vi.fn()} />);
    expect(container.querySelector(`.${selectStyles.caretDisabled}`)).not.toBeInTheDocument();

    rerender(<Select options={OPTIONS} value={null} onChange={vi.fn()} disabled />);
    expect(container.querySelector(`.${selectStyles.caretDisabled}`)).toBeInTheDocument();
  });

  it('maps the deprecated tone and appearance values to a context', () => {
    const { rerender } = render(<Select options={OPTIONS} value={null} onChange={vi.fn()} tone="subtle" />);
    expect(combobox().closest(`.${textFieldStyles.root}`)).toHaveClass(textFieldStyles.context_inline);
    rerender(<Select options={OPTIONS} value={null} onChange={vi.fn()} appearance="inline" />);
    expect(combobox().closest(`.${textFieldStyles.root}`)).toHaveClass(textFieldStyles.context_inline);
    rerender(<Select options={OPTIONS} value={null} onChange={vi.fn()} />);
    expect(combobox().closest(`.${textFieldStyles.root}`)).toHaveClass(textFieldStyles.context_default);
  });

  it('takes the wiring Field passes: its label, message, error, and required', () => {
    render(
      <Field label="Matter type" message="Pick the closest match" state="error" required>
        <Select options={OPTIONS} value={null} onChange={vi.fn()} />
      </Field>,
    );

    const input = screen.getByRole('combobox', { name: 'Matter type' });
    expect(input).toHaveAccessibleDescription('Pick the closest match');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
  });
});
