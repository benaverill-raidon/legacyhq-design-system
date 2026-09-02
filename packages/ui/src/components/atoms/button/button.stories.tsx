import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRightIcon, CheckIcon, CloseIcon, DeleteIcon } from '../../../assets/icons';
import { Button } from './button';
import type { ButtonSize } from './button.types';

const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg'];

const meta = {
  title: 'UI/Atoms/Button',
  component: Button,
  args: {
    children: 'Save changes',
    appearance: 'default',
    tone: 'neutral',
    size: 'md',
    isInverse: false,
    disabled: false,
    isLoading: false,
    isFullWidth: false,
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: ['default', 'primary', 'subtle'] },
    tone: { control: 'inline-radio', options: ['neutral', 'warning', 'error'] },
    size: { control: 'inline-radio', options: sizes },
    isInverse: { control: 'boolean' },
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    isFullWidth: { control: 'boolean' },
    iconBefore: { control: false },
    iconAfter: { control: false },
    className: { control: false },
    onClick: { control: false },
  },
} satisfies Meta<typeof Button>;

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
      <h3
        style={{
          margin: 0,
          font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
          color: 'var(--color-content-default)',
        }}
      >
        {title}
      </h3>
      <div style={row}>{children}</div>
    </section>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/**
 * The intentionally designed forms. `tone` only has a visual effect on `appearance="primary"` -
 * `default` and `subtle` render identically across tones - so this page shows appearance alone,
 * then primary crossed with tone, rather than a full appearance x tone grid.
 */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Appearance (tone has no effect here)">
        <Cell label="default">
          <Button appearance="default">Default</Button>
        </Cell>
        <Cell label="primary">
          <Button appearance="primary">Primary</Button>
        </Cell>
        <Cell label="subtle">
          <Button appearance="subtle">Subtle</Button>
        </Cell>
      </Group>

      <Group title="Primary x tone">
        <Cell label="neutral">
          <Button appearance="primary" tone="neutral">
            Neutral
          </Button>
        </Cell>
        <Cell label="warning">
          <Button appearance="primary" tone="warning">
            Warning
          </Button>
        </Cell>
        <Cell label="error">
          <Button appearance="primary" tone="error">
            Error
          </Button>
        </Cell>
      </Group>
    </div>
  ),
};

/** Size is a meaningful axis: four control-height tokens from `xs` to `lg`. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Sizes">
        {sizes.map((size) => (
          <Cell key={size} label={size}>
            <Button size={size}>{size.toUpperCase()}</Button>
          </Cell>
        ))}
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Icon size is constant across sizes
        </h3>
        <p style={captionStyle}>
          Button does not expose an icon-size prop - icons render at one fixed size regardless of
          the button size, by design.
        </p>
        <div style={row}>
          {sizes.map((size) => (
            <Cell key={size} label={size}>
              <Button size={size} iconBefore={<CheckIcon />}>
                {size.toUpperCase()}
              </Button>
            </Cell>
          ))}
        </div>
      </section>
    </div>
  ),
};

/**
 * Interaction and system states. Hover and pressed are pinned via a documentation-only
 * `data-force-state` attribute so they render statically as a regression reference; disabled and
 * loading are the real props.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Default appearance">
        <Cell label="Default">
          <Button>Save changes</Button>
        </Cell>
        <Cell label="Hover">
          <Button data-force-state="hover">Save changes</Button>
        </Cell>
        <Cell label="Focus visible">
          <Button data-force-state="focus">Save changes</Button>
        </Cell>
        <Cell label="Press">
          <Button data-force-state="press">Save changes</Button>
        </Cell>
        <Cell label="Disabled">
          <Button disabled>Save changes</Button>
        </Cell>
        <Cell label="Loading">
          <Button isLoading>Save changes</Button>
        </Cell>
      </Group>

      <Group title="Primary appearance">
        <Cell label="Default">
          <Button appearance="primary">Save changes</Button>
        </Cell>
        <Cell label="Hover">
          <Button appearance="primary" data-force-state="hover">
            Save changes
          </Button>
        </Cell>
        <Cell label="Focus visible">
          <Button appearance="primary" data-force-state="focus">
            Save changes
          </Button>
        </Cell>
        <Cell label="Press">
          <Button appearance="primary" data-force-state="press">
            Save changes
          </Button>
        </Cell>
        <Cell label="Disabled">
          <Button appearance="primary" disabled>
            Save changes
          </Button>
        </Cell>
        <Cell label="Loading">
          <Button appearance="primary" isLoading>
            Save changes
          </Button>
        </Cell>
      </Group>

      <Group title="Subtle appearance">
        <Cell label="Default">
          <Button appearance="subtle">Save changes</Button>
        </Cell>
        <Cell label="Hover">
          <Button appearance="subtle" data-force-state="hover">
            Save changes
          </Button>
        </Cell>
        <Cell label="Focus visible">
          <Button appearance="subtle" data-force-state="focus">
            Save changes
          </Button>
        </Cell>
        <Cell label="Press">
          <Button appearance="subtle" data-force-state="press">
            Save changes
          </Button>
        </Cell>
        <Cell label="Disabled">
          <Button appearance="subtle" disabled>
            Save changes
          </Button>
        </Cell>
        <Cell label="Loading">
          <Button appearance="subtle" isLoading>
            Save changes
          </Button>
        </Cell>
      </Group>

      <Group title="Disabled flattens tone">
        <Cell label="warning, disabled">
          <Button appearance="primary" tone="warning" disabled>
            Archive
          </Button>
        </Cell>
        <Cell label="error, disabled">
          <Button appearance="primary" tone="error" disabled>
            Delete
          </Button>
        </Cell>
      </Group>

      <Group title="Live - hover, tab to, and click this">
        <Cell label="Interactive">
          <Button appearance="primary" onClick={() => undefined}>
            Save changes
          </Button>
        </Cell>
      </Group>
    </div>
  ),
};

/**
 * `isInverse` is the on-dark treatment - for buttons placed on dark or bold-colored surfaces such
 * as Banner. It overrides the resting appearance fill with a transparent background and the inverse
 * content token, and uses the white *subtle* overlays on hover / press. It only reads on a dark
 * backdrop, so every specimen here sits on one. Disabled flattens the inverse look the same way it
 * flattens tone.
 */
