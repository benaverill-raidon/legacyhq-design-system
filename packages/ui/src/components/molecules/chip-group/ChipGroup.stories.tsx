import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarIcon, SearchIcon, TaskNotStartedIcon } from '../../../assets/icons';
import { Avatar } from '../../atoms/avatar';
import type { MenuSection } from '../../organisms/menu';
import { Chip } from '../chip';
import { ChipGroup } from './chip-group';
import type { ChipGroupAlignment } from './chip-group.types';

const ALIGNMENTS: ChipGroupAlignment[] = ['left', 'right'];

function statusSections(): MenuSection[] {
  return [
    {
      id: 'statuses',
      items: [
        { id: 'not-started', label: 'Not started' },
        { id: 'in-progress', label: 'In progress' },
        { id: 'complete', label: 'Complete' },
      ],
    },
  ];
}

function operatorSections(): MenuSection[] {
  return [
    {
      id: 'operators',
      items: [
        { id: 'on', label: 'on' },
        { id: 'before', label: 'before' },
        { id: 'after', label: 'after' },
      ],
    },
  ];
}

const meta = {
  title: 'UI/Molecules/Chip Group',
  component: ChipGroup,
  args: {
    size: 'md',
    alignment: 'left',
    children: (
      <>
        <Chip mode="search" label="Matters" elemBefore={<SearchIcon decorative />} isSelected />
        <Chip mode="search" label="Documents" elemBefore={<SearchIcon decorative />} />
        <Chip mode="search" label="People" elemBefore={<SearchIcon decorative />} />
        <Chip mode="search" label="Tasks" elemBefore={<SearchIcon decorative />} />
      </>
    ),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    alignment: { control: 'inline-radio', options: ALIGNMENTS },
    children: { control: false },
  },
} satisfies Meta<typeof ChipGroup>;

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

const boundedStyle: CSSProperties = {
  inlineSize: '420px',
  padding: 'var(--spacing-md)',
  border: 'var(--border-width-sm) dashed var(--color-border-default)',
  borderRadius: 'var(--border-radius-lg)',
};

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      {description ? <p style={captionStyle}>{description}</p> : null}
      {children}
    </section>
  );
}

/** Prop exploration. Chip Group is pure layout - every visible pixel belongs to the Chips inside it. */
export const Playground: Story = {};

/**
 * `alignment` maps to Figma's own axis, which measures `primaryAxisAlignItems: MIN`/`MAX` - which edge
 * the chips pack against. (Tag Group's identically-named prop means something else: where its overflow
 * tag renders. Chip Group has no overflow.) The dashed box shows the group's own bounds.
 */
export const Alignment: Story = {
  render: () => (
    <div style={stack}>
      {ALIGNMENTS.map((alignment) => (
        <Group key={alignment} title={`alignment: ${alignment}${alignment === 'left' ? ' (default)' : ''}`}>
          <div style={boundedStyle}>
            <ChipGroup alignment={alignment} size="md">
              <Chip mode="search" label="Matters" isSelected />
              <Chip mode="search" label="Documents" />
              <Chip mode="search" label="People" />
            </ChipGroup>
          </div>
        </Group>
      ))}
    </div>
  ),
};

/**
 * `size` reaches every Chip through context rather than by cloning children, so a Chip still inherits
 * it through a wrapper, a `.map`, or a conditional. Setting `size` on an individual Chip still wins.
 */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Group title="size: sm (24px)">
        <ChipGroup size="sm">
          <Chip mode="search" label="Matters" isSelected />
          <Chip mode="search" label="Documents" />
          <Chip
            mode="filter"
            label="Status"
            elemBefore={<TaskNotStartedIcon decorative />}
            value={{ label: '2 statuses', sections: statusSections() }}
            onRemove={() => {}}
          />
        </ChipGroup>
      </Group>
      <Group title="size: md (32px) - default">
        <ChipGroup size="md">
          <Chip mode="search" label="Matters" isSelected />
          <Chip mode="search" label="Documents" />
          <Chip
            mode="filter"
            label="Status"
            elemBefore={<TaskNotStartedIcon decorative />}
            value={{ label: '2 statuses', sections: statusSections() }}
            onRemove={() => {}}
          />
        </ChipGroup>
      </Group>
      <Group
        title="A single Chip opting out"
        description="The group is sm; the middle chip sets size=md explicitly and keeps it."
      >
        <ChipGroup size="sm">
          <Chip mode="search" label="Inherits sm" />
          <Chip mode="search" label="Explicitly md" size="md" />
          <Chip mode="search" label="Inherits sm" />
        </ChipGroup>
      </Group>
    </div>
  ),
};

