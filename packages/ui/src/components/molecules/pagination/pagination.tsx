import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons';
import { IconButton } from '../../atoms/icon-button';
import toggleButtonStyles from '../../atoms/toggle-button/toggle-button.module.css';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { getPaginationRange } from './pagination-range';
import styles from './pagination.module.css';
import type { PaginationProps } from './pagination.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function defaultGetPageLabel(page: number) {
  return `Page ${page}`;
}

function normalizeTotalPages(totalPages: number) {
  return Number.isFinite(totalPages) ? Math.max(0, Math.trunc(totalPages)) : 0;
}

/** Rounds `currentPage` down and keeps it between 1 and `totalPages` (1 when there are no pages). */
function clampPage(currentPage: number, totalPages: number) {
  if (!Number.isFinite(currentPage)) {
    return 1;
  }

  return Math.max(1, Math.min(totalPages, Math.trunc(currentPage)));
}

/**
 * A page number. It takes Toggle Button's look (its own stylesheet, so the visual states aren't
 * reimplemented here) but not its semantics: Toggle Button always sets `aria-pressed`, and a page is
 * a position, not an on/off option, so the current page is announced once, by `aria-current="page"`.
 */
function PageButton({
  page,
  isCurrent,
  label,
  onSelect,
}: {
  page: number;
  isCurrent: boolean;
  label: string;
  onSelect: (page: number) => void;
}) {
  return (
    <button
      type="button"
      className={mergeClassNames(
        toggleButtonStyles.toggleButton,
        toggleButtonStyles.size_sm,
        toggleButtonStyles.tone_subtle,
        isCurrent && toggleButtonStyles.selected,
        focusRingClassNames.focusRing,
        focusRingClassNames.focusRingDefault,
        styles.page,
      )}
      aria-current={isCurrent ? 'page' : undefined}
      aria-label={label}
      data-current={isCurrent ? 'true' : undefined}
      onClick={() => onSelect(page)}
    >
      <span className={toggleButtonStyles.content}>{page}</span>
    </button>
  );
}

export const Pagination = React.memo(
  React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
    {
      currentPage: requestedPage,
      totalPages: requestedTotalPages,
      onPageChange,
      siblingCount = 1,
      boundaryCount = 1,
      previousLabel = 'Previous page',
      nextLabel = 'Next page',
      getPageLabel = defaultGetPageLabel,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ariaLabel: deprecatedAriaLabel,
      className,
      ...rest
    },
    forwardedRef,
  ) {
    const totalPages = normalizeTotalPages(requestedTotalPages);
    const currentPage = clampPage(requestedPage, totalPages);
    const range = getPaginationRange(currentPage, totalPages, siblingCount, boundaryCount);
    // `ariaLabel` is the deprecated name for the native `aria-label`.
    const label = ariaLabel ?? deprecatedAriaLabel ?? 'Pagination';

    const navRef = React.useRef<HTMLElement | null>(null);
    const setNavRef = React.useCallback(
      (node: HTMLElement | null) => {
        navRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef],
    );
    // Which of Previous or Next had focus when it was activated. Reaching the first or last page
    // disables that button, which drops focus, so focus moves to the current page instead.
    const focusedNavigatorRef = React.useRef<'previous' | 'next' | null>(null);

    const handleNavigatorClick = (
      event: React.MouseEvent<HTMLButtonElement>,
      navigator: 'previous' | 'next',
      page: number,
    ) => {
      focusedNavigatorRef.current = event.currentTarget === document.activeElement ? navigator : null;
      onPageChange(page);
    };

    React.useLayoutEffect(() => {
      const navigator = focusedNavigatorRef.current;
      focusedNavigatorRef.current = null;
      const navigatorDisabled =
        (navigator === 'previous' && currentPage <= 1) || (navigator === 'next' && currentPage >= totalPages);

      if (navigatorDisabled) {
        navRef.current?.querySelector<HTMLButtonElement>('[aria-current="page"]')?.focus();
      }
    }, [currentPage, totalPages]);

    return (
      <nav
        {...rest}
        ref={setNavRef}
        aria-label={ariaLabelledBy ? undefined : label}
        aria-labelledby={ariaLabelledBy}
        className={mergeClassNames(styles.root, className)}
      >
        <ol className={styles.list}>
          <li className={styles.item}>
            <IconButton
              appearance="subtle"
              size="sm"
              shape="square"
              aria-label={previousLabel}
              disabled={currentPage <= 1}
              onClick={(event) => handleNavigatorClick(event, 'previous', currentPage - 1)}
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
                <PageButton
                  page={item}
                  isCurrent={item === currentPage}
                  label={getPageLabel(item)}
                  onSelect={onPageChange}
                />
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
              onClick={(event) => handleNavigatorClick(event, 'next', currentPage + 1)}
            >
              <ChevronRightIcon />
            </IconButton>
          </li>
        </ol>
      </nav>
    );
  }),
);

Pagination.displayName = 'Pagination';
