import type * as React from 'react';

export type LinkAppearance = 'default' | 'subtle' | 'inverse';
export type LinkSize = 'sm' | 'md';
/**
 * Weight of the link text (Figma's `emphasis` axis). `strong` (the default, a heading weight) is for
 * a name / first-column identifier; `default` (a body weight) is for any other entity link.
 */
export type LinkEmphasis = 'default' | 'strong';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Where the link goes: a route, a `#section` on this page, or another site. Required. */
  href: string;
  /**
   * The color for the surface the link sits on: `default` is the brand color, `subtle` is quieter,
   * and `inverse` is for a dark or bold surface only.
   */
  appearance?: LinkAppearance;
  /** Type size, and the size of the new-tab icon: `sm` is `heading-xxs`, `md` is `heading-xs`. */
  size?: LinkSize;
  /**
   * The text weight: `strong`, the default, is a heading weight for a name or first-column
   * identifier; `default` is the body weight, for any other link.
   */
  emphasis?: LinkEmphasis;
  /**
   * The native anchor target, rendered as `_self` when unset. `_blank` adds the new-tab icon and
   * `newTabLabel`, and adds `noopener noreferrer` to `rel`.
   */
  target?: React.HTMLAttributeAnchorTarget;
  /** The native `rel`. With `target="_blank"`, `noopener` and `noreferrer` are added to your values. */
  rel?: string;
  /**
   * Read by assistive technology after the link text when `target="_blank"`, since the
   * external-link icon is decorative. Defaults to "(opens in a new tab)".
   */
  newTabLabel?: string;
  /** The visible link text, and the accessible name. Name the destination. */
  children: React.ReactNode;
}
