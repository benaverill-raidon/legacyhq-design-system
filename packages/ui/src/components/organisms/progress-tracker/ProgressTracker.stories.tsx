import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressTracker } from './progress-tracker';
import type { ProgressTrackerStep } from './progress-tracker.types';

const steps: ProgressTrackerStep[] = [
  { label: 'Details', href: '#details' },
  { label: 'Parties', href: '#parties' },
  { label: 'Documents', href: '#documents' },
  { label: 'Review' },
  { label: 'Submit' },
];

const meta = {
  title: 'UI/Organisms/ProgressTracker',
  component: ProgressTracker,
  args: {
    steps,
    currentStep: 3,
    size: 'md',
    disabled: false,
    'aria-label': 'Matter setup',
  },
  argTypes: {
    currentStep: { control: { type: 'number', min: 1, max: steps.length } },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
    disabled: { control: 'boolean' },
    steps: { control: false },
  },
} satisfies Meta<typeof ProgressTracker>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)', maxInlineSize: '640px' };

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
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

/** Prop exploration. Visited steps (before the current one) are links; the current step is `content/selected`. */
export const Playground: Story = {};

/** The two sizes change only the bar thickness; the label stays `heading-xs`. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="md">
        <ProgressTracker steps={steps} currentStep={3} size="md" aria-label="Setup (md)" />
      </Labelled>

      <Labelled label="lg">
        <ProgressTracker steps={steps} currentStep={3} size="lg" aria-label="Setup (lg)" />
      </Labelled>
    </div>
  ),
};

/** As `currentStep` advances, the fill grows to `currentStep / totalSteps` and the active label moves. */
export const Progress: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="First step">
        <ProgressTracker steps={steps} currentStep={1} aria-label="Setup, first step" />
      </Labelled>
      <Labelled label="In progress">
        <ProgressTracker steps={steps} currentStep={3} aria-label="Setup, in progress" />
      </Labelled>
      <Labelled label="Complete">
        <ProgressTracker steps={steps} currentStep={5} aria-label="Setup, complete" />
      </Labelled>
    </div>
  ),
};

/** A disabled tracker greys the fill and every label; a single step can also be disabled on its own. */
export const Disabled: Story = {
  render: () => (
    <div style={stack}>
      <Labelled label="Whole tracker disabled">
        <ProgressTracker steps={steps} currentStep={3} disabled aria-label="Disabled tracker" />
      </Labelled>

      <Labelled label="One step disabled (Documents)">
        <ProgressTracker
          steps={[
            { label: 'Details', href: '#details' },
            { label: 'Parties', href: '#parties' },
            { label: 'Documents', href: '#documents', disabled: true },
            { label: 'Review' },
            { label: 'Submit' },
          ]}
          currentStep={4}
          aria-label="One step disabled"
        />
      </Labelled>
    </div>
  ),
};
