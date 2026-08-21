import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../atoms/button';
import { Popup } from './popup';
import type { PopupAlignment, PopupPadding } from './popup.types';

const alignments: PopupAlignment[] = ['topLeft', 'topRight', 'topCenter', 'bottomLeft', 'bottomRight', 'bottomCenter'];
const paddings: PopupPadding[] = ['none', 'sm', 'md', 'lg'];

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)', color: 'var(--color-content-default)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-3xl)',
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

const menuItemStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 'var(--spacing-xs) var(--spacing-sm)',
  border: 'none',
  background: 'none',
  borderRadius: 'var(--border-radius-sm)',
  textAlign: 'left',
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-default)',
  cursor: 'pointer',
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      <div style={row}>{children}</div>
    </section>
  );
}

function MenuContent() {
  return (
    <>
      <button type="button" style={menuItemStyle}>
        Rename
      </button>
      <button type="button" style={menuItemStyle}>
        Duplicate
      </button>
      <button type="button" style={menuItemStyle}>
        Delete
      </button>
    </>
  );
}

function PopupDemo({
  label,
  alignment,
  padding,
  closeOnEscape,
  closeOnOutsideClick,
  role,
  content,
}: {
  label: string;
  alignment?: PopupAlignment;
  padding?: PopupPadding;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  role?: React.AriaRole;
  content?: ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      alignment={alignment}
      padding={padding}
      closeOnEscape={closeOnEscape}
      closeOnOutsideClick={closeOnOutsideClick}
      role={role}
      content={content ?? <MenuContent />}
    >
      <Button appearance={open ? 'primary' : 'default'} onClick={() => setOpen((current) => !current)}>
        {label}
      </Button>
    </Popup>
  );
}

const meta = {
  title: 'UI/Primitives/Popup',
  component: Popup,
  args: {
    open: false,
    content: <MenuContent />,
    alignment: 'topLeft',
    padding: 'lg',
    closeOnEscape: true,
    closeOnOutsideClick: true,
    children: <Button>Open popup</Button>,
  },
  argTypes: {
    alignment: { control: 'select', options: alignments },
    padding: { control: 'inline-radio', options: paddings },
    closeOnEscape: { control: 'boolean' },
    closeOnOutsideClick: { control: 'boolean' },
    open: { control: false },
    onOpenChange: { control: false },
    children: { control: false },
    content: { control: false },
    className: { control: false },
    id: { control: false },
    role: { control: false },
    unstyled: { control: false },
    manageTriggerAria: { control: false },
  },
} satisfies Meta<typeof Popup>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Click the trigger to open the popup. `alignment`, `padding`, `closeOnEscape`, and `closeOnOutsideClick` are wired to controls. */
export const Playground: Story = {
  render: (args) => (
    <PopupDemo
      label="Open popup"
      alignment={args.alignment}
      padding={args.padding}
      closeOnEscape={args.closeOnEscape}
      closeOnOutsideClick={args.closeOnOutsideClick}
    />
  ),
};

/**
 * `alignment` picks which side of the trigger the panel opens on (`top`/`bottom`) and how it
 * lines up against it (`Left`/`Right`/`Center`) - it's a preference, not a guarantee, see EdgeCases.
 * `padding` sizes just the default skin's padding, independent of alignment.
 */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Top">
        <PopupDemo label="topLeft" alignment="topLeft" />
        <PopupDemo label="topCenter" alignment="topCenter" />
        <PopupDemo label="topRight" alignment="topRight" />
      </Group>
      <Group title="Bottom">
        <PopupDemo label="bottomLeft" alignment="bottomLeft" />
        <PopupDemo label="bottomCenter" alignment="bottomCenter" />
        <PopupDemo label="bottomRight" alignment="bottomRight" />
      </Group>
      <Group title="Padding">
        <PopupDemo label="sm" padding="sm" />
        <PopupDemo label="md" padding="md" />
        <PopupDemo label="lg (default)" padding="lg" />
      </Group>
    </div>
  ),
};

/** Popup is a positioning/dismissal primitive - it renders whatever content a consumer gives it. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Action menu</h3>
        <p style={captionStyle}>The shape Dropdown Menu will build on - a list of actions, role=&quot;menu&quot;.</p>
        <PopupDemo label="Row actions" role="menu" />
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Short message</h3>
        <p style={captionStyle}>The shape Inline Message will build on - the panel hugs a single line of text.</p>
        <PopupDemo
          label="Show message"
          role="status"
          content={<span style={{ font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)', color: 'var(--color-content-default)' }}>Saved 2 minutes ago</span>}
        />
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Falls back when the preferred alignment would overflow</h3>
        <p style={captionStyle}>
          Each trigger below prefers an alignment that would clip against the viewport edge it sits
          near - open one to see it reposition to whichever alignment actually fits.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <PopupDemo label="Top-left corner" alignment="topLeft" />
          <PopupDemo label="Top-right corner" alignment="topRight" />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Escape and outside click dismiss by default</h3>
        <p style={captionStyle}>
          Open the popup, then press Escape or click anywhere outside it - both call
          <code> onOpenChange(false)</code>.
        </p>
        <PopupDemo label="Dismissible popup" />
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dismissal opted out</h3>
        <p style={captionStyle}>
          With both flags off, only the trigger itself can close the popup - useful for content that
          should persist regardless of stray clicks, like Inline Message.
        </p>
        <PopupDemo label="Persistent popup" closeOnEscape={false} closeOnOutsideClick={false} />
      </section>
    </div>
  ),
};
