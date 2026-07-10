import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRightIcon, CheckIcon, CloseIcon } from '../../../assets/icons';
import { LinkButton } from './link-button';

const meta: Meta<typeof LinkButton> = {
  title: 'UI/Atoms/Link Button',
  component: LinkButton,
  args: {
    href: '/clients',
    children: 'Open client',
    appearance: 'default',
    tone: 'neutral',
    size: 'md',
    isDisabled: false,
    isLoading: false,
    target: '_self',
  },
  argTypes: {
    href: { control: 'text' },
    children: { control: 'text' },
    appearance: { control: 'inline-radio', options: ['default', 'primary', 'subtle'] },
    tone: { control: 'inline-radio', options: ['neutral', 'warning', 'error', 'discovery'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    isDisabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    target: { control: 'inline-radio', options: ['_self', '_blank'] },
    iconBefore: { control: false },
    iconAfter: { control: false },
    className: { control: false },
    onClick: { control: false },
    rel: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof LinkButton>;

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

function ControlledLinkPreview() {
  const [count, setCount] = React.useState(0);

  return (
    <LinkButton
      href="#preview"
      onClick={(event) => {
        event.preventDefault();
        setCount((current) => current + 1);
      }}
    >
      Preview clicks {count}
    </LinkButton>
  );
}

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <LinkButton href="/clients" size="xs">
          XS
        </LinkButton>
        <LinkButton href="/clients" size="sm">
          SM
        </LinkButton>
        <LinkButton href="/clients" size="md">
          MD
        </LinkButton>
        <LinkButton href="/clients" size="lg">
          LG
        </LinkButton>
      </div>

      <div style={rowStyle}>
        <LinkButton href="/clients" appearance="default">
          Default
        </LinkButton>
        <LinkButton href="/clients" appearance="subtle">
          Subtle
        </LinkButton>
        <LinkButton href="/clients" appearance="primary" tone="neutral">
          Primary brand
        </LinkButton>
        <LinkButton href="/clients" appearance="primary" tone="warning">
          Primary warning
        </LinkButton>
        <LinkButton href="/clients" appearance="primary" tone="error">
          Primary error
        </LinkButton>
        <LinkButton href="/clients" appearance="primary" tone="discovery">
          Primary discovery
        </LinkButton>
      </div>

      <div style={rowStyle}>
        <LinkButton href="/clients" iconBefore={<CheckIcon />}>
          Icon before
        </LinkButton>
        <LinkButton href="/clients" iconAfter={<ArrowRightIcon />}>
          Icon after
        </LinkButton>
        <LinkButton href="/clients" isLoading iconBefore={<CheckIcon />}>
          Loading
        </LinkButton>
        <LinkButton href="/clients" isDisabled>
          Disabled
        </LinkButton>
        <LinkButton href="/clients" autoFocus>
          Focused
        </LinkButton>
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <div style={rowStyle}>
          <LinkButton href="/clients">Internal navigation</LinkButton>
          <LinkButton href="#billing" appearance="subtle">
            In-page anchor
          </LinkButton>
          <LinkButton href="https://example.com" target="_blank" iconAfter={<ArrowRightIcon />}>
            External website
          </LinkButton>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <LinkButton href="/clients" iconBefore={<CheckIcon />}>
            Icon before
          </LinkButton>
          <LinkButton href="/clients" iconAfter={<ArrowRightIcon />}>
            Icon after
          </LinkButton>
          <LinkButton href="/clients" isLoading iconBefore={<CheckIcon />}>
            Loading
          </LinkButton>
          <LinkButton href="/clients" isDisabled iconAfter={<CloseIcon />}>
            Disabled
          </LinkButton>
        </div>
      </div>

      <div style={cardStyle}>
        <ControlledLinkPreview />
      </div>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <div style={rowStyle}>
          <LinkButton href="/clients">Dark default</LinkButton>
          <LinkButton href="/clients" appearance="primary">
            Dark primary
          </LinkButton>
          <LinkButton href="/clients" appearance="subtle">
            Dark subtle
          </LinkButton>
        </div>
      </div>
    </div>
  ),
};
