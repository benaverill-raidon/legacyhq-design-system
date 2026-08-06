import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssetsIcon, CalendarIcon, PersonRemoveIcon, TrustIcon } from '../../../assets/icons';
import { Tag } from './tag';
import type { TagTone } from './tag.types';

const elemBeforeOptions = {
  none: undefined,
  asset: <AssetsIcon size="sm" />,
  trust: <TrustIcon size="sm" />,
  calendar: <CalendarIcon size="sm" />,
} as const;

const tones: TagTone[] = ['default', 'blue', 'green', 'purple', 'red', 'teal', 'yellow', 'orange', 'magenta', 'brand'];

const meta = {
  title: 'UI/Atoms/Tag',
  component: Tag,
  args: {
    children: 'Averill Family Living Trust',
    size: 'md',
    tone: 'default',
    href: undefined,
    target: '_self',
    isRemovable: false,
    isDisabled: false,
    elemBefore: undefined,
    removeLabel: undefined,
  },
  argTypes: {
    children: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    tone: { control: 'select', options: tones },
    href: { control: 'text' },
    target: { control: 'inline-radio', options: ['_self', '_blank'] },
    isRemovable: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    elemBefore: {
      control: 'select',
      options: Object.keys(elemBeforeOptions),
      mapping: elemBeforeOptions,
    },
    removeLabel: { control: 'text' },
    className: { control: false },
    onRemove: { control: false },
    onClick: { control: false },
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)', color: 'var(--color-content-default)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
};

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
};

const darkSurfaceStyle: CSSProperties = {
  ...cardStyle,
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

/** A labelled cell so every specimen in a matrix is self-describing. */
function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'start' }}>
      {children}
      <span style={captionStyle}>{label}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      <div style={row}>{children}</div>
    </section>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/**
 * Tone is a broad enumeration (not a paired emphasis/meaning split like Button) - `default` is the
 * neutral default, `brand` ties to the product's own color, and the rest are general-purpose accent
 * tones with no fixed semantic meaning of their own. The four rows below are the fundamentally
 * different rendered forms: plain text, a native anchor, a wrapper with a remove button, and both
 * combined.
 */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Tone">
        {tones.map((tone) => (
          <Tag key={tone} tone={tone}>
            {tone}
          </Tag>
        ))}
      </Group>

      <Group title="Display-only (span)">
        <Tag tone="green">Active</Tag>
      </Group>

      <Group title="Navigational (anchor)">
        <Tag href="/trusts/123" tone="green">
          Averill Family Living Trust
        </Tag>
      </Group>

      <Group title="Removable (wrapper + button)">
        <Tag isRemovable onRemove={() => undefined}>
          Removable
        </Tag>
      </Group>

      <Group title="Navigational + removable">
        <Tag href="/trusts/123" isRemovable onRemove={() => undefined}>
          Link + remove
        </Tag>
      </Group>
    </div>
  ),
};

/**
 * `size` scales tag height, padding, and the remove button's own container - the elemBefore and
 * remove-button icon glyphs stay a constant 16px at both sizes, matching Figma.
 */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Group title="sm">
        <Tag size="sm">Small</Tag>
        <Tag size="sm" elemBefore={<AssetsIcon size="sm" />}>
          With icon
        </Tag>
        <Tag size="sm" isRemovable onRemove={() => undefined}>
          Removable
        </Tag>
      </Group>
      <Group title="md">
        <Tag size="md">Medium</Tag>
        <Tag size="md" elemBefore={<AssetsIcon size="sm" />}>
          With icon
        </Tag>
        <Tag size="md" isRemovable onRemove={() => undefined}>
          Removable
        </Tag>
      </Group>
    </div>
  ),
};

function LiveInteractionExample() {
  const [items, setItems] = React.useState(['Averill Family Living Trust', "Ben's Investments", 'Estate planning']);

  return (
    <div style={row}>
      {items.map((item) => (
        <Tag
          key={item}
          href="/trusts/123"
          isRemovable
          onRemove={() => setItems((current) => current.filter((value) => value !== item))}
        >
          {item}
        </Tag>
      ))}
    </div>
  );
}

