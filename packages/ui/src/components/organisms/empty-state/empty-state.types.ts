import type * as React from 'react';

export type EmptyStateType = 'inherited' | 'informative';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The background. `inherited` is transparent, so it takes on the surface beneath it; `informative`
   * fills a sunken panel. Defaults to `inherited`.
   */
  type?: EmptyStateType;
  /**
   * A picture above the heading, such as an Icon Tile or a spot illustration, centered. Empty State
   * doesn't size it; the reference design is about 80px square.
   */
  illustration?: React.ReactNode;
  /** A bold line above the description, centered. It's a styled `div`, not a heading element. */
  heading?: React.ReactNode;
  /** The description, centered. The only required content. */
  children: React.ReactNode;
  /**
   * Actions below the description, centered: usually one Button, two in a Button Group, or a Link.
   */
  actions?: React.ReactNode;
}
