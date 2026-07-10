import * as React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditIcon } from '../../../assets/icons';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { Tooltip } from './tooltip';
import styles from './tooltip.module.css';

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

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent('Edit');
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.mouseEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', () => {
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

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('associates trigger with aria-describedby while visible', () => {
    render(
      <Tooltip content="Edit">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.mouseEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
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

    fireEvent.mouseEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', `hint ${tooltip.id}`);
  });

  it('respects disabled', () => {
    render(
      <Tooltip content="Edit" disabled>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('applies placement state and class', () => {
    render(
      <Tooltip content="Edit" placement="right">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass(styles.placement_right);
    expect(tooltip).toHaveAttribute('data-placement', 'right');
  });

  it('applies truncate state and class', () => {
    render(
      <Tooltip content="Edit" truncate={false}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Trigger' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass(styles.wrap);
    expect(tooltip).toHaveAttribute('data-truncate', 'false');
  });

  it('preserves child event handlers', () => {
    const handleMouseEnter = vi.fn();
    const handleMouseLeave = vi.fn();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const handleKeyDown = vi.fn();

    render(
      <Tooltip content="Edit">
        <button
          type="button"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          Trigger
        </button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    fireEvent.focus(trigger);
    fireEvent.blur(trigger);
    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleBlur).toHaveBeenCalledTimes(1);
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('supports wrapping icon and text button triggers', () => {
    render(
      <div>
        <Tooltip content="Edit icon">
          <IconButton aria-label="Edit">
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
