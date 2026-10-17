import type * as React from 'react';

export type AvatarSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarPresence = 'none' | 'online' | 'offline' | 'busy';
export type AvatarStatus = 'none' | 'accepted' | 'declined';
export type AvatarEntityType = 'person' | 'team';

export interface AvatarProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** The diameter: 16, 24, 32, 40, 48, or 72px from `xxs` to `xl`, with `md` the default. The badge scales with it. */
  size?: AvatarSize;
  /** The photo's URL. Without one, or when it fails to load, Avatar shows the fallback artwork; a new `src` is tried again. */
  src?: string;
  /** The accessible name when there's no `name` or `aria-label`. The photo itself is always hidden from assistive technology. */
  alt?: string;
  /**
   * The person's or team's name, and the avatar's accessible name unless `aria-label` or
   * `aria-labelledby` is set. Set it even when there's a photo.
   */
  name?: string;
  /** Availability, shown as the badge and added to the accessible name: `online`, `offline`, or `busy`. `status` replaces it when both are set. */
  presence?: AvatarPresence;
  /** A reply, such as to an invitation, shown as the badge and added to the accessible name: `accepted` or `declined`. Takes precedence over `presence`. */
  status?: AvatarStatus;
  /** Draws the brand ring inside the edge and adds "selected" to the accessible name. For an interactive avatar that people pick. */
  isSelected?: boolean;
  /** Dims the avatar. On an interactive avatar it also sets the native `disabled`, so it can't be focused or clicked. */
  isDisabled?: boolean;
  /** Renders a native `button` instead of a `span`, with hover, press, and focus styles. Passing `onClick` does the same. */
  isInteractive?: boolean;
  /** Hides a static avatar from assistive technology, for one next to a visible name. Ignored when the avatar is interactive. */
  decorative?: boolean;
  /**
   * Which fallback artwork shows when there's no photo: a person, or a two-person silhouette for a team
   * or a partner firm. No effect once a photo loads.
   */
  entityType?: AvatarEntityType;
  /** Makes the avatar a `button`, like `isInteractive`. Not called while it's disabled. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** The native button type, when the avatar is interactive. Defaults to `button`. */
  type?: 'button' | 'submit' | 'reset';
  /** Replaces `name` as the accessible name. Avatar still adds "selected" and the badge after it. */
  'aria-label'?: string;
  /** Names the avatar from other text on the page. Avatar then adds nothing, so selection and the badge aren't announced. */
  'aria-labelledby'?: string;
}
