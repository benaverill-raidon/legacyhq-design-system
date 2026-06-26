import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './radio';
import { RadioGroup } from './radio-group';

const options = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'mail', label: 'Mail' },
];

const meta: Meta<typeof Radio> = {
  title: 'UI/Atoms/Radio',
  component: Radio,
  args: {
    label: 'Label',
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
    className: { control: false },
    inputClassName: { control: false },
    onCheckedChange: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Radio>;

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

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
} satisfies CSSProperties;

const cellStyle = {
  padding: 'var(--spacing-100)',
  borderBlockEnd: 'var(--border-width-default) solid var(--color-border-default)',
  textAlign: 'start',
} satisfies CSSProperties;

const helpTextStyle = {
  color: 'var(--color-content-subtle)',
} satisfies CSSProperties;

function ControlledGroupExample() {
  const [value, setValue] = React.useState('email');

  return (
    <RadioGroup
      label="Preferred contact method"
      name="controlled-contact-method"
      value={value}
      onValueChange={setValue}
      options={options}
    />
  );
}

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Radio label="Unselected" name="radio-variants-default" value="unchecked" />
        <Radio label="Selected" name="radio-variants-default" value="checked" defaultChecked />
      </div>

      <div style={rowStyle}>
        <Radio label="Invalid unselected" name="radio-variants-invalid" value="invalid-unchecked" invalid />
        <Radio label="Invalid selected" name="radio-variants-invalid" value="invalid-checked" invalid defaultChecked />
      </div>

      <div style={rowStyle}>
        <Radio label="Disabled unselected" name="radio-variants-disabled" value="disabled-unchecked" disabled />
        <Radio label="Disabled selected" name="radio-variants-disabled" value="disabled-checked" disabled defaultChecked />
        <Radio label="Required" name="radio-variants-required" value="required" required />
      </div>

      <div style={rowStyle}>
        <Radio label="Hover" name="radio-state-hover" value="hover" className="previewHover" />
        <Radio label="Hover selected" name="radio-state-hover" value="hover-selected" className="previewHover" defaultChecked />
      </div>
      <div style={rowStyle}>
        <Radio label="Press" name="radio-state-press" value="press" className="previewPress" />
        <Radio label="Press selected" name="radio-state-press" value="press-selected" className="previewPress" defaultChecked />
      </div>
      <div style={rowStyle}>
        <Radio label="Focus" name="radio-state-focus" value="focus" autoFocus />
        <Radio label="Disabled hover" name="radio-state-disabled" value="disabled-hover" className="previewHover" disabled defaultChecked />
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <Radio label="Standalone option" name="standalone-radio" value="standalone" />
        <Radio aria-label="Select current row" name="accessibility-row" value="row" />
        <Radio label="Required choice" name="accessibility-required" value="required" required />
        <Radio label="Invalid choice" name="accessibility-invalid" value="invalid" invalid aria-describedby="radio-error" />
        <p id="radio-error" style={helpTextStyle}>
          Choose one option before continuing.
        </p>
      </div>

      <div style={cardStyle}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={cellStyle}>
                <Radio aria-label="Select primary matter" name="matter-radio" value="primary" defaultChecked />
              </td>
              <td style={cellStyle}>Primary matter</td>
            </tr>
            <tr>
              <td style={cellStyle}>
                <Radio aria-label="Select secondary matter" name="matter-radio" value="secondary" />
              </td>
              <td style={cellStyle}>Secondary matter</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={cardStyle}>
        <RadioGroup label="Preferred contact method" name="contact-method" options={options} />
      </div>

      <div style={cardStyle}>
        <ControlledGroupExample />
      </div>

      <div style={cardStyle}>
        <RadioGroup label="Delivery speed" name="delivery-speed" defaultValue="standard" options={[
          { value: 'standard', label: 'Standard' },
          { value: 'expedited', label: 'Expedited' },
          { value: 'overnight', label: 'Overnight' },
        ]} />
      </div>

      <div style={cardStyle}>
        <RadioGroup label="Required group" name="required-group" required options={options} />
      </div>

      <div style={cardStyle}>
        <RadioGroup
          label="Invalid group"
          name="invalid-group"
          invalid
          errorMessage="Choose one option before continuing."
          options={options}
        />
      </div>

      <div style={cardStyle}>
        <RadioGroup label="Disabled group" name="disabled-group" disabled defaultValue="email" options={options} />
      </div>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <RadioGroup label="Dark surface group" name="dark-surface-group" defaultValue="email" options={options} />
      </div>
    </div>
  ),
};