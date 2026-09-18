import type * as React from 'react';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonProminence = 'primary' | 'secondary' | 'tertiary';

export type ButtonTone = 'default' | 'brand' | 'warning' | 'error';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  prominence?: ButtonProminence;
  tone?: ButtonTone;
  isInverse?: boolean;
  isLoading?: boolean;
  isFullWidth?: boolean;
  isExpanded?: boolean;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
}

// Kept for sibling button-type components pending their Figma revision.
export type ButtonAppearance = 'default' | 'primary' | 'subtle';
