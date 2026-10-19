import type * as React from 'react';

export type SkeletonAppearance = 'default' | 'subtle';
export type SkeletonShape = 'rectangle' | 'round';
/** @deprecated Use `round`, the shape name Icon Button and Icon Tile use. Still accepted. */
export type DeprecatedSkeletonShape = 'circle';

export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * How visible the fill is. `subtle` is lighter, for dense layouts with real content nearby;
   * `default` is stronger, for a loading state that fills the screen.
   */
  appearance?: SkeletonAppearance;
  /**
   * `rectangle` has small rounded corners, for text lines, cards, and images. `round` is fully
   * rounded, for an avatar: give it an equal width and height. `circle`, the earlier name for
   * `round`, is still accepted.
   */
  shape?: SkeletonShape | DeprecatedSkeletonShape;
  /**
   * Text announced to assistive technology, rendered visually hidden. Setting it gives the skeleton
   * `role="status"` and `aria-live="polite"`; without it the skeleton is `aria-hidden`.
   */
  label?: string;
}
