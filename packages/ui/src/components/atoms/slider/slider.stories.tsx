import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider, SliderCentered, SliderRange } from './index';

type SliderSize = 'xs' | 'sm' | 'md';

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
  gap: 'var(--spacing-2xl)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'grid',
  gap: 'var(--spacing-md)',
} satisfies CSSProperties;

const cardStyle = {
  display: 'grid',
  gap: 'var(--spacing-lg)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
  overflow: 'visible',
} satisfies CSSProperties;

const darkSurfaceStyle = {
  ...cardStyle,
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

const verticalRowStyle = {
  display: 'flex',
  alignItems: 'stretch',
  gap: 'var(--spacing-2xl)',
  minBlockSize: '320px',
} satisfies CSSProperties;

const sizeLabelStyle = {
  fontFamily: 'var(--typography-body-sm-font-family)',
  fontSize: 'var(--typography-body-sm-font-size)',
  fontWeight: 'var(--typography-body-sm-font-weight)',
  lineHeight: 'var(--typography-body-sm-line-height)',
} satisfies CSSProperties;

const sizeToStopContainer: Record<SliderSize, string> = {
  xs: 'var(--component-slider-stop-container-size-xs)',
  sm: 'var(--component-slider-stop-container-size-sm)',
  md: 'var(--component-slider-stop-container-size-md)',
};

function ControlledSliderExample() {
  const [value, setValue] = React.useState(40);

  return <Slider label={`Controlled value ${value}`} value={value} onValueChange={setValue} showValue />;
}

function ControlledRangeExample() {
  const [value, setValue] = React.useState<[number, number]>([20, 80]);

  return <SliderRange label={`Controlled range ${value[0]} to ${value[1]}`} value={value} onValueChange={setValue} />;
}

function EndpointScale({ size }: { size: SliderSize }) {
  const stopContainer = sizeToStopContainer[size];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto 1fr auto',
        alignItems: 'center',
        paddingInline: `calc(${stopContainer} / 2)`,
        marginBlockStart: 'var(--spacing-sm)',
        ...sizeLabelStyle,
      }}
    >
      <span>0</span>
      <span />
      <span style={{ justifySelf: 'center' }}>50</span>
      <span />
      <span style={{ justifySelf: 'end' }}>100</span>
    </div>
  );
}

function EndpointAlignmentExample({ size, value }: { size: SliderSize; value: number }) {
  return (
    <div style={rowStyle}>
      <Slider label={`${size.toUpperCase()} endpoint alignment`} size={size} defaultValue={value} showSteps step={50} />
      <EndpointScale size={size} />
    </div>
  );
}

function SizeShowcase({ size }: { size: SliderSize }) {
  return (
    <div style={rowStyle}>
      <span style={sizeLabelStyle}>{size.toUpperCase()}</span>
      <Slider label={`${size.toUpperCase()} standard`} size={size} defaultValue={50} showSteps step={10} />
      <SliderCentered
        label={`${size.toUpperCase()} centered`}
        size={size}
        defaultValue={0}
        showSteps
        steps={[-100, -50, 0, 50, 100]}
      />
      <SliderRange
        label={`${size.toUpperCase()} range`}
        size={size}
        defaultValue={[25, 75]}
        showSteps
        steps={[0, 25, 50, 75, 100]}
      />
    </div>
  );
}

export const Playground: Story = {};

export const Variants: Story = {
  args: {
    defaultValue: 0,
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
        <SizeShowcase size="xs" />
        <SizeShowcase size="sm" />
        <SizeShowcase size="md" />
      </div>

      <div style={verticalRowStyle}>
        <Slider aria-label="Vertical slider" orientation="vertical" defaultValue={50} step={5} showSteps size="xs" />
        <SliderCentered
          aria-label="Vertical centered slider"
          orientation="vertical"
          defaultValue={-50}
          showSteps
          size="sm"
          steps={[-100, -50, 0, 50, 100]}
        />
        <SliderRange
          aria-label="Vertical range slider"
          orientation="vertical"
          defaultValue={[25, 75]}
          showSteps
          size="md"
          steps={[0, 25, 50, 75, 100]}
        />
      </div>

      <div style={rowStyle}>
        <Slider label="Disabled" defaultValue={50} disabled />
        <Slider label="Hover preview" defaultValue={50} data-preview-state="hover" showSteps step={10} />
        <Slider label="Pressed preview" defaultValue={50} data-preview-state="press" showSteps step={10} />
        <Slider label="Focus preview" defaultValue={50} data-preview-state="focus" showSteps step={10} />
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <EndpointAlignmentExample size="xs" value={0} />
        <EndpointAlignmentExample size="sm" value={50} />
        <EndpointAlignmentExample size="md" value={100} />
      </div>

      <div style={cardStyle}>
        <Slider label="0 percent" size="md" defaultValue={0} step={5} showSteps />
        <Slider label="50 percent" size="md" defaultValue={50} step={5} showSteps />
        <Slider label="100 percent" size="md" defaultValue={100} step={5} showSteps />
      </div>

      <div style={cardStyle}>
        <SliderCentered
          label="-50 adjustment"
          size="xs"
          defaultValue={-50}
          showValue
          showSteps
          steps={[-100, -50, 0, 50, 100]}
        />
        <SliderCentered label="0 adjustment" size="sm" defaultValue={0} showSteps steps={[-100, -50, 0, 50, 100]} />
        <SliderCentered label="50 adjustment" size="md" defaultValue={50} showSteps steps={[-100, -50, 0, 50, 100]} />
      </div>

      <div style={cardStyle}>
        <SliderRange label="Budget range" size="xs" defaultValue={[25, 75]} showValue showSteps steps={[0, 25, 50, 75, 100]} />
        <SliderRange
          label="Range overlapping handles"
          size="sm"
          defaultValue={[40, 40]}
          showValue
          showSteps
          steps={[0, 25, 40, 50, 75, 100]}
        />
        <SliderRange
          label="Range with minimum distance"
          size="md"
          defaultValue={[20, 80]}
          minDistance={10}
          showValue
          showSteps
          steps={[0, 20, 50, 80, 100]}
        />
        <SliderRange
          label="Range with minimum distance and disableSwap"
          size="md"
          defaultValue={[20, 80]}
          minDistance={10}
          disableSwap
          showValue
          showSteps
          steps={[0, 20, 50, 80, 100]}
        />
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
        <Slider label="Dark surface slider" defaultValue={50} showSteps step={10} />
        <SliderCentered label="Dark surface centered" defaultValue={-50} showSteps steps={[-100, -50, 0, 50, 100]} />
        <SliderRange label="Dark surface range" defaultValue={[30, 70]} showSteps steps={[0, 25, 50, 75, 100]} />
      </div>

      <div style={{ ...cardStyle, ...verticalRowStyle }}>
        <Slider aria-label="Tall vertical slider" orientation="vertical" size="xs" defaultValue={50} step={5} showSteps />
        <SliderCentered
          aria-label="Tall vertical centered slider"
          orientation="vertical"
          size="sm"
          defaultValue={0}
          showSteps
          steps={[-100, -50, 0, 50, 100]}
        />
        <SliderRange
          aria-label="Tall vertical range slider"
          orientation="vertical"
          size="md"
          defaultValue={[50, 50]}
          showValue
          showSteps
          steps={[0, 25, 50, 75, 100]}
        />
      </div>
    </div>
  ),
};


