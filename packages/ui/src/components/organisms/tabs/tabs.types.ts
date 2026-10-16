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
  /**
   * The visual style: `line` underlines the selected tab, and `contained` fills it as a pill inside
   * a raised container.
   */
  type?: TabsType;
  /** The tabs, in order: each one's `value`, `label`, and whether it's `disabled`. */
  tabs: TabItem[];
  /** The selected tab's `value`, to control the selection. Update it from `onValueChange`. */
  value?: string;
  /** The tab selected first, when Tabs manages the selection. Defaults to the first enabled tab. */
  defaultValue?: string;
  /** Called with a tab's `value` when it's clicked or reached with the arrow keys, Home, or End. */
  onValueChange?: (value: string) => void;
  /**
   * Shows the border: the line under the tab list for `line`, the container's border for
   * `contained`. On by default for both.
   */
  showBorder?: boolean;
  /** The tab list's accessible name. Set it or `aria-labelledby`. */
  'aria-label'?: string;
  /** Names the tab list by the id of a visible heading, instead of `aria-label`. */
  'aria-labelledby'?: string;
  /** The panels: a `TabPanel` for each tab `value`. Optional, so the tab bar can be used alone. */
  children?: React.ReactNode;
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The `value` of the tab this panel belongs to. */
  value: string;
  /** The panel's content, rendered only while its tab is selected. */
  children: React.ReactNode;
}
