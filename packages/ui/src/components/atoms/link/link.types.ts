import type * as React from 'react';

export type LinkAppearance = 'default' | 'subtle' | 'inverse';
export type LinkSize = 'sm' | 'md';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  appearance?: LinkAppearance;
  size?: LinkSize;
  children: React.ReactNode;
}
