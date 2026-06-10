import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './spinner';
import type { SpinnerSize } from './spinner.types';

const sizes: SpinnerSize[] = ['sm', 'md', 'lg', 'xl'];

const meta: Meta<typeof Spinner> = {
  title: 'UI/Atoms/Spinner',
  component: Spinner,
  args: {
    size: 'lg',
  },
  argTypes: {
    size: { control: 'radio', options: sizes },
    label: { control: 'text' },
    className: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

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

const exampleCardStyle = {
  display: 'grid',
  gap: 'var(--spacing-100)',
  padding: 'var(--spacing-200)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const darkSurfaceStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  padding: 'var(--spacing-200)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

const inlineTextStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-075)',
} satisfies CSSProperties;

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--spacing-075)',
  width: 'fit-content',
  paddingBlock: 'var(--spacing-075)',
  paddingInline: 'var(--spacing-150)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-raised-default)',
  color: 'var(--color-content-default)',
  font: 'inherit',
} satisfies CSSProperties;

const mutedTextStyle = {
  color: 'var(--color-content-subtle)',
} satisfies CSSProperties;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={rowStyle}>
      {sizes.map((size) => (
        <span key={size} style={inlineTextStyle}>
          <Spinner size={size} />
          {size}
        </span>
      ))}
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={exampleCardStyle}>
        <strong>Default loading</strong>
        <Spinner />
      </div>

      <div style={exampleCardStyle}>
        <strong>Accessible labeled loading</strong>
        <Spinner label="Loading matters" />
      </div>

      <p style={inlineTextStyle}>
        <Spinner size="sm" />
        Loading row details
      </p>

      <button type="button" style={buttonStyle} disabled>
        <Spinner size="sm" />
        Saving
      </button>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <Spinner label="Loading dark surface content" />
        Loading content
      </div>

      <p style={mutedTextStyle}>Reduced motion stops continuous rotation while preserving the visible arc.</p>
    </div>
  ),
};
