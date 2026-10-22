import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../atoms/button';
import { Link } from '../../atoms/link';
import { SectionMessage } from '../../organisms/section-message';
import { TextField } from '../text-field';
import { TextArea } from '../text-area';
import { Field } from './field';
import type { FieldContext, FieldSize, FieldState } from './field.types';

const sizes: FieldSize[] = ['sm', 'md', 'lg'];
const states: FieldState[] = ['default', 'error', 'success'];
const contexts: FieldContext[] = ['default', 'inline'];

const meta = {
  title: 'Components/Forms/Field',
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
 * The three validation states. `error` and `success` colour the message and prepend a status icon;
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
 *   Field passes `context="inline"` to it - so the whole field reads as one inline unit.
 *
 * Set Field's `size` to match the wrapped control's `size` so the alignment lands. Inline is for
 * text-bearing controls (Text Field, Select, Text Area, pickers) - that's where a borderless control
 * with the label aligned to its inner text reads.
 */
export const Contexts: Story = {
  render: () => (
    <div style={stack}>
      <Group title="context: default, flush with the control edge at every size">
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

      <Group title="context: inline, borderless control with the label and message aligned to its text (Field size = control size)">
        <Cell label="sm/md: 8px indent">
          <Field label="Field label" context="inline" size="sm" message="Message content">
            <TextField size="sm" placeholder="Placeholder" />
          </Field>
        </Cell>
        <Cell label="sm/md: 8px indent">
          <Field label="Field label" context="inline" size="md" message="Message content">
            <TextField size="md" placeholder="Placeholder" />
          </Field>
        </Cell>
        <Cell label="lg: 12px indent">
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
        <Field label="Bio" state="error" message="Add a sentence or two about yourself.">
          <TextArea invalid placeholder="Tell us about yourself" />
        </Field>
      </Cell>
    </div>
  ),
};

type CheckedField = 'name' | 'email';

const CHECKED_LABELS: Record<CheckedField, string> = { name: 'Client name', email: 'Work email' };

/** The errors in the form's values, in the order the fields appear. */
function checkValues(values: Record<CheckedField, string>) {
  const errors: Partial<Record<CheckedField, string>> = {};
  if (!values.name.trim()) errors.name = "Enter the client's first and last name.";
  if (!/.+@.+\..+/.test(values.email)) errors.email = 'Enter an email address, like name@example.com.';
  return errors;
}

/**
 * When errors show, as the system's rule says: nothing is checked until the form is submitted; then
 * every error shows at once, with a summary at the top, and from then on each field's error follows
 * its value, so it clears as soon as it's fixed. The summary changes only on the next submit.
 */
function ValidatingForm() {
  const prefix = useId();
  const ids: Record<CheckedField, string> = { name: `${prefix}-name`, email: `${prefix}-email` };
  const [values, setValues] = useState<Record<CheckedField, string>>({ name: '', email: 'jordan.lee@' });
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [summary, setSummary] = useState<CheckedField[]>([]);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Before the first submit nothing is checked; after it, each field's error follows its value.
  const errors = submitted ? checkValues(values) : {};

  // Move focus to the summary after each failed submit, so it's read out and people start there.
  useEffect(() => {
    if (attempt > 0) summaryRef.current?.focus();
  }, [attempt]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const failed = (Object.keys(CHECKED_LABELS) as CheckedField[]).filter((key) => checkValues(values)[key]);
    setSummary(failed);
    if (failed.length > 0) setAttempt((count) => count + 1);
  };

  return (
    <form noValidate onSubmit={submit} style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      {summary.length > 0 ? (
        <SectionMessage ref={summaryRef} tabIndex={-1} tone="error" title={`Fix ${summary.length === 1 ? '1 field' : `${summary.length} fields`} to save`}>
          {summary.map((key) => (
            <div key={key}>
              <Link
                href={`#${ids[key]}`}
                emphasis="default"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(ids[key])?.focus();
                }}
              >
                {CHECKED_LABELS[key]}
              </Link>
            </div>
          ))}
        </SectionMessage>
      ) : null}
      {(Object.keys(CHECKED_LABELS) as CheckedField[]).map((key) => (
        <Field
          key={key}
          label={CHECKED_LABELS[key]}
          required
          state={errors[key] ? 'error' : 'default'}
          message={errors[key] ?? (key === 'email' ? "We'll send the engagement letter here." : undefined)}
        >
          <TextField
            id={ids[key]}
            type={key === 'email' ? 'email' : 'text'}
            value={values[key]}
            invalid={Boolean(errors[key])}
            onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
          />
        </Field>
      ))}
      <div>
        <Button type="submit" prominence="primary">
          Save
        </Button>
      </div>
    </form>
  );
}

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Live validation: checked on submit, then as each value changes">
        <div style={{ inlineSize: '360px' }}>
          <ValidatingForm />
        </div>
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
