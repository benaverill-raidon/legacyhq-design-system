import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckIcon, SearchIcon } from '../../../assets/icons';
import { Button } from '../../atoms/button';
import { ButtonGroup } from '../../molecules/button-group';
import { Link } from '../../atoms/link';
import { EmptyState } from './empty-state';
import type { EmptyStateType } from './empty-state.types';

const types: EmptyStateType[] = ['inherited', 'informative'];

const meta = {
  title: 'UI/Organisms/Empty State',
  component: EmptyState,
  args: {
    type: 'inherited',
    heading: "You're all caught up!",
    children: 'No more recent activity in the past 24 hours.',
  },
  argTypes: {
    type: { control: 'inline-radio', options: types },
    heading: { control: 'text' },
    children: { control: 'text' },
    illustration: { control: false },
    actions: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

/* Empty states live on a surface; rendering the demos on the default elevation surface lets the
   transparent `inherited` type read correctly and shows the `informative` sunken panel against it. */
const stack: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-2xl)',
  maxInlineSize: '520px',
  padding: 'var(--spacing-xl)',
  borderRadius: 'var(--border-radius-lg)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
};

/** An ~80x80 decorative placeholder standing in for a real illustration or spot image. */
const illustrationStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  inlineSize: '80px',
  blockSize: '80px',
  borderRadius: 'var(--border-radius-xl)',
  background: 'var(--color-background-accent-magenta-subtle-default)',
  color: 'var(--color-content-accent-magenta-default)',
};

function Illustration({ children }: { children: ReactNode }) {
  return <span style={illustrationStyle}>{children}</span>;
}

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
      <span
        style={{
          font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
          color: 'var(--color-content-subtle)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {
  args: {
    illustration: (
      <Illustration>
        <CheckIcon />
      </Illustration>
    ),
    actions: <Button appearance="subtle">View all activity</Button>,
  },
};

/** `inherited` blends into the surface beneath; `informative` fills a sunken surface panel. */
export const Types: Story = {
  render: () => (
    <div style={stack}>
      {types.map((type) => (
        <Labelled key={type} label={type}>
          <EmptyState
            type={type}
            illustration={
              <Illustration>
                <CheckIcon />
              </Illustration>
            }
            heading="You're all caught up!"
            actions={<Button appearance="subtle">View all activity</Button>}
          >
            No more recent activity in the past 24 hours.
          </EmptyState>
        </Labelled>
      ))}
    </div>
  ),
};

/** The illustration, heading, and actions are all optional; the description is the only required part. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="Full: illustration + heading + description + actions">
        <EmptyState
          type="informative"
          illustration={
            <Illustration>
              <SearchIcon />
            </Illustration>
          }
          heading="No results found"
          actions={
            <ButtonGroup>
              <Button appearance="subtle">Clear filters</Button>
              <Button appearance="primary">New search</Button>
            </ButtonGroup>
          }
        >
          Try adjusting your search or filters to find what you&apos;re looking for.
        </EmptyState>
      </Labelled>

      <Labelled label="No illustration">
        <EmptyState heading="You're all caught up!" actions={<Link href="#activity">View all activity</Link>}>
          No more recent activity in the past 24 hours.
        </EmptyState>
      </Labelled>

      <Labelled label="Description only">
        <EmptyState>Nothing here yet.</EmptyState>
      </Labelled>

      <Labelled label="No actions">
        <EmptyState
          illustration={
            <Illustration>
              <CheckIcon />
            </Illustration>
          }
          heading="Your inbox is empty"
        >
          New messages will appear here.
        </EmptyState>
      </Labelled>
    </div>
  ),
};

/** Difficult cases made reproducible: long wrapping content and a constrained container. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="Long heading and description wrap and stay centered">
        <EmptyState
          type="informative"
          illustration={
            <Illustration>
              <SearchIcon />
            </Illustration>
          }
          heading="We couldn't find any matters that match every one of the filters you've applied"
          actions={<Button appearance="primary">Reset all filters</Button>}
        >
          Matters are only shown here once they match all of the active filters at the same time. Try
          removing a filter or two to widen the results.
        </EmptyState>
      </Labelled>

      <Labelled label="Narrow container">
        <div style={{ inlineSize: '280px', border: 'var(--border-width-sm) dashed var(--color-border-default)' }}>
          <EmptyState heading="No files" actions={<Button appearance="primary">Upload</Button>}>
            Drag files here to get started.
          </EmptyState>
        </div>
      </Labelled>
    </div>
  ),
};
