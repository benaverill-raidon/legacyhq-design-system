import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePickerCalendar } from './date-picker-calendar';

// A fixed "today" keeps the stories deterministic (matches the Figma example month).
const TODAY = new Date(2026, 2, 9); // 9 March 2026

const surface: CSSProperties = {
  display: 'inline-block',
  background: 'var(--color-elevation-surface-overlay-default, var(--color-elevation-surface-raised-default))',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-lg)',
  boxShadow: 'var(--shadow-overlay, 0 8px 24px rgba(0,0,0,0.12))',
};

const meta = {
  title: 'UI/Organisms/DatePickerCalendar',
  component: DatePickerCalendar,
  args: {
    defaultMonth: TODAY,
    defaultValue: TODAY,
    today: TODAY,
    weekStartsOn: 0,
  },
  argTypes: {
    weekStartsOn: { control: { type: 'inline-radio' }, options: [0, 1] },
    value: { control: false },
    defaultValue: { control: false },
    month: { control: false },
    defaultMonth: { control: false },
    today: { control: false },
    onChange: { control: false },
    onMonthChange: { control: false },
    min: { control: false },
    max: { control: false },
    isDateDisabled: { control: false },
  },
  // The calendar is transparent by design; wrap it in a popup-like surface for the stories.
  decorators: [
    (Story) => (
      <div style={surface}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePickerCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Prop exploration. Uncontrolled: the calendar owns the selection and the displayed month. */
export const Playground: Story = {};

/** Controlled: the parent owns the selected value. */
export const Controlled: Story = {
  render: () => {
    const ControlledCalendar = () => {
      const [date, setDate] = React.useState<Date | null>(TODAY);
      return (
        <DatePickerCalendar value={date} onChange={setDate} defaultMonth={TODAY} today={TODAY} />
      );
    };
    return <ControlledCalendar />;
  },
};

/** `min` / `max` restrict the selectable range; out-of-range days and blocked nav are disabled. */
export const MinMax: Story = {
  args: {
    min: new Date(2026, 2, 4),
    max: new Date(2026, 2, 24),
    defaultValue: new Date(2026, 2, 9),
  },
};

/** `isDateDisabled` disables individual dates - here, weekends. */
export const DisabledWeekends: Story = {
  args: {
    isDateDisabled: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
    defaultValue: new Date(2026, 2, 5),
  },
};

/** `weekStartsOn={1}` starts the week on Monday. */
export const WeekStartsMonday: Story = {
  args: { weekStartsOn: 1 },
};
