import type * as React from 'react';

export type ToggleIconButtonTone = 'default' | 'subtle';

export type ToggleIconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ToggleIconButtonShape = 'square' | 'round';

export interface ToggleIconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'> {
  size?: ToggleIconButtonSize;
  tone?: ToggleIconButtonTone;
  shape?: ToggleIconButtonShape;
  isSelected?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
}
