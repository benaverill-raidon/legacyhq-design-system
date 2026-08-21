import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DropdownMenu } from './dropdown-menu';
import type { MenuSection } from '../menu';
import popupStyles from '../../primitives/popup/popup.module.css';

afterEach(cleanup);

function actionSections(): MenuSection[] {
  return [{ id: 'actions', items: [{ id: 'rename', label: 'Rename' }, { id: 'delete', label: 'Delete' }] }];
}

function ControlledDropdownMenu(props: Partial<React.ComponentProps<typeof DropdownMenu>> = {}) {
  const [open, setOpen] = React.useState(props.open ?? false);

  return (
    <DropdownMenu
      aria-label="Matter actions"
      showSearch={false}
      sections={actionSections()}
      open={open}
      onOpenChange={setOpen}
      {...props}
    >
      <button type="button" onClick={() => setOpen((current) => !current)}>
        Trigger
      </button>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('renders only the trigger when closed', () => {
    render(<ControlledDropdownMenu />);

    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders the Menu panel when open', () => {
    render(<ControlledDropdownMenu open />);

    const menu = screen.getByRole('menu', { name: 'Matter actions' });
    expect(menu).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('opens on trigger interaction', () => {
    render(<ControlledDropdownMenu />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('sets aria-expanded/aria-controls on the trigger, matching Popup default behavior', () => {
    render(<ControlledDropdownMenu />);

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('menu').closest('[id]')?.id);
  });

  it('calls onOpenChange(false) on Escape by default', () => {
    const handleOpenChange = vi.fn();
    render(<ControlledDropdownMenu open onOpenChange={handleOpenChange} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) on an outside click by default', () => {
    const handleOpenChange = vi.fn();
    render(<ControlledDropdownMenu open onOpenChange={handleOpenChange} />);

    fireEvent.pointerDown(document.body);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not call onOpenChange when clicking a menu item itself (Menu decides, not DropdownMenu)', () => {
    const handleOpenChange = vi.fn();
    render(<ControlledDropdownMenu open onOpenChange={handleOpenChange} />);

    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));

    expect(handleOpenChange).not.toHaveBeenCalled();
  });

  it('calls the item onSelect and can close itself from there', () => {
    function CloseOnSelect() {
      const [open, setOpen] = React.useState(true);
      return (
        <DropdownMenu
          aria-label="Matter actions"
          showSearch={false}
          open={open}
          onOpenChange={setOpen}
          sections={[{ id: 'actions', items: [{ id: 'delete', label: 'Delete', onSelect: () => setOpen(false) }] }]}
        >
          <button type="button">Trigger</button>
        </DropdownMenu>
      );
    }

    render(<CloseOnSelect />);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('maps alignment left/center/right to Popup bottomLeft/bottomCenter/bottomRight', () => {
    const { rerender } = render(<ControlledDropdownMenu open alignment="left" />);
    expect(screen.getByRole('menu').closest('[data-alignment]')).toHaveAttribute('data-alignment', 'bottomLeft');

    rerender(<ControlledDropdownMenu open alignment="center" />);
    expect(screen.getByRole('menu').closest('[data-alignment]')).toHaveAttribute('data-alignment', 'bottomCenter');

    rerender(<ControlledDropdownMenu open alignment="right" />);
    expect(screen.getByRole('menu').closest('[data-alignment]')).toHaveAttribute('data-alignment', 'bottomRight');
  });

  it('defaults to left (bottomLeft) alignment', () => {
    render(<ControlledDropdownMenu open />);

    expect(screen.getByRole('menu').closest('[data-alignment]')).toHaveAttribute('data-alignment', 'bottomLeft');
  });

  it("renders the panel with Popup's own visual skin but no padding, so Menu sits flush", () => {
    render(<ControlledDropdownMenu open />);

    const panel = screen.getByRole('menu').closest('[data-alignment]') as HTMLElement;
    expect(panel).toHaveClass(popupStyles.panelSurface);
    expect(panel).toHaveClass(popupStyles.padding_none);
  });

  it('passes searchValue/onSearchChange through to Menu', () => {
    const handleSearchChange = vi.fn();
    render(
      <ControlledDropdownMenu
        open
        showSearch
        searchValue="ren"
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search actions"
      />,
    );

    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'del' } });
    expect(handleSearchChange).toHaveBeenCalledWith('del');
  });

  it('supports a custom id and className on the panel', () => {
    render(<ControlledDropdownMenu open id="custom-dropdown" className="custom-panel" />);

    const panel = screen.getByRole('menu').closest('[data-alignment]') as HTMLElement;
    expect(panel).toHaveAttribute('id', 'custom-dropdown');
    expect(panel).toHaveClass('custom-panel');
  });
});
