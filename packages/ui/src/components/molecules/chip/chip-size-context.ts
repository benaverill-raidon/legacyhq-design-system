import * as React from 'react';
import type { ChipSize } from './chip.types';

/**
 * Lets Chip Group set one size for every Chip inside it without cloning children.
 *
 * Context rather than `React.cloneElement` deliberately: cloning only reaches *direct* children, so
 * a Chip wrapped in a Tooltip, returned from a `.map`, or rendered conditionally would silently miss
 * the size - the same structural fragility that detached Chip's own remove button from its pill.
 * Context reaches any descendant regardless of what sits between.
 *
 * `undefined` means "no group above me", which is what lets Chip resolve
 * `size ?? groupSize ?? 'md'` and keep an explicit per-chip `size` winning over the group's.
 */
export const ChipSizeContext = React.createContext<ChipSize | undefined>(undefined);

export function useChipSize(explicitSize: ChipSize | undefined): ChipSize {
  const groupSize = React.useContext(ChipSizeContext);
  return explicitSize ?? groupSize ?? 'md';
}
