// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Popup } from './popup';
import styles from './popup.module.css';

const popupCss = readFileSync('packages/ui/src/components/primitives/popup/popup.module.css', 'utf8');

afterEach(cleanup);

function ControlledPopup(props: Partial<React.ComponentProps<typeof Popup>> = {}) {
  const [open, setOpen] = React.useState(props.open ?? false);

  return (
    <Popup
      content={<span>Popup content</span>}
      open={open}
      onOpenChange={setOpen}
      {...props}
    >
      <button type="button" onClick={() => setOpen(true)}>
        Trigger
      </button>
    </Popup>
  );
}

// A field whose real trigger is an `<input>` inset within a frame `<div>` - the exact shape Select
// composes (TextField forwards its ref to the inset input; the frame is that input's parent). Popup
// clones this and attaches the merged ref + ARIA to the input.
const FakeField = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function FakeField(props, ref) {
    return (
      <div data-testid="frame">
        <input ref={ref} aria-label="Trigger" {...props} />
      </div>
    );
  },
);

// Passes the frame (the input's parent) as `anchorRef`, so positioning/width/dismissal follow the
// whole field, not the inset input - mirroring Select. `frameRef` is derived from the trigger's own
// (descendant) ref, so it's populated before Popup's layout effect, matching the real timing.
function AnchoredPopup({ matchTriggerWidth = false }: { matchTriggerWidth?: boolean }) {
  const frameRef = React.useRef<HTMLElement | null>(null);
  const [open, setOpen] = React.useState(true);
  const setTriggerRef = React.useCallback((node: HTMLInputElement | null) => {
    frameRef.current = node?.parentElement ?? null;
  }, []);

  return (
    <Popup
      content={<span>Popup content</span>}
      open={open}
      onOpenChange={setOpen}
      anchorRef={frameRef}
      matchTriggerWidth={matchTriggerWidth}
    >
      <FakeField ref={setTriggerRef} />
    </Popup>
  );
}

