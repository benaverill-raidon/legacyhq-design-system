import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LinkButton } from '../../atoms/link-button';
import { ButtonGroup } from '../../molecules/button-group';
import { SectionMessage } from './section-message';
import type { SectionMessageAppearance } from './section-message.types';

const appearances: SectionMessageAppearance[] = ['information', 'success', 'warning', 'error'];

const meta = {
  title: 'UI/Organisms/Section Message',
  component: SectionMessage,
  args: {
    appearance: 'information',
    title: 'Restricted access',
    children:
      "You're not allowed to change these restrictions. It's either due to the restrictions on the page, or permission settings for this space.",
    isDismissible: false,
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: appearances },
    title: { control: 'text' },
    children: { control: 'text' },
    isDismissible: { control: 'boolean' },
    actions: { control: false },
    onDismiss: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof SectionMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-lg)', maxInlineSize: '640px' };

const description =
  "You're not allowed to change these restrictions. It's either due to the restrictions on the page, or permission settings for this space.";

/** Two Link Button actions, grouped in a ButtonGroup that lays them out as a row. */
function demoActions() {
  return (
    <ButtonGroup>
      <LinkButton href="#learn-more" appearance="subtle" size="sm">
        Learn more
      </LinkButton>
      <LinkButton href="#request-access" appearance="subtle" size="sm">
        Request access
      </LinkButton>
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

/** The four semantic appearances, each with its status icon, tinted background, and border. */
export const Appearances: Story = {
  render: () => (
    <div style={stack}>
      {appearances.map((appearance) => (
        <Labelled key={appearance} label={appearance}>
          <SectionMessage appearance={appearance} title="Restricted access" actions={demoActions()}>
            {description}
          </SectionMessage>
        </Labelled>
      ))}
    </div>
  ),
};

/** Title, actions, and dismiss are all optional; the description is the only required content. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="Title + description + actions">
        <SectionMessage appearance="information" title="Restricted access" actions={demoActions()}>
          {description}
        </SectionMessage>
      </Labelled>

      <Labelled label="Description only (no title)">
        <SectionMessage appearance="success">Your changes were published successfully.</SectionMessage>
      </Labelled>

      <Labelled label="A single action">
        <SectionMessage
          appearance="warning"
          title="Your trial ends soon"
          actions={
            <LinkButton href="#upgrade" appearance="subtle" size="sm">
              Upgrade now
            </LinkButton>
          }
        >
          Your trial ends in three days. Upgrade to keep access to your matters.
        </SectionMessage>
      </Labelled>

      <Labelled label="Dismissible">
        <SectionMessage appearance="error" title="Something went wrong" isDismissible>
          We couldn&apos;t save your changes. Check your connection and try again.
        </SectionMessage>
      </Labelled>
    </div>
  ),
};

/** Difficult cases made reproducible: long wrapping content, dismissible with actions, no title. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="Long, wrapping content with a title and actions">
        <SectionMessage appearance="information" title="This title is descriptive enough to wrap onto a second line on narrower viewports" isDismissible actions={demoActions()}>
          {description} {description}
        </SectionMessage>
      </Labelled>

      <Labelled label="Dismissible, no title, one action">
        <SectionMessage
          appearance="warning"
          isDismissible
          actions={
            <LinkButton href="#review" appearance="subtle" size="sm">
              Review settings
            </LinkButton>
          }
        >
          Some of your notification preferences are out of date.
        </SectionMessage>
      </Labelled>
    </div>
  ),
};
