import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../atoms/button';
import { ButtonGroup } from '../../molecules/button-group';
import { Toast } from './toast';
import type { ToastTone } from './toast.types';

const tones: ToastTone[] = ['default', 'success', 'information', 'warning', 'error', 'loading'];

const meta = {
  title: 'Components/Feedback/Toast',
  component: Toast,
  args: {
    tone: 'information',
    title: "This is the toast's title",
    description: 'Additional information that will help users understand the flag.',
    expanded: true,
    isDismissible: true,
  },
  argTypes: {
    tone: { control: 'inline-radio', options: tones },
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
    <ButtonGroup>
      <Button size="xs" prominence="tertiary">
        Understood
      </Button>
      <Button size="xs" prominence="tertiary">
        No thanks
      </Button>
    </ButtonGroup>
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

/** The six tones - a colored status tile per tone, and a spinner for loading. */
export const Tones: Story = {
  render: () => (
    <div style={stack}>
      {tones.map((tone) => (
        <Labelled key={tone} label={tone}>
          <Toast
            tone={tone}
            title="This is the toast's title"
            description="Additional information that will help users understand the flag."
            actions={tone === 'loading' ? undefined : demoActions()}
            expanded={tone !== 'loading'}
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
        <Toast tone="success" title="Your changes were saved" expanded={false} />
      </Labelled>
      <Labelled label="Expanded (description + actions)">
        <Toast
          tone="success"
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
        <Toast tone="information" title="Syncing your workspace" />
      </Labelled>
      <Labelled label="Description, no actions">
        <Toast tone="error" title="Upload failed" description="The file was larger than the 25 MB limit." />
      </Labelled>
      <Labelled label="Not dismissible (e.g. loading)">
        <Toast tone="loading" title="Uploading your file..." isDismissible={false} />
      </Labelled>
    </div>
  ),
};
