import type * as React from 'react';

export type TextFieldSize = 'sm' | 'md' | 'lg';
export type TextFieldAppearance = 'default' | 'subtle';

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: TextFieldSize;
  appearance?: TextFieldAppearance;
  invalid?: boolean;
  /** Icon or short text only (e.g. a currency prefix). Always decorative/non-interactive. */
  iconBefore?: React.ReactNode;
  /** An icon, or an interactive control such as an IconButton (clear action) or Button. */
  iconAfter?: React.ReactNode;
  className?: string;
  inputClassName?: string;
}
