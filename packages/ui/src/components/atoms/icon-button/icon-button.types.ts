import type * as React from 'react';
import type { ButtonAppearance, ButtonSize } from '../button';

export type IconButtonAppearance = ButtonAppearance;
export type IconButtonSize = ButtonSize;
export type IconButtonShape = 'square' | 'round';

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'> {
  appearance?: IconButtonAppearance;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  isDisabled?: boolean;
  isLoading?: boolean;
  isExpanded?: boolean;
  children: React.ReactNode;
}
