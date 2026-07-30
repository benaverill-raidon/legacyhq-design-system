import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckIcon, CloseIcon, EditIcon, SearchIcon } from '../../../assets/icons';
import { ToggleButton } from './toggle-button';
import type { ToggleButtonSize } from './toggle-button.types';

const sizes: ToggleButtonSize[] = ['xs', 'sm', 'md', 'lg'];

const meta = {
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
    size: { control: 'inline-radio', options: sizes },
    tone: { control: 'inline-radio', options: ['default', 'subtle'] },
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    iconBefore: { control: false },
    iconAfter: { control: false },
    className: { control: false },
    onClick: { control: false },
  },
} satisfies Meta<typeof ToggleButton>;

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
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'start' }}>
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

/** `tone` crossed with `isSelected` - the two designed forms and the state that overrides both. */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Default tone">
        <ToggleButton tone="default">Unselected</ToggleButton>
        <ToggleButton tone="default" isSelected>
          Selected
        </ToggleButton>
      </Group>
      <Group title="Subtle tone">
        <ToggleButton tone="subtle">Unselected</ToggleButton>
        <ToggleButton tone="subtle" isSelected>
          Selected
        </ToggleButton>
      </Group>
      <Group title="Icons">
        <ToggleButton iconBefore={<CheckIcon />}>Icon before</ToggleButton>
        <ToggleButton iconAfter={<CloseIcon />}>Icon after</ToggleButton>
      </Group>
    </div>
  ),
};

/** `size` scales height, padding, and corner radius - the icon stays the shared default size. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Sizes">
        {sizes.map((size) => (
          <Cell key={size} label={size}>
            <ToggleButton size={size} iconBefore={<CheckIcon />}>
              {size.toUpperCase()}
            </ToggleButton>
          </Cell>
        ))}
      </Group>
    </div>
  ),
};

function LiveToggleExample() {
  const [selected, setSelected] = React.useState(false);

  return (
    <ToggleButton isSelected={selected} onClick={() => setSelected((current) => !current)}>
      {selected ? 'Selected' : 'Click to select'}
    </ToggleButton>
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
          <ToggleButton>Label</ToggleButton>
        </Cell>
        <Cell label="Hover">
          <ToggleButton data-force-state="hover">Label</ToggleButton>
        </Cell>
        <Cell label="Focus visible">
          <ToggleButton data-force-state="focus">Label</ToggleButton>
        </Cell>
        <Cell label="Pressed">
          <ToggleButton data-force-state="active">Label</ToggleButton>
        </Cell>
        <Cell label="Disabled">
          <ToggleButton isDisabled>Label</ToggleButton>
        </Cell>
      </Group>

      <Group title="Selected">
        <Cell label="Default">
          <ToggleButton isSelected>Label</ToggleButton>
        </Cell>
        <Cell label="Focus visible">
          <ToggleButton isSelected data-force-state="focus">
            Label
          </ToggleButton>
        </Cell>
        <Cell label="Disabled">
          <ToggleButton isSelected isDisabled>
            Label
          </ToggleButton>
        </Cell>
      </Group>

      <Group title="Live - click to toggle this">
        <LiveToggleExample />
      </Group>
    </div>
  ),
};

function ToolbarExample() {
  const [selected, setSelected] = React.useState<'bold' | 'italic' | 'underline' | null>('bold');

  return (
    <div style={row}>
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
    <div style={row}>
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

/** How ToggleButton behaves inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <div style={cardStyle}>
        <h3 style={headingStyle}>Text formatting toolbar</h3>
        <ToolbarExample />
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>View mode</h3>
        <ViewModeExample />
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Filter pair</h3>
        <div style={row}>
          <ToggleButton isSelected iconBefore={<CheckIcon />}>
            Selected filter
          </ToggleButton>
          <ToggleButton iconAfter={<CloseIcon />}>Available filter</ToggleButton>
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
        <h3 style={headingStyle}>Long label wraps in a narrow container</h3>
        <p style={captionStyle}>
          Text-only content doesn&apos;t truncate - a very long label will wrap onto multiple lines
          rather than overflow.
        </p>
        <div style={{ inlineSize: '160px' }}>
          <ToggleButton>Notify every assigned reviewer</ToggleButton>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div data-theme="dark" style={darkSurfaceStyle}>
          <div style={row}>
            <ToggleButton>Unselected</ToggleButton>
            <ToggleButton isSelected>Selected</ToggleButton>
            <ToggleButton tone="subtle">Subtle</ToggleButton>
            <ToggleButton isDisabled>Disabled</ToggleButton>
          </div>
        </div>
      </section>
    </div>
  ),
};
