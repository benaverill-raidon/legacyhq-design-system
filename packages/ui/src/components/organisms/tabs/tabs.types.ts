import type * as React from 'react';

export type TabsType = 'line' | 'contained';

export interface TabItem {
  /** Stable identifier for the tab and its panel. */
  value: string;
  /** The tab label. */
  label: React.ReactNode;
  /** Disables the tab (not selectable, skipped by keyboard navigation). */
  disabled?: boolean;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Visual style: `line` (underline indicator) or `contained` (pill). Defaults to `line`. */
  type?: TabsType;
  /** The tabs to render, in order. */
  tabs: TabItem[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value for uncontrolled usage. Defaults to the first enabled tab. */
  defaultValue?: string;
  /** Called with the next value when the selection changes. */
  onValueChange?: (value: string) => void;
  /** Whether to show the bottom border under the tab list. Defaults to true for `line`, false for `contained`. */
  showBorder?: boolean;
  /** Accessible label for the tab list (or use `aria-labelledby`). */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** Panels - typically `TabPanel` elements, one per tab value. */
  children?: React.ReactNode;
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The tab value this panel belongs to. */
  value: string;
  children: React.ReactNode;
}
