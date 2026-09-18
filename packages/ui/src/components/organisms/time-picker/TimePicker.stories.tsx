import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimePicker } from './time-picker';

const FOUR_THIRTY_PM = new Date(2026, 2, 9, 16, 30); // 04:30 PM

const meta = {
  title: 'UI/Organisms/TimePicker',
  component: TimePicker,
  args: {
    defaultValue: FOUR_THIRTY_PM,
    size: 'md',
    context: 'default',
    disabled: false,
    invalid: false,
    minuteStep: 5,
    placeholder: 'hh:mm AM',
    'aria-label': 'Time',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    context: { control: 'inline-radio', options: ['default', 'inline'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    minuteStep: { control: { type: 'number', min: 1, max: 30 } },
    placeholder: { control: 'text' },
    value: { control: false },
    defaultValue: { control: false },
    onChange: { control: false },
  },
  decorators: [(Story) => <div style={{ minBlockSize: '360px' }}>{Story()}</div>],
} satisfies Meta<typeof TimePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', gap: 'var(--spacing-2xl)', alignItems: 'flex-start', flexWrap: 'wrap' };

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', inlineSize: '240px' }}>
      <span
        style={{
          font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
          color: 'var(--color-content-subtle)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

/** Prop exploration. Click the field to open the hour / minute / AM-PM columns, then Confirm. */
export const Playground: Story = {};

/** Three field sizes. */
export const Sizes: Story = {
  render: () => (
    <div style={row}>
      <Labelled label="sm">
        <TimePicker size="sm" defaultValue={FOUR_THIRTY_PM} aria-label="Small time" />
      </Labelled>
      <Labelled label="md">
        <TimePicker size="md" defaultValue={FOUR_THIRTY_PM} aria-label="Medium time" />
      </Labelled>
      <Labelled label="lg">
        <TimePicker size="lg" defaultValue={FOUR_THIRTY_PM} aria-label="Large time" />
      </Labelled>
    </div>
  ),
};

/** `default` is a bordered field; `inline` is borderless (subtle). */
export const Contexts: Story = {
  render: () => (
    <div style={row}>
      <Labelled label="default">
        <TimePicker context="default" defaultValue={FOUR_THIRTY_PM} aria-label="Default context" />
      </Labelled>
      <Labelled label="inline">
        <TimePicker context="inline" defaultValue={FOUR_THIRTY_PM} aria-label="Inline context" />
      </Labelled>
    </div>
  ),
};

/** Empty (placeholder), disabled, and invalid fields. */
export const States: Story = {
  render: () => (
    <div style={row}>
      <Labelled label="Empty">
        <TimePicker defaultValue={null} placeholder="hh:mm AM" aria-label="Empty time" />
      </Labelled>
      <Labelled label="Disabled">
        <TimePicker defaultValue={FOUR_THIRTY_PM} disabled aria-label="Disabled time" />
      </Labelled>
      <Labelled label="Invalid">
        <TimePicker defaultValue={FOUR_THIRTY_PM} invalid aria-label="Invalid time" />
      </Labelled>
    </div>
  ),
};

/** A 15-minute step. */
export const MinuteStep: Story = {
  args: { minuteStep: 15 },
};

/** Controlled: the parent owns the value. */
export const Controlled: Story = {
  render: () => {
    const ControlledPicker = () => {
      const [time, setTime] = React.useState<Date | null>(FOUR_THIRTY_PM);
      return (
        <div style={{ display: 'grid', gap: 'var(--spacing-sm)', inlineSize: '240px' }}>
          <span style={{ font: 'var(--typography-body-sm-font-size) / 1 var(--typography-body-sm-font-family)', color: 'var(--color-content-subtle)' }}>
            Selected: {time ? time.toLocaleTimeString() : 'none'}
          </span>
          <TimePicker value={time} onChange={setTime} aria-label="Controlled time" />
        </div>
      );
    };
    return <ControlledPicker />;
  },
};
