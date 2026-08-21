import type * as React from 'react';

export type IconSize = 'sm' | 'md';
export type IconSpacing = 'none' | 'spacious';

export type IconColor =
  | 'default'
  | 'subtle'
  | 'inverse'
  | 'brand'
  | 'selected'
  | 'success'
  | 'warning'
  | 'error'
  | 'information'
  | 'discovery'
  | 'disabled';

export interface IconProps {
  size?: IconSize;
  spacing?: IconSpacing;
  color?: IconColor;
  title?: string;
  decorative?: boolean;
  className?: string;
  testId?: string;
}

export interface IconBaseProps extends IconProps {
  viewBox: string;
  children: React.ReactNode;
}
