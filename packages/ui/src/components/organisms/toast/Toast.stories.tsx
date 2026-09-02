import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../atoms/button';
import { Toast } from './toast';
import type { ToastAppearance } from './toast.types';

const appearances: ToastAppearance[] = ['default', 'success', 'info', 'warning', 'error', 'loading'];

const meta = {
  title: 'UI/Organisms/Toast',
  component: Toast,
  args: {
    appearance: 'info',
    title: "This is the toast's title",
    description: 'Additional information that will help users understand the flag.',
    expanded: true,
    isDismissible: true,
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: appearances },
    title: { control: 'text' },
    description: { control: 'text' },
    expanded: { control: 'boolean' },
    isDismissible: { control: 'boolean' },
    actions: { control: false },
    onDismiss: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-lg)', justifyItems: 'start' };

function demoActions() {
  return (
    <>
      <Button size="xs" appearance="subtle">
        Understood
      </Button>
      <Button size="xs" appearance="subtle">
        No thanks
      </Button>
    </>
  );
}

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
      <span
        style={{
          font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
          color: 'var(--color-content-subtle)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {
  args: {
    actions: demoActions(),
  },
};

/** The six appearances - a colored status tile per appearance, and a spinner for loading. */
export const Appearances: Story = {
  render: () => (
    <div style={stack}>
      {appearances.map((appearance) => (
        <Labelled key={appearance} label={appearance}>
          <Toast
            appearance={appearance}
            title="This is the toast's title"
            description="Additional information that will help users understand the flag."
            actions={appearance === 'loading' ? undefined : demoActions()}
            expanded={appearance !== 'loading'}
          />
        </Labelled>
      ))}
    </div>
  ),
};

/** Collapsed shows the title only; expanded reveals the description and actions. */
export const ExpandedCollapsed: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="Collapsed (title only)">
        <Toast appearance="success" title="Your changes were saved" expanded={false} />
      </Labelled>
      <Labelled label="Expanded (description + actions)">
        <Toast
          appearance="success"
          title="Your changes were saved"
          description="They will sync across your devices shortly."
          actions={demoActions()}
          expanded
        />
      </Labelled>
    </div>
  ),
};

/** Content variations: title only, description without actions, and non-dismissible. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="Title only">
        <Toast appearance="info" title="Syncing your workspace" />
      </Labelled>
      <Labelled label="Description, no actions">
        <Toast appearance="error" title="Upload failed" description="The file was larger than the 25 MB limit." />
      </Labelled>
      <Labelled label="Not dismissible (e.g. loading)">
        <Toast appearance="loading" title="Uploading your file..." isDismissible={false} />
      </Labelled>
    </div>
  ),
};
