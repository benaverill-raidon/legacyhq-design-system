import type * as React from 'react';

export type LinkAppearance = 'default' | 'subtle' | 'inverse';
export type LinkSize = 'sm' | 'md';
/**
 * Weight of the link text (Figma's `emphasis` axis). `strong` (the default, a heading weight) is for
 * a name / first-column identifier; `default` (a body weight) is for any other entity link.
 */
export type LinkEmphasis = 'default' | 'strong';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  appearance?: LinkAppearance;
  size?: LinkSize;
  emphasis?: LinkEmphasis;
  children: React.ReactNode;
}
