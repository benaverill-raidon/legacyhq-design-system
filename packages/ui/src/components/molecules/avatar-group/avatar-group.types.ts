import type * as React from 'react';
import type { AvatarProps } from '../../atoms/avatar';

export type AvatarGroupSize = 'xs' | 'sm' | 'md' | 'lg';

export interface AvatarGroupItem extends Omit<AvatarProps, 'size' | 'id'> {
  /** Stable identity - used for the React key and as the Menu item id if this avatar is truncated into the overflow panel. */
  id: string;
}

export interface AvatarGroupProps {
  /** Every person in the group, in order, visible or not. Each item takes Avatar's props except `size`, plus a unique `id`. */
  avatars: AvatarGroupItem[];
  /** How many avatars show before the rest move behind the overflow button. At least 1 always shows. With no `maxVisible`, every avatar shows and there's no overflow button. */
  maxVisible?: number;
  /** The size of every avatar and of the overflow button: 24, 32, 40, or 48px from `xs` to `lg`. */
  size?: AvatarGroupSize;
  /** The overflow button's visible text, from the number of hidden people. Defaults to `+3` for three. */
  overflowLabel?: (hiddenCount: number) => React.ReactNode;
  /**
   * The overflow button's accessible name, from the number of hidden people: what the button
   * reveals. Defaults to “+3 more people” for three and “+1 more person” for one. Start it with the
   * button's visible text, so people using speech input can say what they see, and translate it with
   * the rest of your interface.
   */
  getOverflowButtonLabel?: (hiddenCount: number) => string;
  /** The overflow menu's accessible name. Defaults to “3 more people” for three. */
  overflowMenuAriaLabel?: string;
  /** The overflow menu's name for a hidden person with no `name` or `alt`. Defaults to "Unnamed". */
  unnamedLabel?: string;
  /**
   * Called with the person and the event when someone chooses a hidden person from the overflow
   * menu. The menu then closes and focus returns to the overflow button. Avatar Group does nothing
   * else, so navigate from here.
   */
  onOverflowAvatarSelect?: (
    avatar: AvatarGroupItem,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
  /** The root element's `id`. */
  id?: string;
  /** Added to the root element's classes. */
  className?: string;
}
