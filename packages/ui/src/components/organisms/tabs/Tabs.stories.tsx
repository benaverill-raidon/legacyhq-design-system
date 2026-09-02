import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './tabs';
import { TabPanel } from './tab-panel';
import type { TabItem } from './tabs.types';

const tabs: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'documents', label: 'Documents' },
  { value: 'billing', label: 'Billing', disabled: true },
];

const meta = {
  title: 'UI/Organisms/Tabs',
  component: Tabs,
  args: {
    type: 'line',
    tabs,
    defaultValue: 'overview',
    'aria-label': 'Matter sections',
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['line', 'contained'] },
    showBorder: { control: 'boolean' },
    tabs: { control: false },
    value: { control: false },
    onValueChange: { control: false },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)', maxInlineSize: '640px' };

const panelStyle: CSSProperties = {
  font: 'var(--typography-body-md-font-size) / var(--typography-body-md-line-height) var(--typography-body-md-font-family)',
  color: 'var(--color-content-default)',
};

function Panels() {
  return (
    <>
      <TabPanel value="overview" style={panelStyle}>
        A summary of the matter, its parties, and its current status.
      </TabPanel>
      <TabPanel value="activity" style={panelStyle}>
        A chronological feed of everything that has happened on the matter.
      </TabPanel>
      <TabPanel value="documents" style={panelStyle}>
        Every filing, exhibit, and draft associated with the matter.
      </TabPanel>
      <TabPanel value="billing" style={panelStyle}>
        Time entries, expenses, and invoices.
      </TabPanel>
    </>
  );
}

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

/** Prop exploration. The tab bar plus its panels. */
export const Playground: Story = {
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
};

/** The two types: `line` (underline indicator) and `contained` (pill). */
export const Types: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="line">
        <Tabs type="line" tabs={tabs} defaultValue="overview" aria-label="Line tabs">
          <Panels />
        </Tabs>
      </Labelled>

      <Labelled label="contained">
        <Tabs type="contained" tabs={tabs} defaultValue="overview" aria-label="Contained tabs">
          <Panels />
        </Tabs>
      </Labelled>
    </div>
  ),
};

/** A disabled tab is skipped by pointer and keyboard; the bottom border can be toggled off. */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="With a disabled tab (Billing)">
        <Tabs type="line" tabs={tabs} defaultValue="overview" aria-label="With disabled">
          <Panels />
        </Tabs>
      </Labelled>

      <Labelled label="Line without the bottom border">
        <Tabs type="line" tabs={tabs} defaultValue="activity" showBorder={false} aria-label="No border">
          <Panels />
        </Tabs>
      </Labelled>
    </div>
  ),
};

/** Controlled selection: the value is owned by the parent. */
export const Controlled: Story = {
  render: () => {
    const ControlledTabs = () => {
      const [value, setValue] = React.useState('activity');
      return (
        <div style={stack}>
          <span style={{ font: 'var(--typography-body-sm-font-size) / 1 var(--typography-body-sm-font-family)', color: 'var(--color-content-subtle)' }}>
            Selected: {value}
          </span>
          <Tabs type="contained" tabs={tabs} value={value} onValueChange={setValue} aria-label="Controlled">
            <Panels />
          </Tabs>
        </div>
      );
    };

    return <ControlledTabs />;
  },
};
