import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './pagination';

const meta = {
  title: 'UI/Molecules/Pagination',
  component: Pagination,
  args: {
    currentPage: 1,
    totalPages: 20,
    siblingCount: 1,
    boundaryCount: 1,
    onPageChange: () => {},
  },
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
    siblingCount: { control: { type: 'number', min: 0 } },
    boundaryCount: { control: { type: 'number', min: 0 } },
    onPageChange: { control: false },
    previousLabel: { control: 'text' },
    nextLabel: { control: 'text' },
    getPageLabel: { control: false },
    ariaLabel: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      {children}
    </section>
  );
}

function ControlledPagination(props: {
  totalPages: number;
  initialPage?: number;
  siblingCount?: number;
  boundaryCount?: number;
}) {
  const [page, setPage] = React.useState(props.initialPage ?? 1);

  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'start' }}>
      <Pagination
        currentPage={page}
        totalPages={props.totalPages}
        siblingCount={props.siblingCount}
        boundaryCount={props.boundaryCount}
        onPageChange={setPage}
      />
      <span style={captionStyle}>
        Page {page} of {props.totalPages}
      </span>
    </div>
  );
}

/** Prop exploration - a controlled wrapper holds currentPage in state so the controls are live. */
export const Playground: Story = {
  render: (args) => <ControlledPagination totalPages={args.totalPages} initialPage={args.currentPage} />,
};

/** How the page range changes shape depending on where the current page sits. */
export const Composition: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Small page count (no ellipsis)">
        <ControlledPagination totalPages={5} initialPage={2} />
      </Group>

      <Group title="Middle of a large range (ellipsis on both sides)">
        <ControlledPagination totalPages={20} initialPage={10} />
      </Group>

      <Group title="Near the start (trailing ellipsis only)">
        <ControlledPagination totalPages={20} initialPage={1} />
      </Group>

      <Group title="Near the end (leading ellipsis only)">
        <ControlledPagination totalPages={20} initialPage={20} />
      </Group>

      <Group title="Wider sibling range">
        <ControlledPagination totalPages={20} initialPage={1} siblingCount={5} />
      </Group>
    </div>
  ),
};
