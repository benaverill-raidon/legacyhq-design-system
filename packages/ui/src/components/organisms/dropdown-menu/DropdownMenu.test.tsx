import * as React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DropdownMenu } from './dropdown-menu';
import type { MenuSection } from '../menu';
import popupStyles from '../../primitives/popup/popup.module.css';
import menuStyles from '../menu/menu.module.css';

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

  it('closes when an item is chosen, after its onSelect, and returns focus to the trigger', () => {
    const order: string[] = [];
    function Tracked() {
      const [open, setOpen] = React.useState(false);
      return (
        <DropdownMenu
          aria-label="Matter actions"
          showSearch={false}
          open={open}
          onOpenChange={(next) => {
            order.push(`openChange:${next}`);
            setOpen(next);
          }}
          sections={[{ id: 'actions', items: [{ id: 'rename', label: 'Rename', onSelect: () => order.push('select') }] }]}
        >
          <button type="button" onClick={() => setOpen(true)}>
            Trigger
          </button>
        </DropdownMenu>
      );
    }

    render(<Tracked />);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.click(trigger);
    const item = screen.getByRole('menuitem', { name: 'Rename' });
    item.focus();
    fireEvent.click(item);

    expect(order).toEqual(['select', 'openChange:false']);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("stays open when the item's onSelect calls event.preventDefault()", () => {
    const handleOpenChange = vi.fn();
    render(
      <ControlledDropdownMenu
        open
        onOpenChange={handleOpenChange}
        sections={[
          {
            id: 'view',
            items: [
              { id: 'drafts', label: 'Show drafts', selectionType: 'checkbox', onSelect: (event) => event.preventDefault() },
            ],
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Show drafts' }));

    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it("leaves focus where an item's onSelect moved it, outside the panel", () => {
    render(
      <>
        <input aria-label="Elsewhere" />
        <ControlledDropdownMenu
          open
          sections={[
            {
              id: 'actions',
              items: [
                { id: 'rename', label: 'Rename', onSelect: () => screen.getByRole('textbox', { name: 'Elsewhere' }).focus() },
              ],
            },
          ]}
        />
      </>,
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));

    expect(screen.getByRole('textbox', { name: 'Elsewhere' })).toHaveFocus();
  });

  it('gives the trigger aria-haspopup="menu", unless it sets its own', () => {
    const { rerender } = render(<ControlledDropdownMenu />);
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveAttribute('aria-haspopup', 'menu');

    rerender(
      <DropdownMenu aria-label="Matter actions" open={false} sections={actionSections()}>
        <button type="button" aria-haspopup="true">
          Trigger
        </button>
      </DropdownMenu>,
    );
    expect(screen.getByRole('button', { name: 'Trigger' })).toHaveAttribute('aria-haspopup', 'true');
  });

  it("keeps the trigger's own ref working", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <DropdownMenu aria-label="Matter actions" open={false} sections={actionSections()}>
        <button ref={ref} type="button">
          Trigger
        </button>
      </DropdownMenu>,
    );

    expect(ref.current).toBe(screen.getByRole('button', { name: 'Trigger' }));
  });

  it('moves focus to the first enabled item when it opens without a search field', async () => {
    render(
      <ControlledDropdownMenu
        sections={[
          {
            id: 'actions',
            items: [
              { id: 'rename', label: 'Rename', disabled: true },
              { id: 'delete', label: 'Delete' },
            ],
          },
        ]}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    trigger.focus();
    fireEvent.click(trigger);

    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus());
  });

  it('moves focus to the search field when it opens with one', async () => {
    render(<ControlledDropdownMenu showSearch />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));

    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Search' })).toHaveFocus());
  });

  it('returns focus to the trigger on Escape from inside the panel', async () => {
    render(<ControlledDropdownMenu />);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.click(trigger);
    const item = screen.getByRole('menuitem', { name: 'Rename' });
    await waitFor(() => expect(item).toHaveFocus());

    fireEvent.keyDown(item, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes and returns focus to the trigger when Tab or Shift+Tab leaves the panel', async () => {
    render(<ControlledDropdownMenu />);
    const trigger = screen.getByRole('button', { name: 'Trigger' });

    fireEvent.click(trigger);
    let item = screen.getByRole('menuitem', { name: 'Rename' });
    await waitFor(() => expect(item).toHaveFocus());
    expect(fireEvent.keyDown(item, { key: 'Tab' })).toBe(false);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    item = screen.getByRole('menuitem', { name: 'Rename' });
    await waitFor(() => expect(item).toHaveFocus());
    fireEvent.keyDown(item, { key: 'Tab', shiftKey: true });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('lets Tab move from the search field into the rows without closing', async () => {
    render(<ControlledDropdownMenu showSearch />);
    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    const search = screen.getByRole('textbox', { name: 'Search' });
    await waitFor(() => expect(search).toHaveFocus());

    expect(fireEvent.keyDown(search, { key: 'Tab' })).toBe(true);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('leaves focus and closing to a combobox trigger, as Select is', async () => {
    const handleOpenChange = vi.fn();
    render(
      <DropdownMenu aria-label="Options" open onOpenChange={handleOpenChange} showSearch={false} sections={actionSections()}>
        <input role="combobox" aria-label="Field" aria-controls="options" aria-expanded={false} />
      </DropdownMenu>,
    );
    const field = screen.getByRole('combobox', { name: 'Field' });
    field.focus();

    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(field).toHaveFocus();

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

  it('maps alignment start/center/end to Popup bottomStart/bottomCenter/bottomEnd', () => {
    const { rerender } = render(<ControlledDropdownMenu open alignment="start" />);
    expect(screen.getByRole('menu').closest('[data-alignment]')).toHaveAttribute('data-alignment', 'bottomStart');

    rerender(<ControlledDropdownMenu open alignment="center" />);
    expect(screen.getByRole('menu').closest('[data-alignment]')).toHaveAttribute('data-alignment', 'bottomCenter');

    rerender(<ControlledDropdownMenu open alignment="end" />);
    expect(screen.getByRole('menu').closest('[data-alignment]')).toHaveAttribute('data-alignment', 'bottomEnd');
  });

  it('still accepts the deprecated left and right alignments, placed as start and end', () => {
    const { rerender } = render(<ControlledDropdownMenu open alignment="left" />);
    expect(screen.getByRole('menu').closest('[data-alignment]')).toHaveAttribute('data-alignment', 'bottomStart');

    rerender(<ControlledDropdownMenu open alignment="right" />);
    expect(screen.getByRole('menu').closest('[data-alignment]')).toHaveAttribute('data-alignment', 'bottomEnd');
  });

  it('defaults to start (bottomStart) alignment', () => {
    render(<ControlledDropdownMenu open />);

    expect(screen.getByRole('menu').closest('[data-alignment]')).toHaveAttribute('data-alignment', 'bottomStart');
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

  it('passes searchLabel and clearSearchLabel to the Menu', () => {
    render(
      <ControlledDropdownMenu
        open
        showSearch
        searchValue="ren"
        onSearchChange={() => {}}
        searchLabel="Rechercher"
        clearSearchLabel="Effacer"
      />,
    );

    expect(screen.getByRole('textbox', { name: 'Rechercher' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Effacer' })).toBeInTheDocument();
  });

  it('passes fullWidth to the Menu', () => {
    render(<ControlledDropdownMenu open size="sm" fullWidth />);

    const menuRoot = screen.getByRole('menu').parentElement as HTMLElement;
    expect(menuRoot).toHaveClass(menuStyles.fullWidth);
    expect(menuRoot).not.toHaveClass(menuStyles.size_sm);
  });

  it('couples matchTriggerWidth to the inner Menu, filling the panel instead of a fixed size width', () => {
    // The panel-sizing (Popup) side is covered by Popup's own tests; this asserts DropdownMenu's
    // unique wiring: a trigger-matched panel needs its Menu to stretch, not stay at size="sm" width.
    // The width class lives on Menu's outer container (the role="menu" element's parent).
    const menuRoot = () => screen.getByRole('menu').parentElement as HTMLElement;

    const { rerender } = render(<ControlledDropdownMenu open size="sm" />);
    expect(menuRoot()).toHaveClass(menuStyles.size_sm);
    expect(menuRoot()).not.toHaveClass(menuStyles.fullWidth);

    rerender(<ControlledDropdownMenu open size="sm" matchTriggerWidth />);
    expect(menuRoot()).toHaveClass(menuStyles.fullWidth);
    expect(menuRoot()).not.toHaveClass(menuStyles.size_sm);
  });
});
