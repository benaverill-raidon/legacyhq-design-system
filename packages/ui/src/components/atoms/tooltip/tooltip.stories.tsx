import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EditIcon, SearchIcon, StarStarredIcon } from '../../../assets/icons';
import { Button } from '../button';
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
      <IconButton aria-label="Edit">
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
        <Tooltip content="Top placement" placement="top">
          <Button>Top</Button>
        </Tooltip>
        <Tooltip content="Right placement" placement="right">
          <Button>Right</Button>
        </Tooltip>
        <Tooltip content="Bottom placement" placement="bottom">
          <Button>Bottom</Button>
        </Tooltip>
        <Tooltip content="Left placement" placement="left">
          <Button>Left</Button>
        </Tooltip>
      </div>

      <div style={rowStyle}>
        <Tooltip content="Short and brief" truncate>
          <Button>Truncated</Button>
        </Tooltip>
        <Tooltip
          content="Do not put essential information in a tooltip. Tooltips have low discoverability and have usability issues on devices without hover interactions."
          truncate={false}
        >
          <Button>Wrapped</Button>
        </Tooltip>
      </div>

      <div style={rowStyle}>
        <Tooltip content="Disabled tooltip" disabled>
          <Button>Disabled</Button>
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
            <IconButton aria-label="Edit">
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip content="Search">
            <IconButton aria-label="Search">
              <SearchIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <Tooltip content="Save changes">
            <Button>Save</Button>
          </Tooltip>

          <Tooltip content="Open search filters">
            <Button iconBefore={<SearchIcon />}>Filters</Button>
          </Tooltip>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <Tooltip content="Save to favorites">
            <ToggleIconButton aria-label="Save to favorites" isSelected>
              <StarStarredIcon />
            </ToggleIconButton>
          </Tooltip>

          <Tooltip content="Edit view mode">
            <ToggleIconButton aria-label="Edit view mode">
              <EditIcon />
            </ToggleIconButton>
          </Tooltip>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <Tooltip content="Short and brief">
            <Button>Short content</Button>
          </Tooltip>

          <Tooltip
            content="Do not put essential information in a tooltip. Tooltips have low discoverability and have usability issues on devices without hover interactions."
            truncate={false}
            placement="bottom"
          >
            <Button>Longer wrapped content</Button>
          </Tooltip>
        </div>

        <p style={noteStyle}>
          Tooltip content clarifies a control, but it should not replace the control&apos;s visible label or accessible
          name.
        </p>
      </div>
    </div>
  ),
};
