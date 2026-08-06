import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRightIcon, CheckIcon, CloseIcon } from '../../../assets/icons';
import { LinkButton } from './link-button';
import type { LinkButtonSize } from './link-button.types';

const sizes: LinkButtonSize[] = ['xs', 'sm', 'md', 'lg'];

const meta = {
  title: 'UI/Atoms/Link Button',
  component: LinkButton,
  args: {
    href: '/clients',
    children: 'Open client',
    appearance: 'default',
    tone: 'neutral',
    size: 'md',
    isDisabled: false,
    isLoading: false,
    target: '_self',
  },
  argTypes: {
    href: { control: 'text' },
    children: { control: 'text' },
    appearance: { control: 'inline-radio', options: ['default', 'primary', 'subtle'] },
    tone: { control: 'inline-radio', options: ['neutral', 'warning', 'error', 'discovery'] },
    size: { control: 'inline-radio', options: sizes },
    isDisabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    target: { control: 'inline-radio', options: ['_self', '_blank'] },
    iconBefore: { control: false },
    iconAfter: { control: false },
    className: { control: false },
    onClick: { control: false },
    rel: { control: 'text' },
  },
} satisfies Meta<typeof LinkButton>;

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

function ControlledLinkPreview() {
  const [count, setCount] = React.useState(0);

  return (
    <LinkButton
      href="#preview"
      onClick={(event) => {
        event.preventDefault();
        setCount((current) => current + 1);
      }}
    >
      Preview clicks {count}
    </LinkButton>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/**
 * The intentionally designed forms. `tone` only has a visual effect on `appearance="primary"` -
 * `default` and `subtle` render identically across tones, exactly like Button - so this page shows
 * appearance alone, then primary crossed with tone, rather than a full appearance x tone grid.
 */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Appearance (tone has no effect here)">
        <Cell label="default">
          <LinkButton href="/clients" appearance="default">
            Default
          </LinkButton>
        </Cell>
        <Cell label="primary">
          <LinkButton href="/clients" appearance="primary">
            Primary
          </LinkButton>
        </Cell>
        <Cell label="subtle">
          <LinkButton href="/clients" appearance="subtle">
            Subtle
          </LinkButton>
        </Cell>
      </Group>

      <Group title="Primary x tone">
        <Cell label="neutral">
          <LinkButton href="/clients" appearance="primary" tone="neutral">
            Neutral
          </LinkButton>
        </Cell>
        <Cell label="warning">
          <LinkButton href="/clients" appearance="primary" tone="warning">
            Warning
          </LinkButton>
        </Cell>
        <Cell label="error">
          <LinkButton href="/clients" appearance="primary" tone="error">
            Error
          </LinkButton>
        </Cell>
        <Cell label="discovery">
          <LinkButton href="/clients" appearance="primary" tone="discovery">
            Discovery
          </LinkButton>
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
          <LinkButton href="/clients" size={size}>
            {size.toUpperCase()}
          </LinkButton>
        </Cell>
      ))}
    </Group>
  ),
};

