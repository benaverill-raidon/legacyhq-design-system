import type * as React from 'react';

export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderSize = 'xs' | 'sm' | 'md';

export interface SliderBaseProps {
  label?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  orientation?: SliderOrientation;
  size?: SliderSize;
  disabled?: boolean;
  showSteps?: boolean;
  steps?: number[];
  showValue?: boolean;
  className?: string;
}

export interface SliderProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'disabled' | 'min' | 'max' | 'step'
    >,
    SliderBaseProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface SliderCenteredProps extends SliderProps {}

export interface SliderRangeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'>,
    Omit<SliderBaseProps, 'steps'> {
  value?: [number, number];
  defaultValue?: [number, number];
  minDistance?: number;
  disableSwap?: boolean;
  minLabel?: string;
  maxLabel?: string;
  steps?: number[];
  name?: string;
  onValueChange?: (value: [number, number], event: React.ChangeEvent<HTMLInputElement>) => void;
}
