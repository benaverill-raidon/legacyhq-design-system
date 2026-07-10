import type * as React from 'react';

export type AvatarSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type AvatarPresence = 'none' | 'online' | 'offline' | 'busy';
export type AvatarStatus = 'none' | 'accepted' | 'declined';

export interface AvatarProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  size?: AvatarSize;
  src?: string;
  alt?: string;
  name?: string;
  presence?: AvatarPresence;
  status?: AvatarStatus;
  isSelected?: boolean;
  isDisabled?: boolean;
  isInteractive?: boolean;
  decorative?: boolean;
}
