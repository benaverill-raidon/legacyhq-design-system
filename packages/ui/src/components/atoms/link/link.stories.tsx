import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './link';
import type { LinkSize } from './link.types';

const sizes: LinkSize[] = ['sm', 'md'];

const meta = {
  title: 'UI/Atoms/Link',
  component: Link,
  args: {
    href: '/clients',
    target: '_self',
    appearance: 'default',
    size: 'md',
    children: 'Link',
  },
  argTypes: {
    href: { control: 'text' },
    target: { control: 'inline-radio', options: ['_self', '_blank'] },
    appearance: { control: 'inline-radio', options: ['default', 'subtle', 'inverse'] },
    size: { control: 'inline-radio', options: sizes },
    children: { control: 'text' },
    className: { control: false },
    rel: { control: 'text' },
  },
} satisfies Meta<typeof Link>;

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

const paragraphStyle: CSSProperties = {
  margin: 0,
  color: 'var(--color-content-default)',
  font: 'var(--typography-body-md-font-weight) var(--typography-body-md-font-size) / var(--typography-body-md-line-height) var(--typography-body-md-font-family)',
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
  display: 'grid',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-background-neutral-bold-default)',
  color: 'var(--color-content-inverse)',
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
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'start' }}>
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
export const Playground: Story = {};

/** The intentionally designed forms. `inverse` only reads correctly on a dark or bold surface. */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Appearance">
        <Cell label="default">
          <Link href="/clients" appearance="default">
            Default
          </Link>
        </Cell>
        <Cell label="subtle">
          <Link href="/clients" appearance="subtle">
            Subtle
          </Link>
        </Cell>
      </Group>

      <div style={darkSurfaceStyle}>
        <Cell label="inverse (needs a dark or bold surface)">
          <Link href="/clients" appearance="inverse">
            Inverse
          </Link>
        </Cell>
      </div>
    </div>
  ),
};

/** Size is a meaningful axis: `sm` and `md` share the same color and interaction model. */
export const Sizes: Story = {
  render: () => (
    <Group title="Sizes">
      {sizes.map((size) => (
        <Cell key={size} label={size}>
          <Link href="/clients" size={size}>
            {size === 'sm' ? 'Small' : 'Medium'}
          </Link>
        </Cell>
      ))}
    </Group>
  ),
};

/**
 * Interaction states. Hover and pressed are pinned via a documentation-only `data-force-state`
 * attribute, the same convention Button uses. `visited` cannot be forced this way - browsers
 * deliberately prevent scripts and styles from being driven by `:visited` beyond a fixed color, to
 * stop sites from detecting a user's browsing history. See the live example instead.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Default appearance">
        <Cell label="Default">
          <Link href="/clients">Client profile</Link>
        </Cell>
        <Cell label="Hover">
          <Link href="/clients" data-force-state="hover">
            Client profile
          </Link>
        </Cell>
        <Cell label="Focus visible">
          <Link href="/clients" data-force-state="focus">
            Client profile
          </Link>
        </Cell>
        <Cell label="Pressed">
          <Link href="/clients" data-force-state="active">
            Client profile
          </Link>
        </Cell>
      </Group>

      <div style={darkSurfaceStyle}>
        <Group title="Inverse appearance">
          <Cell label="Default">
            <Link href="/clients" appearance="inverse">
              Client profile
            </Link>
          </Cell>
          <Cell label="Hover">
            <Link href="/clients" appearance="inverse" data-force-state="hover">
              Client profile
            </Link>
          </Cell>
          <Cell label="Focus visible">
            <Link href="/clients" appearance="inverse" data-force-state="focus">
              Client profile
            </Link>
          </Cell>
        </Group>
      </div>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Visited (browser-native, cannot be previewed statically)')}
        <p style={captionStyle}>
          Visited color comes from real browser history through <code>:visited</code>. Click this
          link, then reload the page to see it change color on revisit.
        </p>
        <Link href="/link-story-visited-example">Visit this link, then reload</Link>
      </section>
    </div>
  ),
};

/** How Link behaves inline with text, with an external target, and inside realistic compositions. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <div style={cardStyle}>
        {sectionHeading('Inline with sentence text')}
        <p style={paragraphStyle}>
          Review the <Link href="/clients">client profile</Link> before creating the engagement
          letter.
        </p>
      </div>

      <Group title="Target">
        <Cell label="Internal (_self)">
          <Link href="/supporting-documents" appearance="subtle">
            Supporting documents
          </Link>
        </Cell>
        <Cell label="External (_blank) - icon and rel are automatic">
          <Link href="https://example.com" target="_blank">
            External website
          </Link>
        </Cell>
      </Group>

      <div style={darkSurfaceStyle}>
        <Group title="Inverse in composition">
          <Cell label="Internal">
            <Link href="/client-portal" appearance="inverse">
              Client portal
            </Link>
          </Cell>
          <Cell label="External">
            <Link href="https://example.com" target="_blank" appearance="inverse">
              External portal
            </Link>
          </Cell>
        </Group>
      </div>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Long text wraps normally, unlike Button or Label')}
        <p style={captionStyle}>
          Link has no <code>white-space: nowrap</code> - it's built for inline, sentence-level use,
          so long link text wraps like any other inline content instead of overflowing.
        </p>
        <div
          style={{
            inlineSize: '160px',
            border: 'var(--border-width-sm) dashed var(--color-border-default)',
            padding: 'var(--spacing-xs)',
          }}
        >
          <Link href="/clients">Open the full client record and review every filing</Link>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('External icon wraps with the text')}
        <div
          style={{
            inlineSize: '120px',
            border: 'var(--border-width-sm) dashed var(--color-border-default)',
            padding: 'var(--spacing-xs)',
          }}
        >
          <Link href="https://example.com" target="_blank">
            External documentation site
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Inverse on a light surface (misuse)')}
        <p style={captionStyle}>
          <code>inverse</code> hardcodes an inverse-content color regardless of state - on a light
          surface it loses contrast entirely. Only use it on a dark or bold background.
        </p>
        <div style={cardStyle}>
          <Link href="/clients" appearance="inverse">
            Hard to read here
          </Link>
        </div>
      </section>
    </div>
  ),
};
