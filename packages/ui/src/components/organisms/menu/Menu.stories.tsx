import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArchiveIcon,
  CheckboxEmptyIcon,
  CheckboxFillIcon,
  CopyIcon,
  DeleteIcon,
  EditIcon,
  RadioCheckedIcon,
  RadioUncheckedIcon,
} from '../../../assets/icons';
import { Avatar } from '../../atoms/avatar';
import { Menu } from './menu';
import type { MenuItem, MenuSize } from './menu.types';

const meta = {
  title: 'UI/Organisms/Menu',
  component: Menu,
  args: {
    sections: [],
  },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: 'var(--spacing-3xl)',
};

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const surfaceStyle: CSSProperties = {
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-lg)',
  background: 'var(--color-elevation-surface-raised-default)',
  padding: 'var(--spacing-sm)',
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3
        style={{
          margin: 0,
          font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
          color: 'var(--color-content-default)',
        }}
      >
        {title}
      </h3>
      <div style={row}>{children}</div>
    </section>
  );
}

// spacing="spacious" centers the 16x16 (size="md", the Icon default) glyph in a 24x24 box, matching
// Figma's <elemBefore> exactly - confirmed on the plain (non-selectable) action row's own icon
// instance, not just the checkbox/radio ones.
//
// color: verified directly against Figma that a PLAIN elemBefore icon (not just the
// checkbox/radio ones) binds to the same color/content/selected variable as the row's own text
// when isSelected=true, and color/content/default when not - so any icon should recolor with the
// row's selected state, not just checkbox/radio-style ones. selectedId is optional because most
// callers of actionItems() (Sizes, EdgeCases, the "danger zone" section) don't demonstrate
// selection at all.
function actionItems(selectedId?: string): MenuItem[] {
  const definitions = [
    { id: 'rename', label: 'Rename', Icon: EditIcon },
    { id: 'duplicate', label: 'Duplicate', Icon: CopyIcon },
    { id: 'archive', label: 'Archive', Icon: ArchiveIcon },
    { id: 'delete', label: 'Delete', Icon: DeleteIcon },
  ];

  return definitions.map(({ Icon, ...item }) => ({
    ...item,
    leadingElement: <Icon spacing="spacious" color={item.id === selectedId ? 'selected' : 'default'} decorative />,
  }));
}

/** Interactive - type in the search field, click a row, watch the console-free selection state below. */
export const Playground: Story = {
  render: () => {
    function PlaygroundMenu() {
      const [search, setSearch] = React.useState('');
      const [selected, setSelected] = React.useState('rename');

      const items: MenuItem[] = actionItems(selected).map((item) => ({
        ...item,
        selected: item.id === selected,
        onSelect: () => setSelected(item.id),
      }));

      return (
        <div style={surfaceStyle}>
          <Menu
            aria-label="Matter actions"
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search actions"
            sections={[{ id: 'actions', heading: 'Actions', items }]}
          />
        </div>
      );
    }

    return <PlaygroundMenu />;
  },
};

/** `size` controls the panel's fixed width only - row height always follows content. */
export const Sizes: Story = {
  render: () => (
    <div style={row}>
      {(['sm', 'md', 'lg'] as MenuSize[]).map((size) => (
        <div key={size} style={surfaceStyle}>
          <Menu
            aria-label={`Actions (${size})`}
            size={size}
            showSearch={false}
            sections={[{ id: 'actions', items: actionItems() }]}
          />
        </div>
      ))}
    </div>
  ),
};

