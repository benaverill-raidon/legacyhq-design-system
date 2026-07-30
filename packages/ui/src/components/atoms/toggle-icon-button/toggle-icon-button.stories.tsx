import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
import type { ToggleIconButtonSize } from './toggle-icon-button.types';

const sizes: ToggleIconButtonSize[] = ['xs', 'sm', 'md', 'lg'];

const meta = {
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
    size: { control: 'inline-radio', options: sizes },
    tone: { control: 'inline-radio', options: ['default', 'subtle'] },
    shape: { control: 'inline-radio', options: ['square', 'round'] },
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    children: { control: false },
    className: { control: false },
    onClick: { control: false },
    'aria-label': { control: 'text' },
  },
} satisfies Meta<typeof ToggleIconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)', color: 'var(--color-content-default)' };

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
      <h3 style={headingStyle}>{title}</h3>
      <div style={row}>{children}</div>
    </section>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/** `tone` crossed with `isSelected`, plus the independent `shape` axis. */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Default tone">
        <ToggleIconButton aria-label="Unselected" tone="default">
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="Selected" tone="default" isSelected>
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
      </Group>
      <Group title="Subtle tone">
        <ToggleIconButton aria-label="Unselected" tone="subtle">
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
        <ToggleIconButton aria-label="Selected" tone="subtle" isSelected>
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
      </Group>
      <Group title="Shape">
        <Cell label="Square">
          <ToggleIconButton aria-label="Square" shape="square">
            <LayoutTwoColumnsSidebarLeftIcon />
          </ToggleIconButton>
        </Cell>
        <Cell label="Round">
          <ToggleIconButton aria-label="Round" shape="round">
            <LayoutTwoColumnsSidebarLeftIcon />
          </ToggleIconButton>
        </Cell>
      </Group>
    </div>
  ),
};

/** `size` scales the fixed square footprint - the icon itself stays a constant size. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Sizes">
        {sizes.map((size) => (
          <Cell key={size} label={size}>
            <ToggleIconButton aria-label={size} size={size}>
              <LayoutTwoColumnsSidebarLeftIcon />
            </ToggleIconButton>
          </Cell>
        ))}
      </Group>
    </div>
  ),
};

function LiveToggleExample() {
  const [selected, setSelected] = React.useState(false);

  return (
    <ToggleIconButton
      aria-label={selected ? 'Saved to favorites' : 'Save to favorites'}
      isSelected={selected}
      onClick={() => setSelected((current) => !current)}
    >
      {selected ? <StarStarredIcon /> : <StarUnstarredIcon />}
    </ToggleIconButton>
  );
}

/**
 * Interaction and system states, crossed with selected. `data-force-state` mirrors the adjacent
 * pseudo-class so hover/focus/pressed render as a static regression reference (documentation-only,
 * not part of the public API) - the same convention Button and Checkbox use. Focus pairs with the
 * shared Focus Ring primitive's own `data-force-state="focus"` support (the outline ring) and also
 * shows the hover fill, matching Button - focus and hover read as one treatment rather than two
 * different-looking states. Figma has no unique selected+disabled treatment, so disabled styling
 * fully overrides selected visuals here, matching Figma's own limited example set.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Unselected">
        <Cell label="Default">
          <ToggleIconButton aria-label="Grid view">
            <LayoutTwoColumnsSidebarLeftIcon />
          </ToggleIconButton>
        </Cell>
        <Cell label="Hover">
          <ToggleIconButton aria-label="Grid view" data-force-state="hover">
            <LayoutTwoColumnsSidebarLeftIcon />
          </ToggleIconButton>
        </Cell>
        <Cell label="Focus visible">
          <ToggleIconButton aria-label="Grid view" data-force-state="focus">
            <LayoutTwoColumnsSidebarLeftIcon />
          </ToggleIconButton>
        </Cell>
        <Cell label="Pressed">
          <ToggleIconButton aria-label="Grid view" data-force-state="active">
            <LayoutTwoColumnsSidebarLeftIcon />
          </ToggleIconButton>
        </Cell>
        <Cell label="Disabled">
          <ToggleIconButton aria-label="Grid view" isDisabled>
            <LayoutTwoColumnsSidebarLeftIcon />
          </ToggleIconButton>
        </Cell>
      </Group>

      <Group title="Selected">
        <Cell label="Default">
          <ToggleIconButton aria-label="Grid view" isSelected>
            <LayoutTwoColumnsSidebarLeftIcon />
          </ToggleIconButton>
        </Cell>
        <Cell label="Focus visible">
          <ToggleIconButton aria-label="Grid view" isSelected data-force-state="focus">
            <LayoutTwoColumnsSidebarLeftIcon />
          </ToggleIconButton>
        </Cell>
        <Cell label="Disabled">
          <ToggleIconButton aria-label="Grid view" isSelected isDisabled>
            <LayoutTwoColumnsSidebarLeftIcon />
          </ToggleIconButton>
        </Cell>
      </Group>

      <Group title="Live - click to toggle this">
        <LiveToggleExample />
      </Group>
    </div>
  ),
};

function ViewModeExample() {
  const [selected, setSelected] = React.useState<'grid' | 'list'>('grid');

  return (
    <div style={row}>
      <ToggleIconButton aria-label="Grid view" isSelected={selected === 'grid'} onClick={() => setSelected('grid')}>
        <LayoutTwoColumnsSidebarLeftIcon />
      </ToggleIconButton>
      <ToggleIconButton aria-label="List view" isSelected={selected === 'list'} onClick={() => setSelected('list')}>
        <LayoutOneColumnIcon />
      </ToggleIconButton>
    </div>
  );
}

function FormattingToolbarExample() {
  const [selected, setSelected] = React.useState<'bold' | 'search' | 'edit'>('bold');

  return (
    <div style={row}>
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

/** How ToggleIconButton behaves inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <div style={cardStyle}>
        <h3 style={headingStyle}>View mode</h3>
        <ViewModeExample />
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Formatting toolbar</h3>
        <FormattingToolbarExample />
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Favorite/save toggle</h3>
        <div style={row}>
          <ToggleIconButton aria-label="Saved to favorites" isSelected>
            <StarStarredIcon />
          </ToggleIconButton>
          <ToggleIconButton aria-label="Save to favorites">
            <StarUnstarredIcon />
          </ToggleIconButton>
        </div>
      </div>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Missing accessible name (anti-pattern)</h3>
        <p style={captionStyle}>
          Omitting both <code>aria-label</code> and <code>aria-labelledby</code> logs a dev-time
          warning and renders a control assistive technology cannot describe.
        </p>
        <ToggleIconButton>
          <LayoutTwoColumnsSidebarLeftIcon />
        </ToggleIconButton>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div data-theme="dark" style={darkSurfaceStyle}>
          <div style={row}>
            <ToggleIconButton aria-label="Unselected">
              <LayoutTwoColumnsSidebarLeftIcon />
            </ToggleIconButton>
            <ToggleIconButton aria-label="Selected" isSelected>
              <LayoutTwoColumnsSidebarLeftIcon />
            </ToggleIconButton>
            <ToggleIconButton aria-label="Subtle" tone="subtle">
              <LayoutTwoColumnsSidebarLeftIcon />
            </ToggleIconButton>
            <ToggleIconButton aria-label="Disabled" isDisabled>
              <LayoutTwoColumnsSidebarLeftIcon />
            </ToggleIconButton>
          </div>
        </div>
      </section>
    </div>
  ),
};
