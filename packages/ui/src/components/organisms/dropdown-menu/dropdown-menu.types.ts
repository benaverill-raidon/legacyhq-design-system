import type * as React from 'react';
import type { MenuProps } from '../menu';

export type DropdownMenuAlignment = 'left' | 'center' | 'right';

export interface DropdownMenuProps extends Omit<MenuProps, 'id' | 'className'> {
  /**
   * The trigger: one element, such as a Button, an Icon Button, or an Avatar. It's cloned to add a
   * ref and `aria-expanded`/`aria-controls`, so it must pass them to its DOM element. On a Button or
   * an Icon Button, also set `isExpanded={open}`. Open the menu from the trigger's `onClick`.
   */
  children: React.ReactElement;
  /** Whether the panel is open. Your state owns it; Dropdown Menu never changes it. While `false`, only the trigger renders. */
  open: boolean;
  /**
   * Called with `false` on Escape anywhere on the page, or on a press outside the trigger and the
   * panel. Set `open` from it. It isn't called when an item is chosen: close the menu from `onSelect`.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Which edge of the trigger the panel lines up with. It opens below the trigger; where it doesn't
   * fit, it moves to the position that overflows the viewport least, trying above first.
   */
  alignment?: DropdownMenuAlignment;
  /**
   * Another element to position against and match width to, instead of the trigger, such as the
   * field frame around Select's input. A press inside it doesn't close the panel.
   */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Makes the panel as wide as the trigger, or `anchorRef`, with the Menu filling it, instead of the Menu's `size` width. */
  matchTriggerWidth?: boolean;
  /** Set on the floating panel and used for the trigger's `aria-controls`; generated when unset. Not passed to the Menu. */
  id?: string;
  /** Added to the floating panel's classes, not the Menu's. */
  className?: string;
}
