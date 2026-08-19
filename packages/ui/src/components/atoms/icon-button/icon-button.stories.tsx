import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CloseIcon, EditIcon, MenuIcon, MoreHorizIcon, SearchIcon } from '../../../assets/icons';
import { Tooltip } from '../tooltip';
import { IconButton } from './icon-button';
import type { IconButtonSize } from './icon-button.types';

const sizes: IconButtonSize[] = ['xs', 'sm', 'md', 'lg'];

const meta = {
  title: 'UI/Atoms/Icon Button',
  component: IconButton,
  args: {
    appearance: 'default',
    size: 'md',
    shape: 'square',
    disabled: false,
    isLoading: false,
    isExpanded: false,
    'aria-label': 'More actions',
    children: <MoreHorizIcon />,
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: ['default', 'primary', 'subtle'] },
    size: { control: 'inline-radio', options: sizes },
    shape: { control: 'inline-radio', options: ['square', 'round'] },
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    isExpanded: { control: 'boolean' },
    tooltip: { control: 'text' },
    children: { control: false },
    className: { control: false },
    onClick: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-md)',
};

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
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

const toolbarStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-sm)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-lg)',
  background: 'var(--color-elevation-surface-default)',
};

function sectionHeading(text: string) {
  return (
    <h3
      style={{
        margin: 0,
        font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
        color: 'var(--color-content-default)',
      }}
    >
      {text}
    </h3>
  );
}

/** A labelled cell so every specimen in a matrix is self-describing. */
function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'center' }}>
      {children}
      <span style={captionStyle}>{label}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      {sectionHeading(title)}
      <div style={row}>{children}</div>
    </section>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {
  args: {
    'aria-label': 'More actions',
  },
};

/** The intentionally designed forms: appearance and shape. IconButton has no `tone` prop. */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Appearance">
        <Cell label="default">
          <IconButton aria-label="Default" appearance="default">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="primary">
          <IconButton aria-label="Primary" appearance="primary">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="subtle">
          <IconButton aria-label="Subtle" appearance="subtle">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
      </Group>

      <Group title="Shape">
        <Cell label="square">
          <IconButton aria-label="Square" shape="square">
            <SearchIcon />
          </IconButton>
        </Cell>
        <Cell label="round">
          <IconButton aria-label="Round" shape="round">
            <SearchIcon />
          </IconButton>
        </Cell>
      </Group>
    </div>
  ),
};

/** Size is a meaningful axis: four control-height tokens from `xs` to `lg`, shared with Button. */
export const Sizes: Story = {
  render: () => (
    <Group title="Sizes">
      {sizes.map((size) => (
        <Cell key={size} label={size}>
          <IconButton aria-label={size + ' size'} size={size}>
            <MoreHorizIcon />
          </IconButton>
        </Cell>
      ))}
    </Group>
  ),
};

