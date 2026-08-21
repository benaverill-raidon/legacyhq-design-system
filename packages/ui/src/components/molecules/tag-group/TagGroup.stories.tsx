import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssetsIcon, TrustIcon } from '../../../assets/icons';
import { TagGroup } from './tag-group';
import type { TagGroupAlignment, TagGroupItem } from './tag-group.types';

const meta = {
  title: 'UI/Molecules/Tag Group',
  component: TagGroup,
  args: {
    tags: Array.from({ length: 6 }, (_, index) => ({ id: `tag-${index + 1}`, label: `Tag ${index + 1}` })),
    maxVisible: undefined,
    size: 'sm',
    alignment: 'left',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    alignment: { control: 'inline-radio', options: ['left', 'right'] },
    maxVisible: { control: 'number' },
    tags: { control: false },
    overflowLabel: { control: false },
    onOverflowTagSelect: { control: false },
  },
} satisfies Meta<typeof TagGroup>;

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

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      {description ? <p style={captionStyle}>{description}</p> : null}
      {children}
    </section>
  );
}

function fifteenTags(): TagGroupItem[] {
  return Array.from({ length: 15 }, (_, index) => ({ id: `tag-${index + 1}`, label: `Tag ${index + 1}` }));
}

/** Prop exploration. Pass more tags than `maxVisible` to see the overflow tag appear. */
export const Playground: Story = {};

/** No `maxVisible` - every tag renders, wrapping onto new lines as the row fills. Matches Figma's own wrap layout (8px row/column gap). */
export const Wrapping: Story = {
  render: () => (
    <div style={{ inlineSize: '360px' }}>
      <TagGroup tags={fifteenTags().slice(0, 8)} />
    </div>
  ),
};

/**
 * `maxVisible` truncates the rest behind a "+N more" tag that opens a Dropdown Menu holding the
 * remaining truncated tags. `alignment` (matching Figma's `tab-group` component exactly - a naming
 * typo for Tag Group, verified live) controls only where that tag renders: `left` (default) trailing,
 * `right` leading.
 */
export const Overflow: Story = {
  render: () => {
    function OverflowExample({ alignment }: { alignment: TagGroupAlignment }) {
      return <TagGroup tags={fifteenTags()} maxVisible={10} alignment={alignment} />;
    }

    return (
      <div style={stack}>
        <Group title="alignment: left (default)" description="The overflow tag trails the visible tags.">
          <OverflowExample alignment="left" />
        </Group>
        <Group title="alignment: right" description="The overflow tag leads the visible tags.">
          <OverflowExample alignment="right" />
        </Group>
      </div>
    );
  },
};

/** How Tag Group behaves with realistic entity references - tones, leading icons, and removable tags. */
export const Content: Story = {
  render: () => {
    function EntityReferenceExample() {
      const [removed, setRemoved] = React.useState<string[]>([]);

      const tags: TagGroupItem[] = [
        { id: 'trust-1', label: 'Averill Family Living Trust', tone: 'green', href: '/trusts/1', elemBefore: <TrustIcon size="sm" /> },
        { id: 'asset-1', label: "Ben's Investments", tone: 'blue', href: '/assets/1', elemBefore: <AssetsIcon size="sm" /> },
        {
          id: 'asset-2',
          label: 'Vacation Home',
          tone: 'blue',
          isRemovable: true,
          onRemove: () => setRemoved((current) => [...current, 'Vacation Home']),
        },
        { id: 'task-1', label: 'Follow-up task', tone: 'teal', href: '/tasks/12' },
        { id: 'note-1', label: 'Client note mention', tone: 'magenta', href: '/notes/88' },
      ];

      return (
        <div style={stack}>
          <TagGroup tags={tags} />
          {removed.length > 0 ? <p style={captionStyle}>Removed: {removed.join(', ')}</p> : null}
        </div>
      );
    }

    return (
      <Group title="Entity references">
        <EntityReferenceExample />
      </Group>
    );
  },
};

/** Selecting a truncated tag from the overflow panel - Tag Group never assumes what selection means; it calls `onOverflowTagSelect` and leaves navigation/removal to the consumer. */
export const EdgeCases: Story = {
  render: () => {
    function SelectFromOverflowExample() {
      const [lastSelected, setLastSelected] = React.useState<string | null>(null);

      return (
        <div style={stack}>
          <TagGroup
            tags={fifteenTags()}
            maxVisible={10}
            onOverflowTagSelect={(tag) => setLastSelected(String(tag.label))}
          />
          <p style={captionStyle}>{lastSelected ? `Selected from overflow: ${lastSelected}` : 'Nothing selected yet.'}</p>
        </div>
      );
    }

    function SingleTagExample() {
      return (
        <Group title="A single tag, well under maxVisible" description="No overflow tag renders at all - it's optional.">
          <TagGroup tags={[{ id: 'solo', label: 'Solo tag' }]} maxVisible={10} />
        </Group>
      );
    }

    return (
      <div style={stack}>
        <Group title="Selecting a truncated tag" description="Tag Group calls onOverflowTagSelect - it does not navigate, remove, or close the panel on its own.">
          <SelectFromOverflowExample />
        </Group>
        <SingleTagExample />
      </div>
    );
  },
};
