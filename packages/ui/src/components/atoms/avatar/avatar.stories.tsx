import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Avatar } from './avatar';
import type { AvatarSize } from './avatar.types';

/*
 * Photograph stand-ins. These are deliberately gradient portraits rather than
 * flat glyphs so an image-backed avatar is never mistaken for the built-in
 * fallback artwork. Inline data URIs keep stories offline-safe.
 */
function portrait({ top, bottom, figure }: { top: string; bottom: string; figure: string }) {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
        <defs>
          <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${top}"/>
            <stop offset="1" stop-color="${bottom}"/>
          </linearGradient>
          <radialGradient id="v" cx="0.5" cy="0.38" r="0.75">
            <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
            <stop offset="1" stop-color="#000" stop-opacity="0.28"/>
          </radialGradient>
        </defs>
        <rect width="160" height="160" fill="url(#b)"/>
        <ellipse cx="80" cy="152" rx="58" ry="46" fill="${figure}" opacity="0.95"/>
        <circle cx="80" cy="66" r="30" fill="${figure}"/>
        <rect width="160" height="160" fill="url(#v)"/>
      </svg>`,
    )
  );
}

const photoA = portrait({ top: '#8fb8d6', bottom: '#3f6f96', figure: '#f0d9c2' });
const photoB = portrait({ top: '#d8c3a5', bottom: '#8c6f4e', figure: '#3c2f26' });
const photoC = portrait({ top: '#b9c9a8', bottom: '#5f7a52', figure: '#e8d3bb' });
const brokenImage = 'https://invalid.localhost/this-image-does-not-exist.png';

const SIZES: AvatarSize[] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl'];

const row: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-lg)',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const stack: React.CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const captionStyle: React.CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

/** A labelled cell so every specimen in a matrix is self-describing. */
function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--spacing-sm)',
        justifyItems: 'center',
        minInlineSize: '84px',
      }}
    >
      <div style={{ display: 'flex', minBlockSize: 'var(--size-avatar-xl)', alignItems: 'center' }}>
        {children}
      </div>
      <span style={captionStyle}>{label}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
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

const meta = {
  title: 'UI/Atoms/Avatar',
  component: Avatar,
  args: {
    size: 'md',
    name: 'Ben Averill',
    presence: 'none',
    status: 'none',
    isSelected: false,
    isDisabled: false,
    isInteractive: false,
    decorative: false,
    entityType: 'person',
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    src: { control: 'text' },
    alt: { control: 'text' },
    name: { control: 'text' },
    presence: { control: 'select', options: ['none', 'online', 'offline', 'busy'] },
    status: { control: 'select', options: ['none', 'accepted', 'declined'] },
    entityType: { control: 'inline-radio', options: ['person', 'team'] },
    onClick: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/**
 * The intentionally designed forms, scannable side by side. Avatar has no
 * `initials` or `shape` axis - content is either an image or the shared
 * fallback artwork.
 */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Content source">
        <Cell label="Photograph">
          <Avatar src={photoA} name="Ben Averill" />
        </Cell>
        <Cell label="Fallback artwork">
          <Avatar name="Ben Averill" />
        </Cell>
      </Group>

      <Group title="Presence">
        <Cell label="none">
          <Avatar src={photoA} name="No presence" />
        </Cell>
        <Cell label="online">
          <Avatar src={photoA} name="Online" presence="online" />
        </Cell>
        <Cell label="offline">
          <Avatar src={photoA} name="Offline" presence="offline" />
        </Cell>
        <Cell label="busy">
          <Avatar src={photoA} name="Busy" presence="busy" />
        </Cell>
      </Group>

      <Group title="Status (takes precedence over presence)">
        <Cell label="none">
          <Avatar src={photoB} name="No status" />
        </Cell>
        <Cell label="accepted">
          <Avatar src={photoB} name="Accepted" status="accepted" />
        </Cell>
        <Cell label="declined">
          <Avatar src={photoB} name="Declined" status="declined" />
        </Cell>
      </Group>

      <Group title="Rendered element">
        <Cell label="span (static)">
          <Avatar src={photoC} name="Static avatar" />
        </Cell>
        <Cell label="button (interactive)">
          <Avatar src={photoC} name="Interactive avatar" isInteractive onClick={() => undefined} />
        </Cell>
      </Group>
    </div>
  ),
};

/** Size is a meaningful axis: six tokens from `xxs` to `xl`. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Sizes">
        {SIZES.map((size) => (
          <Cell key={size} label={size}>
            <Avatar size={size} src={photoA} name={size + ' avatar'} />
          </Cell>
        ))}
      </Group>

      <Group title="Sizes with a badge">
        {SIZES.map((size) => (
          <Cell key={size} label={size}>
            <Avatar size={size} src={photoA} name={size + ' online'} presence="online" />
          </Cell>
        ))}
      </Group>

      <Group title="Sizes with fallback artwork">
        {SIZES.map((size) => (
          <Cell key={size} label={size}>
            <Avatar size={size} name={size + ' fallback'} />
          </Cell>
        ))}
      </Group>
    </div>
  ),
};

/**
 * Interaction and system states. Hover, focus and press are pinned via
 * `data-force-state` so they render statically as a regression reference; the
 * last row stays live so real pointer and keyboard behaviour is verifiable.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Unselected">
        <Cell label="Default">
          <Avatar src={photoA} name="Default" isInteractive onClick={() => undefined} />
        </Cell>
        <Cell label="Hover">
          <Avatar
            src={photoA}
            name="Hover"
            isInteractive
            onClick={() => undefined}
            data-force-state="hover"
          />
        </Cell>
        <Cell label="Focus visible">
          <Avatar
            src={photoA}
            name="Focus"
            isInteractive
            onClick={() => undefined}
            data-force-state="focus"
          />
        </Cell>
        <Cell label="Press">
          <Avatar
            src={photoA}
            name="Pressed"
            isInteractive
            onClick={() => undefined}
            data-force-state="press"
          />
        </Cell>
        <Cell label="Disabled">
          <Avatar src={photoA} name="Disabled" isInteractive isDisabled onClick={() => undefined} />
        </Cell>
      </Group>

      <Group title="Selected">
        <Cell label="Default">
          <Avatar src={photoA} name="Selected" isInteractive isSelected onClick={() => undefined} />
        </Cell>
        <Cell label="Hover">
          <Avatar
            src={photoA}
            name="Selected hover"
            isInteractive
            isSelected
            onClick={() => undefined}
            data-force-state="hover"
          />
        </Cell>
        <Cell label="Focus visible">
          <Avatar
            src={photoA}
            name="Selected focus"
            isInteractive
            isSelected
            onClick={() => undefined}
            data-force-state="focus"
          />
        </Cell>
        <Cell label="Press">
          <Avatar
            src={photoA}
            name="Selected pressed"
            isInteractive
            isSelected
            onClick={() => undefined}
            data-force-state="press"
          />
        </Cell>
        <Cell label="Disabled">
          <Avatar
            src={photoA}
            name="Selected disabled"
            isInteractive
            isSelected
            isDisabled
            onClick={() => undefined}
          />
        </Cell>
      </Group>

      <Group title="Selected ring over fallback artwork">
        <Cell label="Default">
          <Avatar name="Fallback selected" isInteractive isSelected onClick={() => undefined} />
        </Cell>
        <Cell label="Hover">
          <Avatar
            name="Fallback selected hover"
            isInteractive
            isSelected
            onClick={() => undefined}
            data-force-state="hover"
          />
        </Cell>
        <Cell label="Press">
          <Avatar
            name="Fallback selected pressed"
            isInteractive
            isSelected
            onClick={() => undefined}
            data-force-state="press"
          />
        </Cell>
      </Group>

      <Group title="Live - hover, tab to, and click these">
        <Cell label="Toggles">
          <LiveToggle />
        </Cell>
        <Cell label="Interactive">
          <Avatar src={photoC} name="Live avatar" isInteractive onClick={() => undefined} />
        </Cell>
      </Group>
    </div>
  ),
};

function LiveToggle() {
  const [selected, setSelected] = React.useState(false);

  return (
    <Avatar
      src={photoB}
      name={selected ? 'Ben Averill, selected' : 'Ben Averill'}
      isInteractive
      isSelected={selected}
      presence="online"
      onClick={() => setSelected((value) => !value)}
    />
  );
}

/** How Avatar behaves with realistic content. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Content types">
        <Cell label="Photograph">
          <Avatar src={photoA} name="Ben Averill" />
        </Cell>
        <Cell label="No image supplied">
          <Avatar name="Ben Averill" />
        </Cell>
        <Cell label="Image failed to load">
          <Avatar src={brokenImage} name="Ben Averill" />
        </Cell>
      </Group>

      <Group title="Long accessible name">
        <Cell label="Badge appends to label">
          <Avatar
            src={photoB}
            name="Dr. Alexandra Featherstone-Beaumont III, Trustee of the Averill Family Estate"
            presence="busy"
          />
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Avatar group
        </h3>
        <p style={captionStyle}>
          Overlap uses the semantic <code>--overlap-md</code> token. The trailing avatar carries the
          remaining count.
        </p>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[photoA, photoB, photoC].map((src, index) => (
            <span
              key={src}
              style={{
                marginInlineStart: index === 0 ? 0 : 'var(--overlap-md)',
                borderRadius: 'var(--border-radius-full-round)',
                boxShadow: '0 0 0 var(--border-width-md) var(--color-elevation-surface-default)',
                display: 'inline-flex',
              }}
            >
              <Avatar src={src} name={'Team member ' + (index + 1)} />
            </span>
          ))}
          <span
            style={{
              marginInlineStart: 'var(--overlap-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              inlineSize: 'var(--size-avatar-md)',
              blockSize: 'var(--size-avatar-md)',
              borderRadius: 'var(--border-radius-full-round)',
              background: 'var(--color-background-neutral-subtle-default)',
              boxShadow: '0 0 0 var(--border-width-md) var(--color-elevation-surface-default)',
              color: 'var(--color-content-subtle)',
              font: 'var(--typography-body-sm-font-size) / 1 var(--typography-body-sm-font-family)',
            }}
          >
            +4
          </span>
        </div>
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="No props at all (decorative, no accessible name)">
        <Cell label="Empty">
          <Avatar decorative />
        </Cell>
      </Group>

      <Group title="Invalid or failed image">
        <Cell label="404 src">
          <Avatar src={brokenImage} name="Failed image" />
        </Cell>
        <Cell label="Empty string src">
          <Avatar src="" name="Empty src" />
        </Cell>
        <Cell label="Failed + badge">
          <Avatar src={brokenImage} name="Failed with badge" status="declined" />
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Narrow container
        </h3>
        <p style={captionStyle}>
          Avatar is <code>flex: 0 0 auto</code>, so it holds its size instead of being squeezed.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-xs)',
            inlineSize: '72px',
            padding: 'var(--spacing-xs)',
            border: 'var(--border-width-sm) dashed var(--color-border-default)',
            borderRadius: 'var(--border-radius-sm)',
            overflow: 'hidden',
          }}
        >
          <Avatar src={photoA} name="Squeezed one" />
          <Avatar src={photoB} name="Squeezed two" />
          <Avatar src={photoC} name="Squeezed three" />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Large text setting
        </h3>
        <p style={captionStyle}>
          Avatar is sized from dimension tokens, so a 200% container font-size does not scale it.
          Confirm this is intended alongside the surrounding text.
        </p>
        <div style={{ ...row, fontSize: '200%' }}>
          <Avatar src={photoA} name="Large text context" presence="online" />
          <span style={{ color: 'var(--color-content-default)' }}>Ben Averill</span>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3
          style={{
            margin: 0,
            font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
            color: 'var(--color-content-default)',
          }}
        >
          Magnified 3x
        </h3>
        <p style={captionStyle}>
          For inspecting badge borders and the selected ring at the smallest sizes.
        </p>
        <div style={{ ...row, gap: 'var(--spacing-4xl)' }}>
          {(['xxs', 'xs', 'sm'] as AvatarSize[]).map((size) => (
            <span
              key={size}
              style={{ transform: 'scale(3)', transformOrigin: 'left center', display: 'inline-flex' }}
            >
              <Avatar
                size={size}
                src={photoA}
                name={size + ' magnified'}
                presence="online"
                isInteractive
                isSelected
                onClick={() => undefined}
              />
            </span>
          ))}
        </div>
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
          <Avatar name="Dark fallback" presence="online" />
          <Avatar src={photoA} name="Dark photograph" status="accepted" />
          <Avatar
            src={photoB}
            name="Dark selected"
            isInteractive
            isSelected
            onClick={() => undefined}
          />
          <Avatar name="Dark selected fallback" isInteractive isSelected onClick={() => undefined} />
          <Avatar src={brokenImage} name="Dark failed image" />
        </div>
      </section>
    </div>
  ),
};
