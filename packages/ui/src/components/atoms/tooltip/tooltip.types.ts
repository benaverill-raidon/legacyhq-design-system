import type * as React from 'react';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  truncate?: boolean;
  disabled?: boolean;
  delay?: number;
  className?: string;
}
