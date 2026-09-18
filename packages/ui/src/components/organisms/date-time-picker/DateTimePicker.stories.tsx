import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTimePicker } from './date-time-picker';

const MARCH_9_430PM = new Date(2026, 2, 9, 16, 30);

const meta = {
  title: 'UI/Organisms/DateTimePicker',
  component: DateTimePicker,
  args: {
    defaultValue: MARCH_9_430PM,
    today: MARCH_9_430PM,
    size: 'md',
    context: 'default',
    disabled: false,
    invalid: false,
    datePlaceholder: 'MM/DD/YYYY',
    timePlaceholder: 'hh:mm AM',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    context: { control: 'inline-radio', options: ['default', 'inline'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    value: { control: false },
    defaultValue: { control: false },
    today: { control: false },
    onChange: { control: false },
    min: { control: false },
    max: { control: false },
    isDateDisabled: { control: false },
  },
  decorators: [(Story) => <div style={{ minBlockSize: '380px' }}>{Story()}</div>],
} satisfies Meta<typeof DateTimePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
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

/** Prop exploration. One control with a date half and a time half over a single shared value. */
export const Playground: Story = {};

/** Three sizes. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="sm">
        <DateTimePicker size="sm" defaultValue={MARCH_9_430PM} today={MARCH_9_430PM} aria-label="Small" />
      </Labelled>
      <Labelled label="md">
        <DateTimePicker size="md" defaultValue={MARCH_9_430PM} today={MARCH_9_430PM} aria-label="Medium" />
      </Labelled>
      <Labelled label="lg">
        <DateTimePicker size="lg" defaultValue={MARCH_9_430PM} today={MARCH_9_430PM} aria-label="Large" />
      </Labelled>
    </div>
  ),
};

/** `default` is a bordered control; `inline` is borderless (subtle). */
export const Contexts: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="default">
        <DateTimePicker context="default" defaultValue={MARCH_9_430PM} today={MARCH_9_430PM} aria-label="Default" />
      </Labelled>
      <Labelled label="inline">
        <DateTimePicker context="inline" defaultValue={MARCH_9_430PM} today={MARCH_9_430PM} aria-label="Inline" />
      </Labelled>
    </div>
  ),
};

/** Controlled: the parent owns the combined date-and-time value. */
export const Controlled: Story = {
  render: () => {
    const ControlledPicker = () => {
      const [value, setValue] = React.useState<Date | null>(MARCH_9_430PM);
      return (
        <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
          <span style={{ font: 'var(--typography-body-sm-font-size) / 1 var(--typography-body-sm-font-family)', color: 'var(--color-content-subtle)' }}>
            Selected: {value ? value.toLocaleString() : 'none'}
          </span>
          <DateTimePicker value={value} onChange={setValue} today={MARCH_9_430PM} aria-label="Controlled" />
        </div>
      );
    };
    return <ControlledPicker />;
  },
};
