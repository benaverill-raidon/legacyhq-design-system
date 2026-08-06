import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './spinner';
import type { SpinnerSize } from './spinner.types';

const sizes: SpinnerSize[] = ['sm', 'md', 'lg', 'xl'];

const meta = {
  title: 'UI/Atoms/Spinner',
  component: Spinner,
  args: {
    size: 'lg',
  },
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
    label: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof Spinner>;

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
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
};

// Spinner has no tone/appearance prop - it always renders via `currentColor`, so this demo needs
// a backdrop that contrasts with whatever the ambient theme happens to be (like Badge's default
// chip), not a full dark-theme preview - hence the "boldest contrast for the current theme"
// tokens directly rather than `data-theme="dark"` + theme-relative tokens.
const darkSurfaceStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
};

const inlineTextStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
};

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--spacing-sm)',
  width: 'fit-content',
  paddingBlock: 'var(--spacing-sm)',
  paddingInline: 'var(--spacing-md)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-raised-default)',
  color: 'var(--color-content-default)',
  font: 'inherit',
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

/**
 * Size is the only visual axis - Spinner has one appearance, not a set of variants, so this page
 * replaces Variants. There's no States page either: Spinner is non-interactive and decorative by
 * default (no hover/press/focus/disabled to preview) - see the Docs API section for the full
 * rationale.
 */
export const Sizes: Story = {
  render: () => (
    <Group title="Sizes">
      {sizes.map((size) => (
        <Cell key={size} label={size}>
          <Spinner size={size} />
        </Cell>
      ))}
    </Group>
  ),
};

/** Realistic content and the compositions Spinner is designed to sit inside. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Standalone">
        <div style={cardStyle}>
          <strong>Decorative (default)</strong>
          <span style={captionStyle}>Hidden from assistive technology - pair with visible text.</span>
          <Spinner />
        </div>
        <div style={cardStyle}>
          <strong>Accessible loading status</strong>
          <span style={captionStyle}><code>label</code> announces the status when there's no adjacent visible text.</span>
          <Spinner label="Loading matters" />
        </div>
      </Group>

      <Group title="Inline with text">
        <p style={inlineTextStyle}>
          <Spinner size="sm" />
          Loading row details
        </p>
      </Group>

      <Group title="In composition">
        <button type="button" style={buttonStyle} disabled>
          <Spinner size="sm" />
          Saving
        </button>

        <div style={cardStyle}>
          <strong>Client matter list</strong>
          <p style={inlineTextStyle}>
            <Spinner size="md" label="Loading matters" />
            Fetching matters&hellip;
          </p>
        </div>
      </Group>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Reduced motion</h3>
        <p style={captionStyle}>
          <code>prefers-reduced-motion: reduce</code> stops the continuous rotation while keeping the
          arc visible, rather than swapping to a static replacement. Toggle it from your OS or browser
          accessibility settings against this example - Storybook can&apos;t force the media query for
          a single story.
        </p>
        <Spinner size="xl" label="Loading, respects reduced motion" />
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Color always inherits from context</h3>
        <p style={captionStyle}>
          Spinner has no color of its own - it takes whatever <code>color</code> is in effect where
          it's rendered, the same way a Button's loading Spinner picks up that instance's own
          appearance/tone color.
        </p>
        <div style={row}>
          <span style={{ ...inlineTextStyle, color: 'var(--color-content-error)' }}>
            <Spinner size="sm" />
            Error tone text
          </span>
          <span style={{ ...inlineTextStyle, color: 'var(--color-content-brand-primary-default)' }}>
            <Spinner size="sm" />
            Brand tone text
          </span>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div style={darkSurfaceStyle}>
          <Spinner label="Loading dark surface content" />
          Loading content
        </div>
      </section>
    </div>
  ),
};
