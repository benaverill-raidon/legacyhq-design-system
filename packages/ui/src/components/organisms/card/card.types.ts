import type * as React from 'react';

export type CardSurface = 'raised' | 'default' | 'sunken' | 'deep' | 'none';
export type CardBorderRadius = 'lg' | 'xl' | 'xxl';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The background: `raised`, `default`, `sunken`, and `deep` are elevation surface colors, and `none` is transparent. `raised` adds no shadow. */
  surface?: CardSurface;
  /** Shows the 1px default border. `false` removes its width as well as its color. */
  border?: boolean;
  /** The corner radius: `lg` (8px), `xl` (12px), or `xxl` (16px). Content is clipped to it. */
  borderRadius?: CardBorderRadius;
  /** The content, rendered directly inside the card with no wrapper. It owns its padding, layout, semantics, and interactions. */
  children?: React.ReactNode;
}
