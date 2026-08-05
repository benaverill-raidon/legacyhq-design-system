import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons';
import { IconButton } from '../../atoms/icon-button';
import { ToggleButton } from '../../atoms/toggle-button';
import { getPaginationRange } from './pagination-range';
import styles from './pagination.module.css';
import type { PaginationProps } from './pagination.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function defaultGetPageLabel(page: number) {
  return `Page ${page}`;
}

export const Pagination = React.memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  getPageLabel = defaultGetPageLabel,
  ariaLabel = 'Pagination',
  className,
}: PaginationProps) {
  const range = getPaginationRange(currentPage, totalPages, siblingCount, boundaryCount);

  return (
    <nav aria-label={ariaLabel} className={mergeClassNames(styles.root, className)}>
      <ol className={styles.list}>
        <li className={styles.item}>
          <IconButton
            appearance="subtle"
            size="sm"
            shape="square"
            aria-label={previousLabel}
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeftIcon />
          </IconButton>
        </li>

        {range.map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} className={styles.item}>
              <span className={styles.ellipsis} aria-hidden="true">
                &hellip;
              </span>
            </li>
          ) : (
            <li key={item} className={styles.item}>
              <ToggleButton
                size="sm"
                tone="subtle"
                isSelected={item === currentPage}
                aria-current={item === currentPage ? 'page' : undefined}
                aria-label={getPageLabel(item)}
                onClick={() => onPageChange(item)}
              >
                {item}
              </ToggleButton>
            </li>
          ),
        )}

        <li className={styles.item}>
          <IconButton
            appearance="subtle"
            size="sm"
            shape="square"
            aria-label={nextLabel}
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRightIcon />
          </IconButton>
        </li>
      </ol>
    </nav>
  );
});

Pagination.displayName = 'Pagination';
