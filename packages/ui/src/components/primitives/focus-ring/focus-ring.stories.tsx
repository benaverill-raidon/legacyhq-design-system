import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FocusRing } from './focus-ring';
import styles from './focus-ring.module.css';

const meta: Meta<typeof FocusRing> = {
  title: 'UI/Primitives/Focus Ring',
  component: FocusRing,
  args: {
    borderWidth: 'default',
  },
  argTypes: {
    borderWidth: {
      control: 'radio',
      options: ['default', 'compact'],
    },
    className: { control: false },
    children: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof FocusRing>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-150)',
  justifyItems: 'start',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  flexWrap: 'wrap',
} satisfies CSSProperties;

const buttonStyle = {
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-background-neutral-default)',
  color: 'var(--color-content-default)',
  padding: 'var(--spacing-050) var(--spacing-100)',
  font: 'inherit',
} satisfies CSSProperties;

const inputStyle = {
  border: 'var(--border-width-default) solid var(--color-border-input)',
  borderRadius: 'var(--border-radius-sm)',
  background: 'var(--color-background-input-default)',
  color: 'var(--color-content-default)',
  padding: 'var(--spacing-050) var(--spacing-100)',
  font: 'inherit',
} satisfies CSSProperties;

const surfaceStyle = {
  display: 'grid',
  gap: 'var(--spacing-150)',
  padding: 'var(--spacing-200)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const darkSurfaceStyle = {
  ...surfaceStyle,
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

export const Playground: Story = {
  render: (args) => (
    <FocusRing {...args}>
      <button type="button" style={buttonStyle}>
        Button
      </button>
    </FocusRing>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={rowStyle}>
      <FocusRing borderWidth="default">
        <button type="button" style={buttonStyle}>
          Default
        </button>
      </FocusRing>
      <FocusRing borderWidth="compact">
        <button type="button" style={buttonStyle}>
          Compact
        </button>
      </FocusRing>
    </div>
  ),
};

export const Examples: Story = {
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
          <span>Label</span>
        </label>
        <input className={`${styles.focusRing} ${styles.focusRingDefault}`} placeholder="Placeholder" style={inputStyle} />
      </div>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <FocusRing>
          <button type="button" style={buttonStyle}>
            Button
          </button>
        </FocusRing>
        <label style={rowStyle}>
          <input className={`${styles.focusRing} ${styles.focusRingCompact}`} type="checkbox" />
          <span>Label</span>
        </label>
        <input className={`${styles.focusRing} ${styles.focusRingDefault}`} placeholder="Placeholder" style={inputStyle} />
      </div>
    </div>
  ),
};
