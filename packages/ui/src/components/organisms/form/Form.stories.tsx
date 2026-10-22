import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from '../../molecules/field';
import { TextField } from '../../molecules/text-field';
import { TextArea } from '../../molecules/text-area';
import { Select } from '../../molecules/select';
import { Button } from '../../atoms/button';
import { Checkbox } from '../../atoms/checkbox';
import { RadioGroup } from '../../atoms/radio';
import { DatePicker } from '../date-picker';
import { Form, FormSection, FormRow, FormFooter } from './form';

const meta = {
  title: 'Components/Forms/Form',
  component: Form,
  args: {
    title: 'Create a new repository',
    requiredLegend: true,
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    requiredLegend: { control: 'boolean' },
    children: { control: false },
    className: { control: false },
    headerClassName: { control: false },
    onSubmit: { control: false },
  },
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

const frame: CSSProperties = { inlineSize: '640px', maxInlineSize: '100%' };

const VISIBILITY = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

const OWNERS = [
  { value: 'javerill', label: 'javerill' },
  { value: 'legacyhq', label: 'legacyhq' },
];

/** A realistic repository form: header, a section of fields (one row two-up), and end-aligned actions. */
function RepositoryForm() {
  const [owner, setOwner] = useState<string | null>('javerill');
  const [visibility, setVisibility] = useState<string | null>('public');

  return (
    <div style={frame}>
      <Form title="Create a new repository" requiredLegend onSubmit={(event) => event.preventDefault()}>
        <FormSection>
          <FormRow>
            <Field label="Owner" required>
              <Select options={OWNERS} value={owner} onChange={setOwner} />
            </Field>
            <Field label="Repository name" required message="Great repository names are short and memorable.">
              <TextField placeholder="my-project" />
            </Field>
          </FormRow>

          <Field label="Description">
            <TextArea placeholder="A short description of your project" />
          </Field>

          <Field label="Visibility" message="Anyone on the internet can see a public repository.">
            <Select options={VISIBILITY} value={visibility} onChange={setVisibility} />
          </Field>

          <Checkbox label="Add a README file" />
        </FormSection>

        <FormFooter align="end">
          <Button prominence="tertiary" type="button">
            Cancel
          </Button>
          <Button prominence="primary" type="submit">
            Create repository
          </Button>
        </FormFooter>
      </Form>
    </div>
  );
}

/** The full pattern, wired end to end. */
export const Playground: Story = {
  render: (args) => (
    <div style={frame}>
      <Form {...args} onSubmit={(event) => event.preventDefault()}>
        <FormSection>
          <Field label="Repository name" required>
            <TextField placeholder="my-project" />
          </Field>
          <Field label="Description">
            <TextArea placeholder="A short description" />
          </Field>
        </FormSection>
        <FormFooter align="end">
          <Button prominence="tertiary" type="button">
            Cancel
          </Button>
          <Button prominence="primary" type="submit">
            Create
          </Button>
        </FormFooter>
      </Form>
    </div>
  ),
};

/** A complete, realistic form. */
export const Repository: Story = { render: () => <RepositoryForm /> };

/** Multiple titled sections group related fields; each section adds top spacing and an optional heading. */
export const Sections: Story = {
  render: () => (
    <div style={frame}>
      <Form title="Project settings" requiredLegend onSubmit={(event) => event.preventDefault()}>
        <FormSection title="General">
          <Field label="Project name" required>
            <TextField placeholder="My project" />
          </Field>
          <Field label="Description">
            <TextArea placeholder="What is this project?" />
          </Field>
        </FormSection>

        <FormSection title="Danger zone">
          <Field label="Rename repository" message="This will not break existing links.">
            <TextField placeholder="new-name" />
          </Field>
        </FormSection>

        <FormFooter align="end">
          <Button prominence="primary" type="submit">
            Save changes
          </Button>
        </FormFooter>
      </Form>
    </div>
  ),
};

/** FormRow lays fields out as equal columns (up to 4). Fields outside a row take the full width. */
export const Rows: Story = {
  render: () => (
    <div style={frame}>
      <Form onSubmit={(event) => event.preventDefault()}>
        <FormSection title="Rows">
          <Field label="Full width (no row)">
            <TextField placeholder="One column" />
          </Field>
          <FormRow>
            <Field label="First name">
              <TextField placeholder="Jordan" />
            </Field>
            <Field label="Last name">
              <TextField placeholder="Lee" />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="City">
              <TextField placeholder="City" />
            </Field>
            <Field label="State">
              <TextField placeholder="State" />
            </Field>
            <Field label="ZIP">
              <TextField placeholder="00000" />
            </Field>
          </FormRow>
        </FormSection>
      </Form>
    </div>
  ),
};

/** The footer aligns its actions to the end (default) or the start. */
export const FooterAlignment: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-2xl)', ...frame }}>
      {(['end', 'start'] as const).map((align) => (
        <Form key={align} onSubmit={(event) => event.preventDefault()}>
          <FormSection title={`align="${align}"`}>
            <Field label="Email">
              <TextField type="email" placeholder="you@example.com" />
            </Field>
          </FormSection>
          <FormFooter align={align}>
            <Button prominence="tertiary" type="button">
              Cancel
            </Button>
            <Button prominence="primary" type="submit">
              Submit
            </Button>
          </FormFooter>
        </Form>
      ))}
    </div>
  ),
};

