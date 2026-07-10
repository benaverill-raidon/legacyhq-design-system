import type * as React from 'react';
import type { ButtonAppearance, ButtonSize } from '../button';
import type { TooltipPlacement } from '../tooltip';

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
  tooltip?: React.ReactNode | false;
  tooltipPlacement?: TooltipPlacement;
  children: React.ReactNode;
}
