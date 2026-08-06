import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './skeleton';
import type { SkeletonAppearance, SkeletonShape } from './skeleton.types';

const appearances: SkeletonAppearance[] = ['default', 'subtle'];
const shapes: SkeletonShape[] = ['rectangle', 'circle'];

const meta = {
  title: 'UI/Molecules/Skeleton',
  component: Skeleton,
  args: {
    appearance: 'subtle',
    shape: 'rectangle',
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: appearances },
    shape: { control: 'inline-radio', options: shapes },
    label: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: 'var(--spacing-lg)',
};

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  inlineSize: '320px',
};

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', inlineSize: '160px' }}>
      {children}
      <span style={captionStyle}>{label}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      <div style={row}>{children}</div>
    </section>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/** Both appearances, at both shapes. */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      {appearances.map((appearance) => (
        <Group key={appearance} title={`Appearance: ${appearance}`}>
          {shapes.map((shape) => (
            <Cell key={shape} label={shape}>
              <Skeleton
                appearance={appearance}
                shape={shape}
                style={shape === 'circle' ? { inlineSize: '48px', blockSize: '48px' } : undefined}
              />
            </Cell>
          ))}
        </Group>
      ))}
    </div>
  ),
};

/** How Skeleton behaves inside realistic loading layouts. */
export const Composition: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Text lines">
        <div style={{ display: 'grid', gap: 'var(--spacing-sm)', inlineSize: '320px' }}>
          <Skeleton style={{ inlineSize: '100%' }} />
          <Skeleton style={{ inlineSize: '90%' }} />
          <Skeleton style={{ inlineSize: '60%' }} />
        </div>
      </Group>

      <Group title="List row with avatar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <Skeleton shape="circle" style={{ inlineSize: '40px', blockSize: '40px' }} />
          <div style={{ display: 'grid', gap: 'var(--spacing-sm)', inlineSize: '240px' }}>
            <Skeleton style={{ inlineSize: '70%' }} />
            <Skeleton style={{ inlineSize: '40%' }} />
          </div>
        </div>
      </Group>

      <Group title="Card">
        <div style={cardStyle}>
          <Skeleton style={{ blockSize: '160px' }} />
          <Skeleton style={{ inlineSize: '80%' }} />
          <Skeleton style={{ inlineSize: '50%' }} />
        </div>
      </Group>

      <Group title="Labelled for screen readers">
        <Skeleton label="Loading profile" style={{ inlineSize: '240px' }} />
      </Group>
    </div>
  ),
};
