import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';
import type { BadgeTone } from './badge.types';

const tones: BadgeTone[] = ['default', 'inverse', 'brand', 'success', 'error'];

const meta: Meta<typeof Badge> = {
  title: 'UI/Atoms/Badge',
  component: Badge,
  args: {
    children: '1',
    tone: 'default',
  },
  argTypes: {
    children: { control: 'text' },
    tone: {
      control: 'select',
      options: tones,
    },
    ariaLabel: { control: 'text' },
    className: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-150)',
} satisfies CSSProperties;

const cardStyle = {
  display: 'grid',
  gap: 'var(--spacing-100)',
  padding: 'var(--spacing-200)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const darkSurfaceStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-150)',
  padding: 'var(--spacing-200)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={rowStyle}>
      {tones.map((tone) => (
        <Badge key={tone} tone={tone}>
          {tone === 'error' ? '-1' : tone === 'success' ? '+1' : '1'}
        </Badge>
      ))}
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <span>Unread notifications</span>
        <div style={rowStyle}>
          <Badge ariaLabel="1 unread notification">1</Badge>
          <Badge tone="brand">1</Badge>
        </div>
      </div>

      <div style={cardStyle}>
        <span>Score deltas</span>
        <div style={rowStyle}>
          <Badge tone="success">+1</Badge>
          <Badge tone="error">-1</Badge>
        </div>
      </div>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <Badge>1</Badge>
        <Badge tone="inverse">1</Badge>
        <Badge tone="brand">1</Badge>
      </div>
    </div>
  ),
};

