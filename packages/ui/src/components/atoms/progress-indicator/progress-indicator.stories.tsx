import * as React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { ProgressIndicator } from './progress-indicator';
import type { ProgressIndicatorSize } from './progress-indicator.types';

const sizes: ProgressIndicatorSize[] = ['sm', 'md'];
const totals = [3, 5, 8];

const meta = {
  title: 'UI/Atoms/ProgressIndicator',
  component: ProgressIndicator,
  args: {
    currentStep: 2,
    totalSteps: 5,
    appearance: 'default',
    size: 'sm',
    label: 'Client onboarding',
  },
  argTypes: {
    currentStep: { control: { type: 'number', min: 1, step: 1 } },
    totalSteps: { control: { type: 'number', min: 1, step: 1 } },
    appearance: { control: 'inline-radio', options: ['default', 'primary', 'discovery', 'inverted'] },
    size: { control: 'inline-radio', options: sizes },
    label: { control: 'text' },
    getValueText: { control: false },
    onStepChange: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = { display: 'grid', gap: 'var(--spacing-2xl)' };

const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--spacing-lg)',
};

const captionStyle: CSSProperties = {
  font: 'var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)',
  color: 'var(--color-content-subtle)',
};

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
  overflow: 'visible',
};

const darkCardStyle: CSSProperties = {
  ...cardStyle,
  borderColor: 'var(--color-border-inverse)',
  background: 'var(--color-elevation-surface-default)',
  color: 'var(--color-content-default)',
};

const headingStyle: CSSProperties = {
  margin: 0,
  font: 'var(--typography-heading-xxs-font-weight) var(--typography-heading-xxs-font-size) / var(--typography-heading-xxs-line-height) var(--typography-heading-xxs-font-family)',
  color: 'var(--color-content-default)',
};

/** A labelled cell so every specimen in a matrix is self-describing. */
function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-sm)', justifyItems: 'start', overflow: 'visible' }}>
      {children}
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

/**
 * The intentionally designed forms. `inverted` is shown separately on a dark surface because its
 * selected dot is white and disappears on a light background - it isn't a fourth entry in the same
 * row as the other three appearances.
 */
export const Variants: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Appearance">
        <Cell label="default">
          <ProgressIndicator appearance="default" currentStep={2} totalSteps={4} label="Default journey" />
        </Cell>
        <Cell label="primary">
          <ProgressIndicator appearance="primary" currentStep={2} totalSteps={4} label="Primary journey" />
        </Cell>
        <Cell label="discovery">
          <ProgressIndicator appearance="discovery" currentStep={2} totalSteps={4} label="Discovery journey" />
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Inverted (requires a dark or bold surface)</h3>
        <p style={captionStyle}>
          The inverted selected dot renders in <code>color-content-inverse</code> (white) - correct
          on a dark surface, invisible on a light one. This is why it isn&rsquo;t grouped with the
          other three appearances above.
        </p>
        <div
          data-theme="dark"
          style={{
            ...row,
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-elevation-surface-default)',
          }}
        >
          <ProgressIndicator appearance="inverted" currentStep={2} totalSteps={4} label="Inverted journey" />
          <ProgressIndicator appearance="inverted" size="md" currentStep={3} totalSteps={5} label="Inverted journey, md" />
        </div>
      </section>
    </div>
  ),
};

/** Size is a meaningful axis: dot container and visible-dot diameter both scale. */
export const Sizes: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Sizes">
        {sizes.map((size) => (
          <Cell key={size} label={size}>
            <ProgressIndicator size={size} currentStep={2} totalSteps={4} label={`${size} journey`} />
          </Cell>
        ))}
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>The interactive hit target scales too</h3>
        <p style={captionStyle}>
          Progress Indicator has no separate hit-target prop - the dot container itself grows from
          16px at <code>sm</code> to 20px at <code>md</code>, enlarging the tappable area whenever
          <code> onStepChange</code> is provided.
        </p>
        <div style={row}>
          {sizes.map((size) => (
            <Cell key={size} label={`${size}, interactive`}>
              <ProgressIndicator
                size={size}
                currentStep={2}
                totalSteps={4}
                label={`${size} interactive journey`}
                onStepChange={() => undefined}
              />
            </Cell>
          ))}
        </div>
      </section>
    </div>
  ),
};

function FocusTestExample() {
  const [step, setStep] = React.useState(1);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
      <ProgressIndicator
        currentStep={step}
        totalSteps={5}
        appearance="primary"
        size="md"
        label="Interactive focus test"
        onStepChange={setStep}
      />
      <span style={captionStyle}>Tab through the dots and click one to verify hover, focus, and press</span>
    </div>
  );
}

/**
 * Progress Indicator has no interactive states of its own to pin the way Button or Avatar do -
 * hover/focus/press apply per dot, not to the root, so this page documents the states that
 * actually vary: dot position, and passive versus interactive rendering. The Live group is where
 * hover/focus/press are verified directly, by interacting with a real instance.
 */
