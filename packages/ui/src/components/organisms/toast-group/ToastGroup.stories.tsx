import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../atoms/button';
import { ButtonGroup } from '../../molecules/button-group';
import { ToastGroup } from './toast-group';
import { toast } from './toast-store';

const meta = {
  title: 'UI/Organisms/Toast Group',
  component: ToastGroup,
  parameters: { layout: 'fullscreen' },
  args: {
    maxVisible: 3,
    duration: 5000,
  },
  argTypes: {
    maxVisible: { control: { type: 'number', min: 1, max: 6 } },
    duration: { control: { type: 'number', step: 1000 } },
    label: { control: 'text' },
    className: { control: false },
  },
} satisfies Meta<typeof ToastGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const panel: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-2xl)',
  minBlockSize: '100vh',
  boxSizing: 'border-box',
};

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' };

function undoAction() {
  return (
    <Button size="xs" appearance="subtle">
      Undo
    </Button>
  );
}

/**
 * Trigger toasts from anywhere with the imperative `toast()` API. They stack in the bottom-right;
 * hover (or focus into) the stack to expand it into a vertical list. Toasts auto-dismiss after their
 * duration (paused while the stack is hovered), can be swiped away, and collapse behind a max of
 * `maxVisible`.
 */
export const Playground: Story = {
  render: (args) => (
    <div style={panel}>
      <h3
        style={{
          margin: 0,
          font: 'var(--typography-heading-sm-font-weight) var(--typography-heading-sm-font-size) / var(--typography-heading-sm-line-height) var(--typography-heading-sm-font-family)',
          color: 'var(--color-content-default)',
        }}
      >
        Trigger toasts
      </h3>

      <div style={row}>
        <Button
          appearance="primary"
          onClick={() =>
            toast('Event created', { description: 'Monday, 9:00 AM with the Acme team.', actions: undoAction() })
          }
        >
          Default
        </Button>
        <Button onClick={() => toast.success('Changes saved', { description: 'Your matter is up to date.' })}>
          Success
        </Button>
        <Button onClick={() => toast.error('Upload failed', { description: 'The file exceeded the 25 MB limit.' })}>
          Error
        </Button>
        <Button onClick={() => toast.warning('Your trial ends soon', { description: 'Three days remaining.' })}>
          Warning
        </Button>
        <Button onClick={() => toast.info('A new version is available', { description: 'Refresh to update.' })}>
          Info
        </Button>
        <Button
          onClick={() => {
            const id = toast.loading('Uploading your file...');
            window.setTimeout(() => toast.success('File uploaded', { id, description: 'contract.pdf is ready.' }), 2200);
          }}
        >
          Loading → success
        </Button>
      </div>

      <ButtonGroup>
        <Button
          appearance="subtle"
          onClick={() => {
            toast.success('First');
            toast.info('Second');
            toast.warning('Third');
            toast.error('Fourth');
            toast('Fifth');
          }}
        >
          Add five (see the stack)
        </Button>
        <Button appearance="subtle" onClick={() => toast.dismiss()}>
          Clear all
        </Button>
      </ButtonGroup>

      <p
        style={{
          margin: 0,
          maxInlineSize: '48ch',
          font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
          color: 'var(--color-content-subtle)',
        }}
      >
        Hover or tab into the stack to expand it. Swipe a toast sideways to dismiss it.
      </p>

      <ToastGroup {...args} />
    </div>
  ),
};
