import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EditIcon, SearchIcon, StarStarredIcon } from '../../../assets/icons';
import { IconButton } from '../icon-button';
import { ToggleIconButton } from '../toggle-icon-button';
import { Tooltip } from './tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Atoms/Tooltip',
  component: Tooltip,
  args: {
    content: 'Edit',
    placement: 'top',
    truncate: true,
    disabled: false,
    delay: 300,
    children: (
      <IconButton aria-label="Edit" tooltip={false}>
        <EditIcon />
      </IconButton>
    ),
  },
  argTypes: {
    content: { control: 'text' },
    placement: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    truncate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    delay: { control: 'number' },
    children: { control: false },
    className: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-200)',
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

const noteStyle = {
  margin: 0,
  color: 'var(--color-content-subtle)',
  fontFamily: 'var(--typography-body-sm-font-family)',
  fontSize: 'var(--typography-body-sm-font-size)',
  fontWeight: 'var(--typography-body-sm-font-weight)',
  lineHeight: 'var(--typography-body-sm-line-height)',
} satisfies CSSProperties;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <Tooltip content="Edit item" placement="top">
          <IconButton aria-label="Edit" tooltip={false}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Search library" placement="right">
          <IconButton aria-label="Search" tooltip={false}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Open favorites" placement="bottom">
          <ToggleIconButton aria-label="Open favorites">
            <StarStarredIcon />
          </ToggleIconButton>
        </Tooltip>
        <Tooltip content="Close panel" placement="left">
          <IconButton aria-label="Close" tooltip={false}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </div>

      <div style={rowStyle}>
        <Tooltip content="Short supplemental hint" truncate>
          <IconButton aria-label="Edit" tooltip={false}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          content="Supplemental clarification belongs in a tooltip only when the control already has an accessible name and the message is not essential to task completion."
          truncate={false}
        >
          <IconButton aria-label="Search" tooltip={false}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </div>

      <div style={rowStyle}>
        <Tooltip content="Disabled because nothing is selected">
          <IconButton aria-label="Edit" isDisabled tooltip={false}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Tooltip behavior disabled" disabled>
          <IconButton aria-label="Search" tooltip={false}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <div style={rowStyle}>
          <Tooltip content="Edit">
            <IconButton aria-label="Edit" tooltip={false}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip content="Search">
            <IconButton aria-label="Search" tooltip={false}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
        </div>

        <p style={noteStyle}>Use external composition when the tooltip message intentionally differs from the control name.</p>
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <Tooltip content="Save to favorites">
            <ToggleIconButton aria-label="Save to favorites" isSelected>
              <StarStarredIcon />
            </ToggleIconButton>
          </Tooltip>

          <Tooltip content="Change view mode">
            <ToggleIconButton aria-label="Change view mode">
              <EditIcon />
            </ToggleIconButton>
          </Tooltip>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <Tooltip content="Disabled until a record is selected">
            <IconButton aria-label="Edit" isDisabled tooltip={false}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            content="This tooltip clarifies a potentially ambiguous control, but it is still supplemental and not essential to understanding the action."
            truncate={false}
            placement="bottom"
          >
            <IconButton aria-label="Search" tooltip={false}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
};
