import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CloseIcon, EditIcon, MenuIcon, MoreHorizIcon, SearchIcon } from '../../../assets/icons';
import { IconButton } from './icon-button';

const meta: Meta<typeof IconButton> = {
  title: 'UI/Atoms/Icon Button',
  component: IconButton,
  args: {
    appearance: 'default',
    size: 'md',
    shape: 'square',
    isDisabled: false,
    isLoading: false,
    isExpanded: false,
    'aria-label': 'More actions',
    children: <MoreHorizIcon />,
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: ['default', 'primary', 'subtle'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    shape: { control: 'inline-radio', options: ['square', 'round'] },
    isDisabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    isExpanded: { control: 'boolean' },
    children: { control: false },
    className: { control: false },
    onClick: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

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

const darkSurfaceStyle = {
  ...cardStyle,
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

const toolbarStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-100)',
  padding: 'var(--spacing-075)',
  border: 'var(--border-width-default) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-lg)',
  background: 'var(--color-elevation-surface-default)',
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
        <IconButton aria-label="Extra small" size="xs">
          <MoreHorizIcon />
        </IconButton>
        <IconButton aria-label="Small" size="sm">
          <MoreHorizIcon />
        </IconButton>
        <IconButton aria-label="Medium" size="md">
          <MoreHorizIcon />
        </IconButton>
        <IconButton aria-label="Large" size="lg">
          <MoreHorizIcon />
        </IconButton>
      </div>

      <div style={rowStyle}>
        <IconButton aria-label="Default" appearance="default">
          <MoreHorizIcon />
        </IconButton>
        <IconButton aria-label="Primary" appearance="primary">
          <MoreHorizIcon />
        </IconButton>
        <IconButton aria-label="Subtle" appearance="subtle">
          <MoreHorizIcon />
        </IconButton>
      </div>

      <div style={rowStyle}>
        <IconButton aria-label="Square" shape="square">
          <SearchIcon />
        </IconButton>
        <IconButton aria-label="Round" shape="round">
          <SearchIcon />
        </IconButton>
      </div>

      <div style={rowStyle}>
        <IconButton aria-label="Focused" autoFocus>
          <SearchIcon />
        </IconButton>
        <IconButton aria-label="Disabled" isDisabled>
          <CloseIcon />
        </IconButton>
        <IconButton aria-label="Loading" isLoading>
          <MoreHorizIcon />
        </IconButton>
        <IconButton aria-label="Expanded" isExpanded aria-haspopup="menu">
          <MenuIcon />
        </IconButton>
      </div>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <div style={toolbarStyle}>
          <IconButton aria-label="Search">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Edit">
            <EditIcon />
          </IconButton>
          <IconButton aria-label="Close">
            <CloseIcon />
          </IconButton>
          <IconButton aria-label="More actions" aria-haspopup="menu" isExpanded>
            <MoreHorizIcon />
          </IconButton>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <IconButton aria-label="Open search">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Save changes" appearance="primary">
            <EditIcon />
          </IconButton>
          <IconButton aria-label="More actions" appearance="subtle" aria-haspopup="menu" isExpanded>
            <MenuIcon />
          </IconButton>
          <IconButton aria-label="Loading actions" isLoading>
            <MoreHorizIcon />
          </IconButton>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={rowStyle}>
          <IconButton aria-label="Edit record">
            <EditIcon />
          </IconButton>

          <>
            <span id="icon-button-menu-label">More actions</span>
            <IconButton aria-labelledby="icon-button-menu-label" aria-haspopup="menu">
              <MoreHorizIcon />
            </IconButton>
          </>
        </div>

        <p style={noteStyle}>
          Tooltips should wrap Icon Button externally when needed, but they should not provide the only accessible name.
        </p>
      </div>

      <div data-theme="dark" style={darkSurfaceStyle}>
        <div style={rowStyle}>
          <IconButton aria-label="Dark default">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Dark primary" appearance="primary">
            <EditIcon />
          </IconButton>
          <IconButton aria-label="Dark subtle" appearance="subtle">
            <MoreHorizIcon />
          </IconButton>
        </div>
      </div>
    </div>
  ),
};
