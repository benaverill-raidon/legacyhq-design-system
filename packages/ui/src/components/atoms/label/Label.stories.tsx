import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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

const meta: Meta<typeof Label> = {
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
};

export default meta;

type Story = StoryObj<typeof Label>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-200)',
  alignItems: 'start',
} satisfies CSSProperties;

const matrixStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, max-content)',
  gap: 'var(--spacing-100) var(--spacing-200)',
  alignItems: 'center',
} satisfies CSSProperties;

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-075)',
} satisfies CSSProperties;

const cardStyle = {
  display: 'grid',
  gap: 'var(--spacing-100)',
  padding: 'var(--spacing-200)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-raised-default)',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const tableStyle = {
  borderCollapse: 'collapse',
  color: 'var(--color-content-default)',
} satisfies CSSProperties;

const cellStyle = {
  padding: 'var(--spacing-100)',
  borderBlockEnd: 'var(--border-width-default) solid var(--color-border-default)',
  textAlign: 'left',
} satisfies CSSProperties;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={stackStyle}>
      {sizes.map((size) => (
        <div key={size} style={stackStyle}>
          <Label tone="default" emphasis="bold" size={size}>
            {size}
          </Label>
          <div style={matrixStyle}>
            {tones.flatMap((tone) =>
              emphases.map((emphasis) => (
                <Label key={`${size}-${tone}-${emphasis}`} tone={tone} emphasis={emphasis} size={size}>
                  {tone}
                </Label>
              )),
            )}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
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

      <div style={rowStyle}>
        <Label tone="law" emphasis="bold">
          Law
        </Label>
        <Label tone="wealth" emphasis="bold">
          Wealth
        </Label>
      </div>

      <div style={rowStyle}>
        <Label tone="default">Draft</Label>
        <Label tone="discovery">Review</Label>
        <Label tone="error">Blocked</Label>
        <Label tone="success">Complete</Label>
      </div>
    </div>
  ),
};

