import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../atoms/button';
import { ButtonGroup } from '../../molecules/button-group';
import { Banner } from './banner';
import type { BannerAppearance } from './banner.types';

const appearances: BannerAppearance[] = ['default', 'warning', 'error'];

const meta = {
  title: 'UI/Organisms/Banner',
  component: Banner,
  parameters: { layout: 'fullscreen' },
  args: {
    appearance: 'default',
    showIcon: true,
    children: 'Scheduled maintenance is planned for this weekend. Some features may be unavailable.',
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: appearances },
    showIcon: { control: 'boolean' },
    children: { control: 'text' },
    actions: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-lg)' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
  paddingInline: 'var(--spacing-2xl)',
};

/**
 * The two-action composition the Banner is designed around. `default` and `error` sit on a dark
 * background so their actions use the inverse treatment; the `warning` bar carries dark content, so
 * its actions use `tone="warning"` (which needs `appearance="primary"` to render) instead.
 */
function BannerActions({ appearance = 'default' }: { appearance?: BannerAppearance }) {
  if (appearance === 'warning') {
    return (
      <ButtonGroup>
        <Button size="sm" appearance="primary" tone="warning">
          Learn more
        </Button>
        <Button size="sm" appearance="primary" tone="warning">
          Dismiss
        </Button>
      </ButtonGroup>
    );
  }

  return (
    <ButtonGroup>
      <Button size="sm" isInverse>
        Learn more
      </Button>
      <Button size="sm" isInverse>
        Dismiss
      </Button>
    </ButtonGroup>
  );
}

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
      <span style={captionStyle}>{label}</span>
      {children}
    </div>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {
  args: {
    actions: <BannerActions />,
  },
};

/** The three semantic appearances, each with its status icon and inverse-tone actions. */
export const Appearances: Story = {
  render: () => (
    <div style={stack}>
      {appearances.map((appearance) => (
        <Labelled key={appearance} label={appearance}>
          <Banner appearance={appearance} actions={<BannerActions appearance={appearance} />}>
            Scheduled maintenance is planned for this weekend. Some features may be unavailable.
          </Banner>
        </Labelled>
      ))}
    </div>
  ),
};

/** The message-only form (no actions) and the icon toggled off. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="Message only">
        <Banner>Your changes have been saved and will sync across your devices shortly.</Banner>
      </Labelled>

      <Labelled label="Without the leading icon">
        <Banner showIcon={false}>
          Your changes have been saved and will sync across your devices shortly.
        </Banner>
      </Labelled>

      <Labelled label="With actions">
        <Banner actions={<BannerActions />}>
          A new version of the application is available.
        </Banner>
      </Labelled>

      <Labelled label="A single action">
        <Banner
          appearance="error"
          actions={
            <Button size="sm" isInverse>
              Retry
            </Button>
          }
        >
          We could not reach the server. Some data may be out of date.
        </Banner>
      </Labelled>
    </div>
  ),
};

/** The message truncates to a single line rather than wrapping, keeping the bar one row tall. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="Long message truncates with an ellipsis">
        <Banner appearance="warning" actions={<BannerActions appearance="warning" />}>
          This is an intentionally long announcement that keeps going well past the available width
          of the banner so that the single-line truncation behaviour is visible - the message ends
          with an ellipsis rather than wrapping onto a second line and growing the bar.
        </Banner>
      </Labelled>

      <Labelled label="Narrow viewport">
        <div style={{ inlineSize: '360px', border: 'var(--border-width-sm) dashed var(--color-border-default)' }}>
          <Banner appearance="error" actions={<BannerActions />}>
            The connection was interrupted while saving your work.
          </Banner>
        </div>
      </Labelled>
    </div>
  ),
};
