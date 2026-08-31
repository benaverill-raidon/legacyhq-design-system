import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './text-area';
import type { TextAreaAppearance, TextAreaResize, TextAreaSize } from './text-area.types';

const sizes: TextAreaSize[] = ['md', 'lg'];
const appearances: TextAreaAppearance[] = ['default', 'subtle'];
const resizes: TextAreaResize[] = ['none', 'vertical', 'horizontal', 'both'];

const meta = {
  title: 'UI/Molecules/Text Area',
  component: TextArea,
  args: {
    size: 'md',
    appearance: 'default',
    invalid: false,
    disabled: false,
    resize: 'vertical',
    rows: 4,
    placeholder: 'Placeholder',
    'aria-label': 'Text area',
  },
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
    appearance: { control: 'inline-radio', options: appearances },
    resize: { control: 'inline-radio', options: resizes },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    rows: { control: { type: 'number', min: 1, max: 12 } },
    placeholder: { control: 'text' },
    className: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof TextArea>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 'var(--spacing-lg)' };

const fieldStyle: CSSProperties = { inlineSize: '260px' };

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
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

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'start' }}>
      <div style={fieldStyle}>{children}</div>
      <span style={captionStyle}>{label}</span>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      <h3 style={headingStyle}>{title}</h3>
      <div style={row}>{children}</div>
    </section>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/** Size x appearance, scannable side by side. */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      {appearances.map((appearance) => (
        <Group key={appearance} title={`Appearance: ${appearance}`}>
          {sizes.map((size) => (
            <Cell key={size} label={size}>
              <TextArea size={size} appearance={appearance} rows={4} placeholder="Placeholder" aria-label={`${appearance} ${size}`} />
            </Cell>
          ))}
        </Group>
      ))}
    </div>
  ),
};

/**
 * Hover and focus are pinned via `data-force-state` (documentation-only, mirrors the live
 * pseudo-class) so they're visible side by side as a static reference, the same convention Text
 * Field, Button, and Checkbox use. Invalid and disabled are real props.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      {appearances.map((appearance) => (
        <Group key={appearance} title={`Appearance: ${appearance}`}>
          <Cell label="Default">
            <TextArea appearance={appearance} rows={3} placeholder="Placeholder" aria-label="Default" />
          </Cell>
          <Cell label="Hover">
            <TextArea appearance={appearance} rows={3} placeholder="Placeholder" aria-label="Hover" data-force-state="hover" />
          </Cell>
          <Cell label="Focus">
            <TextArea appearance={appearance} rows={3} placeholder="Placeholder" aria-label="Focus" data-force-state="focus" />
          </Cell>
          <Cell label="Invalid">
            <TextArea appearance={appearance} rows={3} invalid defaultValue="This value needs attention" aria-label="Invalid" />
          </Cell>
          <Cell label="Disabled">
            <TextArea appearance={appearance} rows={3} disabled defaultValue="Disabled value" aria-label="Disabled" />
          </Cell>
        </Group>
      ))}
    </div>
  ),
};

/** The resize axis. `vertical` is the default; `none` locks the height for fixed layouts. */
export const Resize: Story = {
  render: () => (
    <div style={stack}>
      <Group title="resize (drag the bottom edge / corner)">
        {resizes.map((resize) => (
          <Cell key={resize} label={resize}>
            <TextArea resize={resize} rows={3} defaultValue={`resize="${resize}"`} aria-label={`resize ${resize}`} />
          </Cell>
        ))}
      </Group>
    </div>
  ),
};

/** A controlled field with a live character count in a paired helper line. */
function CountingField() {
  const [value, setValue] = useState('');
  const max = 240;

  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
      <label htmlFor="ta-bio" style={{ ...captionStyle, color: 'var(--color-content-default)' }}>
        Bio
      </label>
      <TextArea
        id="ta-bio"
        rows={4}
        maxLength={max}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Tell us about yourself"
      />
      <span style={captionStyle}>
        {value.length} / {max}
      </span>
    </div>
  );
}

/** Realistic content: placeholder vs value, and pairing with a native label + helper text. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Placeholder vs. value">
        <Cell label="Placeholder (empty)">
          <TextArea rows={3} placeholder="Add a description" aria-label="Description" />
        </Cell>
        <Cell label="Has a value">
          <TextArea
            rows={3}
            defaultValue={'Signed engagement letter received.\nAwaiting the trust schedule from the client.'}
            aria-label="Notes"
          />
        </Cell>
      </Group>

      <Group title="Paired with a native label and a live count">
        <Cell label="">
          <CountingField />
        </Cell>
      </Group>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Long value scrolls within a fixed height">
        <div style={fieldStyle}>
          <TextArea
            rows={3}
            resize="none"
            defaultValue={Array.from({ length: 12 }, (_, i) => `Line ${i + 1}: a paragraph of notes that keeps going.`).join('\n')}
            aria-label="Long value"
          />
        </div>
      </Group>

      <Group title="Fills its container">
        <div style={{ inlineSize: '100%' }}>
          <TextArea rows={4} placeholder="Full width" aria-label="Full width" />
        </div>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div data-theme="dark" style={cardStyle}>
          <div style={row}>
            <div style={fieldStyle}>
              <TextArea rows={3} placeholder="Placeholder" aria-label="Dark default" />
            </div>
            <div style={fieldStyle}>
              <TextArea rows={3} appearance="subtle" placeholder="Placeholder" aria-label="Dark subtle" />
            </div>
            <div style={fieldStyle}>
              <TextArea rows={3} invalid defaultValue="Invalid" aria-label="Dark invalid" />
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};
