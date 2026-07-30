import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider, SliderCentered, SliderRange } from './index';
import type { SliderSize } from './slider.types';

const sizes: SliderSize[] = ['xs', 'sm', 'md'];

const meta = {
  title: 'UI/Atoms/Slider',
  component: Slider,
  args: {
    label: 'Slider',
    defaultValue: 50,
    size: 'md',
    orientation: 'horizontal',
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'number' },
    defaultValue: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    size: { control: 'inline-radio', options: sizes },
    disabled: { control: 'boolean' },
    showSteps: { control: 'boolean' },
    steps: { control: 'object' },
    showValue: { control: 'boolean' },
    className: { control: false },
    onValueChange: { control: false },
  },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)', color: 'var(--color-content-default)' };

const row: CSSProperties = { display: 'grid', gap: 'var(--spacing-lg)' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-lg)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
  overflow: 'visible',
};

const verticalRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  gap: 'var(--spacing-2xl)',
  minBlockSize: '200px',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

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

/**
 * The three designed forms - where the fill starts from and how many handles there are - plus
 * orientation, which every form shares.
 */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Slider family">
        <Slider label="Standard - fill runs from min" defaultValue={65} showSteps step={25} />
        <SliderCentered label="Centered - fill runs from the origin" defaultValue={-30} showSteps steps={[-100, -50, 0, 50, 100]} />
        <SliderRange label="Range - two handles" defaultValue={[25, 75]} showSteps steps={[0, 25, 50, 75, 100]} />
      </Group>

      <Group title="Orientation">
        <div style={verticalRowStyle}>
          <Slider aria-label="Horizontal" defaultValue={65} showSteps step={25} />
          <Slider aria-label="Vertical" orientation="vertical" defaultValue={65} showSteps step={25} />
        </div>
      </Group>
    </div>
  ),
};

/**
 * `xs` / `sm` / `md` scale the track thickness only - the handle and every track-stop dot stay a
 * constant size and always sit exactly on the track's endpoints regardless of size.
 */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Sizes">
        {sizes.map((size) => (
          <Slider key={size} label={size.toUpperCase()} size={size} defaultValue={65} showSteps step={25} />
        ))}
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Handle and track-stop size stay constant</h3>
        <p style={captionStyle}>
          Only the track thickness scales with size - the handle and the min/max track-stop dots
          are the same size at every step, so the handle lands exactly on the dot at 0 and 100
          regardless of <code>size</code>.
        </p>
        <div style={row}>
          {sizes.map((size) => (
            <Slider key={size} label={`${size.toUpperCase()} at 0`} size={size} defaultValue={0} />
          ))}
        </div>
      </section>
    </div>
  ),
};

function LiveDragExample() {
  const [value, setValue] = React.useState(50);

  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
      <Slider label="Interactive focus test" defaultValue={value} onValueChange={setValue} />
      <span style={captionStyle}>Click or drag the handle (no ring), then use arrow keys (ring appears)</span>
    </div>
  );
}

/**
 * Interaction and system states, matching Figma's enabled/hovered/pressed/disabled variants.
 * `data-preview-state` mirrors the real `:hover` / `:active` / `:focus-visible` states so they
 * render statically as a regression reference. Clicking or dragging the handle must never show a
 * focus ring on its own - only real keyboard focus does - so this page also has a live example to
 * verify that by hand rather than only pinning a `focus` snapshot.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Enabled">
        <Slider label="Default" defaultValue={65} />
        <Slider label="Hover" defaultValue={65} data-preview-state="hover" />
        <Slider label="Pressed" defaultValue={65} data-preview-state="press" />
        <Slider label="Focus visible (keyboard)" defaultValue={65} data-preview-state="focus" />
      </Group>

      <Group title="Disabled">
        <Slider label="Disabled" defaultValue={65} disabled />
      </Group>

      <Group title="Live - click, drag, and tab to this">
        <LiveDragExample />
      </Group>
    </div>
  ),
};

function ControlledSliderExample() {
  const [value, setValue] = React.useState(40);

  return <Slider label={`Controlled value ${value}`} value={value} onValueChange={setValue} showValue />;
}

function ControlledRangeExample() {
  const [value, setValue] = React.useState<[number, number]>([20, 80]);

  return <SliderRange label={`Controlled range ${value[0]} to ${value[1]}`} value={value} onValueChange={setValue} />;
}

/** Realistic content and the compositions Slider is designed to sit inside. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Track stops">
        <Slider label="Auto steps from step={10}" defaultValue={50} step={10} showSteps />
        <Slider label="Explicit steps" defaultValue={50} showSteps steps={[0, 25, 50, 75, 100]} />
      </Group>

      <Group title="Value indicator">
        <Slider label="Shows on hover, focus, and drag" defaultValue={50} showSteps step={10} />
        <Slider label="Always visible (showValue)" defaultValue={65} showValue showSteps step={10} />
      </Group>

      <Group title="Custom range">
        <Slider label="Custom min, max, and step" min={10} max={90} step={10} defaultValue={40} showSteps />
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>In composition</h3>
        <div style={cardStyle}>
          <Slider label="Volume" defaultValue={70} showValue />
        </div>
        <div style={cardStyle}>
          <SliderRange label="Price range" defaultValue={[25, 75]} showValue showSteps steps={[0, 25, 50, 75, 100]} />
        </div>
        <div style={cardStyle}>
          <ControlledSliderExample />
          <ControlledRangeExample />
        </div>
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Overlapping range handles">
        <SliderRange
          label="Both handles at 40 (minDistance=0)"
          defaultValue={[40, 40]}
          minDistance={0}
          showValue
          showSteps
          steps={[0, 40, 100]}
        />
      </Group>

      <Group title="Minimum distance between range handles">
        <SliderRange label="At least 10 apart" defaultValue={[20, 80]} minDistance={10} showValue />
        <SliderRange
          label="At least 10 apart, no swapping"
          defaultValue={[20, 80]}
          minDistance={10}
          disableSwap
          showValue
        />
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Narrow container</h3>
        <div style={{ inlineSize: '160px', padding: 'var(--spacing-sm)', border: 'var(--border-width-sm) dashed var(--color-border-default)' }}>
          <Slider label="Narrow" defaultValue={50} showSteps step={25} />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Vertical in a constrained space</h3>
        <div style={{ ...verticalRowStyle, minBlockSize: '120px' }}>
          <Slider aria-label="Short vertical" orientation="vertical" size="xs" defaultValue={50} showSteps step={25} />
          <SliderRange aria-label="Short vertical range" orientation="vertical" size="xs" defaultValue={[25, 75]} />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div
          data-theme="dark"
          style={{
            ...cardStyle,
            background: 'var(--color-background-neutral-bold-default)',
            color: 'var(--color-content-inverse)',
          }}
        >
          <Slider label="Dark surface slider" defaultValue={50} showSteps step={10} />
          <SliderRange label="Dark surface range" defaultValue={[30, 70]} showSteps steps={[0, 25, 50, 75, 100]} />
        </div>
      </section>
    </div>
  ),
};
