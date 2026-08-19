import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CloseIcon, SearchIcon } from '../../../assets/icons';
import { IconButton } from '../../atoms/icon-button';
import { Label } from '../../atoms/label';
import { TextField } from './text-field';
import type { TextFieldAppearance, TextFieldSize } from './text-field.types';

const sizes: TextFieldSize[] = ['sm', 'md', 'lg'];
const appearances: TextFieldAppearance[] = ['default', 'subtle'];

const meta = {
  title: 'UI/Molecules/Text Field',
  component: TextField,
  args: {
    size: 'md',
    appearance: 'default',
    invalid: false,
    disabled: false,
    placeholder: 'Placeholder',
    'aria-label': 'Text field',
  },
  argTypes: {
    size: { control: 'inline-radio', options: sizes },
    appearance: { control: 'inline-radio', options: appearances },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    iconBefore: { control: false },
    iconAfter: { control: false },
    className: { control: false },
    inputClassName: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-lg)',
};

const fieldStyle: CSSProperties = { inlineSize: '240px' };

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

const darkSurfaceStyle: CSSProperties = {
  ...cardStyle,
  background: 'var(--color-elevation-surface-default)',
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
              <TextField size={size} appearance={appearance} placeholder="Placeholder" aria-label={`${appearance} ${size}`} />
            </Cell>
          ))}
        </Group>
      ))}
    </div>
  ),
};

/**
 * Hover and focus are pinned via `data-force-state` (documentation-only, mirrors the live
 * pseudo-class) so they're visible side by side as a static reference, the same convention
 * Button and Checkbox use. Invalid and disabled are real props.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      {appearances.map((appearance) => (
        <Group key={appearance} title={`Appearance: ${appearance}`}>
          <Cell label="Default">
            <TextField appearance={appearance} placeholder="Placeholder" aria-label="Default" />
          </Cell>
          <Cell label="Hover">
            <TextField appearance={appearance} placeholder="Placeholder" aria-label="Hover" data-force-state="hover" />
          </Cell>
          <Cell label="Focus">
            <TextField appearance={appearance} placeholder="Placeholder" aria-label="Focus" data-force-state="focus" />
          </Cell>
          <Cell label="Invalid">
            <TextField appearance={appearance} invalid defaultValue="Invalid value" aria-label="Invalid" />
          </Cell>
          <Cell label="Disabled">
            <TextField appearance={appearance} disabled defaultValue="Disabled value" aria-label="Disabled" />
          </Cell>
        </Group>
      ))}
    </div>
  ),
};

/** A real clearable field: `iconAfter` holds an actual IconButton, not a bare icon. */
function ClearableField() {
  const [value, setValue] = useState('Clearable value');

  return (
    <TextField
      aria-label="Filter"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      iconAfter={
        value ? (
          <IconButton
            appearance="subtle"
            shape="square"
            size="xs"
            aria-label="Clear"
            onClick={() => setValue('')}
          >
            <CloseIcon />
          </IconButton>
        ) : null
      }
    />
  );
}

/** Realistic content: icons, text prefixes, actions, and pairing with a real label. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Placeholder vs. value">
        <Cell label="Placeholder (empty)">
          <TextField placeholder="Enter your name" aria-label="Name" />
        </Cell>
        <Cell label="Has a value">
          <TextField defaultValue="Jordan Lee" aria-label="Name" />
        </Cell>
      </Group>

      <Group title="iconBefore: icon or text (always decorative)">
        <Cell label="Icon">
          <TextField iconBefore={<SearchIcon />} placeholder="Search" aria-label="Search" />
        </Cell>
        <Cell label="Text prefix">
          <TextField iconBefore="$" type="number" placeholder="0.00" aria-label="Amount" />
        </Cell>
      </Group>

      <Group title="iconAfter: icon-button, button, or a Label pill (icon-button/button are interactive, Label is not)">
        <Cell label="IconButton action (clear)">
          <ClearableField />
        </Cell>
        <Cell label="Label pill (unit)">
          <TextField
            defaultValue="12"
            aria-label="Weight"
            iconAfter={
              <Label size="sm" tone="default">
                kg
              </Label>
            }
          />
        </Cell>
      </Group>

      <Group title="Paired with a native label">
        <Cell label="">
          <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
            <label htmlFor="tf-email" style={{ ...captionStyle, color: 'var(--color-content-default)' }}>
              Email
            </label>
            <TextField id="tf-email" type="email" placeholder="you@example.com" />
          </div>
        </Cell>
      </Group>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Long value in a narrow container">
        <div style={{ inlineSize: '160px' }}>
          <TextField defaultValue="A much longer value than the field can comfortably show" aria-label="Long value" />
        </div>
      </Group>

      <Group title="Fills its container">
        <div style={{ inlineSize: '100%' }}>
          <TextField placeholder="Full width" aria-label="Full width" />
        </div>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <div data-theme="dark" style={darkSurfaceStyle}>
          <div style={row}>
            <div style={fieldStyle}>
              <TextField placeholder="Placeholder" aria-label="Dark default" />
            </div>
            <div style={fieldStyle}>
              <TextField appearance="subtle" placeholder="Placeholder" aria-label="Dark subtle" />
            </div>
            <div style={fieldStyle}>
              <TextField invalid defaultValue="Invalid" aria-label="Dark invalid" />
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};
