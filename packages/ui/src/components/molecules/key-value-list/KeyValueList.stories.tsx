import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditIcon } from '../../../assets/icons';
import { TextField } from '../text-field';
import { TextArea } from '../text-area';
import { InlineEdit } from '../inline-edit';
import { KeyValuePair } from '../key-value-pair';
import { KeyValueList } from './key-value-list';

const meta = {
  title: 'UI/Molecules/Key Value List',
  component: KeyValueList,
  args: {
    children: null,
  },
} satisfies Meta<typeof KeyValueList>;

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

/** Static metadata list with underlines. */
export const StaticUnderlined: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Static, underlined">
        <KeyValueList>
          <KeyValuePair label="Client name" value="Jane Doe" underline />
          <KeyValuePair label="Account type" value="Trust" underline />
          <KeyValuePair label="Status" value="Active" underline />
          <KeyValuePair label="Date opened" value="2024-03-15" />
        </KeyValueList>
      </Group>
    </div>
  ),
};

/** Static metadata list without underlines. */
export const StaticClean: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Static, no underlines">
        <KeyValueList>
          <KeyValuePair label="Client name" value="Jane Doe" />
          <KeyValuePair label="Account type" value="Trust" />
          <KeyValuePair label="Status" value="Active" />
          <KeyValuePair label="Date opened" value="2024-03-15" />
        </KeyValueList>
      </Group>
    </div>
  ),
};

/** Mixed inline-editable and static pairs, wrapped in InlineEdit. */
function EditableNotes() {
  const [value, setValue] = useState('Awaiting trust schedule.');
  return (
    <InlineEdit value={value} onConfirm={setValue} actionPlacement="end" actionAlignment="start">
      <TextArea autoResize appearance="inline" aria-label="Notes" iconAfter={<EditIcon color="subtle" />} />
    </InlineEdit>
  );
}

export const MixedEditable: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Editable + static, underlined">
        <KeyValueList>
          <KeyValuePair label="Client name" underline>
            <InlineEdit value="Jane Doe" onConfirm={() => {}} actionPlacement="end">
              <TextField appearance="inline" aria-label="Client name" iconAfter={<EditIcon color="subtle" />} />
            </InlineEdit>
          </KeyValuePair>
          <KeyValuePair label="Account type" value="Trust" underline />
          <KeyValuePair label="Notes" underline>
            <EditableNotes />
          </KeyValuePair>
          <KeyValuePair label="Status" value="Active" />
        </KeyValueList>
      </Group>
    </div>
  ),
};

/** Sizes compared side by side. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Group key={size} title={`Size: ${size}`}>
          <KeyValueList>
            <KeyValuePair size={size} label="Client name" value="Jane Doe" underline />
            <KeyValuePair size={size} label="Account type" value="Trust" underline />
            <KeyValuePair size={size} label="Status" value="Active" />
          </KeyValueList>
        </Group>
      ))}
    </div>
  ),
};
