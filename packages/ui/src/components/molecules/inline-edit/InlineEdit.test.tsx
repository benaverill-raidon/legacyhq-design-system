// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { type ComponentProps, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from '../field';
import { TextField } from '../text-field';
import { InlineEdit } from './inline-edit';
import styles from './inline-edit.module.css';

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

    expect(rootRule?.[1]).toContain('display: grid;');
    expect(rootRule?.[1]).toContain('grid-template-columns: minmax(0, 1fr);');
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
    // Placed in the field's grid row (both lines explicit), so validate's message below doesn't move them.
    expect(placementEndActionsRule?.[1]).toContain('grid-row: 1 / 2;');
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

describe('InlineEdit validate', () => {
  const requireName = (value: string) => (value.trim() ? undefined : 'Enter a matter name.');

  function renderValidated(props: Partial<ComponentProps<typeof InlineEdit>> = {}) {
    const onConfirm = vi.fn();
    const utils = render(
      <div>
        <InlineEdit value="Lee Living Trust" onConfirm={onConfirm} validate={requireName} {...props}>
          <TextField context="inline" aria-label="Matter name" />
        </InlineEdit>
        <button type="button">Somewhere else</button>
      </div>,
    );
    const field = screen.getByRole('textbox', { name: 'Matter name' });
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: '   ' } });
    return { ...utils, field, onConfirm };
  }

  function expectError(field: HTMLElement) {
    expect(field).not.toHaveAttribute('readOnly');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Enter a matter name.');
    expect(screen.getByText('Enter a matter name.').closest(`.${styles.message}`)).toBeInTheDocument();
  }

  it('Enter with an error keeps editing, shows the message, marks the field invalid, and keeps focus', () => {
    const { field, onConfirm } = renderValidated();
    field.focus();

    fireEvent.keyDown(field, { key: 'Enter' });

    expect(onConfirm).not.toHaveBeenCalled();
    expectError(field);
    expect(field).toHaveFocus();
    expect(field).toHaveValue('   ');
  });

  it('the confirm button with an error keeps editing and moves focus back to the field', () => {
    const { field, onConfirm } = renderValidated();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Confirm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expectError(field);
    expect(field).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('blur with an error keeps editing, so the draft is not lost', () => {
    const { field, onConfirm } = renderValidated();

    fireEvent.blur(field, { relatedTarget: screen.getByRole('button', { name: 'Somewhere else' }) });

    expect(onConfirm).not.toHaveBeenCalled();
    expectError(field);
    expect(field).toHaveValue('   ');
  });

  it('Escape still cancels, clearing the error and reverting the draft', () => {
    const onCancel = vi.fn();
    const { field } = renderValidated({ onCancel });
    fireEvent.keyDown(field, { key: 'Enter' });

    fireEvent.keyDown(field, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(field).toHaveAttribute('readOnly');
    expect(field).toHaveValue('Lee Living Trust');
    expect(field).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByText('Enter a matter name.')).not.toBeInTheDocument();
  });

  it('after a failed confirm, the error follows the draft and clears once it is fixed', () => {
    const { field, onConfirm } = renderValidated();
    fireEvent.keyDown(field, { key: 'Enter' });

    fireEvent.change(field, { target: { value: 'Lee Family Trust' } });
    expect(screen.queryByText('Enter a matter name.')).not.toBeInTheDocument();
    expect(field).not.toHaveAttribute('aria-invalid');

    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onConfirm).toHaveBeenCalledWith('Lee Family Trust');
    expect(field).toHaveAttribute('readOnly');
  });

  it('confirms a valid draft as before, calling validate with it', () => {
    const validate = vi.fn(requireName);
    const { field, onConfirm } = renderValidated({ validate });
    fireEvent.change(field, { target: { value: 'Lee Family Trust' } });

    fireEvent.keyDown(field, { key: 'Enter' });

    expect(validate).toHaveBeenCalledWith('Lee Family Trust');
    expect(onConfirm).toHaveBeenCalledWith('Lee Family Trust');
    expect(field).toHaveAttribute('readOnly');
  });

  it('announces the message in a polite live region that is there before the error', () => {
    const { field, container } = renderValidated();
    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toBeInTheDocument();
    expect(region).toBeEmptyDOMElement();

    fireEvent.keyDown(field, { key: 'Enter' });
    expect(region).toHaveTextContent('Enter a matter name.');
  });

  it('shows the message in the error look: a status icon and the error color, under the field', () => {
    expect(inlineEditCss).toMatch(/\.message\s*\{[^}]*color: var\(--color-content-error\);/);
    expect(inlineEditCss).toMatch(/\.message\s*\{[^}]*font-size: var\(--typography-body-sm-font-size\);/);
    expect(inlineEditCss).toMatch(/\.message\s*\{[^}]*padding-top: var\(--spacing-xs\);/);
  });
});