export const States: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Position">
        <Cell label="First (1 of 5)">
          <ProgressIndicator currentStep={1} totalSteps={5} label="First step" />
        </Cell>
        <Cell label="Middle (3 of 5)">
          <ProgressIndicator currentStep={3} totalSteps={5} label="Middle step" />
        </Cell>
        <Cell label="Final (5 of 5)">
          <ProgressIndicator currentStep={5} totalSteps={5} label="Final step" />
        </Cell>
      </Group>

      <Group title="Passive versus interactive">
        <Cell label="Passive (decorative, non-focusable)">
          <ProgressIndicator currentStep={2} totalSteps={4} label="Passive journey" />
        </Cell>
        <Cell label="Interactive (native buttons, aria-current on selected)">
          <ProgressIndicator currentStep={2} totalSteps={4} label="Interactive journey" onStepChange={() => undefined} />
        </Cell>
      </Group>

      <Group title="Live - hover, tab to, and click this">
        <FocusTestExample />
      </Group>
    </div>
  ),
};

function PaginationExample() {
  const [step, setStep] = React.useState(1);
  const totalSteps = 5;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
      <Button disabled={step === 1} onClick={() => setStep((value) => Math.max(1, value - 1))}>
        Previous
      </Button>

      <ProgressIndicator currentStep={step} totalSteps={totalSteps} label="Client onboarding" onStepChange={setStep} />

      <Button disabled={step === totalSteps} onClick={() => setStep((value) => Math.min(totalSteps, value + 1))}>
        Next
      </Button>
    </div>
  );
}

/** Realistic content and the compositions Progress Indicator is designed to sit inside. */
export const Content: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Different totals (dot count is dynamic)">
        {totals.map((total) => {
          const middle = Math.ceil(total / 2);

          return (
            <Cell key={total} label={`${middle} of ${total}`}>
              <ProgressIndicator currentStep={middle} totalSteps={total} label={`${middle} of ${total} journey`} />
            </Cell>
          );
        })}
      </Group>

      <Group title="Custom value text">
        <Cell label='announces "Section 2 of 4" instead of "Step 2 of 4"'>
          <ProgressIndicator
            currentStep={2}
            totalSteps={4}
            label="Estate plan setup"
            getValueText={(step, total) => `Section ${step} of ${total}`}
          />
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>In composition</h3>

        <div style={cardStyle}>
          <div style={row}>
            <ProgressIndicator currentStep={2} totalSteps={5} label="Client onboarding" />
            <span style={captionStyle}>Profile review</span>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={row}>
            <ProgressIndicator appearance="primary" size="md" currentStep={3} totalSteps={5} label="Account setup" />
            <span style={captionStyle}>Security preferences</span>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={row}>
            <ProgressIndicator appearance="discovery" currentStep={1} totalSteps={4} label="Guided setup" />
            <span style={captionStyle}>Introduction</span>
          </div>
        </div>

        <div style={darkCardStyle}>
          <div style={row}>
            <ProgressIndicator appearance="inverted" size="md" currentStep={4} totalSteps={5} label="Document setup" />
            <span style={captionStyle}>Review and confirm</span>
          </div>
        </div>

        <div style={cardStyle}>
          <h4 style={{ ...headingStyle, font: 'var(--typography-body-sm-font-weight) var(--typography-body-sm-font-size) / var(--typography-body-sm-line-height) var(--typography-body-sm-font-family)' }}>
            Externally controlled pagination
          </h4>
          <PaginationExample />
        </div>
      </section>
    </div>
  ),
};

/** Difficult states made reproducible outside the application. */
export const EdgeCases: Story = {
  render: () => (
    <div style={stack}>
      <Group title="Single step (always selected, nowhere to go)">
        <Cell label="1 of 1">
          <ProgressIndicator currentStep={1} totalSteps={1} label="Single-step journey" />
        </Cell>
      </Group>

      <Group title="Out-of-range values clamp safely">
        <Cell label="currentStep=0 clamps to 1">
          <ProgressIndicator currentStep={0} totalSteps={5} label="Underflow journey" />
        </Cell>
        <Cell label="currentStep=12 clamps to 5">
          <ProgressIndicator currentStep={12} totalSteps={5} label="Overflow journey" />
        </Cell>
        <Cell label="totalSteps=0 normalizes to 1">
          <ProgressIndicator currentStep={1} totalSteps={0} label="Normalized journey" />
        </Cell>
      </Group>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Many steps in a narrow container</h3>
        <p style={captionStyle}>
          Dots do not wrap - Progress Indicator keeps an intrinsic width based on{' '}
          <code>totalSteps</code> and relies on surrounding layout (here, horizontal scroll) for
          narrow spaces.
        </p>
        <div
          style={{
            inlineSize: '160px',
            overflow: 'auto',
            border: 'var(--border-width-sm) dashed var(--color-border-default)',
            padding: 'var(--spacing-sm)',
          }}
        >
          <ProgressIndicator currentStep={9} totalSteps={20} label="Long journey" />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
        <h3 style={headingStyle}>Dark surface</h3>
        <p style={captionStyle}>
          <code>default</code>, <code>primary</code>, and <code>discovery</code> stay legible on a
          dark surface without switching appearance - <code>inverted</code> is only needed when the
          default selected color itself lacks contrast.
        </p>
        <div
          data-theme="dark"
          style={{
            ...row,
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-elevation-surface-default)',
          }}
        >
          <ProgressIndicator currentStep={2} totalSteps={4} label="Dark default" />
          <ProgressIndicator appearance="primary" currentStep={2} totalSteps={4} label="Dark primary" />
          <ProgressIndicator appearance="discovery" currentStep={2} totalSteps={4} label="Dark discovery" />
          <ProgressIndicator appearance="inverted" currentStep={2} totalSteps={4} label="Dark inverted" />
        </div>
      </section>
    </div>
  ),
};