/** Realistic compositions: grouped sections with headings, descriptions, and selection. */
export const Content: Story = {
  render: () => {
    function ViewOptionsMenu() {
      const [checked, setChecked] = React.useState<Record<string, boolean>>({ showArchived: false, showDrafts: true });

      // The checkbox glyph is purely decorative (aria-hidden, CheckboxFillIcon/CheckboxEmptyIcon
      // are the exact icons Figma's own menu-item uses for this state, colored selected/subtle to
      // match) - aria-checked on the row itself (via selectionType) is what actually conveys
      // state. A real interactive Checkbox is deliberately not nested here: it would render a
      // focusable <input> inside the row's own <button>, which is invalid HTML.
      const items: MenuItem[] = [
        { id: 'showDrafts', label: 'Show drafts' },
        { id: 'showArchived', label: 'Show archived' },
      ].map((item) => ({
        ...item,
        selectionType: 'checkbox',
        selected: checked[item.id],
        leadingElement: checked[item.id] ? (
          <CheckboxFillIcon spacing="spacious" color="selected" decorative />
        ) : (
          <CheckboxEmptyIcon spacing="spacious" color="subtle" decorative />
        ),
        onSelect: () => setChecked((current) => ({ ...current, [item.id]: !current[item.id] })),
      }));

      return (
        <div style={surfaceStyle}>
          <Menu aria-label="View options" showSearch={false} sections={[{ id: 'view', heading: 'View options', items }]} />
        </div>
      );
    }

    function SortByMenu() {
      const [sort, setSort] = React.useState('recent');
      const options = ['recent', 'name', 'status'];

      // RadioCheckedIcon/RadioUncheckedIcon are the exact icons Figma's own menu-item uses for a
      // radio-style row, colored selected/subtle the same way the checkbox-style icons above are.
      const items: MenuItem[] = options.map((value) => ({
        id: value,
        label: value === 'recent' ? 'Most recent' : value === 'name' ? 'Name (A-Z)' : 'Status',
        selectionType: 'radio',
        selected: sort === value,
        leadingElement:
          sort === value ? (
            <RadioCheckedIcon spacing="spacious" color="selected" decorative />
          ) : (
            <RadioUncheckedIcon spacing="spacious" color="subtle" decorative />
          ),
        onSelect: () => setSort(value),
      }));

      return (
        <div style={surfaceStyle}>
          <Menu aria-label="Sort by" showSearch={false} sections={[{ id: 'sort', heading: 'Sort by', items }]} />
        </div>
      );
    }

    return (
      <div style={stack}>
        <Group title="With row descriptions">
          <div style={surfaceStyle}>
            <Menu
              aria-label="Assignee"
              showSearch={false}
              sections={[
                {
                  id: 'assignee',
                  heading: 'Assign to',
                  items: [
                    { id: 'jordan', label: 'Jordan Ellis', description: 'Trusts & estates' },
                    { id: 'priya', label: 'Priya Nair', description: 'Probate' },
                    { id: 'sam', label: 'Sam Okafor', description: 'Out of office', disabled: true },
                  ],
                },
              ]}
            />
          </div>
        </Group>

        {/*
          An Avatar in the leading slot carries a 1px inverse ring (matching Figma's own `type=avatar`
          elemBefore instance), which is what keeps it legible against the tinted selected and hover
          fills rather than blending into them - hence the deliberately selected row here.
        */}
        <Group title="Avatar rows">
          <div style={surfaceStyle}>
            <Menu
              aria-label="Reassign matter"
              showSearch={false}
              sections={[
                {
                  id: 'people',
                  heading: 'Reassign to',
                  items: [
                    {
                      id: 'jordan',
                      label: 'Jordan Ellis',
                      description: 'Trusts & estates',
                      selected: true,
                      leadingElement: <Avatar name="Jordan Ellis" size="xs" decorative />,
                    },
                    {
                      id: 'priya',
                      label: 'Priya Nair',
                      description: 'Probate',
                      leadingElement: <Avatar name="Priya Nair" size="xs" decorative />,
                    },
                    {
                      id: 'estates-team',
                      label: 'Estates team',
                      description: '6 members',
                      leadingElement: <Avatar name="Estates team" entityType="team" size="xs" decorative />,
                    },
                  ],
                },
              ]}
            />
          </div>
        </Group>

        <Group title="Checkbox selection (multi)">
          <ViewOptionsMenu />
        </Group>

        <Group title="Radio selection (single)">
          <SortByMenu />
        </Group>

        <Group title="Multiple sections">
          <div style={surfaceStyle}>
            <Menu
              aria-label="Matter actions"
              showSearch={false}
              sections={[
                { id: 'actions', heading: 'Actions', items: actionItems() },
                {
                  id: 'danger',
                  heading: 'Danger zone',
                  items: [{ id: 'delete-permanently', label: 'Delete permanently', leadingElement: <DeleteIcon spacing="spacious" decorative /> }],
                },
              ]}
            />
          </div>
        </Group>
      </div>
    );
  },
};

/** Loading, empty search results, and a disabled row alongside enabled ones. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Loading">
        <div style={surfaceStyle}>
          <Menu aria-label="Loading example" loading showSearch={false} sections={[]} />
        </div>
      </Group>

      <Group title="Search with no matches">
        <div style={surfaceStyle}>
          <Menu
            aria-label="No matches example"
            searchValue="zzz"
            searchPlaceholder="Search actions"
            emptyMessage="No actions match “zzz”"
            sections={[{ id: 'actions', items: actionItems() }]}
          />
        </div>
      </Group>

      <Group title="Disabled row alongside enabled rows">
        <p style={captionStyle}>Arrow-key navigation skips the disabled row entirely.</p>
        <div style={surfaceStyle}>
          <Menu
            aria-label="Disabled row example"
            showSearch={false}
            sections={[
              {
                id: 'actions',
                items: [
                  { id: 'rename', label: 'Rename' },
                  { id: 'delete', label: 'Delete (unavailable)', disabled: true },
                ],
              },
            ]}
          />
        </div>
      </Group>

      <Group title="Dark surface">
        <div data-theme="dark" style={{ ...surfaceStyle, background: 'var(--color-elevation-surface-raised-default)' }}>
          <Menu aria-label="Dark surface example" showSearch={false} sections={[{ id: 'actions', items: actionItems() }]} />
        </div>
      </Group>
    </div>
  ),
};
