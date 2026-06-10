import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './toggle';

const meta: Meta<typeof Toggle> = {
  title: 'UI/Atoms/Toggle',
  component: Toggle,
  args: {
    label: 'Label',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
    className: { control: false },
    onCheckedChange: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Toggle>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-300)',
} satisfies CSSProperties;

const cardStyle = {
  display: 'grid',
  gap: 'var(--spacing-150)',
  padding: 'var(--spacing-200)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const darkSurfaceStyle = {
  display: 'grid',
  gap: 'var(--spacing-150)',
  padding: 'var(--spacing-200)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

const settingRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--spacing-200)',
} satisfies CSSProperties;

const settingTextStyle = {
  display: 'grid',
  gap: 'var(--spacing-025)',
} satisfies CSSProperties;

const subtleTextStyle = {
  color: 'var(--color-content-subtle)',
} satisfies CSSProperties;

function ControlledToggleExample() {
  const [enabled, setEnabled] = React.useState(true);

  return <Toggle label="Auto-archive closed matters" checked={enabled} onCheckedChange={setEnabled} />;
}

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Toggle label="Unchecked md" />
        <Toggle label="Checked md" defaultChecked />
        <Toggle label="Focused md" autoFocus />
      </div>

      <div style={rowStyle}>
        <Toggle label="Unchecked sm" size="sm" />
        <Toggle label="Checked sm" size="sm" defaultChecked />
        <Toggle label="Required sm" size="sm" required />
      </div>

      <div style={rowStyle}>
        <Toggle label="Disabled md" disabled />
        <Toggle label="Disabled checked md" disabled defaultChecked />
        <Toggle label="Required md" required />
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <Toggle aria-label="Enable standalone setting" defaultChecked />
      </div>

      <div style={cardStyle}>
        <Toggle label="Email notifications" defaultChecked />
        <Toggle label="Compact notification summary" size="sm" />
      </div>

      <div style={cardStyle}>
        <div style={settingRowStyle}>
          <div style={settingTextStyle}>
            <strong>Smart reminders</strong>
            <span style={subtleTextStyle}>Suggest follow-ups for active matters.</span>
          </div>
          <Toggle aria-label="Smart reminders" defaultChecked />
        </div>
        <div style={settingRowStyle}>
          <div style={settingTextStyle}>
            <strong>External sharing</strong>
            <span style={subtleTextStyle}>Allow client-visible document links.</span>
          </div>
          <Toggle aria-label="External sharing" />
        </div>
      </div>

      <form style={cardStyle}>
        <Toggle label="Include archived matters" name="includeArchived" value="yes" />
        <Toggle label="Required preference" name="requiredPreference" required />
        <button type="submit">Save preferences</button>
      </form>

      <div style={cardStyle}>
        <ControlledToggleExample />
        <Toggle label="Locked setting" disabled />
      </div>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <Toggle label="Dark surface unchecked" />
        <Toggle label="Dark surface checked" defaultChecked />
      </div>

      <div style={cardStyle}>
        <span style={subtleTextStyle}>Reduced motion follows the user's system preference.</span>
        <Toggle label="Motion-aware toggle" defaultChecked />
      </div>
    </div>
  ),
};
