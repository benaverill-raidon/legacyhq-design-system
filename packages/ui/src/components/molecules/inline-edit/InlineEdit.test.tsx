// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './inline-edit';

const inlineEditCss = readFileSync(
  'packages/ui/src/components/molecules/inline-edit/inline-edit.module.css',
  'utf8',
);

afterEach(cleanup);

describe('InlineEdit', () => {
  it('renders the child read-only, with no action buttons, before editing starts', () => {
    render(
      <InlineEdit value="Q3 Planning">
        <input aria-label="Title" />
      </InlineEdit>,
    );

    const input = screen.getByLabelText('Title');
    expect(input).toHaveValue('Q3 Planning');
    expect(input).toHaveAttribute('readOnly');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('starts editing when the read-only field is focused/clicked, and shows the action buttons', () => {
    render(
      <InlineEdit value="Q3 Planning">
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));

    expect(screen.getByLabelText('Title')).not.toHaveAttribute('readOnly');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('hides the action buttons when actionButtons is false, while still editing', () => {
    render(
      <InlineEdit value="Q3 Planning" actionButtons={false}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));

    expect(screen.getByLabelText('Title')).not.toHaveAttribute('readOnly');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('confirm commits the typed draft and calls onConfirm with the new value', () => {
    const onConfirm = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onConfirm={onConfirm}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Q4 Roadmap' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).toHaveBeenCalledWith('Q4 Roadmap');
  });

  it('returns to the read-only display (showing the confirmed value) after confirming', () => {
    function Wrapper() {
      const [value, setValue] = useState('Q3 Planning');
      return (
        <InlineEdit value={value} onConfirm={setValue}>
          <input aria-label="Title" />
        </InlineEdit>
      );
    }

    render(<Wrapper />);

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Q4 Roadmap' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    const input = screen.getByLabelText('Title');
    expect(input).toHaveValue('Q4 Roadmap');
    expect(input).toHaveAttribute('readOnly');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('cancel discards the typed draft and reverts the field to the last confirmed value', () => {
    const onCancel = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onCancel={onCancel}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Something else' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    const input = screen.getByLabelText('Title');
    expect(input).toHaveValue('Q3 Planning');
    expect(input).toHaveAttribute('readOnly');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Enter confirms while editing', () => {
    const onConfirm = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onConfirm={onConfirm}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Q4 Roadmap' } });
    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Enter' });

    expect(onConfirm).toHaveBeenCalledWith('Q4 Roadmap');
  });

  it('Escape cancels while editing', () => {
    const onCancel = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onCancel={onCancel}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Title')).toHaveAttribute('readOnly');
  });

  it('Enter still confirms when actionButtons is false and the buttons are not rendered', () => {
    const onConfirm = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" actionButtons={false} onConfirm={onConfirm}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Q4 Roadmap' } });
    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Enter' });

    expect(onConfirm).toHaveBeenCalledWith('Q4 Roadmap');
    expect(screen.getByLabelText('Title')).toHaveAttribute('readOnly');
  });

  it('Escape still cancels when actionButtons is false and the buttons are not rendered', () => {
    const onCancel = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" actionButtons={false} onCancel={onCancel}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Something else' } });
    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Title')).toHaveValue('Q3 Planning');
    expect(screen.getByLabelText('Title')).toHaveAttribute('readOnly');
  });

  it('Enter blurs the field after confirming, deselecting it', () => {
    render(
      <InlineEdit value="Q3 Planning" onConfirm={() => {}}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    const input = screen.getByLabelText('Title');
    fireEvent.focus(input);
    const blurSpy = vi.spyOn(input, 'blur');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(blurSpy).toHaveBeenCalledTimes(1);
  });

  it('Escape blurs the field after canceling, deselecting it', () => {
    render(
      <InlineEdit value="Q3 Planning" onCancel={() => {}}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    const input = screen.getByLabelText('Title');
    fireEvent.focus(input);
    const blurSpy = vi.spyOn(input, 'blur');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(blurSpy).toHaveBeenCalledTimes(1);
  });

  it('does not blur the field on Enter/Escape before editing starts', () => {
    render(
      <InlineEdit value="Q3 Planning">
        <input aria-label="Title" />
      </InlineEdit>,
    );

    const input = screen.getByLabelText('Title');
    const blurSpy = vi.spyOn(input, 'blur');
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(blurSpy).not.toHaveBeenCalled();
  });

  it('auto-confirms, like clicking confirm, when focus moves outside the component', () => {
    const onConfirm = vi.fn();
    render(
      <div>
        <InlineEdit value="Q3 Planning" onConfirm={onConfirm}>
          <input aria-label="Title" />
        </InlineEdit>
        <button type="button">Somewhere else</button>
      </div>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Q4 Roadmap' } });
    fireEvent.blur(screen.getByLabelText('Title'), {
      relatedTarget: screen.getByRole('button', { name: 'Somewhere else' }),
    });

    expect(onConfirm).toHaveBeenCalledWith('Q4 Roadmap');
  });

  it('auto-confirms when relatedTarget is unavailable (e.g. clicking a non-focusable area)', () => {
    const onConfirm = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onConfirm={onConfirm}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Q4 Roadmap' } });
    fireEvent.blur(screen.getByLabelText('Title'), { relatedTarget: null });

    expect(onConfirm).toHaveBeenCalledWith('Q4 Roadmap');
  });

  it('does not auto-confirm when focus moves to the cancel/confirm buttons themselves', () => {
    const onConfirm = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onConfirm={onConfirm}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Q4 Roadmap' } });
    fireEvent.blur(screen.getByLabelText('Title'), {
      relatedTarget: screen.getByRole('button', { name: 'Confirm' }),
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('clicking cancel never triggers an auto-confirm from the blur it causes, even when relatedTarget is unavailable', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onConfirm={onConfirm} onCancel={onCancel}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Something else' } });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.mouseDown(cancelButton);
    // Some browsers don't transfer focus to a clicked <button>, so relatedTarget can be null even
    // though the click landed on our own cancel button - the mousedown flag must cover this case.
    fireEvent.blur(screen.getByLabelText('Title'), { relatedTarget: null });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('Enter/Escape do nothing before editing starts', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onConfirm={onConfirm} onCancel={onCancel}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Enter' });
    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Escape' });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('supports custom accessible names for the action buttons', () => {
    render(
      <InlineEdit value="Q3 Planning" confirmLabel="Save title" cancelLabel="Discard changes">
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));

    expect(screen.getByRole('button', { name: 'Save title' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeInTheDocument();
  });

  it('applies className to the root', () => {
    const { container } = render(
      <InlineEdit value="Q3 Planning" className="custom-inline-edit">
        <input aria-label="Title" />
      </InlineEdit>,
    );

    expect(container.firstChild).toHaveClass('custom-inline-edit');
  });

  it('sets data-editing to reflect the internal editing state', () => {
    const { container } = render(
      <InlineEdit value="Q3 Planning">
        <input aria-label="Title" />
      </InlineEdit>,
    );

    expect(container.firstChild).toHaveAttribute('data-editing', 'false');

    fireEvent.focus(screen.getByLabelText('Title'));

    expect(container.firstChild).toHaveAttribute('data-editing', 'true');
  });

  it('stacks the action row below the field, anchored to the right edge, with an 8px gap', () => {
    const rootRule = inlineEditCss.match(/\.root\s*\{([^}]*)\}/);
    const actionsRule = inlineEditCss.match(/\.actions\s*\{([^}]*)\}/);

    expect(rootRule?.[1]).toContain('flex-direction: column;');
    expect(rootRule?.[1]).toContain('gap: var(--spacing-sm);');
    expect(actionsRule?.[1]).toContain('align-self: flex-end;');
    expect(actionsRule?.[1]).toContain('gap: var(--spacing-xs);');
  });
});
