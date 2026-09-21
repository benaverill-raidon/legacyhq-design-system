import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditIcon } from '../../../assets/icons';
import { TextField } from '../text-field';
import { TextArea } from '../text-area';
import { Select } from '../select';
import { InlineEdit } from '../inline-edit';
import { KeyValuePair } from './key-value-pair';
import type { KeyValuePairSize } from './key-value-pair.types';

const sizes: KeyValuePairSize[] = ['sm', 'md', 'lg'];

const meta = {
  title: 'UI/Molecules/Key Value Pair',
  component: KeyValuePair,
  args: {
    label: 'Client name',
    value: 'Jane Doe',
    size: 'md',
    underline: true,
  },
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
    underline: { control: 'boolean' },
    label: { control: 'text' },
    value: { control: 'text' },
  },
} satisfies Meta<typeof KeyValuePair>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const containerStyle: CSSProperties = { inlineSize: '480px' };

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      <div style={containerStyle}>{children}</div>
    </section>
  );
}

function LiveEditableKVP({ label, initial }: { label: string; initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <KeyValuePair label={label} underline>
      <InlineEdit value={value} onConfirm={setValue} actionPlacement="end">
        <TextField appearance="inline" aria-label={label} iconAfter={<EditIcon color="subtle" />} />
      </InlineEdit>
    </KeyValuePair>
  );
}

function LiveNotesKVP({ label = 'Notes', initial, size = 'md' }: { label?: string; initial: string; size?: KeyValuePairSize }) {
  const [value, setValue] = useState(initial);
  return (
    <KeyValuePair size={size} label={label} underline>
      <InlineEdit value={value} onConfirm={setValue} actionPlacement="end" actionAlignment="start">
        <TextArea size={size} autoResize appearance="inline" aria-label={label} iconAfter={<EditIcon color="subtle" />} />
      </InlineEdit>
    </KeyValuePair>
  );
}

/** Prop exploration. */
export const Playground: Story = {};

/** Static (read-only) pairs at each size. */
export const Static: Story = {
  render: () => (
    <div style={stack}>
      {sizes.map((size) => (
        <Group key={size} title={`Size: ${size}`}>
          <KeyValuePair size={size} label="Client name" value="Jane Doe" underline />
          <KeyValuePair size={size} label="Account type" value="Trust" underline />
          <KeyValuePair size={size} label="Status" value="Active" />
        </Group>
      ))}
    </div>
  ),
};

const accountTypeOptions = [
  { value: 'trust', label: 'Trust' },
  { value: 'individual', label: 'Individual' },
  { value: 'joint', label: 'Joint' },
  { value: 'corporate', label: 'Corporate' },
];

function LiveSelectKVP({ label, initial }: { label: string; initial: string }) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <KeyValuePair label={label} underline>
      <Select
        appearance="inline"
        aria-label={label}
        options={accountTypeOptions}
        value={value}
        onChange={setValue}
      />
    </KeyValuePair>
  );
}

/** Inline editable pairs wrapped in InlineEdit — click a value to edit, Enter to confirm. */
export const InlineEditable: Story = {
  render: () => (
    <div style={stack}>
      <Group title="With TextField + InlineEdit">
        <LiveEditableKVP label="Client name" initial="Jane Doe" />
        <LiveEditableKVP label="Email" initial="jane@example.com" />
        <KeyValuePair label="Account type" value="Trust" underline />
      </Group>

      <Group title="With Select">
        <LiveSelectKVP label="Account type" initial="trust" />
      </Group>

      <Group title="With TextArea + InlineEdit (Enter for newline, Ctrl/Cmd+Enter to save)">
        <LiveNotesKVP initial="Awaiting trust schedule from the client." />
        <KeyValuePair label="Status" value="Active" />
      </Group>
    </div>
  ),
};

/** Underline vs no underline. */
export const Underline: Story = {
  render: () => (
    <div style={stack}>
      <Group title="underline={true}">
        <KeyValuePair label="Name" value="Jane Doe" underline />
        <KeyValuePair label="Email" value="jane@example.com" underline />
        <KeyValuePair label="Status" value="Active" underline />
      </Group>

      <Group title="underline={false}">
        <KeyValuePair label="Name" value="Jane Doe" />
        <KeyValuePair label="Email" value="jane@example.com" />
        <KeyValuePair label="Status" value="Active" />
      </Group>
    </div>
  ),
};

/** All sizes with inline controls side by side. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      {sizes.map((size) => (
        <Group key={size} title={`Size: ${size}`}>
          <KeyValuePair size={size} label="Client name" underline>
            <InlineEdit value="Jane Doe" onConfirm={() => {}} actionPlacement="end">
              <TextField size={size} appearance="inline" aria-label="Client name" iconAfter={<EditIcon color="subtle" />} />
            </InlineEdit>
          </KeyValuePair>
          <LiveNotesKVP size={size} initial="Trust schedule pending." />
          <KeyValuePair size={size} label="Status" value="Active" />
        </Group>
      ))}
    </div>
  ),
};

/** Existing content, wrapping, and the six-line scrolling limit at every control size. */
export const GrowingNotes: Story = {
  render: () => (
    <div style={stack}>
      {sizes.map((size) => (
        <Group key={size} title={`Growing notes: ${size}`}>
          <LiveNotesKVP size={size} label={`Short ${size}`} initial="Short note" />
          <LiveNotesKVP size={size} label={`Wrapped ${size}`} initial="Awaiting the trust schedule from the client. Review the signed engagement letter and confirm the remaining documents before the next meeting." />
          <LiveNotesKVP size={size} label={`Long ${size}`} initial={Array.from({ length: 9 }, (_, i) => `Note ${i + 1}`).join('\n')} />
          <KeyValuePair size={size} label="Next row" value="Moves down with notes" underline />
        </Group>
      ))}
    </div>
  ),
};
