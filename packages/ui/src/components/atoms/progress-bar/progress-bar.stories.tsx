import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './progress-bar';
import type { ProgressBarSize } from './progress-bar.types';

const sizes: ProgressBarSize[] = ['md', 'lg'];

const meta = {
  title: 'UI/Atoms/ProgressBar',
  component: ProgressBar,
  args: {
    value: 42,
    variant: 'linear',
    size: 'md',
    label: 'Generating document package',
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    variant: { control: 'radio', options: ['linear', 'circular'] },
    size: { control: 'radio', options: sizes },
    label: { control: 'text' },
    getValueText: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-lg)',
};

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
};

const linearFrameStyle: CSSProperties = { inlineSize: '100%' };

function sectionHeading(text: string) {
  return (
    <h3
      style={{
        margin: 0,
        font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
        color: 'var(--color-content-default)',
      }}
    >
      {text}
    </h3>
  );
}

/** A labelled cell so every specimen in a matrix is self-describing. */
function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'center' }}>
      {children}
      <span style={captionStyle}>{label}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      {sectionHeading(title)}
      <div style={row}>{children}</div>
    </section>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {
  render: (args) => (
    <div style={args.variant === 'linear' ? linearFrameStyle : undefined}>
      <ProgressBar {...args} />
    </div>
  ),
};

/** The two designed forms: a fluid-width linear track and a fixed-diameter circular ring. */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Linear (fills the available inline width)">
        <div style={linearFrameStyle}>
          <ProgressBar value={42} variant="linear" label="Linear progress" />
        </div>
      </Group>
      <Group title="Circular (fixed diameter)">
        <ProgressBar value={42} variant="circular" label="Circular progress" />
      </Group>
    </div>
  ),
};

/** Size is a meaningful axis: track thickness and stroke width scale, circular diameter does not. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Linear">
        {sizes.map((size) => (
          <div key={size} style={{ ...linearFrameStyle, display: 'grid', gap: 'var(--spacing-sm)' }}>
            <span style={captionStyle}>{size}</span>
            <ProgressBar value={60} variant="linear" size={size} label={`Linear ${size} progress`} />
          </div>
        ))}
      </Group>
      <Group title="Circular">
        {sizes.map((size) => (
          <Cell key={size} label={size}>
            <ProgressBar value={60} variant="circular" size={size} label={`Circular ${size} progress`} />
          </Cell>
        ))}
      </Group>
    </div>
  ),
};

/**
 * The three system states every progress value falls into. Empty and complete are the two exact
 * boundaries where the rendering previously showed a stray sliver - Empty must show no progress
 * fill at all, and Complete must show a fully closed ring with no gap.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Linear">
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {[
            ['Empty (0%)', 0],
            ['In progress (42%)', 42],
            ['Complete (100%)', 100],
          ].map(([caption, value]) => (
            <div key={caption} style={{ ...linearFrameStyle, display: 'grid', gap: 'var(--spacing-sm)' }}>
              <span style={captionStyle}>{caption}</span>
              <ProgressBar value={value as number} variant="linear" label={`Linear ${caption}`} />
            </div>
          ))}
        </div>
      </Group>
      <Group title="Circular">
        <Cell label="Empty (0%)">
          <ProgressBar value={0} variant="circular" label="Circular empty" />
        </Cell>
        <Cell label="In progress (42%)">
          <ProgressBar value={42} variant="circular" label="Circular in progress" />
        </Cell>
        <Cell label="Complete (100%)">
          <ProgressBar value={100} variant="circular" label="Circular complete" />
        </Cell>
      </Group>
    </div>
  ),
};

/** How ProgressBar behaves inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <div style={cardStyle}>
        {sectionHeading('Document generation progress')}
        <div style={linearFrameStyle}>
          <ProgressBar value={42} label="Generating document package" />
        </div>
      </div>

      <div style={cardStyle}>
        {sectionHeading('Client upload progress')}
        <div style={linearFrameStyle}>
          <ProgressBar value={68} size="lg" label="Uploading client files" />
        </div>
      </div>

      <div style={cardStyle}>
        {sectionHeading('Roadmap completion summary')}
        <Cell label="Roadmap completion">
          <ProgressBar variant="circular" value={75} label="Roadmap completion" />
        </Cell>
      </div>

      <div style={cardStyle}>
        {sectionHeading('Custom value text overrides the announced percentage')}
        <p style={captionStyle}>
          <code>getValueText</code> replaces the default &quot;N%&quot; announcement with domain-specific
          wording, while the visible fill still reflects the raw <code>value</code>.
        </p>
        <div style={linearFrameStyle}>
          <ProgressBar value={60} label="Document preparation" getValueText={() => '6 of 10 documents prepared'} />
        </div>
      </div>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Out-of-range values clamp to 0-100">
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
          {[
            ['value={-20} renders as 0%', -20],
            ['value={150} renders as 100%', 150],
            ['value={NaN} renders as 0%', Number.NaN],
          ].map(([caption, value]) => (
            <div key={caption} style={{ ...linearFrameStyle, display: 'grid', gap: 'var(--spacing-sm)' }}>
              <span style={captionStyle}>{caption}</span>
              <ProgressBar value={value as number} label={String(caption)} />
            </div>
          ))}
        </div>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Narrow linear container')}
        <p style={captionStyle}>
          Linear fills whatever inline width its container gives it - the rounded fill and track
          stay legible even when that width is small.
        </p>
        <div style={{ inlineSize: '64px' }}>
          <ProgressBar value={35} label="Narrow container progress" />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Dark surface')}
        <div
          data-theme="dark"
          style={{
            ...row,
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-elevation-surface-default)',
          }}
        >
          <div style={linearFrameStyle}>
            <ProgressBar value={55} label="Dark linear progress" />
          </div>
          <ProgressBar variant="circular" value={55} label="Dark circular progress" />
        </div>
      </section>
    </div>
  ),
};
