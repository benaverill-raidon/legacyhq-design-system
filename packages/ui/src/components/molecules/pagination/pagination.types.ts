import type * as React from 'react';

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** The current page, counted from 1. Rounded down and clamped to `1` through `totalPages`. */
  currentPage: number;
  /**
   * How many pages there are, rounded down. With `0` or fewer, only the previous and next buttons
   * render, both disabled.
   */
  totalPages: number;
  /**
   * Called with the page someone chose: a page number, or the page before or after the current one.
   * Pagination is controlled, so update `currentPage` in response.
   */
  onPageChange: (page: number) => void;
  /** How many pages to show on each side of the current page. */
  siblingCount?: number;
  /** How many pages to always show at the start and at the end. */
  boundaryCount?: number;
  /** The previous button's accessible name and tooltip. */
  previousLabel?: string;
  /** The next button's accessible name and tooltip. */
  nextLabel?: string;
  /** Builds each page button's accessible name from its number. Defaults to "Page 3". */
  getPageLabel?: (page: number) => string;
  /** The `nav` landmark's accessible name. Defaults to "Pagination". Ignored when `aria-labelledby` is set. */
  'aria-label'?: string;
  /** Names the `nav` by the id of a visible heading. When set, no `aria-label` is rendered. */
  'aria-labelledby'?: string;
  /** @deprecated Use the native `aria-label`, as Tabs and Progress Tracker do. Still accepted. */
  ariaLabel?: string;
  /** Added to the root `nav`'s classes. */
  className?: string;
}

export type PaginationRangeItem = number | 'ellipsis';
