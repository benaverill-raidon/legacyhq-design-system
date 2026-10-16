export interface PaginationProps {
  /** The current page, counted from 1. Keep it between `1` and `totalPages`; it isn't clamped. */
  currentPage: number;
  /** How many pages there are. With `0` or fewer, only the previous and next buttons render. */
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
  /** The `nav` landmark's accessible name. Defaults to "Pagination". */
  ariaLabel?: string;
  /** Added to the root `nav`'s classes. */
  className?: string;
}

export type PaginationRangeItem = number | 'ellipsis';
