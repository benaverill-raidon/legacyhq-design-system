import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider, SliderCentered, SliderRange } from './index';

const meta: Meta<typeof Slider> = {
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
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md'] },
    disabled: { control: 'boolean' },
    showSteps: { control: 'boolean' },
    steps: { control: 'object' },
    showValue: { control: 'boolean' },
    className: { control: false },
    onValueChange: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Slider>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-300)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'grid',
  gap: 'var(--spacing-150)',
} satisfies CSSProperties;

const cardStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
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

const verticalRowStyle = {
  display: 'flex',
  alignItems: 'stretch',
  gap: 'var(--spacing-300)',
  minBlockSize: '320px',
} satisfies CSSProperties;

function ControlledSliderExample() {
  const [value, setValue] = React.useState(40);

  return <Slider label={`Controlled value ${value}`} value={value} onValueChange={setValue} showValue />;
}

function ControlledRangeExample() {
  const [value, setValue] = React.useState<[number, number]>([20, 80]);

  return <SliderRange label={`Controlled range ${value[0]} to ${value[1]}`} value={value} onValueChange={setValue} />;
}

export const Playground: Story = {};

export const Variants: Story = {
  args: {
    defaultValue: 0
  },

  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Slider label="Slider default" defaultValue={50} />
        <Slider label="Auto steps" defaultValue={50} step={5} showSteps />
        <Slider label="Explicit endpoint steps" defaultValue={50} showSteps steps={[0, 25, 50, 75, 100]} />
        <SliderCentered label="Centered default" defaultValue={0} showSteps steps={[-100, -50, 0, 50, 100]} />
        <SliderRange label="Range default" defaultValue={[25, 75]} showSteps steps={[0, 25, 50, 75, 100]} />
      </div>

      <div style={rowStyle}>
        <Slider label="XS size" size="xs" defaultValue={50} />
        <Slider label="SM size" size="sm" defaultValue={50} />
        <Slider label="MD size" size="md" defaultValue={50} />
      </div>

      <div style={verticalRowStyle}>
        <Slider aria-label="Vertical slider" orientation="vertical" defaultValue={50} step={5} showSteps />
        <SliderCentered aria-label="Vertical centered slider" orientation="vertical" defaultValue={-50} showSteps steps={[-100, -50, 0, 50, 100]} />
        <SliderRange aria-label="Vertical range slider" orientation="vertical" defaultValue={[25, 75]} showSteps steps={[0, 25, 50, 75, 100]} />
      </div>

      <div style={rowStyle}>
        <Slider label="Disabled" defaultValue={50} disabled />
        <Slider label="Hover preview" defaultValue={50} data-preview-state="hover" />
        <Slider label="Pressed preview" defaultValue={50} data-preview-state="press" />
        <Slider label="Focus preview" defaultValue={50} data-preview-state="focus" />
      </div>
    </div>
  )
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <Slider label="0 percent" defaultValue={0} step={5} showSteps />
        <Slider label="50 percent" defaultValue={50} step={5} showSteps />
        <Slider label="100 percent" defaultValue={100} step={5} showSteps />
      </div>

      <div style={cardStyle}>
        <SliderCentered label="-50 adjustment" defaultValue={-50} showValue showSteps steps={[-100, -50, 0, 50, 100]} />
        <SliderCentered label="0 adjustment" defaultValue={0} showSteps steps={[-100, -50, 0, 50, 100]} />
        <SliderCentered label="50 adjustment" defaultValue={50} showSteps steps={[-100, -50, 0, 50, 100]} />
      </div>

      <div style={cardStyle}>
        <SliderRange label="Budget range" defaultValue={[25, 75]} showValue showSteps steps={[0, 25, 50, 75, 100]} />
        <SliderRange label="Lower handle moved" defaultValue={[10, 70]} showValue showSteps steps={[0, 10, 25, 50, 70, 100]} />
        <SliderRange label="Upper handle moved" defaultValue={[30, 90]} showValue showSteps steps={[0, 30, 50, 75, 90, 100]} />
      </div>

      <div style={cardStyle}>
        <Slider label="Custom min, max, and step" min={10} max={90} step={10} defaultValue={40} showSteps />
        <Slider aria-label="Unlabeled slider" defaultValue={30} />
      </div>

      <div style={cardStyle}>
        <ControlledSliderExample />
        <ControlledRangeExample />
      </div>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <Slider label="Dark surface slider" defaultValue={50} />
        <SliderCentered label="Dark surface centered" defaultValue={-50} />
        <SliderRange label="Dark surface range" defaultValue={[30, 70]} />
      </div>

      <div style={{ ...cardStyle, ...verticalRowStyle }}>
        <Slider aria-label="Tall vertical slider" orientation="vertical" defaultValue={50} step={5} showSteps />
        <SliderRange
          aria-label="Tall vertical range slider"
          orientation="vertical"
          defaultValue={[25, 75]}
          showValue
          showSteps
          steps={[0, 25, 50, 75, 100]}
        />
      </div>
    </div>
  ),
};
