import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Atoms/Checkbox',
  component: Checkbox,
  args: {
    label: 'Label',
  },
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
    className: { control: false },
    onCheckedChange: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-300)',
} satisfies CSSProperties;

const cardStyle = {
  display: 'grid',
  gap: 'var(--spacing-150)',
  padding: 'var(--spacing-200)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const darkSurfaceStyle = {
  display: 'grid',
  gap: 'var(--spacing-150)',
  padding: 'var(--spacing-200)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

const fieldsetStyle = {
  display: 'grid',
  gap: 'var(--spacing-100)',
  padding: 'var(--spacing-0)',
  border: 0,
  margin: 'var(--spacing-0)',
} satisfies CSSProperties;

const legendStyle = {
  marginBlockEnd: 'var(--spacing-050)',
  color: 'var(--color-content-subtle)',
} satisfies CSSProperties;

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
} satisfies CSSProperties;

const cellStyle = {
  padding: 'var(--spacing-100)',
  borderBlockEnd: 'var(--border-width-default) solid var(--color-border-default)',
  textAlign: 'start',
} satisfies CSSProperties;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Indeterminate" indeterminate />
      </div>

      <div style={rowStyle}>
        <Checkbox label="Invalid" invalid />
        <Checkbox label="Invalid checked" invalid defaultChecked />
        <Checkbox label="Required" required />
      </div>

      <div style={rowStyle}>
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Disabled checked" disabled defaultChecked />
        <Checkbox label="Focused" autoFocus />
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <Checkbox label="Send matter updates" defaultChecked />
      </div>

      <fieldset style={cardStyle}>
        <legend style={legendStyle}>Notification channels</legend>
        <div style={fieldsetStyle}>
          <Checkbox label="Email" defaultChecked name="channels" value="email" />
          <Checkbox label="SMS" name="channels" value="sms" />
          <Checkbox label="In-app" name="channels" value="in-app" />
        </div>
      </fieldset>

      <div style={cardStyle}>
        <Checkbox label="I agree to the retention policy" required />
        <Checkbox label="Archived option" disabled />
        <Checkbox label="This selection needs review" invalid />
      </div>

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>
                <Checkbox aria-label="Select all rows" indeterminate />
              </th>
              <th style={cellStyle}>Matter</th>
              <th style={cellStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cellStyle}>
                <Checkbox aria-label="Select Probate review" defaultChecked />
              </td>
              <td style={cellStyle}>Probate review</td>
              <td style={cellStyle}>Ready</td>
            </tr>
            <tr>
              <td style={cellStyle}>
                <Checkbox aria-label="Select Trust update" />
              </td>
              <td style={cellStyle}>Trust update</td>
              <td style={cellStyle}>Draft</td>
            </tr>
          </tbody>
        </table>
      </div>

      <form style={cardStyle}>
        <Checkbox label="Include closed matters" name="includeClosed" value="yes" />
        <button type="submit">Apply filters</button>
      </form>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <Checkbox label="Dark surface option" defaultChecked />
        <Checkbox label="Dark invalid option" invalid />
      </div>
    </div>
  ),
};
