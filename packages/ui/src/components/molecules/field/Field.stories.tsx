import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from '../text-field';
import { TextArea } from '../text-area';
import { Field } from './field';
import type { FieldContext, FieldSize, FieldState } from './field.types';

const sizes: FieldSize[] = ['sm', 'md', 'lg'];
const states: FieldState[] = ['default', 'error', 'valid'];
const contexts: FieldContext[] = ['default', 'inline'];

const meta = {
  title: 'UI/Molecules/Field',
  component: Field,
  args: {
    // A default control so `children` (required) is satisfied for every story; stories with their
    // own `render` provide their own control and this is ignored.
    children: <TextField placeholder="Placeholder" />,
    label: 'Field label',
    message: 'Message content',
    state: 'default',
    context: 'default',
    size: 'md',
    required: false,
  },
  argTypes: {
    label: { control: 'text' },
    message: { control: 'text' },
    state: { control: 'inline-radio', options: states },
    context: { control: 'inline-radio', options: contexts },
    size: { control: 'inline-radio', options: sizes },
    required: { control: 'boolean' },
    children: { control: false },
    controlId: { control: false },
    className: { control: false },
    labelClassName: { control: false },
    messageClassName: { control: false },
  },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'start',
  gap: 'var(--spacing-lg)',
};

const fieldStyle: CSSProperties = { inlineSize: '240px' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
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

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'start' }}>
      <div style={fieldStyle}>{children}</div>
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

/** Prop exploration. Field wraps a Text Field; every Field prop is wired to a control. */
export const Playground: Story = {
  render: (args) => (
    <div style={fieldStyle}>
      <Field {...args}>
        {/* size mirrors Field's own size so the control and the inline indent line up. */}
        <TextField size={args.size} invalid={args.state === 'error'} placeholder="Placeholder" />
      </Field>
    </div>
  ),
};

/**
 * The three validation states. `error` and `valid` colour the message and prepend a status icon;
 * `error` also sets `aria-invalid` on the control (pair it with the control's own `invalid` prop for
 * the error border).
 */
export const States: Story = {
  render: () => (
    <div style={row}>
      {states.map((state) => (
        <Cell key={state} label={state}>
          <Field label="Email" state={state} message="We'll only use this to contact you.">
            <TextField type="email" invalid={state === 'error'} placeholder="you@example.com" />
          </Field>
        </Cell>
      ))}
    </div>
  ),
};

/**
 * `context` is one shared axis across the whole field, matching Figma:
 * - `context="default"` keeps the label and message flush with the control's outer edge and leaves
 *   the control bordered. **Size-independent** - every control size renders the same (Figma's
 *   `size=all`).
 * - `context="inline"` indents the label and message to line up with the text *inside* the control
 *   (`lg` a wider indent; `sm`/`md` share one) AND renders the control itself inline/borderless -
 *   Field injects `appearance="subtle"` into it - so the whole field reads as one inline unit.
 *
 * Set Field's `size` to match the wrapped control's `size` so the alignment lands. Inline is for
 * text-bearing controls (Text Field, Select, Text Area, pickers) - that's where a borderless control
 * with the label aligned to its inner text reads.
 */
export const Contexts: Story = {
  render: () => (
    <div style={stack}>
      <Group title="context: default — flush with the control edge, same for every size">
        <Cell label="sm control">
          <Field label="Field label" context="default" message="Message content">
            <TextField size="sm" placeholder="Placeholder" />
          </Field>
        </Cell>
        <Cell label="lg control">
          <Field label="Field label" context="default" message="Message content">
            <TextField size="lg" placeholder="Placeholder" />
          </Field>
        </Cell>
      </Group>

      <Group title="context: inline — borderless control, label/message aligned to its inner text (Field size = control size)">
        <Cell label="sm/md — 8px indent">
          <Field label="Field label" context="inline" size="sm" message="Message content">
            <TextField size="sm" placeholder="Placeholder" />
          </Field>
        </Cell>
        <Cell label="sm/md — 8px indent">
          <Field label="Field label" context="inline" size="md" message="Message content">
            <TextField size="md" placeholder="Placeholder" />
          </Field>
        </Cell>
        <Cell label="lg — 12px indent">
          <Field label="Field label" context="inline" size="lg" message="Message content">
            <TextField size="lg" placeholder="Placeholder" />
          </Field>
        </Cell>
      </Group>
    </div>
  ),
};

/** A required field, a helper-text-only field, and a message-less field. */
export const Content: Story = {
  render: () => (
    <div style={row}>
      <Cell label="Required (* + forwarded required)">
        <Field label="Password" required message="At least 12 characters.">
          <TextField type="password" placeholder="Placeholder" />
        </Field>
      </Cell>
      <Cell label="Helper text only">
        <Field label="Username" message="This is how you'll appear to others.">
          <TextField placeholder="Placeholder" />
        </Field>
      </Cell>
      <Cell label="No message">
        <Field label="Company">
          <TextField placeholder="Placeholder" />
        </Field>
      </Cell>
    </div>
  ),
};

/** Field is control-agnostic: it wires the label, message, and state onto whatever single control it wraps. */
export const AnyControl: Story = {
  render: () => (
    <div style={row}>
      <Cell label="Text Field">
        <Field label="Email" message="Helper text">
          <TextField type="email" placeholder="you@example.com" />
        </Field>
      </Cell>
      <Cell label="Text Area (error)">
        <Field label="Bio" state="error" message="Bio is required.">
          <TextArea invalid placeholder="Tell us about yourself" />
        </Field>
      </Cell>
    </div>
  ),
};

/** A live required-field validation flow: the message and state react to the input's value. */
function ValidatingField() {
  const [value, setValue] = useState('');
  const touched = value.length > 0;
  const valid = /.+@.+\..+/.test(value);
  const state: FieldState = !touched ? 'default' : valid ? 'valid' : 'error';

  return (
    <Field
      label="Email"
      required
      state={state}
      message={!touched ? 'Enter your work email.' : valid ? 'Looks good.' : 'Enter a valid email address.'}
    >
      <TextField
        type="email"
        value={value}
        invalid={state === 'error'}
        placeholder="you@example.com"
        onChange={(event) => setValue(event.target.value)}
      />
    </Field>
  );
}

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Live validation">
        <Cell label="Type an email">
          <ValidatingField />
        </Cell>
      </Group>

      <Group title="Long label and message in a narrow field">
        <div style={{ inlineSize: '180px' }}>
          <Field
            label="A considerably longer field label than usual"
            state="error"
            message="A long validation message that wraps onto more than one line inside a narrow field."
          >
            <TextField invalid placeholder="Placeholder" />
          </Field>
        </div>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div data-theme="dark" style={cardStyle}>
          <div style={row}>
            {states.map((state) => (
              <div key={state} style={fieldStyle}>
                <Field label="Email" state={state} message="Message content">
                  <TextField invalid={state === 'error'} placeholder="Placeholder" />
                </Field>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  ),
};
