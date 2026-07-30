import type * as React from 'react';

export type IconTileTone =
  | 'gray'
  | 'brand'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'magenta';

export type IconTileAppearance = 'default' | 'bold';
export type IconTileShape = 'square' | 'round';
export type IconTileSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

export interface IconTileProps {
  children: React.ReactNode;
  tone?: IconTileTone;
  appearance?: IconTileAppearance;
  shape?: IconTileShape;
  size?: IconTileSize;
  decorative?: boolean;
  ariaLabel?: string;
  className?: string;
}
