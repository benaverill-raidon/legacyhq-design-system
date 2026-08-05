import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox';

const meta = {
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
} satisfies Meta<typeof Checkbox>;

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

const fieldsetStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-none)',
  border: 0,
  margin: 'var(--spacing-none)',
};

const legendStyle: CSSProperties = {
  marginBlockEnd: 'var(--spacing-xs)',
  color: 'var(--color-content-subtle)',
};

const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse' };

const cellStyle: CSSProperties = {
  padding: 'var(--spacing-sm)',
  borderBlockEnd: 'var(--border-width-sm) solid var(--color-border-default)',
  textAlign: 'start',
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
      <h3
        style={{
          margin: 0,
          font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
          color: 'var(--color-content-default)',
        }}
      >
        {title}
      </h3>
      <div style={row}>{children}</div>
    </section>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/**
 * The checked-value states crossed with interaction and system states. `data-force-state` mirrors
 * the real `:hover` / `:active` / `:focus-visible` states - the same convention Avatar and Button
 * use - so they render statically as a regression reference. `autoFocus` alone isn't used for Focus
 * since a checkbox gaining programmatic focus does not reliably match `:focus-visible`.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Unchecked">
        <Cell label="Default">
          <Checkbox label="Label" />
        </Cell>
        <Cell label="Hover">
          <Checkbox label="Label" data-force-state="hover" />
        </Cell>
        <Cell label="Focus visible">
          <Checkbox label="Label" data-force-state="focus" />
        </Cell>
        <Cell label="Pressed">
          <Checkbox label="Label" data-force-state="active" />
        </Cell>
        <Cell label="Disabled">
          <Checkbox label="Label" disabled />
        </Cell>
      </Group>

      <Group title="Checked">
        <Cell label="Default">
          <Checkbox label="Label" defaultChecked />
        </Cell>
        <Cell label="Hover">
          <Checkbox label="Label" data-force-state="hover" defaultChecked />
        </Cell>
        <Cell label="Focus visible">
          <Checkbox label="Label" data-force-state="focus" defaultChecked />
        </Cell>
        <Cell label="Pressed">
          <Checkbox label="Label" data-force-state="active" defaultChecked />
        </Cell>
        <Cell label="Disabled">
          <Checkbox label="Label" disabled defaultChecked />
        </Cell>
      </Group>

      <Group title="Indeterminate">
        <Cell label="Default">
          <Checkbox label="Label" indeterminate />
        </Cell>
        <Cell label="Hover">
          <Checkbox label="Label" data-force-state="hover" indeterminate />
        </Cell>
        <Cell label="Focus visible">
          <Checkbox label="Label" data-force-state="focus" indeterminate />
        </Cell>
        <Cell label="Pressed">
          <Checkbox label="Label" data-force-state="active" indeterminate />
        </Cell>
        <Cell label="Disabled">
          <Checkbox label="Label" disabled indeterminate />
        </Cell>
      </Group>

      <Group title="Invalid (unchecked / checked / indeterminate)">
        <Cell label="Default">
          <Checkbox label="Label" invalid />
        </Cell>
        <Cell label="Checked">
          <Checkbox label="Label" invalid defaultChecked />
        </Cell>
        <Cell label="Indeterminate">
          <Checkbox label="Label" invalid indeterminate />
        </Cell>
        <Cell label="Hover">
          <Checkbox label="Label" invalid data-force-state="hover" />
        </Cell>
        <Cell label="Pressed">
          <Checkbox label="Label" invalid data-force-state="active" />
        </Cell>
      </Group>

      <Group title="Live - click this">
        <Cell label="Uncontrolled">
          <Checkbox label="Toggle me" />
        </Cell>
      </Group>
    </div>
  ),
};

/** How Checkbox behaves with realistic content, and inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Label content">
        <Cell label="Standard label">
          <Checkbox label="Send matter updates" defaultChecked />
        </Cell>
        <Cell label="Required">
          <Checkbox label="I agree to the retention policy" required />
        </Cell>
        <Cell label="No visible label (aria-label only)">
          <Checkbox aria-label="Select current row" />
        </Cell>
        <Cell label="Long label wraps in place">
          <div style={{ inlineSize: '220px' }}>
            <Checkbox label="Notify every assigned reviewer whenever this matter changes status" />
          </div>
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          In composition
        </h3>
        <fieldset style={cardStyle}>
          <legend style={legendStyle}>Notification channels</legend>
          <div style={fieldsetStyle}>
            <Checkbox label="Email" defaultChecked name="channels" value="email" />
            <Checkbox label="SMS" name="channels" value="sms" />
            <Checkbox label="In-app" name="channels" value="in-app" />
          </div>
        </fieldset>

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
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application, including a documented anti-pattern. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          No accessible name (anti-pattern)
        </h3>
        <p style={captionStyle}>
          Checkbox has no dev-time warning for this today - omitting both <code>label</code> and{' '}
          <code>aria-label</code> renders a control assistive technology cannot describe.
        </p>
        <Checkbox />
      </section>

      <Group title="Invalid with an adjacent error message">
        <Cell label="Described by visible text">
          <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
            <Checkbox
              label="Invalid selection with described error"
              invalid
              aria-describedby="checkbox-error"
            />
            <p id="checkbox-error" style={legendStyle}>
              Select this option before continuing.
            </p>
          </div>
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Narrow container
        </h3>
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
          <Checkbox label="Include closed matters in this search" />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Dark surface
        </h3>
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
          <Checkbox label="Dark surface option" defaultChecked />
          <Checkbox label="Dark invalid option" invalid />
        </div>
      </section>
    </div>
  ),
};
