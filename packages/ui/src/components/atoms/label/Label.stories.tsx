import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './label';
import type { LabelEmphasis, LabelSize, LabelTone } from './label.types';

const tones: LabelTone[] = [
  'default',
  'information',
  'warning',
  'discovery',
  'error',
  'success',
  'law',
  'wealth',
];

const emphases: LabelEmphasis[] = ['subtle', 'bold'];
const sizes: LabelSize[] = ['sm', 'md'];

const meta = {
  title: 'UI/Atoms/Label',
  component: Label,
  args: {
    children: 'Label',
    size: 'md',
    tone: 'default',
    emphasis: 'subtle',
  },
  argTypes: {
    children: { control: 'text' },
    size: { control: 'radio', options: sizes },
    tone: { control: 'select', options: tones },
    emphasis: { control: 'radio', options: emphases },
    className: { control: false },
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-sm)',
};

const matrixStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, max-content)',
  gap: 'var(--spacing-sm) var(--spacing-lg)',
  alignItems: 'center',
};

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-raised-default)',
  color: 'var(--color-content-default)',
};

const tableStyle: CSSProperties = { borderCollapse: 'collapse', color: 'var(--color-content-default)' };

const cellStyle: CSSProperties = {
  padding: 'var(--spacing-sm)',
  borderBlockEnd: 'var(--border-width-sm) solid var(--color-border-default)',
  textAlign: 'left',
};

function sectionHeading(text: string) {
  return (
    <h3
      style={{
        margin: 0,
        font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
        color: 'var(--color-content-default)',
      }}
    >
      {text}
    </h3>
  );
}

/** A labelled cell so every specimen in a matrix is self-describing. */
function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'start' }}>
      {children}
      <span style={captionStyle}>{label}</span>
    </div>
  );
}

/** Prop exploration. Every supported prop is wired to a control. */
export const Playground: Story = {};

/** The intentionally designed forms: every tone crossed with both emphasis levels, at `md`. */
export const Variants: Story = {
  render: () => (
    <div style={matrixStyle}>
      {tones.flatMap((tone) =>
        emphases.map((emphasis) => (
          <Label key={`${tone}-${emphasis}`} tone={tone} emphasis={emphasis}>
            {tone}
          </Label>
        )),
      )}
    </div>
  ),
};

/** Size is a meaningful axis: `sm` and `md` share the same tone/emphasis scale. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
          {sectionHeading(size)}
          <div style={row}>
            <Label tone="default" emphasis="bold" size={size}>
              Default
            </Label>
            <Label tone="information" emphasis="subtle" size={size}>
              Information
            </Label>
            <Label tone="success" emphasis="bold" size={size}>
              Success
            </Label>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** How Label behaves with realistic content, and inside the compositions it's designed for. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Text is transformed to uppercase visually')}
        <p style={captionStyle}>
          Pass normal-cased text - the uppercase transform is applied by the component, not
          expected of the caller.
        </p>
        <Label tone="default">lowercase input renders uppercase</Label>
      </div>

      <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('In composition')}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <th style={cellStyle}>Estate review</th>
              <td style={cellStyle}>
                <Label tone="success" emphasis="subtle" size="sm">
                  Active
                </Label>
              </td>
            </tr>
            <tr>
              <th style={cellStyle}>Compliance task</th>
              <td style={cellStyle}>
                <Label tone="warning" emphasis="bold" size="sm">
                  At risk
                </Label>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={cardStyle}>
          <Label tone="information" emphasis="subtle">
            Research
          </Label>
          <span>Category metadata in a card.</span>
        </div>

        <div style={row}>
          <Label tone="law" emphasis="bold">
            Law
          </Label>
          <Label tone="wealth" emphasis="bold">
            Wealth
          </Label>
        </div>

        <div style={row}>
          <Label tone="default">Draft</Label>
          <Label tone="discovery">Review</Label>
          <Label tone="error">Blocked</Label>
          <Label tone="success">Complete</Label>
        </div>
      </div>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Long content overflows rather than wrapping or truncating')}
        <p style={captionStyle}>
          Label sets <code>white-space: nowrap</code> and has no ellipsis - content longer than the
          recommended 1-3 words overflows visibly. Truncation beyond normal inline layout is
          explicitly out of scope for this component.
        </p>
        <Cell label="Recommended length">
          <Label tone="warning" emphasis="bold">
            At risk
          </Label>
        </Cell>
        <Cell label="Overflows a narrow container">
          <div
            style={{
              inlineSize: '96px',
              padding: 'var(--spacing-xs)',
              border: 'var(--border-width-sm) dashed var(--color-border-default)',
              borderRadius: 'var(--border-radius-sm)',
              overflow: 'hidden',
            }}
          >
            <Label tone="warning" emphasis="bold">
              Needs review before the filing deadline
            </Label>
          </div>
        </Cell>
      </div>

      <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Several labels wrapping in a row')}
        <div style={{ ...row, inlineSize: '220px' }}>
          <Label tone="default">Draft</Label>
          <Label tone="discovery">Review</Label>
          <Label tone="error">Blocked</Label>
          <Label tone="success">Complete</Label>
          <Label tone="information">Archived</Label>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        {sectionHeading('Dark surface')}
        <div
          data-theme="dark"
          style={{
            ...row,
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-background-neutral-bold-default)',
          }}
        >
          <Label tone="default" emphasis="bold">
            Default
          </Label>
          <Label tone="law" emphasis="subtle">
            Law
          </Label>
          <Label tone="wealth" emphasis="bold">
            Wealth
          </Label>
        </div>
      </div>
    </div>
  ),
};
