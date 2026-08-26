import type * as React from 'react';
import type { ChipSize } from '../chip';

/**
 * Where the row sits along its own inline axis - Figma's `alignment` axis, which measures
 * `primaryAxisAlignItems: MIN` / `MAX`.
 *
 * Note this is genuinely different from Tag Group's identically-named prop: there, `alignment`
 * decides where the *overflow tag* renders. Chip Group has no overflow, so here it means what it
 * looks like - which edge the chips pack against.
 */
export type ChipGroupAlignment = 'left' | 'right';

export interface ChipGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The Chips in this group. Any element is accepted, but Chip is what the layout is built for. */
  children: React.ReactNode;
  /**
   * Applied to every Chip inside, via context rather than by cloning children - so a Chip still
   * inherits it through a Tooltip, a `.map`, or a conditional. An explicit `size` on an individual
   * Chip wins. Omit to leave each Chip on its own default.
   */
  size?: ChipSize;
  /** Which edge the chips pack against. Defaults to `left`. */
  alignment?: ChipGroupAlignment;
}
