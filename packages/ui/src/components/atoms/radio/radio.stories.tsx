import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './radio';
import { RadioGroup } from './radio-group';

const options = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'mail', label: 'Mail' },
];

const meta = {
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
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-lg)',
};

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
};

const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse' };

const cellStyle: CSSProperties = {
  padding: 'var(--spacing-sm)',
  borderBlockEnd: 'var(--border-width-sm) solid var(--color-border-default)',
  textAlign: 'start',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

/** A labelled cell so every specimen in a matrix is self-describing. */
function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'start' }}>
      {children}
      <span style={captionStyle}>{label}</span>
    </div>
  );
}

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

function LiveSelectionExample() {
  const [value, setValue] = React.useState('email');

  return (
    <RadioGroup
      label="Preferred contact method"
      name="live-contact-method"
      value={value}
      onValueChange={setValue}
      options={options}
    />
  );
}

/**
 * The checked-value states crossed with interaction and system states. Radio predates the shared
 * `data-force-state` convention (Checkbox, Button, and Avatar use it) - its own CSS pins hover,
 * pressed, and focus with `previewHover` / `previewPress` / `previewFocus` classes instead. The
 * Live group is where real click-driven, mutually-exclusive selection is verified by hand.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Unchecked">
        <Cell label="Default">
          <Radio label="Label" name="state-unchecked" value="default" />
        </Cell>
        <Cell label="Hover">
          <Radio label="Label" name="state-unchecked" value="hover" className="previewHover" />
        </Cell>
        <Cell label="Focus visible">
          <Radio label="Label" name="state-unchecked" value="focus" className="previewFocus" />
        </Cell>
        <Cell label="Pressed">
          <Radio label="Label" name="state-unchecked" value="pressed" className="previewPress" />
        </Cell>
        <Cell label="Disabled">
          <Radio label="Label" name="state-unchecked" value="disabled" disabled />
        </Cell>
      </Group>

      <Group title="Checked">
        <Cell label="Default">
          <Radio label="Label" name="state-checked" value="default" defaultChecked />
        </Cell>
        <Cell label="Hover">
          <Radio label="Label" name="state-checked" value="hover" className="previewHover" defaultChecked />
        </Cell>
        <Cell label="Focus visible">
          <Radio label="Label" name="state-checked" value="focus" className="previewFocus" defaultChecked />
        </Cell>
        <Cell label="Pressed">
          <Radio label="Label" name="state-checked" value="pressed" className="previewPress" defaultChecked />
        </Cell>
        <Cell label="Disabled">
          <Radio label="Label" name="state-checked" value="disabled" disabled defaultChecked />
        </Cell>
      </Group>

      <Group title="Invalid (unchecked / checked)">
        <Cell label="Default">
          <Radio label="Label" name="state-invalid" value="default" invalid />
        </Cell>
        <Cell label="Checked">
          <Radio label="Label" name="state-invalid" value="checked" invalid defaultChecked />
        </Cell>
        <Cell label="Hover">
          <Radio label="Label" name="state-invalid" value="hover" invalid className="previewHover" />
        </Cell>
        <Cell label="Pressed">
          <Radio label="Label" name="state-invalid" value="pressed" invalid className="previewPress" />
        </Cell>
      </Group>

      <Group title="Live - click to switch the selected option">
        <LiveSelectionExample />
      </Group>
    </div>
  ),
};

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

/** How Radio and RadioGroup behave with realistic content, and inside the compositions they're designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Label content">
        <Cell label="Standard label">
          <Radio label="Send matter updates" name="content-standard" value="standard" defaultChecked />
        </Cell>
        <Cell label="Required">
          <Radio label="I agree to the retention policy" name="content-required" value="required" required />
        </Cell>
        <Cell label="No visible label (aria-label only)">
          <Radio aria-label="Select current row" name="content-row" value="row" />
        </Cell>
        <Cell label="Long label wraps in place">
          <div style={{ inlineSize: '220px' }}>
            <Radio
              label="Notify every assigned reviewer whenever this matter changes status"
              name="content-long"
              value="long"
            />
          </div>
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>In composition</h3>

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
          <RadioGroup label="Preferred contact method (options API)" name="contact-method" options={options} />
        </div>

        <div style={cardStyle}>
          <ControlledGroupExample />
        </div>

        <div style={cardStyle}>
          <RadioGroup
            label="Delivery speed (horizontal orientation)"
            name="delivery-speed"
            orientation="horizontal"
            defaultValue="standard"
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'expedited', label: 'Expedited' },
              { value: 'overnight', label: 'Overnight' },
            ]}
          />
        </div>

        <div style={cardStyle}>
          <RadioGroup
            label="Custom layout (children composition)"
            name="custom-layout"
            description="Grouped manually instead of using the options API"
          >
            <Radio label="Draft" name="custom-layout" value="draft" defaultChecked />
            <Radio label="In review" name="custom-layout" value="in-review" />
            <Radio label="Final" name="custom-layout" value="final" />
          </RadioGroup>
        </div>

        <form style={cardStyle}>
          <RadioGroup label="Required group" name="required-group" required options={options} />
          <button type="submit">Continue</button>
        </form>

        <div style={cardStyle}>
          <RadioGroup label="Disabled group" name="disabled-group" disabled defaultValue="email" options={options} />
        </div>
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application, including a documented anti-pattern. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>No accessible name (anti-pattern)</h3>
        <p style={captionStyle}>
          Radio has no dev-time warning for this today - omitting both <code>label</code> and{' '}
          <code>aria-label</code> renders a control assistive technology cannot describe.
        </p>
        <Radio name="edge-unlabelled" value="unlabelled" />
      </section>

      <Group title="Invalid group with an adjacent error message">
        <RadioGroup
          label="Preferred contact method"
          name="edge-invalid-group"
          invalid
          errorMessage="Choose one option before continuing."
          options={options}
        />
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Narrow container</h3>
        <p style={captionStyle}>
          The label wraps and the control stays anchored to the first line rather than shrinking.
        </p>
        <div
          style={{
            inlineSize: '96px',
            padding: 'var(--spacing-sm)',
            border: 'var(--border-width-sm) dashed var(--color-border-default)',
            borderRadius: 'var(--border-radius-sm)',
          }}
        >
          <Radio label="Include closed matters in this search" name="edge-narrow" value="narrow" />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Horizontal orientation wraps in a narrow container</h3>
        <p style={captionStyle}>
          <code>orientation=&quot;horizontal&quot;</code> lays options out in a row that wraps
          (<code>flex-wrap</code>) rather than overflowing, once the container is too narrow for
          every option.
        </p>
        <div style={{ inlineSize: '220px' }}>
          <RadioGroup
            label="Delivery speed"
            name="edge-horizontal"
            orientation="horizontal"
            defaultValue="standard"
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'expedited', label: 'Expedited' },
              { value: 'overnight', label: 'Overnight' },
              { value: 'international', label: 'International' },
            ]}
          />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div
          data-theme="dark"
          style={{
            display: 'grid',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-elevation-surface-default)',
            color: 'var(--color-content-default)',
          }}
        >
          <RadioGroup label="Dark surface group" name="dark-surface-group" defaultValue="email" options={options} />
          <Radio label="Dark invalid option" name="dark-invalid" value="invalid" invalid />
        </div>
      </section>
    </div>
  ),
};
