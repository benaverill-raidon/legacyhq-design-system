import type * as React from 'react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  label?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  onCheckedChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export interface CheckboxGroupOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}

export interface CheckboxGroupProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  name?: string;
  value?: string[];
  defaultValue?: string[];
  options?: CheckboxGroupOption[];
  children?: React.ReactNode;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  onValueChange?: (value: string[], event: React.ChangeEvent<HTMLInputElement>) => void;
}
