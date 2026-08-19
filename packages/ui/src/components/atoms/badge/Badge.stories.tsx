import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';
import type { BadgeTone } from './badge.types';

const tones: BadgeTone[] = ['default', 'brand', 'success', 'error'];

const meta = {
  title: 'UI/Atoms/Badge',
  component: Badge,
  args: {
    children: '1',
    tone: 'default',
  },
  argTypes: {
    children: { control: 'text' },
    tone: { control: 'select', options: tones },
    ariaLabel: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-lg)',
};

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
};

/** A labelled cell so every specimen in a matrix is self-describing. */
function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'center' }}>
      <div style={{ display: 'flex', minBlockSize: 'var(--spacing-lg)', alignItems: 'center' }}>
        {children}
      </div>
      <span style={captionStyle}>{label}</span>
    </div>
  );
}

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

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/** The intentionally designed tones, scannable side by side. Badge has no size or shape axis. */
export const Variants: Story = {
  render: () => (
    <Group title="Tone">
      {tones.map((tone) => (
        <Cell key={tone} label={tone}>
          <Badge tone={tone}>{tone === 'error' ? '-1' : tone === 'success' ? '+1' : '1'}</Badge>
        </Cell>
      ))}
    </Group>
  ),
};

/** How Badge behaves with realistic content, and inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Content length">
        <Cell label="1 digit">
          <Badge>1</Badge>
        </Cell>
        <Cell label="2 digits">
          <Badge>12</Badge>
        </Cell>
        <Cell label="Positive delta">
          <Badge tone="success">+1</Badge>
        </Cell>
        <Cell label="Negative delta">
          <Badge tone="error">-1</Badge>
        </Cell>
      </Group>

      <Group title="With ariaLabel (count needs context)">
        <Cell label="Visible '1', announced fully">
          <Badge ariaLabel="1 unread notification">1</Badge>
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          In composition
        </h3>
        <div style={row}>
          <div style={cardStyle}>
            <span>Unread notifications</span>
            <div style={row}>
              <Badge ariaLabel="1 unread notification">1</Badge>
              <Badge tone="brand">1</Badge>
            </div>
          </div>

          <div style={cardStyle}>
            <span>Score deltas</span>
            <div style={row}>
              <Badge tone="success">+1</Badge>
              <Badge tone="error">-1</Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Content beyond the recommended 1-4 characters">
        <Cell label="Recommended max">
          <Badge>99+</Badge>
        </Cell>
        <Cell label="Long number (overflows, does not wrap)">
          <Badge>184320</Badge>
        </Cell>
        <Cell label="Word instead of a number (discouraged)">
          <Badge tone="brand">NEW</Badge>
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Narrow container
        </h3>
        <p style={captionStyle}>
          Badge does not wrap or shrink its text - a long value inside a narrow container overflows
          visibly rather than truncating silently.
        </p>
        <div
          style={{
            inlineSize: '32px',
            padding: 'var(--spacing-xs)',
            border: 'var(--border-width-sm) dashed var(--color-border-default)',
            borderRadius: 'var(--border-radius-sm)',
            overflow: 'hidden',
          }}
        >
          <Badge tone="brand">184320</Badge>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Dark surface
        </h3>
        <div
          data-theme="dark"
          style={{
            ...row,
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-elevation-surface-default)',
          }}
        >
          <Badge>1</Badge>
          <Badge tone="brand">1</Badge>
        </div>
      </section>
    </div>
  ),
};
