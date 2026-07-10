import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Avatar } from './avatar';

const sampleImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="#ccecff" />
      <circle cx="40" cy="30" r="16" fill="#4a91ba" />
      <path d="M16 68c4-13 17-20 24-20s20 7 24 20" fill="#4a91ba" />
    </svg>
  `);

const meta = {
  title: 'UI/Atoms/Avatar',
  component: Avatar,
  args: {
    size: 'md',
    name: 'Ben Averill',
    presence: 'none',
    status: 'none',
    isSelected: false,
    isDisabled: false,
    isInteractive: false,
    decorative: false,
  },
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    name: { control: 'text' },
    presence: {
      control: 'select',
      options: ['none', 'online', 'offline', 'busy'],
    },
    status: {
      control: 'select',
      options: ['none', 'accepted', 'declined'],
    },
    onClick: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Avatar size="xxs" name="XXS avatar" />
        <Avatar size="xs" name="XS avatar" presence="online" />
        <Avatar size="sm" name="SM avatar" presence="busy" />
        <Avatar size="md" name="MD avatar" presence="offline" />
        <Avatar size="lg" name="LG avatar" status="declined" />
        <Avatar size="xl" name="XL avatar" status="accepted" />
        <Avatar size="xxl" name="XXL avatar" status="accepted" />
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'end', flexWrap: 'wrap' }}>
        <Avatar size="lg" name="LG accepted" status="accepted" />
        <Avatar size="xxl" name="XXL accepted" status="accepted" />
        <Avatar size="lg" name="LG declined" status="declined" />
        <Avatar size="xxl" name="XXL declined" status="declined" />
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Avatar name="Fallback" />
        <Avatar name="Image avatar" src={sampleImage} />
        <Avatar name="Selected" isSelected isInteractive onClick={() => undefined} />
        <Avatar name="Disabled" isDisabled isInteractive onClick={() => undefined} />
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Avatar name="Online" presence="online" />
        <Avatar name="Offline" presence="offline" />
        <Avatar name="Busy" presence="busy" />
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Avatar name="Accepted" status="accepted" />
        <Avatar name="Declined" status="declined" />
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => {
    const [selected, setSelected] = React.useState(false);

    return (
      <div style={{ display: 'grid', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar src={sampleImage} name="Image avatar" />
          <Avatar src={sampleImage} name="Accepted image avatar" status="accepted" />
          <Avatar name="Fallback avatar" presence="online" />
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar
            name={selected ? 'Selected Ben Averill' : 'Ben Averill'}
            isInteractive
            isSelected={selected}
            presence="busy"
            onClick={() => setSelected((value) => !value)}
          />
          <Avatar
            src={sampleImage}
            name="Ben Averill"
            isInteractive
            status="declined"
            onClick={() => undefined}
          />
          <Avatar name="Disabled" isDisabled isInteractive onClick={() => undefined} />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--color-neutral-dark-solid-0)',
          }}
          data-theme="dark"
        >
          <Avatar name="Dark fallback" presence="online" />
          <Avatar src={sampleImage} name="Dark image" status="accepted" />
          <Avatar name="Dark selected" isInteractive isSelected onClick={() => undefined} />
        </div>
      </div>
    );
  },
};
