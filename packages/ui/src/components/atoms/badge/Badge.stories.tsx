import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Atoms/Badge',
  component: Badge,
  args: {
    children: '1',
    tone: 'default',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'inverse', 'brand', 'success', 'error'],
    },
    ariaLabel: { control: 'text' },
    className: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Inverse: Story = {
  args: {
    tone: 'inverse',
    children: '+1',
  },
};

export const Brand: Story = {
  args: {
    tone: 'brand',
    children: '1',
  },
};

export const Success: Story = {
  args: {
    tone: 'success',
    children: '+1',
  },
};

export const Error: Story = {
  args: {
    tone: 'error',
    children: '-1',
  },
};
