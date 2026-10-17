import type * as React from 'react';

export type MenuSize = 'sm' | 'md' | 'lg';

export type MenuItemSelectionType = 'checkbox' | 'radio';

export interface MenuItem {
  /** Unique within the Menu. Used as the React key and to track which row is the tab stop. */
  id: string;
  /** The row's text and its accessible name. Search can match it only when it's a string. */
  label: React.ReactNode;
  /** A second, smaller line under the label. Search can match it only when it's a string. */
  description?: React.ReactNode;
  /**
   * A fixed 24px slot before the text, for an icon or an Avatar. It's hidden from assistive
   * technology, so it can't carry meaning, and it must never hold a control: the row is already a
   * native `button`. The slot centers what you pass, so a `md` icon sits in the middle of it.
   *
   * An icon here needs no color: it takes the row's text color, so it turns `selected` with the
   * row (color/content/selected, the variable Figma binds) and `disabled` with it. For a
   * checkbox/radio-style row, use the exact icons Figma's own menu-item uses -
   * CheckboxFillIcon/CheckboxEmptyIcon or RadioCheckedIcon/RadioUncheckedIcon - and set
   * color="subtle" on the unchecked one, which Figma dims below the row's text. Never a real
   * Checkbox/Radio.
   */
  leadingElement?: React.ReactNode;
  /** A small icon right before the label, on the label's line. Rare: most rows need only `leadingElement`. Hidden from assistive technology. */
  titleLeadingElement?: React.ReactNode;
  /** A fixed 24px slot after the text, for a chevron, a count, or a shortcut hint. Hidden from assistive technology, like `leadingElement`. */
  trailingElement?: React.ReactNode;
  /** Shows the row as selected: a tinted fill, the selected text color, and a 2px bar on its left edge. Announced only when `selectionType` is set. */
  selected?: boolean;
  /** Makes the row a `menuitemcheckbox` or `menuitemradio`, with `aria-checked` from `selected`. Menu doesn't keep radio rows exclusive: select one yourself. */
  selectionType?: MenuItemSelectionType;
  /** Disables the row with the native attribute: it can't be focused, the arrow keys skip it, and `onSelect` isn't called. */
  disabled?: boolean;
  /**
   * Called when the row is clicked, or activated with Enter or Space. Menu on its own doesn't close
   * anything. In a Dropdown Menu, choosing a row then closes the menu and returns focus to the
   * trigger; call `event.preventDefault()` here to keep it open, such as for a checkbox row.
   */
  onSelect?: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
}

export interface MenuSection {
  /** Unique within the Menu; used as the React key. */
  id: string;
  /** Text above the section's rows. A headed section is a `role="group"` named by its heading, so the rows are announced with it. */
  heading?: React.ReactNode;
  /** An icon before the heading. Hidden from assistive technology. */
  headingLeadingElement?: React.ReactNode;
  /** The section's rows, in order. */
  items: MenuItem[];
}

export interface MenuProps {
  /** The sections, top to bottom. A divider separates each one from the section or search field above it. */
  sections: MenuSection[];
  /** The Menu's fixed width: `sm` 192px, `md` 240px, `lg` 288px. Row height follows the content. Ignored with `fullWidth`. */
  size?: MenuSize;
  /**
   * Shows the search field above the sections and focuses it when the Menu mounts, which in a
   * Dropdown Menu is every time it opens. On by default, as in Figma.
   */
  showSearch?: boolean;
  /**
   * The search text, and the filter: rows stay when their string label or description contains it,
   * ignoring case, and sections left empty are hidden. Menu keeps no search state, so pass it with
   * `onSearchChange`; without it, typing doesn't filter.
   */
  searchValue?: string;
  /** Called with the field's text on every change, and with `''` when the clear button is pressed. */
  onSearchChange?: (value: string) => void;
  /** The search field's placeholder, a hint shown while it's empty. None by default. It doesn't name the field: `searchLabel` does. */
  searchPlaceholder?: string;
  /** The search field's accessible name. Defaults to "Search". */
  searchLabel?: string;
  /** The accessible name and tooltip of the clear button, which shows once `searchValue` isn't empty. */
  clearSearchLabel?: string;
  /** Lets the sections scroll once they're taller than `maxHeight`; without it, the extra rows are cut off. On by default, as in Figma. */
  showScrollbar?: boolean;
  /** The tallest the sections can be, in pixels or any CSS length. No limit by default. */
  maxHeight?: number | string;
  /** Replaces the sections with a loading row, a Spinner and `loadingLabel`, in a polite live region. The search field stays usable. */
  loading?: boolean;
  /** The loading row's text. */
  loadingLabel?: React.ReactNode;
  /**
   * Shown in place of the rows when none are left, such as when a search matches nothing. It's
   * announced politely when the rows run out after the Menu has rendered, not when it first renders empty.
   */
  emptyMessage?: React.ReactNode;
  /** Fills the container's width instead of a fixed `size` width, for a panel sized to its trigger, as Dropdown Menu's `matchTriggerWidth` does. */
  fullWidth?: boolean;
  /** Set on the Menu's outer `div`, which holds the search field and the menu. */
  id?: string;
  /** Added to the outer `div`'s classes. */
  className?: string;
  /** Names the menu for assistive technology. Set it or `aria-labelledby`: Menu has no default name. */
  'aria-label'?: string;
  /** The id of visible text that names the menu, such as a heading above it. */
  'aria-labelledby'?: string;
}
