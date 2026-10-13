import type * as React from 'react';

export type SkeletonAppearance = 'default' | 'subtle';
export type SkeletonShape = 'rectangle' | 'round';
/** @deprecated Use `round`, the shape name Icon Button and Icon Tile use. Still accepted. */
export type DeprecatedSkeletonShape = 'circle';

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  appearance?: SkeletonAppearance;
  shape?: SkeletonShape | DeprecatedSkeletonShape;
  label?: string;
}
