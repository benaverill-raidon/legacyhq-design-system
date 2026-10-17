import type * as React from 'react';

export type EmptyStateAppearance = 'inherited' | 'informative';
/** @deprecated Renamed to `EmptyStateAppearance`. */
export type EmptyStateType = EmptyStateAppearance;
export type EmptyStateHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The background. `inherited` is transparent, so it takes on the surface beneath it; `informative`
   * fills a sunken panel. Defaults to `inherited`. Figma names this property `type`.
   */
  appearance?: EmptyStateAppearance;
  /** @deprecated Renamed to `appearance`, the name every component uses for visual style. Still accepted. */
  type?: EmptyStateAppearance;
  /**
   * A picture above the heading, such as an Icon Tile or a spot illustration, centered. Empty State
   * doesn't size it; the reference design is about 80px square.
   */
  illustration?: React.ReactNode;
  /** A bold line above the description, centered. Rendered as a real heading, at `headingLevel`. */
  heading?: React.ReactNode;
  /**
   * The heading's level: `2` renders an `h2`. Choose the level that fits the page's outline, usually
   * one below the heading of the section the Empty State sits in. It doesn't change how the heading
   * looks. Defaults to `2`.
   */
  headingLevel?: EmptyStateHeadingLevel;
  /** The description, centered. The only required content. */
  children: React.ReactNode;
  /**
   * Actions below the description, centered: usually one Button, two in a Button Group, or a Link.
   */
  actions?: React.ReactNode;
}
