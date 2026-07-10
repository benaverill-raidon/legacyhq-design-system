import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  CheckIcon,
  EditIcon,
  LayoutOneColumnIcon,
  LayoutTwoColumnsSidebarLeftIcon,
  SearchIcon,
  StarStarredIcon,
  StarUnstarredIcon,
} from '../../../assets/icons';
import { ToggleIconButton } from './toggle-icon-button';

const meta: Meta<typeof ToggleIconButton> = {
  title: 'UI/Atoms/Toggle Icon Button',
  component: ToggleIconButton,
  args: {
    size: 'md',
    tone: 'default',
    shape: 'square',
    isSelected: false,
    isDisabled: false,
    'aria-label': 'Grid view',
    children: <LayoutTwoColumnsSidebarLeftIcon />,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['default', 'subtle'] },
    shape: { control: 'inline-radio', options: ['square', 'round'] },
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    children: { control: false },
    className: { control: false },
    onClick: { control: false },
    'aria-label': { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof ToggleIconButton>;

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

function ViewModeExample() {
  const [selected, setSelected] = React.useState<'grid' | 'list'>('grid');

  return (
    <div style={rowStyle}>
      <ToggleIconButton
        aria-label="Grid view"
        isSelected={selected === 'grid'}
        onClick={() => setSelected('grid')}
      >
        <LayoutTwoColumnsSidebarLeftIcon />
      </ToggleIconButton>
      <ToggleIconButton
        aria-label="List view"
        isSelected={selected === 'list'}
        onClick={() => setSelected('list')}
      >
        <LayoutOneColumnIcon />
      </ToggleIconButton>
    </div>
  );
}

function FormattingToolbarExample() {
  const [selected, setSelected] = React.useState<'bold' | 'search' | 'edit'>('bold');

  return (
    <div style={rowStyle}>
      <ToggleIconButton aria-label="Bold" isSelected={selected === 'bold'} onClick={() => setSelected('bold')}>
        <CheckIcon />
      </ToggleIconButton>
      <ToggleIconButton aria-label="Search" isSelected={selected === 'search'} onClick={() => setSelected('search')}>
        <SearchIcon />
      </ToggleIconButton>
      <ToggleIconButton aria-label="Edit" isSelected={selected === 'edit'} onClick={() => setSelected('edit')}>
        <EditIcon />
      </ToggleIconButton>
    </div>
  );
}

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <ToggleIconButton aria-label="XS" size="xs">
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="SM" size="sm">
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="MD" size="md">
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="LG" size="lg">
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
      </div>

      <div style={rowStyle}>
        <ToggleIconButton aria-label="Default" tone="default">
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="Default selected" tone="default" isSelected>
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="Subtle" tone="subtle">
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="Subtle selected" tone="subtle" isSelected>
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
      </div>

      <div style={rowStyle}>
        <ToggleIconButton aria-label="Square" shape="square">
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="Round" shape="round">
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="Disabled" isDisabled>
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="Selected disabled" isSelected isDisabled>
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <ViewModeExample />
      </div>

      <div style={cardStyle}>
        <FormattingToolbarExample />
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <ToggleIconButton aria-label="Save to favorites" isSelected>
            <StarStarredIcon />
          </ToggleIconButton>
          <ToggleIconButton aria-label="Add to favorites">
            <StarUnstarredIcon />
          </ToggleIconButton>
        </div>
      </div>
    </div>
  ),
};
