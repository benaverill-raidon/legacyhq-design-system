import type * as React from 'react';
import type { MenuProps } from '../menu';

export type DropdownMenuAlignment = 'left' | 'center' | 'right';

export interface DropdownMenuProps extends Omit<MenuProps, 'id' | 'className'> {
  /**
   * The trigger: one element, such as a Button, an Icon Button, or an Avatar. It's cloned to add a
   * ref, `aria-haspopup="menu"` (unless it sets its own), and `aria-expanded`/`aria-controls`, so it
   * must pass them to its DOM element. Open the menu from the trigger's `onClick`. Focus returns to
   * it when the menu closes from inside. A `role="combobox"` trigger, like Select's field, keeps
   * focus while the menu is open and closes it itself.
   */
  children: React.ReactElement;
  /** Whether the panel is open. Your state owns it; Dropdown Menu never changes it. While `false`, only the trigger renders. */
  open: boolean;
  /**
   * Called with `false` on Escape anywhere on the page, a press outside the trigger and the panel,
   * Tab out of the panel, or choosing an item (unless its `onSelect` calls `event.preventDefault()`).
   * Set `open` from it.
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
