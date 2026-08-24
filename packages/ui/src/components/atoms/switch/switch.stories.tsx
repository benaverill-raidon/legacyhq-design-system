import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './switch';
import type { SwitchSize } from './switch.types';

const sizes: SwitchSize[] = ['md', 'sm'];

const meta = {
  title: 'UI/Atoms/Switch',
  component: Switch,
  args: {
    label: 'Label',
  },
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    showIcons: { control: 'boolean' },
    label: { control: 'text' },
    className: { control: false },
    onCheckedChange: { control: false },
  },
} satisfies Meta<typeof Switch>;

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

const darkSurfaceStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
};

const settingRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--spacing-lg)',
};

const settingTextStyle: CSSProperties = { display: 'grid', gap: 'var(--spacing-xxs)' };

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

/** `size` is the only variant-like axis - track thickness, thumb, and travel distance all scale together. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Unchecked">
        {sizes.map((size) => (
          <Cell key={size} label={size}>
            <Switch aria-label={`${size} unchecked`} size={size} />
          </Cell>
        ))}
      </Group>
      <Group title="Checked">
        {sizes.map((size) => (
          <Cell key={size} label={size}>
            <Switch aria-label={`${size} checked`} size={size} defaultChecked />
          </Cell>
        ))}
      </Group>
    </div>
  ),
};

function LiveToggleExample() {
  const [enabled, setEnabled] = React.useState(true);

  return <Switch label="Auto-archive closed matters" checked={enabled} onCheckedChange={setEnabled} />;
}

/**
 * Interaction and system states, crossed with checked. `data-force-state` mirrors the adjacent
 * pseudo-class so hover/press render as a static regression reference (documentation-only, not
 * part of the public API); focus preview instead uses the shared Focus Ring primitive's own
 * `data-force-state="focus"` support on the input. Loading blocks toggling and announces
 * `aria-busy`, but stays focusable - unlike disabled, which removes it from the tab order - see the
 * Live group to verify both by hand.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Unchecked">
        <Cell label="Default">
          <Switch label="Label" />
        </Cell>
        <Cell label="Hover">
          <Switch label="Label" data-force-state="hover" />
        </Cell>
        <Cell label="Focus visible">
          <Switch label="Label" data-force-state="focus" />
        </Cell>
        <Cell label="Press">
          <Switch label="Label" data-force-state="press" />
        </Cell>
        <Cell label="Disabled">
          <Switch label="Label" disabled />
        </Cell>
        <Cell label="Loading">
          <Switch label="Label" isLoading />
        </Cell>
      </Group>

      <Group title="Checked">
        <Cell label="Default">
          <Switch label="Label" defaultChecked />
        </Cell>
        <Cell label="Hover">
          <Switch label="Label" defaultChecked data-force-state="hover" />
        </Cell>
        <Cell label="Focus visible">
          <Switch label="Label" defaultChecked data-force-state="focus" />
        </Cell>
        <Cell label="Press">
          <Switch label="Label" defaultChecked data-force-state="press" />
        </Cell>
        <Cell label="Disabled">
          <Switch label="Label" defaultChecked disabled />
        </Cell>
        <Cell label="Loading">
          <Switch label="Label" defaultChecked isLoading />
        </Cell>
      </Group>

      <Group title="Required">
        <Cell label="Required">
          <Switch label="Label" required />
        </Cell>
      </Group>

      <Group title="Icons hidden (showIcons=false) - independent of loading">
        <Cell label="Unchecked">
          <Switch label="Label" showIcons={false} />
        </Cell>
        <Cell label="Checked">
          <Switch label="Label" defaultChecked showIcons={false} />
        </Cell>
        <Cell label="Loading (Spinner still shows)">
          <Switch label="Label" defaultChecked isLoading showIcons={false} />
        </Cell>
      </Group>

      <Group title="Live - click, tab to, and toggle this">
        <LiveToggleExample />
      </Group>
    </div>
  ),
};

/** How Switch behaves with realistic content and inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Label content">
        <Cell label="Standard label">
          <Switch label="Email notifications" defaultChecked />
        </Cell>
        <Cell label="No visible label (aria-label only)">
          <Switch aria-label="Enable standalone setting" />
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>In composition</h3>

        <div style={cardStyle}>
          <Switch label="Email notifications" defaultChecked />
          <Switch label="Compact notification summary" size="sm" />
        </div>

        <div style={cardStyle}>
          <div style={settingRowStyle}>
            <div style={settingTextStyle}>
              <strong>Smart reminders</strong>
              <span style={captionStyle}>Suggest follow-ups for active matters.</span>
            </div>
            <Switch aria-label="Smart reminders" defaultChecked />
          </div>
          <div style={settingRowStyle}>
            <div style={settingTextStyle}>
              <strong>External sharing</strong>
              <span style={captionStyle}>Allow client-visible document links.</span>
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
          <Switch label="Syncing calendar" isLoading defaultChecked />
          <Switch label="Locked setting" disabled />
        </div>

        <div data-theme="dark" style={darkSurfaceStyle}>
          <Switch label="Dark surface unchecked" />
          <Switch label="Dark surface checked" defaultChecked />
        </div>
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Reduced motion</h3>
        <p style={captionStyle}>
          <code>prefers-reduced-motion: reduce</code> follows the user&apos;s system preference and
          removes the thumb&apos;s slide/press animation - toggle it from your OS or browser accessibility
          settings against this example.
        </p>
        <Switch label="Motion-aware switch" defaultChecked />
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Long label wraps in a narrow container</h3>
        <p style={captionStyle}>
          The control stays anchored to the first line of a wrapped label rather than shrinking.
        </p>
        <div
          style={{
            inlineSize: '160px',
            padding: 'var(--spacing-sm)',
            border: 'var(--border-width-sm) dashed var(--color-border-default)',
            borderRadius: 'var(--border-radius-sm)',
          }}
        >
          <Switch label="Notify every assigned reviewer whenever this matter changes status" />
        </div>
      </section>
    </div>
  ),
};
