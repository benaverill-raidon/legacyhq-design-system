import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckIcon, CloseIcon, StarStarredIcon } from '../../../assets/icons';
import { IconTile } from './icon-tile';
import type { IconTileAppearance, IconTileShape, IconTileSize, IconTileTone } from './icon-tile.types';

const tones: IconTileTone[] = [
  'gray',
  'brand',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'magenta',
];
const appearances: IconTileAppearance[] = ['default', 'bold'];
const shapes: IconTileShape[] = ['square', 'round'];
const sizes: IconTileSize[] = ['xxs', 'xs', 'sm', 'md', 'lg'];

const meta = {
  title: 'UI/Molecules/Icon Tile',
  component: IconTile,
  args: {
    tone: 'brand',
    appearance: 'default',
    shape: 'square',
    size: 'md',
    decorative: true,
    children: <CheckIcon />,
  },
  argTypes: {
    tone: { control: 'select', options: tones },
    appearance: { control: 'inline-radio', options: appearances },
    shape: { control: 'inline-radio', options: shapes },
    size: { control: 'inline-radio', options: sizes },
    decorative: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof IconTile>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

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

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
};

const listItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-md)',
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

/** Every tone x appearance combination, scannable side by side. */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      {appearances.map((appearance) => (
        <Group key={appearance} title={`Appearance: ${appearance}`}>
          {tones.map((tone) => (
            <Cell key={tone} label={tone}>
              <IconTile tone={tone} appearance={appearance}>
                <CheckIcon />
              </IconTile>
            </Cell>
          ))}
        </Group>
      ))}
    </div>
  ),
};

/** Every size, at the default tone/appearance/shape. */
export const Sizes: Story = {
  render: () => (
    <Group title="Size">
      {sizes.map((size) => (
        <Cell key={size} label={size}>
          <IconTile size={size}>
            <CheckIcon />
          </IconTile>
        </Cell>
      ))}
    </Group>
  ),
};

/** Square vs round, at every size. */
export const Shapes: Story = {
  render: () => (
    <div style={stack}>
      {shapes.map((shape) => (
        <Group key={shape} title={`Shape: ${shape}`}>
          {sizes.map((size) => (
            <Cell key={size} label={size}>
              <IconTile shape={shape} size={size} tone="teal">
                <StarStarredIcon />
              </IconTile>
            </Cell>
          ))}
        </Group>
      ))}
    </div>
  ),
};

/** How Icon Tile behaves inside realistic compositions. */
export const Composition: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Feature list">
        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          <div style={listItemStyle}>
            <IconTile tone="brand">
              <CheckIcon />
            </IconTile>
            <span style={{ color: 'var(--color-content-default)' }}>Automated backups</span>
          </div>
          <div style={listItemStyle}>
            <IconTile tone="teal">
              <StarStarredIcon />
            </IconTile>
            <span style={{ color: 'var(--color-content-default)' }}>Priority support</span>
          </div>
        </div>
      </Group>

      <Group title="Empty state">
        <div style={{ ...cardStyle, justifyItems: 'center', textAlign: 'center' }}>
          <IconTile size="lg" tone="gray" shape="round">
            <StarStarredIcon />
          </IconTile>
          <h3 style={headingStyle}>No favorites yet</h3>
          <p style={captionStyle}>Star an item to see it here.</p>
        </div>
      </Group>

      <Group title="Sole carrier of meaning (decorative=false)">
        <IconTile tone="red" appearance="bold" decorative={false} ariaLabel="Error">
          <CloseIcon />
        </IconTile>
      </Group>
    </div>
  ),
};
