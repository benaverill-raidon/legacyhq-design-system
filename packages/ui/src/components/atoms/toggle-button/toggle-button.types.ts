import type * as React from 'react';

export type ToggleButtonTone = 'default' | 'subtle';

export type ToggleButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ToggleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'> {
  size?: ToggleButtonSize;
  tone?: ToggleButtonTone;
  isSelected?: boolean;
  isDisabled?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}
