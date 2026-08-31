// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

    it('sets aria-invalid when invalid', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} invalid />);

      expect(combobox()).toHaveAttribute('aria-invalid', 'true');
    });

    it('opens on ArrowDown when closed', () => {
      render(<Select options={OPTIONS} value={null} onChange={vi.fn()} />);
      fireEvent.keyDown(combobox(), { key: 'ArrowDown' });

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('maps size and tone to the TextField trigger', () => {
      const { rerender } = render(<Select options={OPTIONS} value={null} onChange={vi.fn()} size="lg" tone="subtle" />);

      const frame = combobox().closest(`.${textFieldStyles.root}`);
      expect(frame).toHaveClass(textFieldStyles.size_lg);
      expect(frame).toHaveClass(textFieldStyles.appearance_subtle);

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

  it('rotates the caret only while open, via a class rather than inline style', () => {
    // Guards the one bit of CSS Select owns.
    expect(selectCss).toMatch(/\.caretOpen\s*\{[^}]*transform:\s*rotate\(180deg\)/);
  });

  it('colors the caret content/subtle at rest and content/disabled when disabled (Figma-verified)', () => {
    // Verified live against Figma's select-trigger caret_down vector: content/subtle default,
    // content/disabled when isDisabled. The CaretDownIcon inherits this via TextField's own
    // `.action :global([data-color]) { color: inherit }`.
    expect(selectCss).toMatch(/\.caret\s*\{[^}]*color:\s*var\(--color-content-subtle\)/);
    expect(selectCss).toMatch(/\.caretDisabled\s*\{[^}]*color:\s*var\(--color-content-disabled\)/);
  });

  it('applies the disabled caret class only when the field is disabled', () => {
    const { container, rerender } = render(<Select options={OPTIONS} value={null} onChange={vi.fn()} />);
    expect(container.querySelector(`.${selectStyles.caretDisabled}`)).not.toBeInTheDocument();

    rerender(<Select options={OPTIONS} value={null} onChange={vi.fn()} disabled />);
    expect(container.querySelector(`.${selectStyles.caretDisabled}`)).toBeInTheDocument();
  });
});
