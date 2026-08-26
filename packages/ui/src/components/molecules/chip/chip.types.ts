import type * as React from 'react';
import type { MenuSection } from '../../organisms/menu';

export type ChipMode = 'filter' | 'property' | 'scope';

export type ChipSize = 'sm' | 'md';

/** Shared by all three modes - the leading label segment plus geometry. */
interface ChipCommonProps {
  /** The leading segment's text: the property name (`filter`/`property`) or the scope name (`scope`). */
  label: React.ReactNode;
  /**
   * Decorative slot before the label - an Icon or Avatar, matching Figma's own
   * `figma-parts / elemBefore` (element=icon|avatar) at a fixed 16px box. Never an interactive
   * control: in `scope` mode the whole segment is already a button, so nesting a focusable element
   * inside it would be invalid HTML.
   */
  elemBefore?: React.ReactNode;
  /**
   * Applied to every segment together, matching Figma - there is no per-segment size mixing.
   *
   * Defaults to the size of the enclosing Chip Group, or `md` when there is none. Setting it
   * explicitly always wins over the group's.
   */
  size?: ChipSize;
  /** Disables every segment at once (native `disabled` on each real control). */
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** One dropdown-backed segment: visible text plus the menu it opens. */
export interface ChipSegment {
  /** The segment's visible text - the current operator ("on") or value ("2 statuses", "March 2"). */
  label: React.ReactNode;
  /** Rows shown when this segment opens, same shape Menu/Dropdown Menu already use. */
  sections: MenuSection[];
  /** Accessible name for this segment's own menu panel. */
  menuAriaLabel?: string;
}

/**
 * `scope` - a selectable search scope. The only mode Figma gives an unselected state, and the only
 * one whose label segment is itself the interactive control (a real toggle button).
 *
 * Each scope chip is an independent on/off toggle - it is not a radio group. Several can be on at
 * once, and turning one on does not turn another off; that coordination (if any) belongs to the
 * consumer holding the state, the same way Toggle Button works.
 */
export interface ChipScopeProps extends ChipCommonProps {
  mode: 'scope';
  /** Selected scopes carry the `selected` token family; unselected ones read as a plain chip. */
  isSelected?: boolean;
  /** Called with this chip's next on/off value when it is activated. */
  onSelectedChange?: (isSelected: boolean) => void;
  /**
   * Documentation-only: pins `:focus-visible` as a static Storybook reference, the same convention
   * Button/Tag/Toggle Button use. Not part of the public API.
   *
   * Only `'focus'` is accepted: the label segment deliberately has no hover or press treatment, so
   * a `'hover'`/`'press'` value here would render identically to the default and quietly mislead.
   */
  'data-force-state'?: 'focus';
}

/** `property` - one already-applied property, with a remove affordance. No dropdowns. */
export interface ChipPropertyProps extends ChipCommonProps {
  mode: 'property';
  /** Every verified Figma `property` chip carries a remove button, so this is required. */
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name for the remove button. Defaults to `Remove ${label}` when label is a string. */
  removeAriaLabel?: string;
}

/**
 * `filter` - an active filter across one property: the property name, an optional operator, the
 * current value (each dropdown-backed), and a remove affordance.
 */
export interface ChipFilterProps extends ChipCommonProps {
  mode: 'filter';
  /** The current value segment and the menu it opens. */
  value: ChipSegment;
  /**
   * Optional comparison operator between the label and the value ("on", "before", "is not"). Figma
   * only shows this on its `due date` filter type, but nothing about it is date-specific - any
   * filter that needs a comparison can use it.
   */
  operator?: ChipSegment;
  /** Preview of the current selection, rendered before the value text (an Avatar Group, status icons, ...). */
  valuePreview?: React.ReactNode;
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void;
  removeAriaLabel?: string;
}

/**
 * Discriminated on `mode`, so props that only make sense for one use are rejected for the others -
 * `sections` cannot reach a scope chip, `onSelectedChange` cannot reach a property chip.
 */
export type ChipProps = ChipScopeProps | ChipPropertyProps | ChipFilterProps;
