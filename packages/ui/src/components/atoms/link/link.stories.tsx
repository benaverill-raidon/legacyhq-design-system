import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './link';

const meta: Meta<typeof Link> = {
  title: 'UI/Atoms/Link',
  component: Link,
  args: {
    href: '/clients',
    target: '_self',
    appearance: 'default',
    size: 'md',
    children: 'Link',
  },
  argTypes: {
    href: { control: 'text' },
    target: { control: 'inline-radio', options: ['_self', '_blank'] },
    appearance: { control: 'inline-radio', options: ['default', 'subtle', 'inverse'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    children: { control: 'text' },
    className: { control: false },
    rel: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Link>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-200)',
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

const paragraphStyle = {
  margin: 'var(--spacing-0)',
  color: 'var(--color-content-default)',
  fontFamily: 'var(--typography-body-md-font-family)',
  fontSize: 'var(--typography-body-md-font-size)',
  fontWeight: 'var(--typography-body-md-font-weight)',
  lineHeight: 'var(--typography-body-md-line-height)',
} satisfies CSSProperties;

const noteStyle = {
  ...paragraphStyle,
  color: 'var(--color-content-subtle)',
} satisfies CSSProperties;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Link href="/clients" appearance="default">
          Default
        </Link>
        <Link href="/clients" appearance="subtle">
          Subtle
        </Link>
        <span data-theme="dark" style={darkSurfaceStyle}>
          <Link href="/clients" appearance="inverse">
            Inverse
          </Link>
        </span>
      </div>

      <div style={rowStyle}>
        <Link href="/clients" size="sm">
          Small
        </Link>
        <Link href="/clients" size="md">
          Medium
        </Link>
      </div>

      <div style={rowStyle}>
        <Link href="/clients" target="_self">
          Self target
        </Link>
        <Link href="https://example.com" target="_blank">
          Blank target
        </Link>
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <p style={paragraphStyle}>
          Review the <Link href="/clients">client profile</Link> before creating the engagement letter.
        </p>
      </div>

      <div style={cardStyle}>
        <Link href="https://example.com" target="_blank">
          External website
        </Link>
        <Link href="/supporting-documents" appearance="subtle">
          Supporting documents
        </Link>
      </div>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <Link href="/client-portal" appearance="inverse">
          Client portal
        </Link>
        <Link href="https://example.com" target="_blank" appearance="inverse">
          External portal
        </Link>
      </div>

      <div style={cardStyle}>
        <Link href="/visited-documentation">Visited link documentation</Link>
        <p style={noteStyle}>
          Visited color is handled by native browser history through <code>:visited</code>; hover and press add the
          underline.
        </p>
      </div>
    </div>
  ),
};
