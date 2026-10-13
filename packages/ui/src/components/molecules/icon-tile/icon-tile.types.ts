import type * as React from 'react';

export type IconTileTone =
  | 'taupe'
  | 'brand'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'magenta';

/** @deprecated Use `taupe`, the palette's name and Figma's. Still accepted. */
export type DeprecatedIconTileTone = 'gray';

export type IconTileAppearance = 'default' | 'bold';
export type IconTileShape = 'square' | 'round';
export type IconTileSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

export interface IconTileProps {
  children: React.ReactNode;
  tone?: IconTileTone | DeprecatedIconTileTone;
  appearance?: IconTileAppearance;
  shape?: IconTileShape;
  size?: IconTileSize;
  decorative?: boolean;
  ariaLabel?: string;
  className?: string;
}
