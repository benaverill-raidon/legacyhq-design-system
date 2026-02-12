import * as React from 'react';

export type ButtonAppearance = 'default' | 'primary' | 'subtle' | 'warning' | 'danger';
export type ButtonSpacing = 'default' | 'compact';

export type ButtonProps = {
  appearance?: ButtonAppearance;
  spacing?: ButtonSpacing;

  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;

  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;

  children?: React.ReactNode;

  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';

  'aria-label'?: string;
  'aria-labelledby'?: string;

  /** Recommended for tests. */
  'data-testid'?: string;
};

export type ButtonOwnerState = {
  appearance: ButtonAppearance;
  spacing: ButtonSpacing;

  selected: boolean;
  disabled: boolean;
  loading: boolean;

  hasIconBefore: boolean;
  hasIconAfter: boolean;
  hasLabel: boolean;

  /** Derived: loading disables interaction. */
  isDisabled: boolean;
};
