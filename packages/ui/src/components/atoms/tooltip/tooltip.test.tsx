import * as React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditIcon } from '../../../assets/icons';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Tooltip } from './tooltip';

afterEach(cleanup);

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders trigger child', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
  });

  it('does not attach tooltip behavior for empty content', () => {
    render(
      <Tooltip content="">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });

  it('does not render a tooltip for null or undefined content', () => {
    const { rerender } = render(
      <Tooltip content={null}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    rerender(
      <Tooltip content={undefined}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('hides tooltip initially', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on hover after delay', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent('Edit');
  });

  it('hides tooltip on pointer leave', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.pointerLeave(trigger);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus after delay', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.focus(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.focus(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(trigger);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('hides tooltip on Escape', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.focus(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('sets role tooltip', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('associates trigger with aria-describedby only while visible', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });

    expect(trigger).not.toHaveAttribute('aria-describedby');

    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);

    fireEvent.pointerLeave(trigger);
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });

  it('preserves existing aria-describedby and appends tooltip id', () => {
    render(
      <>
        <span id="hint">Existing hint</span>
        <Tooltip content="Edit">
          <button type="button" aria-describedby="hint">
            Trigger
          </button>
        </Tooltip>
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', `hint ${tooltip.id}`);
  });

  it('respects its own disabled state', () => {
    render(
      <Tooltip content="Edit" disabled>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies placement state', () => {
    render(
      <Tooltip content="Edit" placement="right">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('data-placement', 'right');
  });

  it('applies truncate state', () => {
    render(
      <Tooltip content="Edit" truncate={false}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('data-truncate', 'false');
  });

  it('preserves child event handlers', () => {
    const handlePointerEnter = vi.fn();
    const handlePointerLeave = vi.fn();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const handleKeyDown = vi.fn();

    render(
      <Tooltip content="Edit">
        <button
          type="button"
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          Trigger
        </button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.pointerEnter(trigger);
    fireEvent.pointerLeave(trigger);
    fireEvent.focus(trigger);
    fireEvent.blur(trigger);
    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(handlePointerEnter).toHaveBeenCalledTimes(1);
    expect(handlePointerLeave).toHaveBeenCalledTimes(1);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('skips internal behavior when a handler prevents default', () => {
    render(
      <Tooltip content="Edit">
        <button
          type="button"
          onPointerEnter={(event) => event.preventDefault()}
          onFocus={(event) => event.preventDefault()}
          onPointerLeave={(event) => event.preventDefault()}
          onBlur={(event) => event.preventDefault()}
        >
          Trigger
        </button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.focus(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows a tooltip for a disabled native IconButton on pointer hover', () => {
    render(
      <Tooltip content="Unavailable until saved">
        <IconButton aria-label="Edit" isDisabled tooltip={false}>
          <EditIcon />
        </IconButton>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Edit' });
    expect(button).toBeDisabled();

    const wrapper = button.parentElement;
    expect(wrapper?.getAttribute('tabindex')).toBeNull();

    fireEvent.pointerEnter(wrapper as HTMLElement);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent('Unavailable until saved');
  });

  it('does not create an extra tab stop for disabled controls', () => {
    render(
      <Tooltip content="Unavailable until saved">
        <IconButton aria-label="Edit" isDisabled tooltip={false}>
          <EditIcon />
        </IconButton>
      </Tooltip>,
    );

    const button = screen.getByRole('button', { name: 'Edit' });
    expect(button).toBeDisabled();
    expect(button.parentElement?.hasAttribute('tabindex')).toBe(false);
  });

  it('supports external IconButton composition without double tooltip behavior', () => {
    render(
      <Tooltip content="Custom explanation">
        <IconButton aria-label="Edit" tooltip={false}>
          <EditIcon />
        </IconButton>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Edit' });
    fireEvent.pointerEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Custom explanation');
  });

  it('supports wrapping icon and text button triggers', () => {
    render(
      <div>
        <Tooltip content="Edit icon">
          <IconButton aria-label="Edit" tooltip={false}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Save changes">
          <Button>Save</Button>
        </Tooltip>
      </div>,
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
