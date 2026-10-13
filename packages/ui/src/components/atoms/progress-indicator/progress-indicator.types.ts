import type * as React from 'react';

export type ProgressIndicatorAppearance =
  | 'default'
  | 'primary'
  | 'inverse';
/** @deprecated Use `inverse`, the name every other component uses for light-on-dark. Still accepted. */
export type DeprecatedProgressIndicatorAppearance = 'inverted';

export type ProgressIndicatorSize = 'sm' | 'md';

export interface ProgressIndicatorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  currentStep: number;
  totalSteps: number;
  appearance?: ProgressIndicatorAppearance | DeprecatedProgressIndicatorAppearance;
  size?: ProgressIndicatorSize;
  label?: string;
  getValueText?: (currentStep: number, totalSteps: number) => string;
  onStepChange?: (step: number) => void;
}
