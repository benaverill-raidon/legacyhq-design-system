import * as React from 'react';

export type FocusRingBorderWidth = 'default' | 'compact';

export interface FocusRingProps {
  children: React.ReactElement;
  borderWidth?: FocusRingBorderWidth;
  className?: string;
  disabled?: boolean;
}