/**
 * Interaction and system states. `data-force-state` mirrors the adjacent pseudo-class so
 * hover/pressed render as a static regression reference (documentation-only, not part of the
 * public API) - the same convention Button and Checkbox use; passing it on a removable Tag previews
 * both the content and remove areas together, matching Figma's single combined hover/press swatch.
 * Focus preview uses real `autoFocus`, since content and the remove button are two independently
 * focusable native elements, each with its own tight ring at its own bounds - not a ring around the
 * whole tag - see the Live group for both being focused/hovered/clicked independently by hand.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Navigational">
        <Cell label="Default">
          <Tag href="/trusts/123">Trust</Tag>
        </Cell>
        <Cell label="Hover">
          <Tag href="/trusts/123" data-force-state="hover">
            Trust
          </Tag>
        </Cell>
        <Cell label="Focus visible">
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- intentional, documented above:
              a static focus-visible reference for this story only, not shipped component behavior. */}
          <Tag href="/trusts/123" autoFocus>
            Trust
          </Tag>
        </Cell>
        <Cell label="Pressed">
          <Tag href="/trusts/123" data-force-state="active">
            Trust
          </Tag>
        </Cell>
        <Cell label="Disabled">
          <Tag href="/trusts/123" isDisabled>
            Trust
          </Tag>
        </Cell>
      </Group>

      <Group title="Removable">
        <Cell label="Default">
          <Tag isRemovable onRemove={() => undefined}>
            Trust
          </Tag>
        </Cell>
        <Cell label="Hover">
          <Tag isRemovable onRemove={() => undefined} data-force-state="hover">
            Trust
          </Tag>
        </Cell>
        <Cell label="Pressed">
          <Tag isRemovable onRemove={() => undefined} data-force-state="active">
            Trust
          </Tag>
        </Cell>
        <Cell label="Disabled">
          <Tag isRemovable isDisabled onRemove={() => undefined}>
            Trust
          </Tag>
        </Cell>
      </Group>

      <Group title="Live - hover, focus, and remove these independently">
        <LiveInteractionExample />
      </Group>
    </div>
  ),
};

/** How Tag behaves with realistic content and inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <div style={cardStyle}>
        <h3 style={headingStyle}>Entity references</h3>
        <div style={row}>
          <Tag href="/entities/trusts/123" tone="green" elemBefore={<TrustIcon size="sm" />}>
            Averill Family Living Trust
          </Tag>
          <Tag href="/entities/assets/456" tone="blue" elemBefore={<AssetsIcon size="sm" />}>
            Ben&apos;s Investments
          </Tag>
          <Tag tone="purple" elemBefore={<CalendarIcon size="sm" />}>
            Estate planning
          </Tag>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Task and note mentions</h3>
        <div style={row}>
          <Tag href="/entities/tasks/12" tone="teal">
            Follow-up task
          </Tag>
          <Tag href="/entities/notes/88" tone="magenta">
            Client note mention
          </Tag>
          <Tag
            href="/entities/people/42"
            tone="orange"
            isRemovable
            onRemove={() => undefined}
            elemBefore={<PersonRemoveIcon size="sm" />}
          >
            Ben Averill
          </Tag>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Removable relationships</h3>
        <div style={row}>
          <Tag href="/entities/trusts/123" tone="green" isRemovable onRemove={() => undefined}>
            Averill Family Living Trust
          </Tag>
          <Tag href="/entities/assets/456" tone="brand" isRemovable onRemove={() => undefined}>
            Equity account
          </Tag>
          <Tag tone="red" isRemovable onRemove={() => undefined}>
            Remove relationship
          </Tag>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Tag row that wraps</h3>
        <p style={captionStyle}>Tags wrap onto new lines as a row fills, rather than overflowing.</p>
        <div style={{ ...row, inlineSize: '320px' }}>
          <Tag tone="green">Active</Tag>
          <Tag tone="blue">Investments</Tag>
          <Tag tone="purple">Estate planning</Tag>
          <Tag tone="teal">Follow-up</Tag>
          <Tag tone="orange">Ben Averill</Tag>
        </div>
      </div>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Long text truncates instead of wrapping</h3>
        <p style={captionStyle}>
          <code>text-overflow: ellipsis</code> keeps a single-line tag from breaking layout in a
          narrow container.
        </p>
        <div style={{ inlineSize: '160px' }}>
          <Tag
            href="/entities/trusts/123"
            elemBefore={<TrustIcon size="sm" />}
            isRemovable
            onRemove={() => undefined}
          >
            Averill Family Revocable Living Trust
          </Tag>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div data-theme="dark" style={darkSurfaceStyle}>
          <div style={row}>
            <Tag href="/entities/assets/456" tone="blue" elemBefore={<AssetsIcon size="sm" />}>
              Dark surface reference
            </Tag>
            <Tag tone="yellow">Classification</Tag>
            <Tag href="/entities/trusts/123" tone="brand" isRemovable onRemove={() => undefined}>
              Linked removable tag
            </Tag>
          </div>
        </div>
      </section>
    </div>
  ),
};
