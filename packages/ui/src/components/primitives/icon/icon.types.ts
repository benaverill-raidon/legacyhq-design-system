import type * as React from 'react';

export type IconSize = 'sm' | 'md';
export type IconSpacing = 'none' | 'spacious';

/**
 * `inherit` (the default) takes the color of the surrounding text, so the icon follows its control
 * through hover, selection, disabled, and inverse. The others set a semantic content color.
 */
export type IconColor =
  | 'inherit'
  | 'default'
  | 'subtle'
  | 'inverse'
  | 'brand'
  | 'selected'
  | 'success'
  | 'warning'
  | 'error'
  | 'information'
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
