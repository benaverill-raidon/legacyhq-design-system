import type * as React from 'react';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonAppearance = 'default' | 'primary' | 'subtle';

export type ButtonTone = 'neutral' | 'warning' | 'error';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  appearance?: ButtonAppearance;
  tone?: ButtonTone;
  isLoading?: boolean;
  isFullWidth?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}
