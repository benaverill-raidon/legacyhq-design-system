import type * as React from 'react';

export type MenuSize = 'sm' | 'md' | 'lg';

export type MenuItemSelectionType = 'checkbox' | 'radio';

export interface MenuItem {
  /** Stable identity for the item - used for the React key and as part of the roving-tabindex order. */
  id: string;
  /** Primary row text. Used for search filtering when it's a plain string. */
  label: React.ReactNode;
  /** Secondary row text, rendered below the label. */
  description?: React.ReactNode;
  /**
   * Leading slot for the whole row - a fixed 24px box regardless of content. Decorative only
   * (rendered with aria-hidden); never a real interactive control - the row is a native <button>,
   * so nesting a focusable one inside it is invalid HTML. Pass an Icon with `spacing="spacious"`
   * (size stays at Icon's own `md` default) to fill the slot the way Figma does.
   *
   * Any icon here should track `selected`: color="selected" when the item is selected,
   * color="default" otherwise - verified on a plain, non-checkbox icon (same color/content/selected
   * variable the row's own text uses), not just checkbox/radio ones. For a checkbox/radio-style
   * row specifically, use the exact icons Figma's own menu-item uses -
   * CheckboxFillIcon/CheckboxEmptyIcon or RadioCheckedIcon/RadioUncheckedIcon, colored
   * color="selected" when selected and color="subtle" (not "default") when not - never a real
   * Checkbox/Radio.
   */
  leadingElement?: React.ReactNode;
  /** A smaller leading icon immediately before the label text itself, distinct from leadingElement. Rare - most rows only need leadingElement. */
  titleLeadingElement?: React.ReactNode;
  /** Trailing slot for the whole row (24px) - a shortcut hint, chevron, or count. Same decorative-only rule as leadingElement. */
  trailingElement?: React.ReactNode;
  /** Persistent highlighted/checked state, independent of hover/focus. Omit entirely for a plain action item with no selection concept. */
  selected?: boolean;
  /** When set alongside `selected`, the row's ARIA role becomes menuitemcheckbox/menuitemradio with aria-checked instead of plain menuitem. */
  selectionType?: MenuItemSelectionType;
  disabled?: boolean;
  onSelect?: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
}

export interface MenuSection {
  id: string;
  heading?: React.ReactNode;
  headingLeadingElement?: React.ReactNode;
  items: MenuItem[];
}

export interface MenuProps {
  /** Sections rendered top to bottom, each separated by a divider after the first. */
  sections: MenuSection[];
  /** Controls the panel's fixed width (--component-menu-width-sm/md/lg: 192/240/288px). Row height is unaffected - it's driven by content. */
  size?: MenuSize;
  /** Shows the search field above the sections. Defaults to true, matching the Figma component's own default. */
  showSearch?: boolean;
  /** Filters items by a case-insensitive substring match against each item's label (only when label is a plain string) and description. Controlled - Menu does not filter internally when this is provided without onSearchChange. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Enables scrolling (with a visible scrollbar) once content exceeds maxHeight. Defaults to true, matching the Figma component's own default. */
  showScrollbar?: boolean;
  /** Caps the sections area's height before it scrolls. No cap by default. */
  maxHeight?: number | string;
  /** Replaces the sections area with a loading row. Search (if shown) stays interactive. */
  loading?: boolean;
  loadingLabel?: React.ReactNode;
  /** Shown when search filters every item out. */
  emptyMessage?: React.ReactNode;
  id?: string;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
