import * as React from 'react';
import { ButtonBase } from './ButtonBase';
import type { ButtonProps } from './types';

export const Button = React.memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
    return <ButtonBase ref={ref} {...props} />;
  }),
);

Button.displayName = 'Button';
