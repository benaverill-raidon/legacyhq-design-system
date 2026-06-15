import type * as React from 'react';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'checked' | 'defaultChecked'> {
  label?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  onCheckedChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface RadioGroupOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}

export interface RadioGroupProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  options?: RadioGroupOption[];
  children?: React.ReactNode;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  onValueChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}
