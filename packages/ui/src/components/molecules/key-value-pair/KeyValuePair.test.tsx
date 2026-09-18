import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InlineEdit } from '../inline-edit';
import { TextArea } from '../text-area';
import { KeyValuePair } from './key-value-pair';
import styles from './key-value-pair.module.css';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function EditableNotes() {
  const [value, setValue] = useState('Saved note');
  return (
    <dl>
      <KeyValuePair label="Notes" underline>
        <InlineEdit value={value} onConfirm={setValue} actionPlacement="end" actionAlignment="start">
          <TextArea autoResize appearance="inline" aria-label="Notes" style={{ lineHeight: '24px' }} />
        </InlineEdit>
      </KeyValuePair>
      <KeyValuePair label="Status" value="Active" />
    </dl>
  );
}

describe('KeyValuePair', () => {
  it('allows newlines and restores both the saved value and height when canceled', () => {
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLTextAreaElement) {
      return this.value.split('\n').length * 24;
    });
    render(<EditableNotes />);
    const field = screen.getByRole('textbox', { name: 'Notes' });
    fireEvent.focus(field);
    // A true return means InlineEdit did not prevent the textarea's native newline behavior.
    expect(fireEvent.keyDown(field, { key: 'Enter' })).toBe(true);
    expect(fireEvent.keyDown(field, { key: 'Enter', shiftKey: true })).toBe(true);
    expect(field).not.toHaveAttribute('readOnly');
    fireEvent.change(field, { target: { value: 'New\nmultiline\ndraft' } });
    expect(field).toHaveStyle({ height: '72px' });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(field).toHaveValue('Saved note');
    expect(field).toHaveStyle({ height: '24px' });
    expect(field).toHaveAttribute('readOnly');
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it.each(['ctrlKey', 'metaKey'] as const)('confirms multiline text with %s+Enter', (modifier) => {
    render(<EditableNotes />);
    const field = screen.getByRole('textbox', { name: 'Notes' });
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: 'Saved\nmultiline note' } });
    fireEvent.keyDown(field, { key: 'Enter', [modifier]: true });
    expect(field).toHaveValue('Saved\nmultiline note');
    expect(field).toHaveAttribute('readOnly');
    expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
  });

  it('confirms with the action button and cancels later multiline edits with Escape', () => {
    render(<EditableNotes />);
    const field = screen.getByRole('textbox', { name: 'Notes' });
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: 'Saved\nmultiline note' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: 'Discard this' } });
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(field).toHaveValue('Saved\nmultiline note');
    expect(field).toHaveAttribute('readOnly');
  });

  it('renders the label as a <dt> and static value as a <dd>', () => {
    render(<KeyValuePair label="Name" value="Jane" />);

    const dt = screen.getByText('Name');
    const dd = screen.getByText('Jane');
    expect(dt.tagName).toBe('DT');
    expect(dd.tagName).toBe('DD');
  });

  it('uses the default size (md)', () => {
    const { container } = render(<KeyValuePair label="Name" value="Jane" />);

    expect(container.firstElementChild).toHaveAttribute('data-size', 'md');
  });

  it('applies a selected size', () => {
    const { container } = render(<KeyValuePair label="Name" value="Jane" size="lg" />);

    expect(container.firstElementChild).toHaveAttribute('data-size', 'lg');
    expect(container.firstElementChild).toHaveClass(styles.size_lg);
  });

  it('renders the underline divider when underline is true', () => {
    const { container } = render(<KeyValuePair label="Name" value="Jane" underline />);

    expect(container.firstElementChild).toHaveClass(styles.underline);
  });

  it('does not render the underline divider by default', () => {
    const { container } = render(<KeyValuePair label="Name" value="Jane" />);

    expect(container.firstElementChild).not.toHaveClass(styles.underline);
  });

  it('renders children in the value slot instead of the value prop', () => {
    render(
      <KeyValuePair label="Name" value="Ignored">
        <input aria-label="Name" defaultValue="Jane" />
      </KeyValuePair>,
    );

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.queryByText('Ignored')).toBeNull();
  });

  it('renders static value text when no children are provided', () => {
    render(<KeyValuePair label="Status" value="Active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies className to the root', () => {
    const { container } = render(<KeyValuePair label="Name" value="Jane" className="custom-kv" />);

    expect(container.firstElementChild).toHaveClass('custom-kv');
  });

  it('supports all three sizes', () => {
    const { container, rerender } = render(<KeyValuePair label="K" value="V" size="sm" />);
    expect(container.firstElementChild).toHaveClass(styles.size_sm);

    rerender(<KeyValuePair label="K" value="V" size="md" />);
    expect(container.firstElementChild).toHaveClass(styles.size_md);

    rerender(<KeyValuePair label="K" value="V" size="lg" />);
    expect(container.firstElementChild).toHaveClass(styles.size_lg);
  });
});
