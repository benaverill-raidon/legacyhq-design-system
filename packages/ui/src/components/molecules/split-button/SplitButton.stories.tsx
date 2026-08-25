import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { MenuSection } from '../../organisms/menu';
import { SplitButton } from './split-button';
import type { SplitButtonAppearance } from './split-button.types';

const SIZES = ['xs', 'sm', 'md', 'lg'] as const;
const APPEARANCES: SplitButtonAppearance[] = ['default', 'primary'];

function saveSections(onSelect?: (id: string) => void): MenuSection[] {
  return [
    {
      id: 'save-actions',
      items: [
        { id: 'save-as', label: 'Save as...', onSelect: () => onSelect?.('save-as') },
        { id: 'save-copy', label: 'Save a copy', onSelect: () => onSelect?.('save-copy') },
      ],
    },
  ];
}

const meta = {
  title: 'UI/Molecules/Split Button',
  component: SplitButton,
  args: {
    children: 'Save',
    secondaryActionLabel: 'More Save options',
    sections: saveSections(),
    appearance: 'default',
    size: 'md',
    disabled: false,
    isLoading: false,
  },
  argTypes: {
    children: { control: 'text' },
    appearance: { control: 'inline-radio', options: APPEARANCES },
    size: { control: 'inline-radio', options: SIZES },
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    sections: { control: false },
    onClick: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof SplitButton>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-2xl)' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      {description ? <p style={captionStyle}>{description}</p> : null}
      {children}
    </section>
  );
}

/** Prop exploration. Activate the caret segment to open the dropdown. */
export const Playground: Story = {};

/** Both verified appearances, at every size. */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      {APPEARANCES.map((appearance) => (
        <Group key={appearance} title={appearance}>
          <div style={row}>
            {SIZES.map((size) => (
              <SplitButton key={size} appearance={appearance} size={size} secondaryActionLabel="More Save options" sections={saveSections()}>
                Save
              </SplitButton>
            ))}
          </div>
        </Group>
      ))}
    </div>
  ),
};

/** Realistic content - a primary action paired with a small group of closely related alternatives. */
export const Content: Story = {
  render: () => (
    <div style={row}>
      <SplitButton
        appearance="primary"
        secondaryActionLabel="More options for sending for signature"
        sections={[
          {
            id: 'send-actions',
            items: [
              { id: 'send-draft', label: 'Send as draft' },
              { id: 'preview', label: 'Preview before sending' },
            ],
          },
        ]}
      >
        Send for signature
      </SplitButton>
      <SplitButton
        secondaryActionLabel="More options for creating a trust"
        sections={[
          {
            id: 'create-actions',
            items: [
              { id: 'from-template', label: 'Create from template' },
              { id: 'import', label: 'Import existing trust' },
            ],
          },
        ]}
      >
        Create trust
      </SplitButton>
    </div>
  ),
};

/** Loading and disabled states, and a live example confirming a selection actually reaches the consumer. */
export const EdgeCases: Story = {
  render: () => {
    function LiveSelectionExample() {
      const [lastSelected, setLastSelected] = React.useState<string | null>(null);

      return (
        <div style={stack}>
          <SplitButton secondaryActionLabel="More Save options" sections={saveSections(setLastSelected)}>
            Save
          </SplitButton>
          <p style={captionStyle}>{lastSelected ? `Selected: ${lastSelected}` : 'Nothing selected yet.'}</p>
        </div>
      );
    }

    return (
      <div style={stack}>
        <Group title="Loading" description="The secondary action is disabled while the primary action is in flight, so a consumer can't pick a conflicting action mid-submit.">
          <SplitButton isLoading secondaryActionLabel="More Save options" sections={saveSections()}>
            Save
          </SplitButton>
        </Group>
        <Group title="Disabled" description="Both segments are disabled together. Primary appearance stays borderless when disabled, matching its own resting look - it does not borrow default appearance's bordered disabled treatment.">
          <div style={row}>
            <SplitButton disabled secondaryActionLabel="More Save options" sections={saveSections()}>
              Save
            </SplitButton>
            <SplitButton disabled appearance="primary" secondaryActionLabel="More Save options" sections={saveSections()}>
              Save
            </SplitButton>
          </div>
        </Group>
        <Group title="Selecting an action">
          <LiveSelectionExample />
        </Group>
      </div>
    );
  },
};
