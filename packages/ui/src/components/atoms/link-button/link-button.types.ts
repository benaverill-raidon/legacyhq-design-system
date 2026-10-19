import type * as React from 'react';
import type { ButtonAppearance, ButtonSize, ButtonTone } from '../button';

export type LinkButtonAppearance = ButtonAppearance;
export type LinkButtonSize = ButtonSize;
export type LinkButtonTone = ButtonTone;

export interface LinkButtonProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> {
  /** Where the link goes: a route, a `#section` on this page, or another site. Required. */
  href: string;
  /**
   * The visual style: `default` is outlined, `primary` has the brand fill, and `subtle` has no border
   * and no fill until hover.
   */
  appearance?: LinkButtonAppearance;
  /**
   * What the link means. `warning` and `error` restyle `appearance="primary"` only; any other pairing,
   * including `brand`, renders the appearance's own look.
   */
  tone?: LinkButtonTone;
  /** Control height, padding, and corner radius. `lg` also sets the label one type size larger. */
  size?: LinkButtonSize;
  /**
   * The on-dark treatment, for a dark or bold surface such as Banner: no fill or border, inverse text,
   * and light hover and press overlays. `isDisabled` overrides it.
   */
  isInverse?: boolean;
  /**
   * Anchors have no native `disabled`, so this removes the `href` (nothing can open it, not even the
   * context menu), sets `aria-disabled`, and takes the link out of the tab order.
   */
  isDisabled?: boolean;
  /**
   * Shows a Spinner over the content without changing the size, sets `aria-busy` and `aria-disabled`,
   * and removes the `href` so the link can't be opened. It stays focusable, and the label stays the
   * accessible name.
   */
  isLoading?: boolean;
  /** An icon before the label, to support it, never to replace it. */
  iconBefore?: React.ReactNode;
  /** An icon after the label, such as an arrow to continue. */
  iconAfter?: React.ReactNode;
  /** The visible label, and the accessible name. Name the destination. */
  children: React.ReactNode;
  /** The native anchor target. With `_blank` and no `rel`, Link Button adds `rel="noopener noreferrer"`. */
  target?: React.HTMLAttributeAnchorTarget;
  /** The native `rel`. When set, it replaces the `noopener noreferrer` default for `_blank`. */
  rel?: string;
  /** Hidden text read after the label when `target="_blank"`. Defaults to "(opens in a new tab)". */
  newTabLabel?: string;
  /** Not called while the link button is disabled or loading. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}
