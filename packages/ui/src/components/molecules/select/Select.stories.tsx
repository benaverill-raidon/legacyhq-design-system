import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../../atoms/avatar';
import { TaskNotStartedIcon } from '../../../assets/icons';
import { Select } from './select';
import type { SelectOption, SelectSize, SelectTone } from './select.types';

const SIZES: SelectSize[] = ['sm', 'md', 'lg'];
const TONES: SelectTone[] = ['default', 'subtle'];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'in-review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'filed', label: 'Filed' },
  { value: 'archived', label: 'Archived' },
];

const PEOPLE_OPTIONS: SelectOption[] = [
  { value: 'jordan', label: 'Jordan Ellis', icon: <Avatar name="Jordan Ellis" size="xs" decorative /> },
  { value: 'priya', label: 'Priya Nair', icon: <Avatar name="Priya Nair" size="xs" decorative /> },
  { value: 'sam', label: 'Sam Okafor', icon: <Avatar name="Sam Okafor" size="xs" decorative /> },
  { value: 'mei', label: 'Mei Lin', icon: <Avatar name="Mei Lin" size="xs" decorative /> },
];

const GROUPED_OPTIONS: SelectOption[] = [
  { value: 'trust', label: 'Trust', group: 'Estate' },
  { value: 'will', label: 'Will', group: 'Estate' },
  { value: 'poa', label: 'Power of attorney', group: 'Estate' },
  { value: 'llc', label: 'LLC formation', group: 'Business' },
  { value: 'nda', label: 'NDA', group: 'Business' },
];

const meta = {
  title: 'UI/Molecules/Select',
  component: Select,
  args: {
    options: STATUS_OPTIONS,
    size: 'md',
    tone: 'default',
    placeholder: 'Select a status',
    // Defaults so `render`-only stories satisfy the discriminated union; the Playground render
    // overrides value/onChange with its own state.
    value: null,
    onChange: () => {},
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    tone: { control: 'inline-radio', options: TONES },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    options: { control: false },
    value: { control: false },
    onChange: { control: false },
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = React.useState<string | null>(null);
    // Pass the common controllable fields explicitly rather than spreading the discriminated union,
    // which TS can't narrow through a spread.
    return (
      <div style={{ inlineSize: '280px' }}>
        <Select
          options={args.options}
          size={args.size}
          tone={args.tone}
          placeholder={args.placeholder}
          disabled={args.disabled}
          invalid={args.invalid}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)', maxInlineSize: '320px' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      {description ? <p style={captionStyle}>{description}</p> : null}
      {children}
    </section>
  );
}

/** Prop exploration - a single-select over a short status list. Click or type to open. */
export const Playground: Story = {};

/** Single vs multi. Single shows the chosen label in the trigger; multi shows removable chips. */
export const InputTypes: Story = {
  render: () => {
    function SingleExample() {
      const [value, setValue] = React.useState<string | null>('approved');
      return <Select options={STATUS_OPTIONS} value={value} onChange={setValue} placeholder="Select a status" />;
    }
    function MultiExample() {
      const [value, setValue] = React.useState<string[]>(['jordan', 'priya']);
      return (
        <Select inputType="multi" options={PEOPLE_OPTIONS} value={value} onChange={setValue} placeholder="Add assignees" />
      );
    }
    return (
      <div style={stack}>
        <Group title="Single-select" description="One value; the trigger shows its label.">
          <SingleExample />
        </Group>
        <Group title="Multi-select" description="An array of values as removable chips; re-picking a row toggles it off.">
          <MultiExample />
        </Group>
      </div>
    );
  },
};

/** Type in the trigger to filter the options live; the panel shows the empty message when nothing matches. */
export const Typeahead: Story = {
  render: () => {
    function Example() {
      const [value, setValue] = React.useState<string | null>(null);
      return (
        <Select
          options={PEOPLE_OPTIONS}
          value={value}
          onChange={setValue}
          placeholder="Search people"
          emptyMessage="No people match"
        />
      );
    }
    return (
      <div style={{ inlineSize: '280px' }}>
        <Example />
      </div>
    );
  },
};

