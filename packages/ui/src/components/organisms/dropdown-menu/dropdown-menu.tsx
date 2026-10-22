import * as React from 'react';
import { Menu } from '../menu';
import type { MenuItem, MenuSection } from '../menu';
import { Popup } from '../../primitives/popup';
import type { PopupAlignment } from '../../primitives/popup';
import type { DeprecatedDropdownMenuAlignment, DropdownMenuAlignment, DropdownMenuProps } from './dropdown-menu.types';

// `left` and `right` are the deprecated names for `start` and `end`, placed the same.
const ALIGNMENT_MAP: Record<DropdownMenuAlignment | DeprecatedDropdownMenuAlignment, PopupAlignment> = {
  start: 'bottomStart',
  center: 'bottomCenter',
  end: 'bottomEnd',
  left: 'bottomStart',
  right: 'bottomEnd',
};

/** What can take focus inside the panel, for the Tab handling below. Filtered to tabIndex >= 0. */
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]';

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

/** Where focus goes when the menu opens: the search field, else the rows' tab stop (the first enabled row), else the menu. */
function getOpeningFocusTarget(panel: HTMLElement) {
  return (
    panel.querySelector<HTMLElement>('input:not(:disabled)') ??
    panel.querySelector<HTMLElement>('[role="menu"] [tabindex="0"]') ??
    panel.querySelector<HTMLElement>('[role="menu"]')
  );
}

export const DropdownMenu = React.memo(function DropdownMenu({
  children,
  open,
  onOpenChange,
  alignment = 'start',
  id,
  className,
  sections,
  size,
  showSearch,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  clearSearchLabel,
  showScrollbar,
  maxHeight,
  loading,
  loadingLabel,
  emptyMessage,
  fullWidth,
  anchorRef,
  matchTriggerWidth = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: DropdownMenuProps) {
  const generatedId = React.useId();
  const panelId = id ?? generatedId;
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
  >;
  const childRef = child.props.ref;
  // A combobox trigger (Select's field) keeps focus while the menu is open, since typing filters
  // it, and decides itself when to close: the menu-button focus handling below is skipped for it.
  const isCombobox = child.props.role === 'combobox';
  const mergedTriggerRef = React.useMemo(() => mergeRefs<HTMLElement>(childRef, triggerRef), [childRef]);

  const getPanel = React.useCallback(() => document.getElementById(panelId), [panelId]);

  // Focus goes back to the trigger only when it was in the panel (or was lost to the page), so an
  // item that moved focus somewhere on purpose, such as into a dialog it opened, keeps it there.
  const returnFocusToTrigger = React.useCallback(() => {
    const active = document.activeElement;
    if (!active || active === document.body || getPanel()?.contains(active)) {
      triggerRef.current?.focus();
    }
  }, [getPanel]);

  const closeToTrigger = React.useCallback(() => {
    returnFocusToTrigger();
    onOpenChange?.(false);
  }, [returnFocusToTrigger, onOpenChange]);

  // The menu-button pattern: opening moves focus into the panel (the search field, or the first
  // enabled row), since the panel is portalled to the end of the page. It waits a frame because
  // Popup keeps the panel hidden until it's positioned, and a hidden element can't take focus.
  // While loading with no search field there's nothing to focus; it runs again when loading ends.
  React.useEffect(() => {
    if (!open || isCombobox) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const panel = getPanel();
      const active = document.activeElement;
      if (!panel || (active && panel.contains(active))) return;
      if (active && active !== document.body && active !== triggerRef.current) return;
      getOpeningFocusTarget(panel)?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, isCombobox, loading, getPanel]);

  // Escape returns focus to the trigger (Popup then calls onOpenChange(false)); Tab past the
  // panel's last stop, or Shift+Tab before its first, closes it and returns focus to the trigger,
  // as Inline Message does, so the tab order runs trigger, panel, then the rest of the page.
  React.useEffect(() => {
    const panel = open && !isCombobox ? getPanel() : null;
    if (!panel) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        returnFocusToTrigger();
        return;
      }
      if (event.key !== 'Tab') return;
      // Walks every element so the stops come in document order (a selector list needn't, in jsdom).
      const tabbables = [...panel.querySelectorAll<HTMLElement>('*')].filter(
        (element) => element.matches(FOCUSABLE) && element.tabIndex >= 0,
      );
      const active = document.activeElement;
      const leaving = event.shiftKey
        ? !tabbables.length || active === tabbables[0] || !tabbables.includes(active as HTMLElement)
        : !tabbables.length || active === tabbables[tabbables.length - 1] || !tabbables.includes(active as HTMLElement);
      if (leaving) {
        event.preventDefault();
        closeToTrigger();
      }
    };
    panel.addEventListener('keydown', handleKeyDown);
    return () => panel.removeEventListener('keydown', handleKeyDown);
  }, [open, isCombobox, getPanel, returnFocusToTrigger, closeToTrigger]);

  // Choosing an item closes the menu and returns focus to the trigger, after the item's own
  // onSelect. The item can keep the menu open by calling event.preventDefault().
  const menuSections = React.useMemo<MenuSection[]>(() => {
    if (isCombobox) return sections;
    return sections.map((section) => ({
      ...section,
      items: section.items.map<MenuItem>((item) => ({
        ...item,
        onSelect: (event) => {
          item.onSelect?.(event);
          if (!event.defaultPrevented) closeToTrigger();
        },
      })),
    }));
  }, [sections, isCombobox, closeToTrigger]);

  const trigger = React.cloneElement(child, {
    ref: mergedTriggerRef,
    'aria-haspopup': child.props['aria-haspopup'] ?? 'menu',
  });

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      alignment={ALIGNMENT_MAP[alignment]}
      padding="none"
      id={panelId}
      className={className}
      anchorRef={anchorRef}
      matchTriggerWidth={matchTriggerWidth}
      content={
        <Menu
          sections={menuSections}
          size={size}
          // When the panel is sized to the trigger, the Menu fills it instead of a fixed size width.
          fullWidth={fullWidth || matchTriggerWidth}
          showSearch={showSearch}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          searchLabel={searchLabel}
          clearSearchLabel={clearSearchLabel}
          showScrollbar={showScrollbar}
          maxHeight={maxHeight}
          loading={loading}
          loadingLabel={loadingLabel}
          emptyMessage={emptyMessage}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
        />
      }
    >
      {trigger}
    </Popup>
  );
});

DropdownMenu.displayName = 'DropdownMenu';
