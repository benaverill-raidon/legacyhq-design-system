import type * as React from 'react';
import type { MenuProps } from '../menu';

export type DropdownMenuAlignment = 'left' | 'center' | 'right';

export interface DropdownMenuProps extends Omit<MenuProps, 'id' | 'className'> {
  /**
   * The single trigger element - any focusable control (Button, IconButton, Avatar, Tag, Chip,
   * a page selector, ...), matching Figma's own range of trigger types. Cloned by the underlying
   * Popup to receive a measurement ref and aria-expanded/aria-controls.
   */
  children: React.ReactElement;
  /** Controlled visibility - renders nothing but the trigger when false. */
  open: boolean;
  /** Called with false on Escape or an outside click. DropdownMenu does not change its own visibility - the consumer updates `open` in response. */
  onOpenChange?: (open: boolean) => void;
  /** Horizontal edge the panel opens aligned to, below the trigger. Maps to Popup's bottomLeft/bottomCenter/bottomRight - DropdownMenu always opens below, matching Figma exactly. */
  alignment?: DropdownMenuAlignment;
  /** Id applied to the floating panel (Popup's own id), not to the Menu inside it. */
  id?: string;
  /** Composes with the floating panel's class list (Popup's panel), not with Menu's root. */
  className?: string;
}
