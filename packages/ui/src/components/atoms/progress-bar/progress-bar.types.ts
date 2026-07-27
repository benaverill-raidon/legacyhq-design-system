import type * as React from 'react';

export type ProgressBarVariant = 'linear' | 'circular';
export type ProgressBarSize = 'md' | 'lg';

export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  label?: string;
  getValueText?: (value: number) => string;
}
