export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  previousLabel?: string;
  nextLabel?: string;
  getPageLabel?: (page: number) => string;
  ariaLabel?: string;
  className?: string;
}

export type PaginationRangeItem = number | 'ellipsis';
