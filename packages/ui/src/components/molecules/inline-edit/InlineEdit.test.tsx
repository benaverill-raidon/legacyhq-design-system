// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it('claims the Escape that cancels, so a dialog around the field stays open', () => {
    render(
      <InlineEdit value="Q3 Planning">
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));
    // fireEvent returns false when the event's default was prevented.
    expect(fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Escape' })).toBe(false);
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

  it.each(['Enter', 'Escape'])('keeps focus on the field, now read-only, after %s', (key) => {
    render(
      <InlineEdit value="Q3 Planning" onConfirm={() => {}} onCancel={() => {}}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    const input = screen.getByLabelText('Title');
    act(() => input.focus());
    expect(input).not.toHaveAttribute('readOnly');
    fireEvent.keyDown(input, { key });

    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('readOnly');
  });

  it('returns focus to the read-only field on Escape from an action button', () => {
    const onCancel = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onCancel={onCancel}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    const input = screen.getByLabelText('Title');
    act(() => input.focus());
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    act(() => cancel.focus());
    fireEvent.keyDown(cancel, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('readOnly');
  });

  it.each(['Cancel', 'Confirm'])('returns focus to the read-only field after %s is activated', (name) => {
    render(
      <InlineEdit value="Q3 Planning" onConfirm={() => {}}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    const input = screen.getByLabelText('Title');
    act(() => input.focus());
    const button = screen.getByRole('button', { name });
    act(() => button.focus());
    fireEvent.click(button);

    expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('readOnly');
  });

  it.each([
    ['Enter', (input: HTMLElement) => fireEvent.keyDown(input, { key: 'Enter' })],
    ['a click', (input: HTMLElement) => fireEvent.click(input)],
  ])('starts editing again with %s on the focused read-only field', (_name, act2) => {
    const onConfirm = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onConfirm={onConfirm}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    const input = screen.getByLabelText('Title');
    act(() => input.focus());
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveAttribute('readOnly');

    act2(input);

    expect(input).not.toHaveAttribute('readOnly');
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("still runs the child's own onClick and onKeyDown while read-only", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <InlineEdit value="Q3 Planning">
        <input aria-label="Title" onClick={onClick} onKeyDown={onKeyDown} />
      </InlineEdit>,
    );

    fireEvent.click(screen.getByLabelText('Title'));
    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Enter' });

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
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

  it('does not confirm an unchanged draft when focus leaves, but still ends editing', () => {
    const onConfirm = vi.fn();
    render(
      <div>
        <InlineEdit value="Q3 Planning" onConfirm={onConfirm}>
          <input aria-label="Title" />
        </InlineEdit>
        <button type="button">Somewhere else</button>
      </div>,
    );

    const input = screen.getByLabelText('Title');
    act(() => input.focus());
    act(() => screen.getByRole('button', { name: 'Cancel' }).focus());
    act(() => screen.getByRole('button', { name: 'Confirm' }).focus());
    act(() => screen.getByRole('button', { name: 'Somewhere else' }).focus());

    expect(onConfirm).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('readOnly');
    expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
  });

  it('still confirms an unchanged draft when confirm is chosen explicitly', () => {
    const onConfirm = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onConfirm={onConfirm}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    act(() => screen.getByLabelText('Title').focus());
    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Enter' });

    expect(onConfirm).toHaveBeenCalledWith('Q3 Planning');
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

  it('Enter/Escape never confirm or cancel before editing starts (Enter starts editing)', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <InlineEdit value="Q3 Planning" onConfirm={onConfirm} onCancel={onCancel}>
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Escape' });
    expect(screen.getByLabelText('Title')).toHaveAttribute('readOnly');
    fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'Enter' });

    expect(screen.getByLabelText('Title')).not.toHaveAttribute('readOnly');
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

  it('floats the action row as a popup below the field by default, anchored to the right edge, with a 4px gap', () => {
    const rootRule = inlineEditCss.match(/\.root\s*\{([^}]*)\}/);
    const actionsRule = inlineEditCss.match(/\.actions\s*\{([^}]*)\}/);

    expect(rootRule?.[1]).toContain('flex-direction: column;');
    expect(rootRule?.[1]).toContain('position: relative;');
    expect(actionsRule?.[1]).toContain('position: absolute;');
    expect(actionsRule?.[1]).toContain('inset-block-start: calc(100% + var(--spacing-sm));');
    expect(actionsRule?.[1]).toContain('inset-inline-end: 0;');
    expect(actionsRule?.[1]).toContain('gap: var(--spacing-xs);');
  });

  it('places actions outside the input trailing edge when actionPlacement="end"', () => {
    const placementEndActionsRule = inlineEditCss.match(/\.placement_end\s+\.actions\s*\{([^}]*)\}/);
    expect(placementEndActionsRule?.[1]).toContain('inset-inline-start: calc(100% + var(--spacing-sm));');
    expect(placementEndActionsRule?.[1]).toContain('inset-inline-end: auto;');
    expect(placementEndActionsRule?.[1]).toContain('inset-block: 0;');
    expect(placementEndActionsRule?.[1]).toContain('margin-block: auto;');
  });

  it('pins the action buttons to the neutral-subtle background ramp (rest, hover, press)', () => {
    expect(inlineEditCss).toContain('background: var(--color-background-neutral-subtle-default);');
    expect(inlineEditCss).toContain('background: var(--color-background-neutral-subtle-hover);');
    expect(inlineEditCss).toContain('background: var(--color-background-neutral-subtle-press);');
  });

  it('wraps the confirm/cancel buttons in a Button Group, which owns the row layout and gap', () => {
    render(
      <InlineEdit value="Q3 Planning">
        <input aria-label="Title" />
      </InlineEdit>,
    );

    fireEvent.focus(screen.getByLabelText('Title'));

    const group = screen.getByRole('button', { name: 'Confirm' }).closest('[data-orientation]');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');
    expect(group).toContainElement(screen.getByRole('button', { name: 'Cancel' }));
  });
});