/**
 * Interaction and system states. Hover and pressed are pinned via a documentation-only
 * `data-force-state` attribute, the same convention Button uses - focus-visible shows the hover
 * fill in addition to the ring, so Focus and Hover are visually related but not identical.
 * `isDisabled` sets `aria-disabled` and `tabindex="-1"` rather than a native `disabled` attribute,
 * since anchors have no such attribute.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Default appearance">
        <Cell label="Default">
          <LinkButton href="/clients">Open client</LinkButton>
        </Cell>
        <Cell label="Hover">
          <LinkButton href="/clients" data-force-state="hover">
            Open client
          </LinkButton>
        </Cell>
        <Cell label="Focus visible">
          <LinkButton href="/clients" data-force-state="focus">
            Open client
          </LinkButton>
        </Cell>
        <Cell label="Pressed">
          <LinkButton href="/clients" data-force-state="active">
            Open client
          </LinkButton>
        </Cell>
        <Cell label="Disabled">
          <LinkButton href="/clients" isDisabled>
            Open client
          </LinkButton>
        </Cell>
        <Cell label="Loading">
          <LinkButton href="/clients" isLoading>
            Open client
          </LinkButton>
        </Cell>
      </Group>

      <Group title="Primary appearance">
        <Cell label="Default">
          <LinkButton href="/clients" appearance="primary">
            Open client
          </LinkButton>
        </Cell>
        <Cell label="Hover">
          <LinkButton href="/clients" appearance="primary" data-force-state="hover">
            Open client
          </LinkButton>
        </Cell>
        <Cell label="Focus visible">
          <LinkButton href="/clients" appearance="primary" data-force-state="focus">
            Open client
          </LinkButton>
        </Cell>
        <Cell label="Pressed">
          <LinkButton href="/clients" appearance="primary" data-force-state="active">
            Open client
          </LinkButton>
        </Cell>
        <Cell label="Disabled">
          <LinkButton href="/clients" appearance="primary" isDisabled>
            Open client
          </LinkButton>
        </Cell>
      </Group>

      <Group title="Disabled flattens tone">
        <Cell label="warning, disabled">
          <LinkButton href="/clients" appearance="primary" tone="warning" isDisabled>
            Archive
          </LinkButton>
        </Cell>
        <Cell label="error, disabled">
          <LinkButton href="/clients" appearance="primary" tone="error" isDisabled>
            Delete
          </LinkButton>
        </Cell>
      </Group>

      <Group title="Live - hover, tab to, and click this">
        <Cell label="Intercepted navigation">
          <ControlledLinkPreview />
        </Cell>
      </Group>
    </div>
  ),
};

/** How LinkButton behaves with icons, external targets, and inside realistic compositions. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Icon placement">
        <Cell label="Text only">
          <LinkButton href="/clients">Open client</LinkButton>
        </Cell>
        <Cell label="Leading icon">
          <LinkButton href="/clients" iconBefore={<CheckIcon />}>
            Open client
          </LinkButton>
        </Cell>
        <Cell label="Trailing icon">
          <LinkButton href="/clients" iconAfter={<ArrowRightIcon />}>
            Open client
          </LinkButton>
        </Cell>
        <Cell label="Loading replaces the leading icon">
          <LinkButton href="/clients" iconBefore={<CheckIcon />} isLoading>
            Open client
          </LinkButton>
        </Cell>
      </Group>

      <Group title="Navigation target">
        <Cell label="Internal (_self)">
          <LinkButton href="/clients">Internal navigation</LinkButton>
        </Cell>
        <Cell label="In-page anchor">
          <LinkButton href="#billing" appearance="subtle">
            In-page anchor
          </LinkButton>
        </Cell>
        <Cell label="External - rel is added automatically">
          <LinkButton href="https://example.com" target="_blank" iconAfter={<ArrowRightIcon />}>
            External website
          </LinkButton>
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('In composition')}
        <div style={cardStyle}>
          <div style={row}>
            <LinkButton href="/clients" iconBefore={<CheckIcon />}>
              Open client
            </LinkButton>
            <LinkButton href="/clients" appearance="subtle" iconAfter={<CloseIcon />}>
              Dismiss
            </LinkButton>
            <LinkButton href="/clients" isDisabled iconAfter={<CloseIcon />}>
              Unavailable
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Long label">
        <Cell label="Overflows rather than wrapping (no ellipsis)">
          <div
            style={{
              inlineSize: '160px',
              border: 'var(--border-width-sm) dashed var(--color-border-default)',
            }}
          >
            <LinkButton href="/clients" appearance="primary">
              Open the client record and review every filing
            </LinkButton>
          </div>
        </Cell>
      </Group>

      <Group title="Narrow flex container">
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)', inlineSize: '200px' }}>
          <LinkButton href="/clients" appearance="primary">
            Open client
          </LinkButton>
          <LinkButton href="/clients">Cancel</LinkButton>
        </div>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Disabled keeps its href')}
        <p style={captionStyle}>
          Unlike a native <code>button</code>, an anchor has no <code>disabled</code> attribute.
          LinkButton simulates it with <code>aria-disabled</code>, <code>tabindex=&quot;-1&quot;</code>, and a
          suppressed click handler - the <code>href</code> is still present in the DOM, so anything
          that reads raw anchor markup rather than respecting ARIA state could still navigate.
        </p>
        <LinkButton href="/clients" isDisabled>
          Disabled, but href is still &quot;/clients&quot;
        </LinkButton>
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
          <LinkButton href="/clients">Dark default</LinkButton>
          <LinkButton href="/clients" appearance="primary">
            Dark primary
          </LinkButton>
          <LinkButton href="/clients" appearance="subtle">
            Dark subtle
          </LinkButton>
        </div>
      </section>
    </div>
  ),
};