/**
 * Interaction and system states. Hover and pressed are pinned via a documentation-only
 * `data-force-state` attribute, the same convention Button uses - focus-visible shows the hover
 * fill in addition to the ring, so Focus and Hover are visually related but not identical.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Default appearance">
        <Cell label="Default">
          <IconButton aria-label="Default">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="Hover">
          <IconButton aria-label="Hover" data-force-state="hover">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="Focus visible">
          <IconButton aria-label="Focus" data-force-state="focus">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="Pressed">
          <IconButton aria-label="Pressed" data-force-state="active">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="Disabled">
          <IconButton aria-label="Disabled" disabled>
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="Loading">
          <IconButton aria-label="Loading" isLoading>
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="Expanded">
          <IconButton aria-label="Expanded" isExpanded aria-haspopup="menu">
            <MenuIcon />
          </IconButton>
        </Cell>
      </Group>

      <Group title="Primary appearance">
        <Cell label="Default">
          <IconButton aria-label="Default" appearance="primary">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="Hover">
          <IconButton aria-label="Hover" appearance="primary" data-force-state="hover">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="Focus visible">
          <IconButton aria-label="Focus" appearance="primary" data-force-state="focus">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="Pressed">
          <IconButton aria-label="Pressed" appearance="primary" data-force-state="active">
            <MoreHorizIcon />
          </IconButton>
        </Cell>
        <Cell label="Disabled">
          <IconButton aria-label="Disabled" appearance="primary" disabled>
            <MoreHorizIcon />
          </IconButton>
        </Cell>
      </Group>

      <Group title="Live - hover, tab to, and click this">
        <Cell label="Interactive">
          <IconButton aria-label="Live" appearance="primary" onClick={() => undefined}>
            <SearchIcon />
          </IconButton>
        </Cell>
      </Group>
    </div>
  ),
};

/** How IconButton behaves with a tooltip, and inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Tooltip source">
        <Cell label="aria-label becomes the tooltip">
          <IconButton aria-label="Search">
            <SearchIcon />
          </IconButton>
        </Cell>
        <Cell label="Custom tooltip content">
          <IconButton aria-label="Edit" tooltip="Edit record details">
            <EditIcon />
          </IconButton>
        </Cell>
        <Cell label="tooltip={false} suppresses it">
          <IconButton aria-label="Close" tooltip={false}>
            <CloseIcon />
          </IconButton>
        </Cell>
        <Cell label="aria-labelledby needs an explicit tooltip">
          <span id="icon-button-story-label" style={captionStyle}>
            More actions
          </span>
        </Cell>
      </Group>
      <div style={row}>
        <IconButton aria-labelledby="icon-button-story-label" tooltip="More actions menu" aria-haspopup="menu">
          <MoreHorizIcon />
        </IconButton>
        <Tooltip content="Externally composed explanation">
          <IconButton aria-label="Edit" tooltip={false}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <span style={captionStyle}>Wrapped in an external Tooltip - internal tooltip is suppressed to avoid nesting.</span>
      </div>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('In composition')}
        <div style={cardStyle}>
          <div style={toolbarStyle}>
            <IconButton aria-label="Search toolbar">
              <SearchIcon />
            </IconButton>
            <IconButton aria-label="Edit toolbar" tooltip="Edit toolbar item">
              <EditIcon />
            </IconButton>
            <IconButton aria-label="Close toolbar" tooltip={false}>
              <CloseIcon />
            </IconButton>
            <IconButton aria-label="More actions toolbar" aria-haspopup="menu" isExpanded>
              <MoreHorizIcon />
            </IconButton>
          </div>
        </div>
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application, including two documented anti-patterns. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('No accessible name (anti-pattern - check the console)')}
        <p style={captionStyle}>
          Omitting both <code>aria-label</code> and <code>aria-labelledby</code> logs a dev-time
          warning - IconButton has no visible text to fall back on.
        </p>
        <IconButton>
          <MoreHorizIcon />
        </IconButton>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('aria-labelledby without an explicit tooltip (anti-pattern - check the console)')}
        <p style={captionStyle}>
          IconButton only derives a tooltip from a string <code>aria-label</code>. With{' '}
          <code>aria-labelledby</code>, it warns unless you set <code>tooltip</code> or{' '}
          <code>{'tooltip={false}'}</code> explicitly.
        </p>
        <span id="icon-button-edge-label" style={captionStyle}>
          More actions
        </span>
        <IconButton aria-labelledby="icon-button-edge-label" aria-haspopup="menu">
          <MenuIcon />
        </IconButton>
      </section>

      <Group title="Disabled with an explanation">
        <Cell label="Tooltip still available on a disabled button">
          <IconButton aria-label="Locked" tooltip="This matter is locked for editing" disabled>
            <EditIcon />
          </IconButton>
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Narrow toolbar')}
        <p style={captionStyle}>
          IconButton holds its square footprint rather than shrinking when the toolbar runs out of
          room.
        </p>
        <div style={{ ...toolbarStyle, inlineSize: '96px', overflow: 'hidden' }}>
          <IconButton aria-label="Search">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Edit">
            <EditIcon />
          </IconButton>
          <IconButton aria-label="Close">
            <CloseIcon />
          </IconButton>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Dark surface')}
        <div
          data-theme="dark"
          style={{
            ...row,
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-elevation-surface-default)',
          }}
        >
          <IconButton aria-label="Dark default">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Dark primary" appearance="primary" tooltip="Primary action">
            <EditIcon />
          </IconButton>
          <IconButton aria-label="Dark subtle" appearance="subtle">
            <MoreHorizIcon />
          </IconButton>
        </div>
      </section>
    </div>
  ),
};
