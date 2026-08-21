import type * as React from 'react';

export type TagTone =
  | 'default'
  | 'blue'
  | 'green'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow'
  | 'orange'
  | 'magenta'
  | 'brand';

export type TagSize = 'sm' | 'md';

export interface TagProps extends React.HTMLAttributes<HTMLElement> {
  size?: TagSize;
  tone?: TagTone;
  href?: string;
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  rel?: string;
  isRemovable?: boolean;
  isDisabled?: boolean;
  isInteractive?: boolean;
  elemBefore?: React.ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  children: React.ReactNode;
}
