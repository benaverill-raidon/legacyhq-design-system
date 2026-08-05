import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../atoms/button';
import { Checkbox } from '../../atoms/checkbox';
import { Switch } from '../../atoms/switch';
import { FocusRing } from './focus-ring';

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
  gap: 'var(--spacing-md)',
  justifyItems: 'start',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  flexWrap: 'wrap',
} satisfies CSSProperties;

// `--color-elevation-surface-default` and `--color-content-default` are theme-relative - they
// already resolve to the correct light/dark value for whatever `[data-theme]` scope they're read
// in, so the "dark" variant below is the same style object under a `data-theme="dark"` wrapper,
// not a different set of tokens. (`--color-background-neutral-bold-default`, used elsewhere in
// this file previously, is a "boldest contrast for the current theme" token, not a fixed dark
// value - it flips to a near-white color under data-theme="dark", which is why that combination
// silently rendered as a light box instead of a dark one.)
const surfaceStyle = {
  display: 'grid',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

/**
 * Uses the real Button atom so the ring reads correctly against the rest of this system's
 * Storybook pages. Button already applies its own default-width focus classes internally; the
 * outer FocusRing here is purely to drive the borderWidth control for this demo - in real code,
 * Button is never wrapped in FocusRing (see Examples below for how it looks unwrapped).
 */
export const Playground: Story = {
  render: (args) => (
    <FocusRing {...args}>
      <Button>Custom control</Button>
    </FocusRing>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={rowStyle}>
      <FocusRing borderWidth="default">
        <Button>Default</Button>
      </FocusRing>
      <FocusRing borderWidth="compact">
        <Button>Compact</Button>
      </FocusRing>
    </div>
  ),
};

/**
 * Button, Checkbox, and Switch already consume Focus Ring internally (via `focusRingClassNames`),
 * so they're rendered here unwrapped - this shows the actual, real-world result of using Focus
 * Ring across the system's own atoms, in both light and dark themes, rather than a hand-rolled
 * approximation of what those atoms look like.
 */
export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Button>Save</Button>
        <Checkbox label="Label" />
        <Switch label="Notifications" />
      </div>

      <div data-theme="dark" style={surfaceStyle}>
        <div style={rowStyle}>
          <Button>Save</Button>
          <Checkbox label="Label" />
          <Switch label="Notifications" />
        </div>
      </div>
    </div>
  ),
};
