import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeleteIcon, EditIcon } from '../../../assets/icons';
import { Button } from '../../atoms/button';
import { IconButton } from '../../atoms/icon-button';
import { ButtonGroup } from './button-group';
import type { ButtonGroupOrientation } from './button-group.types';

const orientations: ButtonGroupOrientation[] = ['horizontal', 'vertical'];

const meta = {
  title: 'UI/Molecules/Button Group',
  component: ButtonGroup,
  args: {
    orientation: 'horizontal',
    children: (
      <>
        <Button size="sm">Button 1</Button>
        <Button size="sm">Button 2</Button>
      </>
    ),
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: orientations },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
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
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
};

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'flex-start' }}>
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

/** Horizontal vs. vertical, at 2, 3, and 4 buttons - matching the Figma reference. */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      {orientations.map((orientation) => (
        <Group key={orientation} title={`Orientation: ${orientation}`}>
          {[2, 3, 4].map((count) => (
            <Cell key={count} label={`${count} buttons`}>
              <ButtonGroup orientation={orientation}>
                {Array.from({ length: count }, (_, index) => (
                  <Button key={index} size="sm">
                    {`Button ${index + 1}`}
                  </Button>
                ))}
              </ButtonGroup>
            </Cell>
          ))}
        </Group>
      ))}
    </div>
  ),
};

/** How Button Group behaves inside realistic compositions. */
export const Composition: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Dialog action row">
        <div style={cardStyle}>
          <h3 style={headingStyle}>Discard unsaved changes?</h3>
          <p style={captionStyle}>This can&apos;t be undone.</p>
          <ButtonGroup aria-label="Dialog actions">
            <Button appearance="subtle">Cancel</Button>
            <Button appearance="primary" tone="error">
              Discard
            </Button>
          </ButtonGroup>
        </div>
      </Group>

      <Group title="Toolbar with Icon Button">
        <ButtonGroup aria-label="Row actions">
          <IconButton aria-label="Edit">
            <EditIcon />
          </IconButton>
          <IconButton aria-label="Delete">
            <DeleteIcon />
          </IconButton>
        </ButtonGroup>
      </Group>

      <Group title="Stacked form actions">
        <ButtonGroup orientation="vertical" aria-label="Form actions">
          <Button appearance="primary" isFullWidth>
            Continue
          </Button>
          <Button appearance="subtle" isFullWidth>
            Go back
          </Button>
        </ButtonGroup>
      </Group>
    </div>
  ),
};
