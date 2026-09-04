import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './date-picker';

const TODAY = new Date(2026, 2, 9); // 9 March 2026

const meta = {
  title: 'UI/Organisms/DatePicker',
  component: DatePicker,
  args: {
    defaultValue: TODAY,
    today: TODAY,
    size: 'md',
    context: 'default',
    disabled: false,
    invalid: false,
    placeholder: 'MM/DD/YYYY',
    'aria-label': 'Date',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    context: { control: 'inline-radio', options: ['default', 'inline'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    placeholder: { control: 'text' },
    value: { control: false },
    defaultValue: { control: false },
    today: { control: false },
    onChange: { control: false },
    min: { control: false },
    max: { control: false },
    isDateDisabled: { control: false },
  },
  // Give the popup room to open within the story canvas.
  decorators: [(Story) => <div style={{ minBlockSize: '380px' }}>{Story()}</div>],
} satisfies Meta<typeof DatePicker>;

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

/** Prop exploration. Click the field (or press Enter / Arrow Down) to open the calendar. */
export const Playground: Story = {};

/** Three field sizes. */
export const Sizes: Story = {
  render: () => (
    <div style={row}>
      <Labelled label="sm">
        <DatePicker size="sm" defaultValue={TODAY} today={TODAY} aria-label="Small date" />
      </Labelled>
      <Labelled label="md">
        <DatePicker size="md" defaultValue={TODAY} today={TODAY} aria-label="Medium date" />
      </Labelled>
      <Labelled label="lg">
        <DatePicker size="lg" defaultValue={TODAY} today={TODAY} aria-label="Large date" />
      </Labelled>
    </div>
  ),
};

/** `default` is a bordered field; `inline` is borderless (subtle). */
export const Contexts: Story = {
  render: () => (
    <div style={row}>
      <Labelled label="default">
        <DatePicker context="default" defaultValue={TODAY} today={TODAY} aria-label="Default context" />
      </Labelled>
      <Labelled label="inline">
        <DatePicker context="inline" defaultValue={TODAY} today={TODAY} aria-label="Inline context" />
      </Labelled>
    </div>
  ),
};

/** Empty (placeholder), disabled, and invalid fields. */
export const States: Story = {
  render: () => (
    <div style={row}>
      <Labelled label="Empty">
        <DatePicker defaultValue={null} today={TODAY} placeholder="MM/DD/YYYY" aria-label="Empty date" />
      </Labelled>
      <Labelled label="Disabled">
        <DatePicker defaultValue={TODAY} today={TODAY} disabled aria-label="Disabled date" />
      </Labelled>
      <Labelled label="Invalid">
        <DatePicker defaultValue={TODAY} today={TODAY} invalid aria-label="Invalid date" />
      </Labelled>
    </div>
  ),
};

/** `min` / `max` restrict the selectable range in the calendar. */
export const WithConstraints: Story = {
  args: {
    min: new Date(2026, 2, 4),
    max: new Date(2026, 2, 24),
  },
};

/** Controlled: the parent owns the value. */
export const Controlled: Story = {
  render: () => {
    const ControlledPicker = () => {
      const [date, setDate] = React.useState<Date | null>(TODAY);
      return (
        <div style={{ display: 'grid', gap: 'var(--spacing-sm)', inlineSize: '240px' }}>
          <span style={{ font: 'var(--typography-body-sm-font-size) / 1 var(--typography-body-sm-font-family)', color: 'var(--color-content-subtle)' }}>
            Selected: {date ? date.toDateString() : 'none'}
          </span>
          <DatePicker value={date} onChange={setDate} today={TODAY} aria-label="Controlled date" />
        </div>
      );
    };
    return <ControlledPicker />;
  },
};
