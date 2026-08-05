import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from '../text-field';
import { InlineEdit } from './inline-edit';

const meta = {
  title: 'UI/Molecules/Inline Edit',
  component: InlineEdit,
  args: {
    value: 'Q3 Planning',
    actionButtons: true,
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    children: <TextField appearance="subtle" aria-label="Title" />,
  },
  argTypes: {
    value: { control: 'text' },
    actionButtons: { control: 'boolean' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    children: { control: false },
    onConfirm: { control: false },
    onCancel: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof InlineEdit>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-lg)',
};

const fieldStyle: CSSProperties = { inlineSize: '240px' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
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

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'start' }}>
      <div style={fieldStyle}>{children}</div>
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

/**
 * Prop exploration. Click the field (or Tab to it) to start editing - Inline Edit has no static
 * "always showing confirm/cancel" state, since real usage always starts read-only.
 */
export const Playground: Story = {};

/** A real, fully working example - click the value, edit it, then confirm or cancel. */
function LiveInlineEditExample({ actionButtons = true }: { actionButtons?: boolean }) {
  const [value, setValue] = useState('Q3 Planning');

  return (
    <InlineEdit value={value} actionButtons={actionButtons} onConfirm={setValue}>
      <TextField appearance="subtle" aria-label="Title" />
    </InlineEdit>
  );
}

/**
 * `actionButtons=false` still supports Enter to confirm and Escape to cancel once editing starts -
 * both cells are wired to real state so confirming/canceling is visibly reflected in the field.
 */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Default (click or Tab into the field to edit)">
        <Cell label="actionButtons=true (default)">
          <LiveInlineEditExample />
        </Cell>
        <Cell label="actionButtons=false (Enter/Escape only, once editing)">
          <LiveInlineEditExample actionButtons={false} />
        </Cell>
      </Group>
    </div>
  ),
};

/** How Inline Edit behaves inside a realistic composition. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Live - click the value, edit it, then confirm or cancel">
        <Cell label="Interactive">
          <LiveInlineEditExample />
        </Cell>
      </Group>

      <Group title="Sizes">
        <Cell label="sm">
          <InlineEdit value="Q3 Planning">
            <TextField appearance="subtle" size="sm" aria-label="Title" />
          </InlineEdit>
        </Cell>
        <Cell label="md (default)">
          <InlineEdit value="Q3 Planning">
            <TextField appearance="subtle" aria-label="Title" />
          </InlineEdit>
        </Cell>
      </Group>

      <Group title="Custom action labels">
        <Cell label="confirmLabel / cancelLabel">
          <InlineEdit value="Q3 Planning" confirmLabel="Save title" cancelLabel="Discard changes">
            <TextField appearance="subtle" aria-label="Title" />
          </InlineEdit>
        </Cell>
      </Group>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Long value in a narrow container">
        <div style={{ inlineSize: '160px' }}>
          <InlineEdit value="A value longer than the field can comfortably show">
            <TextField appearance="subtle" aria-label="Title" />
          </InlineEdit>
        </div>
      </Group>

      <Group title="Fills its container">
        <div style={{ inlineSize: '100%' }}>
          <InlineEdit value="Full width">
            <TextField appearance="subtle" aria-label="Title" />
          </InlineEdit>
        </div>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div data-theme="dark" style={cardStyle}>
          <div style={row}>
            <div style={fieldStyle}>
              <InlineEdit value="Q3 Planning">
                <TextField appearance="subtle" aria-label="Title" />
              </InlineEdit>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};
