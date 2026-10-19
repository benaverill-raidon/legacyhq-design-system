// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPaginationRange } from './pagination-range';
import { Pagination } from './pagination';
import styles from './pagination.module.css';
import toggleButtonStyles from '../../atoms/toggle-button/toggle-button.module.css';

const paginationCss = readFileSync(
  'packages/ui/src/components/molecules/pagination/pagination.module.css',
  'utf8',
).replace(/\r\n/g, '\n');

afterEach(cleanup);

describe('getPaginationRange', () => {
  it('returns every page with no ellipsis when the total page count is small', () => {
    expect(getPaginationRange(2, 5, 1, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it('inserts an ellipsis on both sides when the current page is in the middle of a large range', () => {
    expect(getPaginationRange(10, 20, 1, 1)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
  });

  it('inserts only a trailing ellipsis when the current page is near the start', () => {
    expect(getPaginationRange(1, 20, 1, 1)).toEqual([1, 2, 'ellipsis', 20]);
  });

  it('inserts only a leading ellipsis when the current page is near the end', () => {
    expect(getPaginationRange(20, 20, 1, 1)).toEqual([1, 'ellipsis', 19, 20]);
  });

  it('respects a custom siblingCount', () => {
    expect(getPaginationRange(1, 20, 5, 1)).toEqual([1, 2, 3, 4, 5, 6, 'ellipsis', 20]);
  });

  it('respects a custom boundaryCount', () => {
    expect(getPaginationRange(10, 20, 1, 2)).toEqual([1, 2, 'ellipsis', 9, 10, 11, 'ellipsis', 19, 20]);
  });

  it('returns an empty range when totalPages is 0', () => {
    expect(getPaginationRange(1, 0)).toEqual([]);
  });
});

describe('Pagination', () => {
  it('renders a page button for every page when the range has no ellipsis', () => {
    render(<Pagination currentPage={2} totalPages={4} onPageChange={() => {}} />);

    for (let page = 1; page <= 4; page += 1) {
      expect(screen.getByRole('button', { name: `Page ${page}` })).toBeInTheDocument();
    }
    expect(screen.queryByText('…')).not.toBeInTheDocument();
  });

  it('renders an ellipsis for a collapsed range', () => {
    render(<Pagination currentPage={10} totalPages={20} onPageChange={() => {}} />);

    expect(screen.getAllByText('…')).toHaveLength(2);
  });

  it('calls onPageChange with the clicked page number', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

    screen.getByRole('button', { name: 'Page 2' }).click();

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with currentPage + 1 when next is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    screen.getByRole('button', { name: 'Next page' }).click();

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with currentPage - 1 when previous is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    screen.getByRole('button', { name: 'Previous page' }).click();

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('disables previous on the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('disables next on the last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('marks the current page with aria-current="page"', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 2' })).not.toHaveAttribute('aria-current');
  });

  it('announces the current page once, by aria-current, not as a pressed toggle', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);

    for (let page = 1; page <= 5; page += 1) {
      expect(screen.getByRole('button', { name: `Page ${page}` })).not.toHaveAttribute('aria-pressed');
    }
  });

  it("gives page buttons Toggle Button's small subtle look, selected on the current page", () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);

    expect(toggleButtonStyles.toggleButton).toEqual(expect.any(String));
    expect(toggleButtonStyles.selected).toEqual(expect.any(String));
    const current = screen.getByRole('button', { name: 'Page 3' });
    expect(current).toHaveClass(
      toggleButtonStyles.toggleButton,
      toggleButtonStyles.size_sm,
      toggleButtonStyles.tone_subtle,
      toggleButtonStyles.selected,
    );
    expect(current).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Page 2' })).not.toHaveClass(toggleButtonStyles.selected);
  });

  it('moves focus to the current page when Next reaches the last page and is disabled', () => {
    function Controlled() {
      const [page, setPage] = React.useState(4);
      return <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />;
    }
    render(<Controlled />);

    act(() => screen.getByRole('button', { name: 'Next page' }).focus());
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Page 5' })).toHaveFocus();
  });

  it('moves focus to the current page when Previous reaches the first page and is disabled', () => {
    function Controlled() {
      const [page, setPage] = React.useState(2);
      return <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />;
    }
    render(<Controlled />);

    act(() => screen.getByRole('button', { name: 'Previous page' }).focus());
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveFocus();
  });

  it('keeps focus on Next while it stays enabled', () => {
    function Controlled() {
      const [page, setPage] = React.useState(2);
      return <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />;
    }
    render(<Controlled />);

    act(() => screen.getByRole('button', { name: 'Next page' }).focus());
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(screen.getByRole('button', { name: 'Next page' })).toHaveFocus();
  });

  it('clamps currentPage to 1 through totalPages', () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<Pagination currentPage={9} totalPages={5} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    screen.getByRole('button', { name: 'Previous page' }).click();
    expect(onPageChange).toHaveBeenCalledWith(4);

    rerender(<Pagination currentPage={0} totalPages={5} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    rerender(<Pagination currentPage={2.7} totalPages={5} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  });

  it('disables both arrows with no pages', () => {
    render(<Pagination currentPage={3} totalPages={0} onPageChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /^Page/ })).not.toBeInTheDocument();
  });

  it('labels the nav "Pagination" by default', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('supports custom aria-label, previousLabel, and nextLabel', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        aria-label="Search results pages"
        previousLabel="Previous results"
        nextLabel="Next results"
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Search results pages' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous results' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next results' })).toBeInTheDocument();
  });

  it('still accepts the deprecated ariaLabel', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} ariaLabel="Results pages" />);

    expect(screen.getByRole('navigation', { name: 'Results pages' })).toBeInTheDocument();
  });

  it('names the nav by aria-labelledby instead of the default label', () => {
    render(
      <>
        <h2 id="results-heading">Results</h2>
        <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} aria-labelledby="results-heading" />
      </>,
    );

    expect(screen.getByRole('navigation', { name: 'Results' })).not.toHaveAttribute('aria-label');
  });

  it('forwards other attributes and the ref to the root nav', () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Pagination ref={ref} currentPage={1} totalPages={5} onPageChange={() => {}} data-testid="pager" id="pager" />,
    );

    const nav = screen.getByTestId('pager');
    expect(nav.tagName).toBe('NAV');
    expect(nav).toHaveAttribute('id', 'pager');
    expect(ref.current).toBe(nav);
  });

  it('applies className to the root nav', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} className="custom-pagination" />);

    expect(screen.getByRole('navigation')).toHaveClass('custom-pagination');
  });

  it('forces page buttons to a fixed square size regardless of digit count', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveClass(styles.page);
    expect(paginationCss).toContain('.page {\n  inline-size: var(--size-control-sm);\n}');
  });
});
