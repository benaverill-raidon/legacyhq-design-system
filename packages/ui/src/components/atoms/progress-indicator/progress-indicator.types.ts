import type * as React from 'react';

export type ProgressIndicatorAppearance =
  | 'default'
  | 'primary'
  | 'discovery'
  | 'inverted';

export type ProgressIndicatorSize = 'sm' | 'md';

export interface ProgressIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  currentStep: number;
  totalSteps: number;
  appearance?: ProgressIndicatorAppearance;
  size?: ProgressIndicatorSize;
  label?: string;
  getValueText?: (currentStep: number, totalSteps: number) => string;
  onStepChange?: (step: number) => void;
}
