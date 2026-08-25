import type * as React from 'react';

export type AvatarSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarPresence = 'none' | 'online' | 'offline' | 'busy';
export type AvatarStatus = 'none' | 'accepted' | 'declined';
export type AvatarEntityType = 'person' | 'team';

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
  /** Which fallback artwork renders when there is no `src` (or it fails to load) - a generic person silhouette for an individual, or a two-person silhouette for a team/partner entity. Purely visual; has no effect when `src` loads successfully. */
  entityType?: AvatarEntityType;
}
