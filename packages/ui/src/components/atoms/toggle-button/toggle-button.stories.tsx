import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CheckIcon, CloseIcon, EditIcon, SearchIcon } from '../../../assets/icons';
import { ToggleButton } from './toggle-button';

const meta: Meta<typeof ToggleButton> = {
  title: 'UI/Atoms/Toggle Button',
  component: ToggleButton,
  args: {
    children: 'Toggle Button',
    size: 'md',
    tone: 'default',
    isSelected: false,
    isDisabled: false,
  },
  argTypes: {
    children: { control: 'text' },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['default', 'subtle'] },
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    iconBefore: { control: false },
    iconAfter: { control: false },
    className: { control: false },
    onClick: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof ToggleButton>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-150)',
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

function ToolbarExample() {
  const [selected, setSelected] = React.useState<'bold' | 'italic' | 'underline' | null>('bold');

  return (
    <div style={rowStyle}>
      <ToggleButton isSelected={selected === 'bold'} onClick={() => setSelected('bold')} iconBefore={<EditIcon />}>
        Bold
      </ToggleButton>
      <ToggleButton isSelected={selected === 'italic'} onClick={() => setSelected('italic')} iconBefore={<EditIcon />}>
        Italic
      </ToggleButton>
      <ToggleButton
        isSelected={selected === 'underline'}
        onClick={() => setSelected('underline')}
        iconBefore={<EditIcon />}
      >
        Underline
      </ToggleButton>
    </div>
  );
}

function ViewModeExample() {
  const [selected, setSelected] = React.useState<'list' | 'search'>('list');

  return (
    <div style={rowStyle}>
      <ToggleButton isSelected={selected === 'list'} onClick={() => setSelected('list')} iconBefore={<CheckIcon />}>
        List view
      </ToggleButton>
      <ToggleButton
        tone="subtle"
        isSelected={selected === 'search'}
        onClick={() => setSelected('search')}
        iconBefore={<SearchIcon />}
      >
        Search mode
      </ToggleButton>
    </div>
  );
}

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <ToggleButton size="xs">XS</ToggleButton>
        <ToggleButton size="sm">SM</ToggleButton>
        <ToggleButton size="md">MD</ToggleButton>
        <ToggleButton size="lg">LG</ToggleButton>
      </div>

      <div style={rowStyle}>
        <ToggleButton tone="default">Default</ToggleButton>
        <ToggleButton tone="default" isSelected>
          Default selected
        </ToggleButton>
        <ToggleButton tone="subtle">Subtle</ToggleButton>
        <ToggleButton tone="subtle" isSelected>
          Subtle selected
        </ToggleButton>
      </div>

      <div style={rowStyle}>
        <ToggleButton iconBefore={<CheckIcon />}>Icon before</ToggleButton>
        <ToggleButton iconAfter={<CloseIcon />}>Icon after</ToggleButton>
        <ToggleButton isDisabled>Disabled</ToggleButton>
        <ToggleButton isSelected isDisabled>
          Selected disabled
        </ToggleButton>
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <ToolbarExample />
      </div>

      <div style={cardStyle}>
        <ViewModeExample />
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <ToggleButton isSelected iconBefore={<CheckIcon />}>
            Selected filter
          </ToggleButton>
          <ToggleButton iconAfter={<CloseIcon />}>Available filter</ToggleButton>
        </div>
      </div>
    </div>
  ),
};
