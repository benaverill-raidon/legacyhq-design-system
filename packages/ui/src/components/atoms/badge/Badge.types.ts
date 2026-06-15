import * as React from 'react';

export type BadgeTone = 'default' | 'inverse' | 'brand' | 'success' | 'error';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  ariaLabel?: string;
  className?: string;
}