export const Inverse: Story = {
  render: () => (
    <div
      style={{
        ...stack,
        padding: 'var(--spacing-2xl)',
        borderRadius: 'var(--border-radius-md)',
        background: 'var(--color-background-neutral-bold-default)',
      }}
    >
      <Group title="States (on a dark surface)">
        <Cell label="Default">
          <Button isInverse>Learn more</Button>
        </Cell>
        <Cell label="Hover">
          <Button isInverse data-force-state="hover">
            Learn more
          </Button>
        </Cell>
        <Cell label="Focus visible">
          <Button isInverse data-force-state="focus">
            Learn more
          </Button>
        </Cell>
        <Cell label="Press">
          <Button isInverse data-force-state="press">
            Learn more
          </Button>
        </Cell>
        <Cell label="Disabled">
          <Button isInverse disabled>
            Learn more
          </Button>
        </Cell>
        <Cell label="Loading">
          <Button isInverse isLoading>
            Learn more
          </Button>
        </Cell>
      </Group>

      <Group title="Sizes">
        {sizes.map((size) => (
          <Cell key={size} label={size}>
            <Button isInverse size={size}>
              {size.toUpperCase()}
            </Button>
          </Cell>
        ))}
      </Group>

      <Group title="With icons">
        <Cell label="Leading">
          <Button isInverse iconBefore={<CheckIcon />}>
            Approve
          </Button>
        </Cell>
        <Cell label="Trailing">
          <Button isInverse iconAfter={<ArrowRightIcon />}>
            Continue
          </Button>
        </Cell>
      </Group>
    </div>
  ),
};

/** How Button behaves with icons, and inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Icon placement">
        <Cell label="Text only">
          <Button>Save changes</Button>
        </Cell>
        <Cell label="Leading icon">
          <Button iconBefore={<CheckIcon />}>Save changes</Button>
        </Cell>
        <Cell label="Trailing icon">
          <Button iconAfter={<ArrowRightIcon />}>Continue</Button>
        </Cell>
        <Cell label="Both icons">
          <Button iconBefore={<CheckIcon />} iconAfter={<ArrowRightIcon />}>
            Save and continue
          </Button>
        </Cell>
      </Group>

      <Group title="Loading preserves the label and its width">
        <Cell label="Default">
          <Button appearance="primary">Save changes</Button>
        </Cell>
        <Cell label="Loading (same width)">
          <Button appearance="primary" isLoading>
            Save changes
          </Button>
        </Cell>
        <Cell label="Loading replaces a leading icon">
          <Button appearance="primary" iconBefore={<CheckIcon />} isLoading>
            Save changes
          </Button>
        </Cell>
      </Group>

      <Group title="Full width">
        <div style={{ inlineSize: '320px' }}>
          <Button isFullWidth appearance="primary">
            Continue
          </Button>
        </div>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          In composition
        </h3>
        <div style={cardStyle}>
          <div style={row}>
            <Button appearance="primary" iconBefore={<CheckIcon />}>
              Save changes
            </Button>
            <Button>Cancel</Button>
            <Button appearance="subtle">Preview</Button>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={row}>
            <Button appearance="primary" tone="warning">
              Archive matter
            </Button>
            <Button appearance="primary" tone="error">
              Delete matter
            </Button>
            <Button appearance="primary" iconAfter={<ArrowRightIcon />}>
              Explore setup
            </Button>
          </div>
        </div>
        <form style={cardStyle}>
          <label htmlFor="matter-name">Matter name</label>
          <input id="matter-name" name="matterName" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
            <Button appearance="subtle" type="button" iconBefore={<CloseIcon />}>
              Cancel
            </Button>
            <Button appearance="primary" type="submit" isLoading>
              Save matter
            </Button>
          </div>
        </form>
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application, including a documented anti-pattern. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Long label">
        <Cell label="Overflows rather than wrapping (no ellipsis)">
          <div style={{ inlineSize: '160px', border: 'var(--border-width-sm) dashed var(--color-border-default)' }}>
            <Button appearance="primary">Save changes and continue to the next step</Button>
          </div>
        </Cell>
      </Group>

      <Group title="Narrow flex container">
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', inlineSize: '200px' }}>
          <Button appearance="primary">Save changes</Button>
          <Button>Cancel</Button>
        </div>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Icon-only (anti-pattern)
        </h3>
        <p style={captionStyle}>
          Button has no icon-only mode - passing an icon with no visible label leaves the button
          unlabelled for assistive technology. Use <code>IconButton</code> instead.
        </p>
        <Button appearance="subtle" iconBefore={<DeleteIcon />} aria-label="Delete">
          {null}
        </Button>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Dark surface
        </h3>
        <div
          data-theme="dark"
          style={{
            ...row,
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-elevation-surface-default)',
          }}
        >
          <Button>Dark default</Button>
          <Button appearance="primary">Dark primary</Button>
          <Button appearance="subtle">Dark subtle</Button>
        </div>
      </section>
    </div>
  ),
};
