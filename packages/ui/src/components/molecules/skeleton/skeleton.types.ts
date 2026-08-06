import type * as React from 'react';

export type SkeletonAppearance = 'default' | 'subtle';
export type SkeletonShape = 'rectangle' | 'circle';

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  appearance?: SkeletonAppearance;
  shape?: SkeletonShape;
  label?: string;
}
