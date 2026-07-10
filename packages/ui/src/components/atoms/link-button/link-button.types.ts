import type * as React from 'react';
import type { ButtonAppearance, ButtonSize, ButtonTone } from '../button';

export type LinkButtonAppearance = ButtonAppearance;
export type LinkButtonSize = ButtonSize;
export type LinkButtonTone = ButtonTone;

export interface LinkButtonProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> {
  href: string;
  appearance?: LinkButtonAppearance;
  tone?: LinkButtonTone;
  size?: LinkButtonSize;
  isDisabled?: boolean;
  isLoading?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}
