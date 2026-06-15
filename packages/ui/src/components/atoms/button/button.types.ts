import type * as React from 'react';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonAppearance = 'default' | 'primary' | 'subtle';

export type ButtonTone = 'neutral' | 'warning' | 'error' | 'discovery';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  tone?: ButtonTone;
  isDisabled?: boolean;
  isLoading?: boolean;
  isFullWidth?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}
