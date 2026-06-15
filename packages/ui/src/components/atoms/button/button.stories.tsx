import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRightIcon, CheckIcon, CloseIcon } from '../../../assets/icons';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Atoms/Button',
  component: Button,
  args: {
    children: 'Save changes',
    appearance: 'default',
    tone: 'neutral',
    size: 'md',
    isDisabled: false,
    isLoading: false,
    isFullWidth: false,
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: ['default', 'primary', 'subtle'] },
    tone: { control: 'inline-radio', options: ['neutral', 'warning', 'error', 'discovery'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    isDisabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    isFullWidth: { control: 'boolean' },
    iconBefore: { control: false },
    iconAfter: { control: false },
    className: { control: false },
    onClick: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

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

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 'var(--spacing-150)',
  alignItems: 'start',
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
  ...cardStyle,
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

const footerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--spacing-100)',
} satisfies CSSProperties;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Button size="xs">XS</Button>
        <Button size="sm">SM</Button>
        <Button size="md">MD</Button>
        <Button size="lg">LG</Button>
      </div>

      <div style={rowStyle}>
        <Button appearance="default">Default</Button>
        <Button appearance="primary">Primary</Button>
        <Button appearance="subtle">Subtle</Button>
      </div>

      <div style={gridStyle}>
        <Button>Default neutral</Button>
        <Button appearance="subtle">Subtle neutral</Button>
        <Button appearance="primary" tone="neutral">
          Primary brand
        </Button>
        <Button appearance="primary" tone="warning">
          Primary warning
        </Button>
        <Button appearance="primary" tone="error">
          Primary error
        </Button>
        <Button appearance="primary" tone="discovery">
          Primary discovery
        </Button>
      </div>

      <div style={rowStyle}>
        <Button iconBefore={<CheckIcon />}>Icon before</Button>
        <Button iconAfter={<ArrowRightIcon />}>Icon after</Button>
        <Button iconBefore={<CheckIcon />} iconAfter={<ArrowRightIcon />}>
          Both icons
        </Button>
        <Button isLoading>Loading</Button>
        <Button isDisabled>Disabled</Button>
      </div>

      <Button isFullWidth>Full width</Button>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <div style={rowStyle}>
          <Button appearance="primary" iconBefore={<CheckIcon />}>
            Save changes
          </Button>
          <Button>Cancel</Button>
          <Button appearance="subtle">Preview</Button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <Button appearance="primary" tone="warning">
            Archive matter
          </Button>
          <Button appearance="primary" tone="error">
            Delete matter
          </Button>
          <Button appearance="primary" tone="discovery" iconAfter={<ArrowRightIcon />}>
            Explore setup
          </Button>
        </div>
      </div>

      <form style={cardStyle}>
        <label htmlFor="matter-name">Matter name</label>
        <input id="matter-name" name="matterName" />
        <div style={footerStyle}>
          <Button appearance="subtle" type="button" iconBefore={<CloseIcon />}>
            Cancel
          </Button>
          <Button appearance="primary" type="submit" isLoading>
            Save matter
          </Button>
        </div>
      </form>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <div style={rowStyle}>
          <Button>Dark default</Button>
          <Button appearance="primary">Dark primary</Button>
          <Button appearance="subtle">Dark subtle</Button>
        </div>
      </div>
    </div>
  ),
};
