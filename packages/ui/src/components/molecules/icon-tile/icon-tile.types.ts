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
  /** The icon, one only. Any icon from the icon set works: the tile sets its color and its size, two-thirds of the tile. */
  children: React.ReactNode;
  /** The color: `taupe` (neutral), `brand`, or one of eight accent colors. `gray` is the deprecated name for `taupe`. */
  tone?: IconTileTone | DeprecatedIconTileTone;
  /** How strong the color is: `default` is a light tint with a colored icon, `bold` a solid fill with an inverse icon. */
  appearance?: IconTileAppearance;
  /** `square` has rounded corners that scale with the size; `round` is a circle. */
  shape?: IconTileShape;
  /** The tile's width and height: 16, 24, 32, 40, or 48px from `xxs` to `lg`. */
  size?: IconTileSize;
  /** Hides the tile from assistive technology, for a tile beside text that already says what it means. Set it to `false`, with `ariaLabel`, when the tile carries meaning on its own. */
  decorative?: boolean;
  /**
   * The accessible name of a tile that isn't decorative. Ignored while `decorative` is `true`. A tile
   * with `decorative={false}` and no `ariaLabel` warns in development: it would be an unnamed image.
   */
  ariaLabel?: string;
  /** Added to the root element's classes. */
  className?: string;
}