/** Once the row runs out of width, chips wrap onto a new line with the same 8px gap on both axes. */
export const Wrapping: Story = {
  render: () => (
    <div style={boundedStyle}>
      <ChipGroup size="md">
        {['Matters', 'Documents', 'People', 'Tasks', 'Notes', 'Invoices', 'Calendar', 'Contacts'].map((label) => (
          <Chip key={label} mode="search" label={label} isSelected={label === 'Matters'} />
        ))}
      </ChipGroup>
    </div>
  ),
};

/** Realistic uses - a scope selector and an active filter bar, the two places chips gather. */
export const Content: Story = {
  render: () => {
    function ScopeSelector() {
      const [scopes, setScopes] = React.useState(() => new Set(['matters']));
      const toggle = (id: string) =>
        setScopes((current) => {
          const next = new Set(current);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });

      return (
        <div style={stack}>
          <ChipGroup size="sm" aria-label="Search scopes">
            {[
              { id: 'matters', label: 'Matters' },
              { id: 'documents', label: 'Documents' },
              { id: 'people', label: 'People' },
              { id: 'tasks', label: 'Tasks' },
            ].map((option) => (
              <Chip
                key={option.id}
                mode="search"
                label={option.label}
                elemBefore={<SearchIcon decorative />}
                isSelected={scopes.has(option.id)}
                onSelectedChange={() => toggle(option.id)}
              />
            ))}
          </ChipGroup>
          <p style={captionStyle}>
            {scopes.size ? `Searching: ${[...scopes].join(', ')}` : 'No scope selected - searching everything.'}
          </p>
        </div>
      );
    }

    function FilterBar() {
      const [filters, setFilters] = React.useState(['status', 'assignee', 'due']);
      const drop = (id: string) => setFilters((current) => current.filter((x) => x !== id));

      return (
        <div style={stack}>
          <ChipGroup size="md" aria-label="Active filters">
            {filters.includes('status') ? (
              <Chip
                mode="filter"
                label="Status"
                elemBefore={<TaskNotStartedIcon decorative />}
                value={{ label: '2 statuses', sections: statusSections() }}
                onRemove={() => drop('status')}
              />
            ) : null}
            {filters.includes('assignee') ? (
              <Chip
                mode="filter"
                label="Assignee"
                value={{ label: 'Jordan Ellis', sections: statusSections() }}
                valuePreview={<Avatar name="Jordan Ellis" size="xs" decorative />}
                onRemove={() => drop('assignee')}
              />
            ) : null}
            {filters.includes('due') ? (
              <Chip
                mode="filter"
                label="Due date"
                elemBefore={<CalendarIcon decorative />}
                operator={{ label: 'before', sections: operatorSections() }}
                value={{ label: 'April 15', sections: statusSections() }}
                onRemove={() => drop('due')}
              />
            ) : null}
          </ChipGroup>
          <p style={captionStyle}>
            {filters.length ? `${filters.length} filter${filters.length === 1 ? '' : 's'} applied.` : 'No filters applied.'}
          </p>
        </div>
      );
    }

    return (
      <div style={stack}>
        <Group title="Scope selector" description="Independent on/off scopes - Chip Group never coordinates selection.">
          <ScopeSelector />
        </Group>
        <Group title="Active filter bar" description="Removing a filter is the consumer's job; the group only lays them out.">
          <FilterBar />
        </Group>
      </div>
    );
  },
};

/** Difficult cases made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="A single chip" description="No gap to collapse, and alignment still applies.">
        <div style={boundedStyle}>
          <ChipGroup alignment="right" size="md">
            <Chip mode="search" label="Matters" isSelected />
          </ChipGroup>
        </div>
      </Group>
      <Group
        title="Mixed modes in one group"
        description="Chip Group takes any Chip - scope, property, and filter can share a row, all at one size."
      >
        <ChipGroup size="md">
          <Chip mode="search" label="Matters" isSelected />
          <Chip mode="select" label="Trusts" onRemove={() => {}} />
          <Chip
            mode="filter"
            label="Status"
            elemBefore={<TaskNotStartedIcon decorative />}
            value={{ label: 'Any', sections: statusSections() }}
            onRemove={() => {}}
          />
        </ChipGroup>
      </Group>
      <Group title="Disabled chips sit in the row normally">
        <ChipGroup size="md">
          <Chip mode="search" label="Matters" isSelected />
          <Chip mode="search" label="Archived" disabled />
          <Chip mode="select" label="Trusts" onRemove={() => {}} disabled />
        </ChipGroup>
      </Group>
      <Group title="Dark surface">
        <div
          data-theme="dark"
          style={{
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-lg)',
            background: 'var(--color-elevation-surface-default)',
          }}
        >
          <ChipGroup size="md">
            <Chip mode="search" label="Matters" isSelected />
            <Chip mode="search" label="Documents" />
            <Chip mode="select" label="Trusts" onRemove={() => {}} />
          </ChipGroup>
        </div>
      </Group>
    </div>
  ),
};