describe('InlineEdit in a Field', () => {
  const requireName = (value: string) => (value.trim() ? undefined : 'Enter a matter name.');

  function renderInField(fieldProps: Partial<ComponentProps<typeof Field>> = {}, editProps: Partial<ComponentProps<typeof InlineEdit>> = {}) {
    const onConfirm = vi.fn();
    const utils = render(
      <Field label="Matter name" message="Shown on every document." {...fieldProps}>
        <InlineEdit value="Lee Living Trust" onConfirm={onConfirm} {...editProps}>
          <TextField context="inline" />
        </InlineEdit>
      </Field>,
    );
    return { ...utils, onConfirm, field: () => screen.getByRole('textbox') };
  }

  it("names the control with Field's label and describes it with Field's message, read-only and editing", () => {
    const { field } = renderInField();

    expect(field()).toHaveAccessibleName('Matter name');
    expect(field()).toHaveAccessibleDescription('Shown on every document.');
    // The label's htmlFor reaches the input, so clicking the label focuses it.
    const label = screen.getByText('Matter name').closest('label') as HTMLLabelElement;
    expect(label.htmlFor).toBe(field().id);

    fireEvent.focus(field());
    expect(field()).not.toHaveAttribute('readOnly');
    expect(field()).toHaveAccessibleName('Matter name');
    expect(field()).toHaveAccessibleDescription('Shown on every document.');
  });

  it("passes Field's required and error on to the control", () => {
    const { field } = renderInField({ required: true, state: 'error', message: 'This name is taken.' });

    expect(field()).toBeRequired();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription('This name is taken.');
  });

  it("passes Field's inline context to a child that sets none, and the child's own context wins", () => {
    const { container, rerender } = render(
      <Field label="Matter name" context="inline">
        <InlineEdit value="Lee Living Trust">
          <TextField />
        </InlineEdit>
      </Field>,
    );
    const frame = () => container.querySelector('input')?.parentElement as HTMLElement;
    expect(frame().className).toMatch(/context_inline/);

    rerender(
      <Field label="Matter name" context="inline">
        <InlineEdit value="Lee Living Trust">
          <TextField context="default" />
        </InlineEdit>
      </Field>,
    );
    expect(frame().className).not.toMatch(/context_inline/);
  });

  it("keeps the child's own name and description first, adding Field's message after them", () => {
    render(
      <>
        <p id="own-hint">Own hint.</p>
        <Field label="Matter name" message="Field message.">
          <InlineEdit value="Lee Living Trust">
            <TextField context="inline" aria-label="Own name" aria-describedby="own-hint" />
          </InlineEdit>
        </Field>
      </>,
    );
    const field = screen.getByRole('textbox');

    expect(field).toHaveAccessibleName('Own name');
    expect(field).toHaveAccessibleDescription('Own hint. Field message.');
  });

  it("shows validate's message under the control and Field's message below, and the control reads both", () => {
    const { field, onConfirm } = renderInField({}, { validate: requireName });

    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: '  ' } });
    fireEvent.keyDown(field(), { key: 'Enter' });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAccessibleDescription('Shown on every document. Enter a matter name.');
    const validateMessage = screen.getByText('Enter a matter name.');
    const fieldMessage = screen.getByText('Shown on every document.');
    expect(validateMessage.compareDocumentPosition(fieldMessage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.change(field(), { target: { value: 'Lee Family Trust' } });
    expect(field()).not.toHaveAttribute('aria-invalid');
    expect(field()).toHaveAccessibleDescription('Shown on every document.');
  });

  it("keeps Field's error on the control after validate's clears", () => {
    const { field } = renderInField({ state: 'error', message: 'This name is taken.' }, { validate: requireName });

    fireEvent.focus(field());
    fireEvent.change(field(), { target: { value: '  ' } });
    fireEvent.keyDown(field(), { key: 'Enter' });
    fireEvent.change(field(), { target: { value: 'Lee Family Trust' } });

    expect(field()).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('InlineEdit Docs page', () => {
  it('puts every Key Value Pair inside a Key Value List, so the dt and dd are in a dl', () => {
    const mdx = readFileSync('packages/ui/src/components/molecules/inline-edit/inline-edit.mdx', 'utf8');
    const pairs = [...mdx.matchAll(/<KeyValuePair[\s>]/g)];

    expect(pairs.length).toBeGreaterThan(0);
    for (const pair of pairs) {
      const before = mdx.slice(0, pair.index);
      expect(before.lastIndexOf('<KeyValueList')).toBeGreaterThan(before.lastIndexOf('</KeyValueList>'));
    }
  });
});