const debugTrackStyle = {
  ...cardStyle,
  outline: '1px dashed var(--color-border-subtle)',
  outlineOffset: '4px',
} satisfies CSSProperties;

const brandTintedSurfaceStyle = {
  ...cardStyle,
  background: 'var(--color-data-viz-sequence-prussian-100)',
} satisfies CSSProperties;

function DebugStack({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--border-radius-md)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--color-data-viz-sequence-prussian-100) 40%, transparent), transparent)',
      }}
    >
      {children}
    </div>
  );
}

export const HandleGeometryDebug: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={debugTrackStyle}>
        <DebugStack>
          <Slider label="Standard md" size="md" defaultValue={50} showSteps step={10} showValue />
          <SliderCentered
            label="Centered sm"
            size="sm"
            defaultValue={-25}
            showSteps
            showValue
            steps={[-100, -50, 0, 50, 100]}
          />
          <SliderRange
            label="Range xs"
            size="xs"
            defaultValue={[25, 75]}
            showSteps
            showValue
            steps={[0, 25, 50, 75, 100]}
          />
        </DebugStack>
      </div>

      <div style={{ ...debugTrackStyle, ...verticalRowStyle }}>
        <Slider aria-label="Debug vertical standard" orientation="vertical" size="xs" defaultValue={50} showSteps step={10} />
        <SliderCentered
          aria-label="Debug vertical centered"
          orientation="vertical"
          size="sm"
          defaultValue={25}
          showSteps
          steps={[-100, -50, 0, 50, 100]}
        />
        <SliderRange
          aria-label="Debug vertical range"
          orientation="vertical"
          size="md"
          defaultValue={[30, 70]}
          showSteps
          steps={[0, 25, 50, 75, 100]}
        />
      </div>
    </div>
  ),
};

export const RadiusComparison: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <Slider label="0" defaultValue={0} showSteps step={25} />
        <Slider label="25" defaultValue={25} showSteps step={25} />
        <Slider label="50" defaultValue={50} showSteps step={25} />
        <Slider label="75" defaultValue={75} showSteps step={25} />
        <Slider label="100" defaultValue={100} showSteps step={25} />
      </div>
      <div style={cardStyle}>
        <SliderCentered label="Centered 0" defaultValue={0} showSteps steps={[-100, -50, 0, 50, 100]} />
        <SliderCentered label="Centered 100" defaultValue={100} showSteps steps={[-100, -50, 0, 50, 100]} />
        <SliderRange label="Range full" defaultValue={[0, 100]} showSteps steps={[0, 25, 50, 75, 100]} />
      </div>
    </div>
  ),
};

export const TrackStopContrast: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <Slider label="Light surface" defaultValue={50} showSteps step={10} />
        <SliderRange label="Light range" defaultValue={[25, 75]} showSteps steps={[0, 25, 50, 75, 100]} />
      </div>
      <div data-theme="dark" style={darkSurfaceStyle}>
        <Slider label="Dark surface" defaultValue={50} showSteps step={10} />
        <SliderRange label="Dark range" defaultValue={[25, 75]} showSteps steps={[0, 25, 50, 75, 100]} />
      </div>
      <div style={brandTintedSurfaceStyle}>
        <Slider label="Brand-tinted surface" defaultValue={50} showSteps step={10} />
        <SliderCentered label="Brand-tinted centered" defaultValue={0} showSteps steps={[-100, -50, 0, 50, 100]} />
      </div>
    </div>
  ),
};
