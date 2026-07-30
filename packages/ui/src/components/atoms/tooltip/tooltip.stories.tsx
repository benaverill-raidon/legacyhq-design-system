import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditIcon, SearchIcon, StarStarredIcon } from '../../../assets/icons';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { ToggleIconButton } from '../toggle-icon-button';
import { Tooltip } from './tooltip';
import type { TooltipPlacement } from './tooltip.types';

const placements: TooltipPlacement[] = ['top', 'right', 'bottom', 'left'];

const meta = {
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
    placement: { control: 'inline-radio', options: placements },
    truncate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    delay: { control: 'number' },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)', color: 'var(--color-content-default)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-lg)',
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

const darkSurfaceStyle: CSSProperties = {
  ...cardStyle,
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      <div style={row}>{children}</div>
    </section>
  );
}

/** Prop exploration. Every supported prop is wired to a control. Hover or focus the trigger to see it. */
export const Playground: Story = {};

/**
 * The two independent axes - `placement` (with automatic viewport-edge fallback, see EdgeCases)
 * and `truncate` (single ellipsized line vs. wrapped) - plus `disabled`, which suppresses the
 * tooltip behavior entirely rather than just hiding it visually.
 */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Placement">
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
      </Group>

      <Group title="Truncate">
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
      </Group>

      <Group title="Disabled">
        <Tooltip content="Disabled because nothing is selected">
          <IconButton aria-label="Edit" disabled tooltip={false}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip content="Tooltip behavior disabled" disabled>
          <IconButton aria-label="Search" tooltip={false}>
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </Group>
    </div>
  ),
};

/** How Tooltip behaves inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <div style={cardStyle}>
        <h3 style={headingStyle}>Icon-only actions</h3>
        <div style={row}>
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
        <p style={captionStyle}>
          Use external composition when the tooltip message intentionally differs from the
          control&apos;s own accessible name.
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Toggle icon buttons</h3>
        <div style={row}>
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
        <h3 style={headingStyle}>Explaining a disabled control</h3>
        <div style={row}>
          <Tooltip content="Disabled until a record is selected">
            <IconButton aria-label="Edit" disabled tooltip={false}>
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

      <div style={cardStyle}>
        <h3 style={headingStyle}>Text button trigger</h3>
        <Tooltip content="Saves all pending changes to the current matter">
          <Button>Save</Button>
        </Tooltip>
      </div>
    </div>
  ),
};

function EdgeTooltip({ label, placement }: { label: string; placement: TooltipPlacement }) {
  return (
    <Tooltip content={`${label} (${placement})`} placement={placement}>
      <IconButton aria-label={label} tooltip={false}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  );
}

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Falls back when the preferred placement would overflow</h3>
        <p style={captionStyle}>
          Each trigger below prefers a placement that would clip against the viewport edge it sits
          near - hover one to see it reposition to whichever side actually fits.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <EdgeTooltip label="Top-left corner" placement="left" />
          <EdgeTooltip label="Top-right corner" placement="right" />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Keyboard focus shows the tooltip too</h3>
        <p style={captionStyle}>Tab to this button - the tooltip opens on focus, not just hover.</p>
        <Tooltip content="Shown on keyboard focus">
          <IconButton aria-label="Edit" tooltip={false}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div data-theme="dark" style={darkSurfaceStyle}>
          <div style={row}>
            <Tooltip content="Dark surface tooltip">
              <IconButton aria-label="Edit" tooltip={false}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </section>
    </div>
  ),
};
