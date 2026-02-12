import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: {
    appearance: 'default',
    spacing: 'default',
    selected: false,
    disabled: false,
    loading: false,
    children: 'Button',
  },
  argTypes: {
    appearance: { control: 'select', options: ['default', 'primary', 'subtle', 'warning', 'danger'] },
    spacing: { control: 'radio', options: ['default', 'compact'] },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    iconBefore: { control: false },
    iconAfter: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

const DemoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path d="M8 1.5l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 12.7 3.8 14.5l.8-4.7L1.2 6.5l4.7-.7L8 1.5z" fill="currentColor" />
  </svg>
);

export const Controls: Story = {};

export const WithIcons: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button {...args} iconBefore={<DemoIcon />} />
      <Button {...args} iconAfter={<DemoIcon />} />
      <Button {...args} iconBefore={<DemoIcon />} iconAfter={<DemoIcon />} />
    </div>
  ),
};

export const Appearances: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button {...args} appearance="default">Default</Button>
      <Button {...args} appearance="primary">Primary</Button>
      <Button {...args} appearance="subtle">Subtle</Button>
      <Button {...args} appearance="warning">Warning</Button>
      <Button {...args} appearance="danger">Danger</Button>
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button {...args}>Default</Button>
        <Button {...args} selected>Selected</Button>
        <Button {...args} disabled>Disabled</Button>
        <Button {...args} loading>Loading</Button>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button {...args} appearance="primary">Primary</Button>
        <Button {...args} appearance="primary" selected>Primary Selected</Button>
        <Button {...args} appearance="primary" disabled>Primary Disabled</Button>
        <Button {...args} appearance="primary" loading>Primary Loading</Button>
      </div>
    </div>
  ),
};
