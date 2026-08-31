import * as React from 'react';
import { Menu } from '../menu';
import { Popup } from '../../primitives/popup';
import type { PopupAlignment } from '../../primitives/popup';
import type { DropdownMenuAlignment, DropdownMenuProps } from './dropdown-menu.types';

const ALIGNMENT_MAP: Record<DropdownMenuAlignment, PopupAlignment> = {
  left: 'bottomLeft',
  center: 'bottomCenter',
  right: 'bottomRight',
};

export const DropdownMenu = React.memo(function DropdownMenu({
  children,
  open,
  onOpenChange,
  alignment = 'left',
  id,
  className,
  sections,
  size,
  showSearch,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  showScrollbar,
  maxHeight,
  loading,
  loadingLabel,
  emptyMessage,
  anchorRef,
  matchTriggerWidth = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: DropdownMenuProps) {
  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      alignment={ALIGNMENT_MAP[alignment]}
      padding="none"
      id={id}
      className={className}
      anchorRef={anchorRef}
      matchTriggerWidth={matchTriggerWidth}
      content={
        <Menu
          sections={sections}
          size={size}
          // When the panel is sized to the trigger, the Menu fills it instead of a fixed size width.
          fullWidth={matchTriggerWidth}
          showSearch={showSearch}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
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
      {children}
    </Popup>
  );
});

DropdownMenu.displayName = 'DropdownMenu';
