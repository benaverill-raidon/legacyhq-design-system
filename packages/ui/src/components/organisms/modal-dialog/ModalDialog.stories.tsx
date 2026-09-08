import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../atoms/button';
import { ModalDialog } from './modal-dialog';
import type { ModalAppearance, ModalWidth } from './modal-dialog.types';

const widths: ModalWidth[] = ['small', 'medium', 'large', 'extraLarge'];
const appearances: ModalAppearance[] = ['default', 'warning', 'error'];

const meta = {
  title: 'UI/Organisms/Modal Dialog',
  component: ModalDialog,
  args: {
    // Required props; every story's render provides its own open state and onClose, so these are
    // just here to satisfy the types.
    open: false,
    onClose: () => {},
    title: 'Modal title',
    appearance: 'default',
    width: 'medium',
    showCloseButton: true,
    closeOnEscape: true,
    closeOnBackdropClick: true,
  },
  argTypes: {
    title: { control: 'text' },
    appearance: { control: 'inline-radio', options: appearances },
    width: { control: 'inline-radio', options: widths },
    showCloseButton: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    closeOnBackdropClick: { control: 'boolean' },
    open: { control: false },
    onClose: { control: false },
    children: { control: false },
    footer: { control: false },
  },
} satisfies Meta<typeof ModalDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' };

/** Confirm button tone follows the modal's appearance, the way the Figma variants pair them. */
function confirmTone(appearance: ModalAppearance) {
  return appearance === 'default' ? 'neutral' : appearance;
}

/** A trigger button that opens a modal; the modal owns its own open state for the demo. */
function ModalDemo({
  triggerLabel,
  appearance = 'default',
  children,
  ...props
}: {
  triggerLabel: string;
  appearance?: ModalAppearance;
  title?: ReactNode;
  width?: ModalWidth;
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <ModalDialog
        {...props}
        appearance={appearance}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button appearance="subtle" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button appearance="primary" tone={confirmTone(appearance)} onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        {children ?? <p style={{ margin: 0 }}>Modal body content goes here.</p>}
      </ModalDialog>
    </>
  );
}

function PlaygroundModal(args: Parameters<NonNullable<Story['render']>>[0]) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <ModalDialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button appearance="subtle" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button appearance="primary" tone={confirmTone(args.appearance ?? 'default')} onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>Modal body content goes here.</p>
      </ModalDialog>
    </>
  );
}

/** Prop exploration. Open the modal from the trigger; every prop is wired to a control. */
export const Playground: Story = {
  render: (args) => <PlaygroundModal {...args} />,
};

/**
 * `appearance` prepends a status icon to the title (warning / error). It does not tone the footer
 * buttons - pair it with a matching Confirm button, as these do.
 */
export const Appearances: Story = {
  render: () => (
    <div style={row}>
      <ModalDemo triggerLabel="Default" appearance="default" title="Save changes?" />
      <ModalDemo triggerLabel="Warning" appearance="warning" title="Unsaved changes" />
      <ModalDemo triggerLabel="Delete" appearance="error" title="Delete repository?" />
    </div>
  ),
};

/** Four panel widths: small (400px), medium (600px), large (752px), extraLarge (968px). */
export const Widths: Story = {
  render: () => (
    <div style={row}>
      {widths.map((width) => (
        <ModalDemo key={width} triggerLabel={width} width={width} title={`Width: ${width}`} />
      ))}
    </div>
  ),
};

/** A realistic destructive confirmation. */
export const DestructiveConfirmation: Story = {
  render: () => (
    <ModalDemo triggerLabel="Delete repository" appearance="error" width="small" title="Delete repository?">
      <p style={{ margin: 0 }}>
        This permanently deletes <strong>legacyhq/design-system</strong> and all of its history. This action cannot be
        undone.
      </p>
    </ModalDemo>
  ),
};

/** Long body content scrolls within the panel while the header and footer stay fixed. */
export const ScrollingBody: Story = {
  render: () => (
    <ModalDemo triggerLabel="Open terms" title="Terms of service" width="medium">
      <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {Array.from({ length: 20 }).map((_, index) => (
          <p key={index} style={{ margin: 0 }}>
            {index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </ModalDemo>
  ),
};

/** No footer, and a dialog labelled by `aria-label` instead of a visible title. */
export const EdgeCases: Story = {
  render: () => (
    <div style={row}>
      <ModalDemoNoFooter />
      <ModalDemoNoTitle />
    </div>
  ),
};

function ModalDemoNoFooter() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>No footer</Button>
      <ModalDialog open={open} onClose={() => setOpen(false)} title="Just a message">
        <p style={{ margin: 0 }}>An informational dialog with no footer actions - close it with the X or Escape.</p>
      </ModalDialog>
    </>
  );
}

function ModalDemoNoTitle() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>No visible title</Button>
      <ModalDialog open={open} onClose={() => setOpen(false)} aria-label="Quick settings">
        <p style={{ margin: 0 }}>This dialog has no visible title, so it is named with `aria-label`.</p>
      </ModalDialog>
    </>
  );
}
