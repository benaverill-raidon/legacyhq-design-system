import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AssetsIcon, CalendarIcon, PersonRemoveIcon, TrustIcon } from '../../../assets/icons';
import { Tag } from './tag';

const elemBeforeOptions = {
  none: undefined,
  asset: <AssetsIcon size="sm" />,
  trust: <TrustIcon size="sm" />,
  calendar: <CalendarIcon size="sm" />,
} as const;

const tones = ['standard', 'blue', 'green', 'purple', 'red', 'teal', 'yellow', 'orange', 'magenta', 'brand'] as const;

const meta: Meta<typeof Tag> = {
  title: 'UI/Atoms/Tag',
  component: Tag,
  args: {
    children: 'Averill Family Living Trust',
    size: 'md',
    tone: 'standard',
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
    tone: {
      control: 'select',
      options: tones,
    },
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
};

export default meta;

type Story = StoryObj<typeof Tag>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
  color: 'var(--color-content-default)',
} satisfies React.CSSProperties;

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
} satisfies React.CSSProperties;

const cardStyle = {
  display: 'grid',
  gap: 'var(--spacing-150)',
  padding: 'var(--spacing-200)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
} satisfies React.CSSProperties;

const darkSurfaceStyle = {
  ...cardStyle,
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies React.CSSProperties;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        {tones.map((tone) => (
          <Tag key={tone} tone={tone}>
            {tone}
          </Tag>
        ))}
      </div>

      <div style={rowStyle}>
        <Tag size="sm">Small</Tag>
        <Tag size="md">Medium</Tag>
        <Tag elemBefore={<AssetsIcon size="sm" />}>With icon</Tag>
        <Tag isRemovable onRemove={() => undefined}>
          Removable
        </Tag>
        <Tag href="/trusts/123">Navigational</Tag>
        <Tag href="/trusts/123" isRemovable onRemove={() => undefined}>
          Link + remove
        </Tag>
        <Tag tone="brand">Brand</Tag>
        <Tag isDisabled href="/trusts/123" isRemovable onRemove={() => undefined}>
          Disabled
        </Tag>
      </div>

      <div style={rowStyle}>
        <Tag href="/trusts/123" autoFocus>
          Focus preview
        </Tag>
        <Tag href="/assets/456" tone="blue" elemBefore={<AssetsIcon size="sm" />}>
          Hover and press preview
        </Tag>
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <div style={rowStyle}>
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
        <div style={rowStyle}>
          <Tag href="/entities/tasks/12" tone="teal">
            Follow-up task
          </Tag>
          <Tag href="/entities/notes/88" tone="magenta">
            Client note mention
          </Tag>
          <Tag href="/entities/people/42" tone="orange" isRemovable onRemove={() => undefined} elemBefore={<PersonRemoveIcon size="sm" />}>
            Ben Averill
          </Tag>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
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

      <div data-theme="dark" style={darkSurfaceStyle}>
        <div style={rowStyle}>
          <Tag href="/entities/assets/456" tone="blue" elemBefore={<AssetsIcon size="sm" />}>
            Dark surface reference
          </Tag>
          <Tag tone="yellow">Classification</Tag>
          <Tag href="/entities/trusts/123" tone="brand" isRemovable onRemove={() => undefined}>
            Linked removable tag
          </Tag>
        </div>
      </div>
    </div>
  ),
};
