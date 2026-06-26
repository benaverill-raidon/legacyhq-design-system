import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './switch';

const meta: Meta<typeof Switch> = {
  title: 'UI/Atoms/Switch',
  component: Switch,
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

type Story = StoryObj<typeof Switch>;

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

function ControlledSwitchExample() {
  const [enabled, setEnabled] = React.useState(true);

  return <Switch label="Auto-archive closed matters" checked={enabled} onCheckedChange={setEnabled} />;
}

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Switch label="Unchecked md" />
        <Switch label="Checked md" defaultChecked />
        <Switch label="Focused md" autoFocus />
      </div>

      <div style={rowStyle}>
        <Switch label="Unchecked sm" size="sm" />
        <Switch label="Checked sm" size="sm" defaultChecked />
        <Switch label="Required sm" size="sm" required />
      </div>

      <div style={rowStyle}>
        <Switch label="Disabled md" disabled />
        <Switch label="Disabled checked md" disabled defaultChecked />
        <Switch label="Required md" required />
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <Switch aria-label="Enable standalone setting" defaultChecked />
      </div>

      <div style={cardStyle}>
        <Switch label="Email notifications" defaultChecked />
        <Switch label="Compact notification summary" size="sm" />
      </div>

      <div style={cardStyle}>
        <div style={settingRowStyle}>
          <div style={settingTextStyle}>
            <strong>Smart reminders</strong>
            <span style={subtleTextStyle}>Suggest follow-ups for active matters.</span>
          </div>
          <Switch aria-label="Smart reminders" defaultChecked />
        </div>
        <div style={settingRowStyle}>
          <div style={settingTextStyle}>
            <strong>External sharing</strong>
            <span style={subtleTextStyle}>Allow client-visible document links.</span>
          </div>
          <Switch aria-label="External sharing" />
        </div>
      </div>

      <form style={cardStyle}>
        <Switch label="Include archived matters" name="includeArchived" value="yes" />
        <Switch label="Required preference" name="requiredPreference" required />
        <button type="submit">Save preferences</button>
      </form>

      <div style={cardStyle}>
        <ControlledSwitchExample />
        <Switch label="Locked setting" disabled />
      </div>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <Switch label="Dark surface unchecked" />
        <Switch label="Dark surface checked" defaultChecked />
      </div>

      <div style={cardStyle}>
        <span style={subtleTextStyle}>Reduced motion follows the user's system preference.</span>
        <Switch label="Motion-aware switch" defaultChecked />
      </div>
    </div>
  ),
};

