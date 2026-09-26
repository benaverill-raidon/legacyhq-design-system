import type * as React from 'react';

export type CardSurface = 'raised' | 'default' | 'sunken' | 'deep' | 'none';
export type CardBorderRadius = 'lg' | 'xl' | 'xxl';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Surface color. Raised adds no shadow; none is transparent. */
  surface?: CardSurface;
  /** Show the 1px default border. False removes its width as well as its paint. Defaults to true. */
  border?: boolean;
  /** Semantic corner radius: lg (8px), xl (12px), or xxl (16px). */
  borderRadius?: CardBorderRadius;
  /** Unrestricted content slot. Content owns its padding, layout, semantics, and interactions. */
  children?: React.ReactNode;
}
