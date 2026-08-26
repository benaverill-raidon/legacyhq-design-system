import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InlineMessage } from './inline-message';
import type { InlineMessageTone } from './inline-message.types';

const tones: InlineMessageTone[] = ['default', 'info', 'success', 'warning', 'error', 'discovery'];

const meta = {
  title: 'UI/Molecules/Inline Message',
  component: InlineMessage,
  args: {
    title: 'Title',
    secondaryText: 'Secondary text',
    tone: 'info',
    content: 'Additional detail about this message goes here.',
  },
  argTypes: {
    title: { control: 'text' },
    secondaryText: { control: 'text' },
    tone: { control: 'inline-radio', options: tones },
    content: { control: 'text' },
    open: { control: false },
    defaultOpen: { control: false },
    onOpenChange: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof InlineMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)', color: 'var(--color-content-default)' };

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
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
};

const darkSurfaceStyle: CSSProperties = { ...cardStyle, background: 'var(--color-elevation-surface-default)' };

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      <div style={row}>{children}</div>
    </section>
  );
}

/** Prop exploration. Click the row to reveal the popup - every supported prop is wired to a control. */
export const Playground: Story = {};

/** Every tone. `default` falls back to a plain dot - Figma has no dedicated status icon for it either. */
export const Variants: Story = {
  render: () => (
    <div style={row}>
      {tones.map((tone) => (
        <InlineMessage
          key={tone}
          tone={tone}
          title="Title"
          secondaryText="Secondary text"
          content={`${tone} detail content.`}
        />
      ))}
    </div>
  ),
};

/** How Inline Message behaves with realistic content and compositions. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Title only, no secondary text">
        <InlineMessage title="Draft saved" tone="success" content="Your changes are saved automatically." />
      </Group>

      <Group title="Title and secondary text">
        <InlineMessage
          title="3 documents pending review"
          secondaryText="Last updated 2 hours ago"
          tone="warning"
          content="Review each document before the filing deadline on Friday."
        />
      </Group>

      <Group title="No content - a plain, non-interactive status row">
        <InlineMessage title="Synced" secondaryText="All changes saved" tone="success" />
      </Group>

      <div style={cardStyle}>
        <h3 style={headingStyle}>In a form</h3>
        <InlineMessage
          title="Password requirements not met"
          tone="error"
          content="Use at least 8 characters, including one number and one symbol."
        />
      </div>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Falls back automatically near a viewport edge</h3>
        <p style={captionStyle}>
          Inline Message always prefers `bottomLeft` and delegates viewport-fit fallback to Popup -
          click a row pinned to this row&apos;s edge to see it reposition on its own.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <InlineMessage title="Left edge" tone="info" content="Repositioned automatically near the left edge." />
          <InlineMessage title="Right edge" tone="info" content="Repositioned automatically near the right edge." />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Long detail content wraps inside Popup&apos;s default width</h3>
        <InlineMessage
          title="Migration in progress"
          tone="discovery"
          content="This matter is being migrated to the new document management system. Existing links and permissions are preserved, but search indexing may take up to 24 hours to catch up across every linked workspace."
        />
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div data-theme="dark" style={darkSurfaceStyle}>
          <div style={row}>
            <InlineMessage title="Dark surface" tone="info" content="Reads correctly on a dark surface." />
          </div>
        </div>
      </section>
    </div>
  ),
};
