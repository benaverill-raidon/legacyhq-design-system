import type { CSSProperties } from 'react';
import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from './Logo';
import type { LogoSize, LogoType } from './Logo.types';

const types: LogoType[] = ['mark', 'wordmark', 'full'];
const sizes: LogoSize[] = ['xxs', 'xs', 'sm', 'md', 'lg'];

const meta: Meta<typeof Logo> = {
  title: 'UI/Primitives/Logo',
  component: Logo,
  args: {
    type: 'full',
    size: 'md',
    decorative: false,
    title: 'LegacyHQ',
  },
  argTypes: {
    type: { control: 'radio', options: types },
    size: { control: 'radio', options: sizes },
    decorative: { control: 'boolean' },
    title: { control: 'text' },
    ariaLabel: { control: 'text' },
    className: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Logo is the approved LegacyHQ brand primitive. Preserve aspect ratio, clear space, approved colors, and avoid stretching, cropping, rotation, shadows, effects, or manual wordmark recreation.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Logo>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const matrixStyle = {
  display: 'grid',
  gridTemplateColumns: 'max-content repeat(3, minmax(120px, max-content))',
  gap: 'var(--spacing-150) var(--spacing-300)',
  alignItems: 'center',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-150)',
  flexWrap: 'wrap',
} satisfies CSSProperties;

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--spacing-200)',
  paddingBlock: 'var(--spacing-100)',
  paddingInline: 'var(--spacing-150)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const navStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  padding: 'var(--spacing-100)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-raised-default)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const surfaceStyle = {
  display: 'grid',
  gap: 'var(--spacing-150)',
  padding: 'var(--spacing-200)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const darkSurfaceStyle = {
  ...surfaceStyle,
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

const linkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  color: 'inherit',
  textDecoration: 'none',
} satisfies CSSProperties;

const mutedTextStyle = {
  color: 'var(--color-content-subtle)',
} satisfies CSSProperties;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={matrixStyle}>
      <span style={mutedTextStyle}>Size</span>
      {types.map((type) => (
        <span key={type} style={mutedTextStyle}>
          {type}
        </span>
      ))}
      {sizes.map((size) => (
        <Fragment key={size}>
          <span style={mutedTextStyle}>
            {size}
          </span>
          {types.map((type) => (
            <Logo key={`${size}-${type}`} type={type} size={size} title={`LegacyHQ ${type}`} />
          ))}
        </Fragment>
      ))}
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <header style={headerStyle}>
        <a href="/" aria-label="LegacyHQ home" style={linkStyle}>
          <Logo decorative type="full" size="md" />
        </a>
        <span style={mutedTextStyle}>Workspace</span>
      </header>

      <nav style={navStyle} aria-label="Compact navigation">
        <a href="/" aria-label="LegacyHQ home" style={linkStyle}>
          <Logo decorative type="mark" size="sm" />
        </a>
      </nav>

      <div style={rowStyle}>
        <div style={surfaceStyle}>
          <Logo type="full" size="md" title="LegacyHQ" />
        </div>
        <div data-theme="dark" style={darkSurfaceStyle}>
          <Logo type="full" size="md" title="LegacyHQ" />
        </div>
      </div>
    </div>
  ),
};
