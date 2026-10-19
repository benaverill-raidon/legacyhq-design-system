import type * as React from 'react';

export interface KeyValueListProps {
  /** The rows: Key Value Pairs, or other `dt` and `dd` groups. */
  children: React.ReactNode;
  /** Added to the `dl` element's classes. */
  className?: string;
}