/** No header, and a dark surface. */
export const EdgeCases: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-2xl)' }}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)', ...frame }}>
        <h3 style={{ margin: 0, color: 'var(--color-content-subtle)' }}>No header</h3>
        <Form onSubmit={(event) => event.preventDefault()}>
          <FormSection>
            <Field label="Search">
              <TextField type="search" placeholder="Search" />
            </Field>
          </FormSection>
        </Form>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={{ margin: 0, color: 'var(--color-content-subtle)' }}>Dark surface</h3>
        <div
          data-theme="dark"
          style={{
            ...frame,
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-elevation-surface-default)',
          }}
        >
          <Form title="Create a new repository" requiredLegend onSubmit={(event) => event.preventDefault()}>
            <FormSection>
              <Field label="Repository name" required>
                <TextField placeholder="my-project" />
              </Field>
            </FormSection>
            <FormFooter align="end">
              <Button prominence="primary" type="submit">
                Create
              </Button>
            </FormFooter>
          </Form>
        </div>
      </section>
    </div>
  ),
};

const BILLING = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'flat', label: 'Flat fee' },
];

// A native fieldset's own border, padding, and margin, cleared so the fields sit where a FormSection
// would put them. Its legend is the section's title, hidden here because the Form title names it.
const plainFieldset: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-lg)',
  minInlineSize: 0,
  margin: 'var(--spacing-none)',
  padding: 'var(--spacing-none)',
  border: 'none',
};

/**
 * Disabling a group of fields at once: wrap them in a native `<fieldset disabled>`. Every control in
 * it is disabled and looks it, without its own `disabled` prop, just as the browser disables native
 * inputs. Here a closed matter's details are locked until it's reopened.
 */
function LockedMatterForm() {
  const [locked, setLocked] = useState(true);
  const [owner, setOwner] = useState<string | null>('javerill');

  return (
    <div style={frame}>
      <Form title="Matter details" description={locked ? 'This matter is closed. Reopen it to make changes.' : 'Make your changes, then save.'} onSubmit={(event) => event.preventDefault()}>
        <FormSection>
          <fieldset disabled={locked} style={plainFieldset}>
            <FormRow>
              <Field label="Matter name">
                <TextField defaultValue="Lee Living Trust" />
              </Field>
              <Field label="Responsible attorney">
                <Select options={OWNERS} value={owner} onChange={setOwner} />
              </Field>
            </FormRow>
            <Field label="Opened">
              <DatePicker defaultValue={new Date(2026, 2, 9)} today={new Date(2026, 2, 9)} />
            </Field>
            <RadioGroup label="Billing" orientation="horizontal" defaultValue="flat" options={BILLING} />
            <Checkbox label="Email the client a copy of each document" defaultChecked />
          </fieldset>
        </FormSection>
        <FormFooter align="end">
          <Button prominence={locked ? 'primary' : 'tertiary'} onClick={() => setLocked((current) => !current)}>
            {locked ? 'Reopen matter' : 'Close matter'}
          </Button>
          {locked ? null : (
            <Button prominence="primary" type="submit">
              Save
            </Button>
          )}
        </FormFooter>
      </Form>
    </div>
  );
}

/** A group of fields disabled at once by a native `<fieldset disabled>`. */
export const DisabledFieldset: Story = { render: () => <LockedMatterForm /> };
