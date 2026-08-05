// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPaginationRange } from './pagination-range';
import { Pagination } from './pagination';

const paginationCss = readFileSync(
  'packages/ui/src/components/molecules/pagination/pagination.module.css',
  'utf8',
);

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

  it('labels the nav "Pagination" by default', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('supports custom ariaLabel, previousLabel, and nextLabel', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={() => {}}
        ariaLabel="Search results pages"
        previousLabel="Previous results"
        nextLabel="Next results"
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Search results pages' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous results' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next results' })).toBeInTheDocument();
  });

  it('applies className to the root nav', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} className="custom-pagination" />);

    expect(screen.getByRole('navigation')).toHaveClass('custom-pagination');
  });

  it('forces page buttons to a fixed square size regardless of digit count', () => {
    expect(paginationCss).toContain('.item :global([data-selected]) {\n  inline-size: var(--size-control-sm);\n}');
  });
});
