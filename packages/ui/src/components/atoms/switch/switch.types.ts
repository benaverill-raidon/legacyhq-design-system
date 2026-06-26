import type * as React from 'react';

export type SwitchSize = 'sm' | 'md';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'size' | 'onChange'> {
  label?: React.ReactNode;
  size?: SwitchSize;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
  onCheckedChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

