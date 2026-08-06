import type { PaginationRangeItem } from './pagination.types';

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
  boundaryCount = 1,
): PaginationRangeItem[] {
  if (totalPages <= 0) {
    return [];
  }

  const pages = new Set<number>();

  for (let page = 1; page <= Math.min(boundaryCount, totalPages); page += 1) {
    pages.add(page);
  }

  for (let page = Math.max(totalPages - boundaryCount + 1, 1); page <= totalPages; page += 1) {
    pages.add(page);
  }

  for (let page = currentPage - siblingCount; page <= currentPage + siblingCount; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const range: PaginationRangeItem[] = [];
  let previousPage: number | null = null;

  for (const page of sorted) {
    if (previousPage !== null) {
      const gap = page - previousPage;

      // A gap of exactly one hidden page costs the same width as an ellipsis but is more
      // informative, so show the page itself instead of collapsing it.
      if (gap === 2) {
        range.push(previousPage + 1);
      } else if (gap > 2) {
        range.push('ellipsis');
      }
    }

    range.push(page);
    previousPage = page;
  }

  return range;
}
