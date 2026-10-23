// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModalDialog } from '../../organisms/modal-dialog';
import { LAYERS } from '../layers';
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

  it('names the panel, not the trigger, with aria-label', () => {
    render(<ControlledPopup open role="dialog" aria-label="Matter details" />);

    expect(screen.getByRole('dialog', { name: 'Matter details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trigger' })).not.toHaveAttribute('aria-label');
  });

  it('names the panel from a heading in its content with aria-labelledby', () => {
    render(
      <ControlledPopup
        open
        role="dialog"
        aria-labelledby="popup-heading"
        content={<h2 id="popup-heading">Matter details</h2>}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Matter details' })).toBeInTheDocument();
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
    render(<ControlledPopup open alignment="bottomEnd" />);

    const panel = screen.getByText('Popup content').parentElement;
    expect(panel).toHaveAttribute('data-alignment', 'bottomEnd');
  });

  it('defaults to topStart alignment, matching the Figma component default', () => {
    render(<ControlledPopup open />);

    const panel = screen.getByText('Popup content').parentElement;
    expect(panel).toHaveAttribute('data-alignment', 'topStart');
  });

  it("places start at the trigger's left edge and end at its right edge", () => {
    document.documentElement.style.setProperty('--spacing-sm', '8px');
    const getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') {
          return { top: 100, bottom: 120, left: 200, right: 400, width: 200, height: 20 } as DOMRect;
        }
        return { top: 0, bottom: 50, left: 0, right: 100, width: 100, height: 50 } as DOMRect;
      });

    const { unmount } = render(<ControlledPopup open alignment="bottomStart" />);
    expect(screen.getByText('Popup content').parentElement).toHaveStyle({ left: '200px' });
    unmount();

    render(<ControlledPopup open alignment="bottomEnd" />);
    expect(screen.getByText('Popup content').parentElement).toHaveStyle({ left: '300px' });

    getBoundingClientRectSpy.mockRestore();
    document.documentElement.style.removeProperty('--spacing-sm');
  });

  it.each([
    ['topLeft', 'topStart'],
    ['topRight', 'topEnd'],
    ['bottomLeft', 'bottomStart'],
    ['bottomRight', 'bottomEnd'],
  ] as const)('still accepts the deprecated %s alignment, placed as %s', (deprecated, replacement) => {
    document.documentElement.style.setProperty('--spacing-sm', '8px');
    const getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') {
          return { top: 200, bottom: 220, left: 200, right: 400, width: 200, height: 20 } as DOMRect;
        }
        return { top: 0, bottom: 50, left: 0, right: 100, width: 100, height: 50 } as DOMRect;
      });

    const { unmount } = render(<ControlledPopup open alignment={replacement} />);
    const expected = screen.getByText('Popup content').parentElement as HTMLElement;
    const expectedStyle = { top: expected.style.top, left: expected.style.left };
    unmount();

    render(<ControlledPopup open alignment={deprecated} />);
    const panel = screen.getByText('Popup content').parentElement as HTMLElement;
    expect(panel).toHaveAttribute('data-alignment', replacement);
    expect(expectedStyle.left).not.toBe('');
    expect({ top: panel.style.top, left: panel.style.left }).toEqual(expectedStyle);

    getBoundingClientRectSpy.mockRestore();
    document.documentElement.style.removeProperty('--spacing-sm');
  });

  it('falls back to the same alignment on the opposite side, not an unrelated alignment, on a tied overflow', () => {
    // Regression guard: when the preferred alignment overflows and multiple other alignments tie
    // at zero overflow, the fallback must prefer flipping the side (topCenter -> bottomCenter)
    // over jumping to an alignment with a different horizontal align (e.g. bottomStart) just
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
    expect(popupCss).toContain('box-shadow: var(--elevation-shadow-overlay);');
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

  it('stacks the panel above Modal Dialog and Toast Group, from the one layer scale', () => {
    render(<ControlledPopup open />);

    const panel = screen.getByText('Popup content').parentElement as HTMLElement;
    expect(panel.style.zIndex).toBe(String(LAYERS.popup));
    expect(LAYERS.popup).toBeGreaterThan(LAYERS.toast);
    expect(LAYERS.toast).toBeGreaterThan(LAYERS.dialog);
    // The stylesheet doesn't set its own z-index, so there's one source for it.
    expect(popupCss).not.toMatch(/z-indexs*:/);
  });

  it('closes only the topmost open popup on Escape', () => {
    const outerChange = vi.fn();
    const innerChange = vi.fn();
    function Nested({ innerOpen }: { innerOpen: boolean }) {
      return (
        <Popup
          open
          onOpenChange={outerChange}
          content={
            <Popup open={innerOpen} onOpenChange={innerChange} content={<span>Inner</span>}>
              <button type="button">Inner trigger</button>
            </Popup>
          }
        >
          <button type="button">Outer trigger</button>
        </Popup>
      );
    }
    const { rerender } = render(<Nested innerOpen={false} />);
    rerender(<Nested innerOpen />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(innerChange).toHaveBeenCalledWith(false);
    expect(outerChange).not.toHaveBeenCalled();

    rerender(<Nested innerOpen={false} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(outerChange).toHaveBeenCalledWith(false);
  });

  it('puts a popup inside a dialog above it on Escape when both open in the same render', () => {
    const dialogClose = vi.fn();
    const popupChange = vi.fn();
    // Both mount already open: React runs the popup's effects before the dialog's, so ordering by
    // when they open would put the dialog on top.
    render(
      <ModalDialog open onClose={dialogClose} title="Dialog">
        <Popup open onOpenChange={popupChange} content={<span>Inside</span>}>
          <button type="button">Trigger</button>
        </Popup>
      </ModalDialog>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(popupChange).toHaveBeenCalledWith(false);
    expect(dialogClose).not.toHaveBeenCalled();
  });

  it('puts a popup inside another popup above it on Escape when both open in the same render', () => {
    const outerChange = vi.fn();
    const innerChange = vi.fn();
    render(
      <Popup
        open
        onOpenChange={outerChange}
        content={
          <Popup open onOpenChange={innerChange} content={<span>Inner</span>}>
            <button type="button">Inner trigger</button>
          </Popup>
        }
      >
        <button type="button">Outer trigger</button>
      </Popup>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(innerChange).toHaveBeenCalledWith(false);
    expect(outerChange).not.toHaveBeenCalled();

    // The outer panel's portal lands after the inner one in the DOM, so the inner panel needs the
    // higher z-index to paint above it.
    const outerPanel = screen.getByRole('button', { name: 'Inner trigger' }).parentElement as HTMLElement;
    const innerPanel = screen.getByText('Inner').parentElement as HTMLElement;
    expect(outerPanel.style.zIndex).toBe(String(LAYERS.popup));
    expect(Number(innerPanel.style.zIndex)).toBeGreaterThan(LAYERS.popup);
  });

  it('keeps an open popup with closeOnEscape off on top, so the layer below it stays open', () => {
    const outerChange = vi.fn();
    function Nested({ innerOpen }: { innerOpen: boolean }) {
      return (
        <Popup open onOpenChange={outerChange} content={<span>Outer</span>}>
          <Popup open={innerOpen} closeOnEscape={false} content={<span>Inner</span>}>
            <button type="button">Trigger</button>
          </Popup>
        </Popup>
      );
    }
    const { rerender } = render(<Nested innerOpen={false} />);
    rerender(<Nested innerOpen />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(outerChange).not.toHaveBeenCalled();
  });

  it('leaves an Escape that something inside already handled (preventDefault)', () => {
    const handleOpenChange = vi.fn();
    render(
      <ControlledPopup
        open
        onOpenChange={handleOpenChange}
        content={<input aria-label="Field" onKeyDown={(event) => event.key === 'Escape' && event.preventDefault()} />}
      />,
    );

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Field' }), { key: 'Escape' });
    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it("reads the trigger's own ref from its props, without React 19's element.ref warning", () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const triggerRef = React.createRef<HTMLButtonElement>();
    render(
      <Popup open content={<span>Popup content</span>}>
        <button ref={triggerRef} type="button">
          Trigger
        </button>
      </Popup>,
    );

    expect(triggerRef.current).toBe(screen.getByRole('button', { name: 'Trigger' }));
    expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining('element.ref'));
    consoleError.mockRestore();
  });
});
