import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarIcon, SearchIcon, TaskNotStartedIcon } from '../../../assets/icons';
import { Avatar } from '../../atoms/avatar';
import { AvatarGroup } from '../avatar-group';
import type { MenuSection } from '../../organisms/menu';
import { Chip } from './chip';
import type { ChipSize } from './chip.types';

const SIZES: ChipSize[] = ['sm', 'md'];

function statusSections(): MenuSection[] {
  return [
    {
      id: 'statuses',
      items: [
        { id: 'not-started', label: 'Not started', leadingElement: <TaskNotStartedIcon spacing="spacious" decorative /> },
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

function peopleSections(): MenuSection[] {
  return [
    {
      id: 'people',
      items: [
        { id: 'jordan', label: 'Jordan Ellis', leadingElement: <Avatar name="Jordan Ellis" size="xs" decorative /> },
        { id: 'priya', label: 'Priya Nair', leadingElement: <Avatar name="Priya Nair" size="xs" decorative /> },
      ],
    },
  ];
}

const meta = {
  title: 'UI/Molecules/Chip',
  component: Chip,
  args: {
    mode: 'filter',
    label: 'Status',
    elemBefore: <TaskNotStartedIcon decorative />,
    value: { label: '2 statuses', sections: statusSections() },
    size: 'md',
    disabled: false,
    onRemove: () => {},
  },
  argTypes: {
    label: { control: 'text' },
    size: { control: 'inline-radio', options: SIZES },
    disabled: { control: 'boolean' },
    mode: { control: false },
    value: { control: false },
    operator: { control: false },
    elemBefore: { control: false },
    onRemove: { control: false },
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-md)' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
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

/** Prop exploration on a `filter` chip. Activate the value segment to open its menu. */
export const Playground: Story = {};

/**
 * The three modes, which is the axis that actually changes Chip's shape. `filter` is the only mode
 * with dropdown segments; `property` is a label plus a remove affordance; `scope` is the only mode
 * that is itself selectable, and the only one Figma gives an unselected state.
 */
export const Modes: Story = {
  render: () => (
    <div style={stack}>
      <Group
        title="filter"
        description="An active filter on one property: the property name, the current value (dropdown-backed), and remove. Most often several of these sit together above a task list."
      >
        <div style={row}>
          <Chip
            mode="filter"
            label="Status"
            elemBefore={<TaskNotStartedIcon decorative />}
            value={{ label: '2 statuses', sections: statusSections() }}
            onRemove={() => {}}
          />
          <Chip
            mode="filter"
            label="Assignee"
            value={{ label: '3 people', sections: peopleSections() }}
            valuePreview={
              <AvatarGroup
                size="xs"
                maxVisible={3}
                avatars={[
                  { id: 'a', name: 'Jordan Ellis' },
                  { id: 'b', name: 'Priya Nair' },
                  { id: 'c', name: 'Sam Okafor' },
                ]}
              />
            }
            onRemove={() => {}}
          />
        </div>
      </Group>

      <Group
        title="property"
        description="A single already-applied property. No dropdown - the value is the label itself, and the only control is remove."
      >
        <div style={row}>
          <Chip mode="property" label="Trusts" onRemove={() => {}} />
          <Chip mode="property" label="Jordan Ellis" elemBefore={<Avatar name="Jordan Ellis" size="xs" decorative />} onRemove={() => {}} />
        </div>
      </Group>

      <Group
        title="scope"
        description="Scopes a search to a broader category than a single property. Each chip is an independent on/off toggle carrying aria-pressed - not a radio group, so several can be on at once."
      >
        <ScopeExample />
      </Group>
    </div>
  ),
};

/**
 * Each scope chip toggles independently - this holds a Set, not a single value, so several scopes can
 * be active at once and turning one off leaves the others alone.
 */
function ScopeExample() {
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
      <div style={row}>
        {[
          { id: 'matters', label: 'Matters' },
          { id: 'documents', label: 'Documents' },
          { id: 'people', label: 'People' },
          { id: 'tasks', label: 'Tasks' },
        ].map((option) => (
          <Chip
            key={option.id}
            mode="scope"
            label={option.label}
            elemBefore={<SearchIcon decorative />}
            isSelected={scopes.has(option.id)}
            onSelectedChange={() => toggle(option.id)}
          />
        ))}
      </div>
      <p style={captionStyle}>
        {scopes.size ? `Searching: ${[...scopes].join(', ')}` : 'No scope selected - searching everything.'}
      </p>
    </div>
  );
}

/**
 * An operator segment between the label and the value. Figma only shows this on its `due date`
 * filter type, but nothing about it is date-specific - any filter needing a comparison can use it.
 * This is also the junction Figma leaves at 2px (two middle segments side by side); code normalizes
 * every junction to a single 1px line.
 */
export const WithOperator: Story = {
  render: () => (
    <div style={row}>
      <Chip
        mode="filter"
        label="Due date"
        elemBefore={<CalendarIcon decorative />}
        operator={{ label: 'on', sections: operatorSections() }}
        value={{ label: 'March 2', sections: statusSections() }}
        onRemove={() => {}}
      />
      <Chip
        mode="filter"
        label="Due date"
        elemBefore={<CalendarIcon decorative />}
        operator={{ label: 'before', sections: operatorSections() }}
        value={{ label: 'April 15', sections: statusSections() }}
        onRemove={() => {}}
      />
    </div>
  ),
};

/** Both sizes Figma defines - `sm (24)` and `md (32)` - applied to every segment together. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      {SIZES.map((size) => (
        <Group key={size} title={size === 'sm' ? 'sm (24px)' : 'md (32px) - default'}>
          <div style={row}>
            <Chip
              mode="filter"
              size={size}
              label="Status"
              elemBefore={<TaskNotStartedIcon decorative />}
              value={{ label: '2 statuses', sections: statusSections() }}
              onRemove={() => {}}
            />
            <Chip
              mode="filter"
              size={size}
              label="Due date"
              elemBefore={<CalendarIcon decorative />}
              operator={{ label: 'on', sections: operatorSections() }}
              value={{ label: 'March 2', sections: statusSections() }}
              onRemove={() => {}}
            />
            <Chip mode="property" size={size} label="Trusts" onRemove={() => {}} />
            <Chip mode="scope" size={size} label="Matters" isSelected />
          </div>
        </Group>
      ))}
    </div>
  ),
};

/**
 * Interaction and system states. The label segment (Figma's chip-base) deliberately has **no** hover
 * or press treatment in any mode - in filter/property it is a passive span, and in scope the
 * selected/unselected distinction is the feedback, with the focus ring covering keyboard affordance.
 * So `data-force-state` accepts only `'focus'` here; the segments that do have interaction fills are
 * the operator, the value, and remove.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="scope - unselected" description="No hover or press fill - only focus and disabled change the label segment.">
        <div style={row}>
          <Chip mode="scope" label="Default" elemBefore={<SearchIcon decorative />} />
          <Chip mode="scope" label="Focus" elemBefore={<SearchIcon decorative />} data-force-state="focus" />
          <Chip mode="scope" label="Disabled" elemBefore={<SearchIcon decorative />} disabled />
        </div>
      </Group>
      <Group
        title="scope - selected"
        description="Selected is a selection state, not an interaction state - it uses the dedicated selected token family, and the label icon tracks the text colour with it."
      >
        <div style={row}>
          <Chip mode="scope" label="Default" elemBefore={<SearchIcon decorative />} isSelected />
          <Chip mode="scope" label="Focus" elemBefore={<SearchIcon decorative />} isSelected data-force-state="focus" />
          <Chip mode="scope" label="Disabled" elemBefore={<SearchIcon decorative />} isSelected disabled />
        </div>
      </Group>
      <Group
        title="Interactive segments keep their fills"
        description="Hover the value, operator, or remove segment - those are the parts that act, so those are the parts that respond."
      >
        <div style={row}>
          <Chip
            mode="filter"
            label="Due date"
            elemBefore={<CalendarIcon decorative />}
            operator={{ label: 'on', sections: operatorSections() }}
            value={{ label: 'March 2', sections: statusSections() }}
            onRemove={() => {}}
          />
        </div>
      </Group>
      <Group title="filter / property - disabled" description="Disabled applies to every segment at once.">
        <div style={row}>
          <Chip
            mode="filter"
            label="Status"
            elemBefore={<TaskNotStartedIcon decorative />}
            value={{ label: '2 statuses', sections: statusSections() }}
            onRemove={() => {}}
            disabled
          />
          <Chip mode="property" label="Trusts" onRemove={() => {}} disabled />
        </div>
      </Group>
    </div>
  ),
};

/** A realistic filter bar - the most common place several chips appear together. */
export const Content: Story = {
  render: () => {
    function FilterBar() {
      const [filters, setFilters] = React.useState(['status', 'assignee', 'due']);

      return (
        <div style={stack}>
          <div style={row}>
            {filters.includes('status') ? (
              <Chip
                mode="filter"
                label="Status"
                elemBefore={<TaskNotStartedIcon decorative />}
                value={{ label: '2 statuses', sections: statusSections() }}
                onRemove={() => setFilters((f) => f.filter((x) => x !== 'status'))}
              />
            ) : null}
            {filters.includes('assignee') ? (
              <Chip
                mode="filter"
                label="Assignee"
                value={{ label: 'Jordan Ellis', sections: peopleSections() }}
                valuePreview={<Avatar name="Jordan Ellis" size="xs" decorative />}
                onRemove={() => setFilters((f) => f.filter((x) => x !== 'assignee'))}
              />
            ) : null}
            {filters.includes('due') ? (
              <Chip
                mode="filter"
                label="Due date"
                elemBefore={<CalendarIcon decorative />}
                operator={{ label: 'before', sections: operatorSections() }}
                value={{ label: 'April 15', sections: statusSections() }}
                onRemove={() => setFilters((f) => f.filter((x) => x !== 'due'))}
              />
            ) : null}
          </div>
          <p style={captionStyle}>
            {filters.length ? `${filters.length} filter${filters.length === 1 ? '' : 's'} applied.` : 'No filters applied.'}
          </p>
        </div>
      );
    }

    return <FilterBar />;
  },
};

/** Difficult cases made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Long label and value truncate rather than breaking the pill" description="The chip stays a single line; segments ellipsize.">
        <div style={{ inlineSize: '320px' }}>
          <Chip
            mode="filter"
            label="Responsible attorney of record"
            value={{ label: 'Jordan Ellis, Priya Nair and 4 others', sections: peopleSections() }}
            onRemove={() => {}}
          />
        </div>
      </Group>
      <Group title="No elemBefore" description="The icon slot is optional in every mode.">
        <div style={row}>
          <Chip mode="filter" label="Status" value={{ label: 'Any', sections: statusSections() }} onRemove={() => {}} />
          <Chip mode="property" label="Trusts" onRemove={() => {}} />
          <Chip mode="scope" label="Matters" />
        </div>
      </Group>
      <Group title="Dark surface">
        <div
          data-theme="dark"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-lg)',
            background: 'var(--color-elevation-surface-default)',
          }}
        >
          <Chip
            mode="filter"
            label="Status"
            elemBefore={<TaskNotStartedIcon decorative />}
            value={{ label: '2 statuses', sections: statusSections() }}
            onRemove={() => {}}
          />
          <Chip mode="property" label="Trusts" onRemove={() => {}} />
          <Chip mode="scope" label="Matters" isSelected />
        </div>
      </Group>
    </div>
  ),
};