describe('Popup', () => {
  it('renders the trigger and nothing else when closed', () => {
    render(<ControlledPopup />);

    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
    expect(screen.queryByText('Popup content')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(<ControlledPopup open />);

    expect(screen.getByText('Popup content')).toBeInTheDocument();
  });

  it('opens on trigger interaction', () => {
    render(<ControlledPopup />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));

    expect(screen.getByText('Popup content')).toBeInTheDocument();
  });

  it('sets aria-expanded on the trigger reflecting open state', () => {
    render(<ControlledPopup />);

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('wires aria-controls to the panel id only while open', () => {
    render(<ControlledPopup />);

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(trigger).not.toHaveAttribute('aria-controls');

    fireEvent.click(trigger);

    const panel = screen.getByText('Popup content').closest('[id]');
    expect(trigger).toHaveAttribute('aria-controls', panel?.id);
  });

  it('applies the requested role to the panel', () => {
    render(<ControlledPopup open role="menu" />);

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('applies no role by default', () => {
    render(<ControlledPopup open />);

    const panel = screen.getByText('Popup content').parentElement;
    expect(panel).not.toHaveAttribute('role');
  });

  it('calls onOpenChange(false) on Escape by default', () => {
    const handleOpenChange = vi.fn();
    render(<ControlledPopup open onOpenChange={handleOpenChange} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not call onOpenChange on Escape when closeOnEscape is false', () => {
    const handleOpenChange = vi.fn();
    render(<ControlledPopup open onOpenChange={handleOpenChange} closeOnEscape={false} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('calls onOpenChange(false) on an outside pointer press by default', () => {
    const handleOpenChange = vi.fn();
    render(<ControlledPopup open onOpenChange={handleOpenChange} />);

    fireEvent.pointerDown(document.body);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not call onOpenChange for a pointer press inside the panel', () => {
    const handleOpenChange = vi.fn();
    render(<ControlledPopup open onOpenChange={handleOpenChange} />);

    fireEvent.pointerDown(screen.getByText('Popup content'));

    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('does not call onOpenChange for a pointer press on the trigger', () => {
    const handleOpenChange = vi.fn();
    render(<ControlledPopup open onOpenChange={handleOpenChange} />);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Trigger' }));

    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('does not call onOpenChange on outside press when closeOnOutsideClick is false', () => {
    const handleOpenChange = vi.fn();
    render(<ControlledPopup open onOpenChange={handleOpenChange} closeOnOutsideClick={false} />);

    fireEvent.pointerDown(document.body);

    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('sets data-alignment on the panel matching the requested alignment', () => {
    render(<ControlledPopup open alignment="bottomRight" />);

    const panel = screen.getByText('Popup content').parentElement;
    expect(panel).toHaveAttribute('data-alignment', 'bottomRight');
  });

  it('defaults to topLeft alignment, matching the Figma component default', () => {
    render(<ControlledPopup open />);

    const panel = screen.getByText('Popup content').parentElement;
    expect(panel).toHaveAttribute('data-alignment', 'topLeft');
  });

  it('falls back to the same alignment on the opposite side, not an unrelated alignment, on a tied overflow', () => {
    // Regression guard: when the preferred alignment overflows and multiple other alignments tie
    // at zero overflow, the fallback must prefer flipping the side (topCenter -> bottomCenter)
    // over jumping to an alignment with a different horizontal align (e.g. bottomLeft) just
    // because it happens to come first in the internal fallback list.
    document.documentElement.style.setProperty('--spacing-sm', '8px');

    const getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') {
          return { top: 4, bottom: 24, left: 400, right: 500, width: 100, height: 20 } as DOMRect;
        }
        return { top: 0, bottom: 50, left: 0, right: 100, width: 100, height: 50 } as DOMRect;
      });

    render(<ControlledPopup open alignment="topCenter" />);

    const panel = screen.getByText('Popup content').parentElement;
    expect(panel).toHaveAttribute('data-alignment', 'bottomCenter');

    getBoundingClientRectSpy.mockRestore();
    document.documentElement.style.removeProperty('--spacing-sm');
  });

  it('hides the panel (visibility: hidden, data-trigger-out-of-view) once the trigger scrolls fully out of the viewport', () => {
    // Regression guard: without this, the panel clamps to the nearest viewport edge and stays
    // visibly "stuck" there once the trigger scrolls away entirely, floating with no visible
    // anchor - hiding it is the correct behavior instead.
    const getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') {
          return { top: -100, bottom: -60, left: 10, right: 110, width: 100, height: 40 } as DOMRect;
        }
        return { top: 0, bottom: 50, left: 0, right: 100, width: 100, height: 50 } as DOMRect;
      });

    render(<ControlledPopup open />);

    const panel = screen.getByText('Popup content').parentElement as HTMLElement;
    expect(panel).toHaveAttribute('data-trigger-out-of-view', 'true');
    expect(panel).toHaveStyle({ visibility: 'hidden' });

    getBoundingClientRectSpy.mockRestore();
  });

  it('does not hide the panel when the trigger is still (even partially) within the viewport', () => {
    const getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') {
          return { top: 4, bottom: 24, left: 10, right: 110, width: 100, height: 20 } as DOMRect;
        }
        return { top: 0, bottom: 50, left: 0, right: 100, width: 100, height: 50 } as DOMRect;
      });

    render(<ControlledPopup open />);

    const panel = screen.getByText('Popup content').parentElement as HTMLElement;
    expect(panel).not.toHaveAttribute('data-trigger-out-of-view');

    getBoundingClientRectSpy.mockRestore();
  });

  it('preserves an existing aria-controls value while closed', () => {
    render(
      <Popup content={<span>Popup content</span>} open={false}>
        <button type="button" aria-controls="external-region">
          Trigger
        </button>
      </Popup>,
    );

    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveAttribute('aria-controls', 'external-region');
  });

  it('supports a custom id for the panel', () => {
    render(<ControlledPopup open id="custom-popup-id" />);

    expect(screen.getByText('Popup content').parentElement).toHaveAttribute('id', 'custom-popup-id');
  });

  it('composes a custom className onto the panel', () => {
    render(<ControlledPopup open className="custom-panel" />);

    expect(screen.getByText('Popup content').parentElement).toHaveClass('custom-panel');
  });

  it('maps Figma visual tokens for the panel', () => {
    expect(popupCss).toContain('padding: var(--spacing-lg);');
    expect(popupCss).toContain('gap: var(--spacing-xs);');
    expect(popupCss).toContain('background: var(--color-elevation-surface-raised-default);');
    expect(popupCss).toContain('border: var(--border-width-sm) solid var(--color-border-default);');
    expect(popupCss).toContain('border-radius: var(--border-radius-lg);');
    expect(popupCss).toContain('var(--color-elevation-shadow-overlay-inner)');
    expect(popupCss).toContain('var(--color-elevation-shadow-overlay-spread)');
    expect(popupCss).toContain('var(--color-elevation-shadow-overlay-perimeter)');
  });

  it('hugs its content instead of stretching to fill a container', () => {
    // Regression guard: the Figma slot inside the popup panel hugs its content on both axes
    // (layoutSizingHorizontal/Vertical: HUG) - the panel must not stretch to fill an ancestor.
    expect(popupCss).toContain('inline-size: max-content;');
    expect(popupCss).not.toContain('width: 100%');
    expect(popupCss).not.toContain('inline-size: 100%');
  });

  it('applies its own visual skin by default', () => {
    render(<ControlledPopup open />);

    expect(screen.getByText('Popup content').parentElement).toHaveClass(styles.panelSurface);
  });

  it('skips the visual skin when unstyled is set, keeping only structural positioning', () => {
    render(<ControlledPopup open unstyled />);

    const panel = screen.getByText('Popup content').parentElement as HTMLElement;
    expect(panel).toHaveClass(styles.panel);
    expect(panel).not.toHaveClass(styles.panelSurface);
  });

  it('defaults padding to lg, matching Figma', () => {
    render(<ControlledPopup open />);

    expect(screen.getByText('Popup content').parentElement).toHaveClass(styles.padding_lg);
  });

  it('applies none/sm/md padding classes when requested', () => {
    const { rerender } = render(<ControlledPopup open padding="none" />);
    expect(screen.getByText('Popup content').parentElement).toHaveClass(styles.padding_none);

    rerender(<ControlledPopup open padding="sm" />);
    expect(screen.getByText('Popup content').parentElement).toHaveClass(styles.padding_sm);

    rerender(<ControlledPopup open padding="md" />);
    expect(screen.getByText('Popup content').parentElement).toHaveClass(styles.padding_md);
  });

  it('does not apply any padding class when unstyled is set', () => {
    render(<ControlledPopup open unstyled padding="sm" />);

    const panel = screen.getByText('Popup content').parentElement as HTMLElement;
    expect(panel).not.toHaveClass(styles.padding_sm);
    expect(panel).not.toHaveClass(styles.padding_md);
    expect(panel).not.toHaveClass(styles.padding_lg);
  });

  it('manages trigger aria-expanded/aria-controls by default', () => {
    render(<ControlledPopup />);

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not set aria-expanded/aria-controls when manageTriggerAria is false', () => {
    render(<ControlledPopup manageTriggerAria={false} />);

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.click(trigger);

    expect(trigger).not.toHaveAttribute('aria-expanded');
    expect(trigger).not.toHaveAttribute('aria-controls');
  });

  it('fixes the panel width to the measured trigger when matchTriggerWidth is set', () => {
    const getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') {
          return { top: 0, bottom: 40, left: 0, right: 240, width: 240, height: 40 } as DOMRect;
        }
        return { top: 0, bottom: 50, left: 0, right: 100, width: 100, height: 50 } as DOMRect;
      });

    render(<ControlledPopup open matchTriggerWidth />);

    const panel = screen.getByText('Popup content').parentElement as HTMLElement;
    expect(panel).toHaveStyle({ width: '240px' });

    getBoundingClientRectSpy.mockRestore();
  });

  it('does not fix the panel width by default (it hugs its own content)', () => {
    render(<ControlledPopup open />);

    const panel = screen.getByText('Popup content').parentElement as HTMLElement;
    expect(panel.style.width).toBe('');
  });

  it('measures and sizes the panel to the anchorRef element, not the smaller trigger child', () => {
    // Select's real shape: the panel should match the field frame (320), never the inset input (120).
    const getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.getAttribute?.('data-testid') === 'frame') {
          return { top: 0, bottom: 40, left: 0, right: 320, width: 320, height: 40 } as DOMRect;
        }
        if (this.tagName === 'BUTTON') {
          return { top: 0, bottom: 40, left: 0, right: 120, width: 120, height: 40 } as DOMRect;
        }
        return { top: 0, bottom: 50, left: 0, right: 100, width: 100, height: 50 } as DOMRect;
      });

    render(<AnchoredPopup matchTriggerWidth />);

    const panel = screen.getByText('Popup content').parentElement as HTMLElement;
    expect(panel).toHaveStyle({ width: '320px' });

    getBoundingClientRectSpy.mockRestore();
  });

  it('treats the anchorRef element as the outside-click boundary, so a press inside the frame keeps it open', () => {
    // Without anchorRef, a press on the frame padding (outside the trigger child) would dismiss;
    // the anchor extends the "inside" boundary to the whole control.
    render(<AnchoredPopup />);

    fireEvent.pointerDown(screen.getByTestId('frame'));

    expect(screen.getByText('Popup content')).toBeInTheDocument();
  });
});
