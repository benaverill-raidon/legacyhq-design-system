import type * as React from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  truncate?: boolean;
  disabled?: boolean;
  delay?: number;
  className?: string;
}