/** Options grouped under section headings, via each option's `group` field. */
export const Grouped: Story = {
  render: () => {
    function Example() {
      const [value, setValue] = React.useState<string | null>(null);
      return <Select options={GROUPED_OPTIONS} value={value} onChange={setValue} placeholder="Select a matter type" />;
    }
    return (
      <div style={{ inlineSize: '280px' }}>
        <Example />
      </div>
    );
  },
};

/** All three sizes and both tones. `tone` maps to TextField's `appearance`. */
export const Variants: Story = {
  render: () => {
    function Field({ size, tone }: { size: SelectSize; tone: SelectTone }) {
      const [value, setValue] = React.useState<string | null>('approved');
      return <Select options={STATUS_OPTIONS} value={value} onChange={setValue} size={size} tone={tone} />;
    }
    return (
      <div style={stack}>
        {TONES.map((tone) => (
          <Group key={tone} title={`tone: ${tone}`}>
            {SIZES.map((size) => (
              <Field key={size} size={size} tone={tone} />
            ))}
          </Group>
        ))}
      </div>
    );
  },
};

/** Invalid and disabled, single and multi. */
export const States: Story = {
  render: () => {
    function InvalidExample() {
      const [value, setValue] = React.useState<string | null>(null);
      return <Select options={STATUS_OPTIONS} value={value} onChange={setValue} placeholder="Required" invalid />;
    }
    return (
      <div style={stack}>
        <Group title="Invalid" description="Red border and aria-invalid on the input.">
          <InvalidExample />
        </Group>
        <Group title="Disabled - single">
          <Select options={STATUS_OPTIONS} value="approved" onChange={() => {}} disabled />
        </Group>
        <Group title="Disabled - multi" description="Chips render disabled; removal is blocked.">
          <Select inputType="multi" options={PEOPLE_OPTIONS} value={['jordan', 'priya']} onChange={() => {}} disabled />
        </Group>
      </div>
    );
  },
};

/** A realistic form row - an icon-bearing status select wired to live state. */
export const Content: Story = {
  render: () => {
    function StatusPicker() {
      const [value, setValue] = React.useState<string | null>('in-review');
      const withIcons: SelectOption[] = STATUS_OPTIONS.map((o) => ({
        ...o,
        icon: <TaskNotStartedIcon decorative />,
      }));
      return (
        <div style={stack}>
          <Select options={withIcons} value={value} onChange={setValue} placeholder="Select a status" aria-label="Matter status" />
          <p style={captionStyle}>{value ? `Status: ${value}` : 'No status set.'}</p>
        </div>
      );
    }
    return <StatusPicker />;
  },
};

/** Difficult cases made reproducible outside the app. */
export const EdgeCases: Story = {
  render: () => {
    function ManyChips() {
      const [value, setValue] = React.useState<string[]>(PEOPLE_OPTIONS.map((o) => o.value));
      return <Select inputType="multi" options={PEOPLE_OPTIONS} value={value} onChange={setValue} placeholder="Assignees" />;
    }
    function DisabledOption() {
      const [value, setValue] = React.useState<string | null>(null);
      const opts: SelectOption[] = [
        ...STATUS_OPTIONS.slice(0, 2),
        { value: 'locked', label: 'Locked (unavailable)', disabled: true },
      ];
      return <Select options={opts} value={value} onChange={setValue} placeholder="Select" />;
    }
    return (
      <div style={stack}>
        <Group title="Many chips stay on one line" description="The trigger is single-line; chips shrink and clip rather than wrapping.">
          <ManyChips />
        </Group>
        <Group title="A disabled option" description="Non-selectable rows stay visible but inert.">
          <DisabledOption />
        </Group>
        <Group title="Dark surface">
          <div
            data-theme="dark"
            style={{
              padding: 'var(--spacing-lg)',
              borderRadius: 'var(--border-radius-lg)',
              background: 'var(--color-elevation-surface-default)',
            }}
          >
            <Select options={STATUS_OPTIONS} value="approved" onChange={() => {}} />
          </div>
        </Group>
      </div>
    );
  },
};
