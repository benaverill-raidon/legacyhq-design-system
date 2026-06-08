import type { Meta, StoryObj } from '@storybook/react';
import { FocusRing } from './focus-ring';
import styles from './focus-ring.module.css';

const meta: Meta<typeof FocusRing> = {
  title: 'UI/Primitives/Focus Ring',
  component: FocusRing,
  args: {
    borderWidth: 'default',
    disabled: false,
  },
  argTypes: {
    borderWidth: {
      control: 'radio',
      options: ['default', 'compact'],
    },
    disabled: { control: 'boolean' },
    className: { control: false },
    children: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof FocusRing>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-100)',
  justifyItems: 'start',
} satisfies React.CSSProperties;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  flexWrap: 'wrap',
} satisfies React.CSSProperties;

const buttonStyle = {
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-background-neutral-default)',
  color: 'var(--color-content-default)',
  padding: 'var(--spacing-050) var(--spacing-100)',
  font: 'inherit',
} satisfies React.CSSProperties;

const inputStyle = {
  border: 'var(--border-width-default) solid var(--color-border-input)',
  borderRadius: 'var(--border-radius-sm)',
  background: 'var(--color-background-input-default)',
  color: 'var(--color-content-default)',
  padding: 'var(--spacing-050) var(--spacing-100)',
  font: 'inherit',
} satisfies React.CSSProperties;

const surfaceStyle = {
  display: 'grid',
  gap: 'var(--spacing-150)',
  padding: 'var(--spacing-200)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
} satisfies React.CSSProperties;

export const Basic: Story = {
  render: (args) => (
    <FocusRing {...args}>
      <button type="button" style={buttonStyle}>
        Button
      </button>
    </FocusRing>
  ),
};

export const Default: Story = {
  args: {
    borderWidth: 'default',
  },
  render: (args) => (
    <FocusRing {...args}>
      <button type="button" style={buttonStyle}>
        Default
      </button>
    </FocusRing>
  ),
};

export const Compact: Story = {
  args: {
    borderWidth: 'compact',
  },
  render: (args) => (
    <FocusRing {...args}>
      <button type="button" style={buttonStyle}>
        Compact
      </button>
    </FocusRing>
  ),
};

export const Examples: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <FocusRing>
          <button type="button" style={buttonStyle}>
            Button
          </button>
        </FocusRing>
        <label style={rowStyle}>
          <input className={`${styles.focusRing} ${styles.focusRingCompact}`} type="checkbox" />
          <span style={{ color: 'var(--color-content-default)' }}>Label</span>
        </label>
        <input className={`${styles.focusRing} ${styles.focusRingDefault}`} placeholder="Placeholder" style={inputStyle} />
      </div>
      <div data-theme="dark" style={surfaceStyle}>
        <div style={stackStyle}>
          <FocusRing>
            <button type="button" style={buttonStyle}>
              Button
            </button>
          </FocusRing>
          <label style={rowStyle}>
            <input className={`${styles.focusRing} ${styles.focusRingCompact}`} type="checkbox" />
            <span style={{ color: 'var(--color-content-default)' }}>Label</span>
          </label>
          <input className={`${styles.focusRing} ${styles.focusRingDefault}`} placeholder="Placeholder" style={inputStyle} />
        </div>
      </div>
    </div>
  ),
};
