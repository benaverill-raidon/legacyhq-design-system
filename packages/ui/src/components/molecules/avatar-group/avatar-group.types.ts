import type * as React from 'react';
import type { AvatarProps } from '../../atoms/avatar';

export type AvatarGroupSize = 'xs' | 'sm' | 'md' | 'lg';

export interface AvatarGroupItem extends Omit<AvatarProps, 'size' | 'id'> {
  /** Stable identity - used for the React key and as the Menu item id if this avatar is truncated into the overflow panel. */
  id: string;
}

export interface AvatarGroupProps {
  /** The full set of avatars, visible and truncated. */
  avatars: AvatarGroupItem[];
  /** Once `avatars.length` exceeds this, only the first `maxVisible` render as avatars - the rest are truncated behind the overflow trigger. No truncation when omitted. */
  maxVisible?: number;
  /** Applied uniformly to every rendered avatar, including the overflow trigger - matching Figma, which has no per-avatar size mixing within one group. */
  size?: AvatarGroupSize;
  /** Overflow trigger text, given the truncated count. Defaults to `+${hiddenCount}`, matching Figma exactly. */
  overflowLabel?: (hiddenCount: number) => React.ReactNode;
  /** Accessible name for the overflow panel (a Menu). Defaults to `${hiddenCount} more people`. */
  overflowMenuAriaLabel?: string;
  /**
   * Called when a truncated avatar is selected from the overflow panel. Avatar Group does not
   * navigate or close the panel on its own - same "never assume" rule as Menu and Dropdown Menu.
   */
  onOverflowAvatarSelect?: (
    avatar: AvatarGroupItem,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
  id?: string;
  className?: string;
}
