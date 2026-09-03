import type * as React from 'react';

export type EmptyStateType = 'inherited' | 'informative';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Background treatment. `inherited` (default) is transparent and blends into the surface beneath
   * it; `informative` fills a sunken surface panel.
   */
  type?: EmptyStateType;
  /** Optional illustration or image, centered above the heading (~80x80 in the reference design). */
  illustration?: React.ReactNode;
  /** Optional heading, centered above the description. */
  heading?: React.ReactNode;
  /** The description. */
  children: React.ReactNode;
  /** Optional actions - typically Buttons and/or a Link, centered below the description. */
  actions?: React.ReactNode;
}
