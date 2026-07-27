import * as React from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../button';
import { ProgressIndicator } from './progress-indicator';
import type {
  ProgressIndicatorAppearance,
  ProgressIndicatorSize,
} from './progress-indicator.types';

const appearances: ProgressIndicatorAppearance[] = ['default', 'primary', 'discovery', 'inverted'];
const sizes: ProgressIndicatorSize[] = ['sm', 'md'];
const totals = [3, 5, 8];

const meta: Meta<typeof ProgressIndicator> = {
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
    appearance: { control: 'radio', options: appearances },
    size: { control: 'radio', options: sizes },
    label: { control: 'text' },
    getValueText: { control: false },
    onStepChange: { control: false },
    className: { control: false },
    style: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressIndicator>;

const stackStyle = {
  display: 'grid',
  gap: 'var(--spacing-lg)',
} satisfies CSSProperties;

const cardStyle = {
  display: 'grid',
  gap: 'var(--spacing-sm)',
  padding: 'var(--spacing-lg)',
  border: 'var(--border-width-sm) solid var(--color-border-default)',
  borderRadius: 'var(--border-radius-md)',
  background: 'var(--color-elevation-surface-default)',
  overflow: 'visible',
} satisfies CSSProperties;

const darkCardStyle = {
  ...cardStyle,
  borderColor: 'var(--color-border-inverse)',
  background: 'var(--color-background-neutral-bold-default)',
} satisfies CSSProperties;

const variantsGridStyle = {
  display: 'grid',
  gap: 'var(--spacing-lg)',
} satisfies CSSProperties;

const appearanceGridStyle = {
  display: 'grid',
  gap: 'var(--spacing-md)',
} satisfies CSSProperties;

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '120px repeat(3, max-content)',
  alignItems: 'center',
  gap: 'var(--spacing-md)',
} satisfies CSSProperties;

const inlineGroupStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--spacing-md)',
} satisfies CSSProperties;

const paginationStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--spacing-md)',
  flexWrap: 'wrap',
} satisfies CSSProperties;

const headingStyle = {
  margin: 0,
  fontFamily: 'var(--typography-body-md-font-family)',
  fontSize: 'var(--typography-body-md-font-size)',
  fontWeight: 'var(--typography-body-md-font-weight)',
  lineHeight: 'var(--typography-body-md-line-height)',
  letterSpacing: 'var(--typography-body-md-letter-spacing)',
} satisfies CSSProperties;

const labelStyle = {
  color: 'var(--color-content-subtle)',
  fontFamily: 'var(--typography-body-sm-font-family)',
  fontSize: 'var(--typography-body-sm-font-size)',
  fontWeight: 'var(--typography-body-sm-font-weight)',
  lineHeight: 'var(--typography-body-sm-line-height)',
} satisfies CSSProperties;

const inverseLabelStyle = {
  ...labelStyle,
  color: 'var(--color-content-inverse)',
} satisfies CSSProperties;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={variantsGridStyle}>
      {sizes.map((size) => (
        <div key={size} style={cardStyle}>
          <h3 style={headingStyle}>Passive {size}</h3>
          <div style={appearanceGridStyle}>
            {appearances
              .filter((appearance) => appearance !== 'inverted')
              .map((appearance) => (
                <div key={`${size}-${appearance}`} style={rowStyle}>
                  <span style={labelStyle}>{appearance}</span>
                  {totals.map((total) => {
                    const middle = Math.ceil(total / 2);

                    return (
                      <ProgressIndicator
                        key={`${size}-${appearance}-${total}`}
                        appearance={appearance}
                        size={size}
                        currentStep={middle}
                        totalSteps={total}
                        label={`${appearance} journey ${middle} of ${total}`}
                      />
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      ))}

      {sizes.map((size) => (
        <div key={`interactive-${size}`} style={cardStyle}>
          <h3 style={headingStyle}>Interactive {size}</h3>
          <div style={appearanceGridStyle}>
            {appearances
              .filter((appearance) => appearance !== 'inverted')
              .map((appearance) => (
                <div key={`interactive-${size}-${appearance}`} style={rowStyle}>
                  <span style={labelStyle}>{appearance}</span>
                  {totals.map((total) => {
                    const middle = Math.ceil(total / 2);

                    return (
                      <ProgressIndicator
                        key={`interactive-${size}-${appearance}-${total}`}
                        appearance={appearance}
                        size={size}
                        currentStep={middle}
                        totalSteps={total}
                        label={`${appearance} interactive journey ${middle} of ${total}`}
                        onStepChange={() => undefined}
                      />
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      ))}

      {sizes.map((size) => (
        <div key={`inverted-${size}`} style={darkCardStyle}>
          <h3 style={{ ...headingStyle, color: 'var(--color-content-inverse)' }}>
            Inverted {size}
          </h3>
          <div style={appearanceGridStyle}>
            {totals.map((total) => {
              const middle = Math.ceil(total / 2);

              return (
                <div key={`inverted-${size}-${total}`} style={inlineGroupStyle}>
                  <span style={inverseLabelStyle}>{`${middle} of ${total}`}</span>
                  <ProgressIndicator
                    appearance="inverted"
                    size={size}
                    currentStep={middle}
                    totalSteps={total}
                    label={`Inverted journey ${middle} of ${total}`}
                  />
                </div>
              );
            })}

            <div style={inlineGroupStyle}>
              <span style={inverseLabelStyle}>interactive</span>
              <ProgressIndicator
                appearance="inverted"
                size={size}
                currentStep={2}
                totalSteps={5}
                label="Inverted interactive journey"
                onStepChange={() => undefined}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

function PaginationExample() {
  const [step, setStep] = React.useState(1);
  const totalSteps = 5;

  return (
    <div style={paginationStyle}>
      <Button
        isDisabled={step === 1}
        onClick={() => setStep((value) => Math.max(1, value - 1))}
      >
        Previous
      </Button>

      <ProgressIndicator
        currentStep={step}
        totalSteps={totalSteps}
        label="Client onboarding"
        onStepChange={setStep}
      />

      <Button
        isDisabled={step === totalSteps}
        onClick={() => setStep((value) => Math.min(totalSteps, value + 1))}
      >
        Next
      </Button>
    </div>
  );
}

function FocusTestExample() {
  const [step, setStep] = React.useState(1);

  return (
    <div style={inlineGroupStyle}>
      <ProgressIndicator
        currentStep={step}
        totalSteps={5}
        appearance="primary"
        size="md"
        label="Interactive focus test"
        onStepChange={setStep}
      />
      <span style={labelStyle}>Tab through the dots to verify the ring</span>
    </div>
  );
}

export const Examples: Story = {
  render: () => (
    <div style={stackStyle}>
      <div style={cardStyle}>
        <h3 style={headingStyle}>Client onboarding</h3>
        <div style={inlineGroupStyle}>
          <ProgressIndicator currentStep={2} totalSteps={5} label="Client onboarding" />
          <span style={labelStyle}>Profile review</span>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Account setup</h3>
        <div style={inlineGroupStyle}>
          <ProgressIndicator
            appearance="primary"
            size="md"
            currentStep={3}
            totalSteps={5}
            label="Account setup"
          />
          <span style={labelStyle}>Security preferences</span>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Guided setup</h3>
        <div style={inlineGroupStyle}>
          <ProgressIndicator
            appearance="discovery"
            currentStep={1}
            totalSteps={4}
            label="Guided setup"
          />
          <span style={labelStyle}>Introduction</span>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Interactive dots</h3>
        <div style={inlineGroupStyle}>
          <ProgressIndicator
            appearance="primary"
            currentStep={2}
            totalSteps={5}
            label="Interactive account setup"
            onStepChange={() => undefined}
          />
          <span style={labelStyle}>Select a step directly</span>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Interactive focus test</h3>
        <FocusTestExample />
      </div>

      <div style={darkCardStyle}>
        <h3 style={{ ...headingStyle, color: 'var(--color-content-inverse)' }}>
          Document setup
        </h3>
        <div style={inlineGroupStyle}>
          <ProgressIndicator
            appearance="inverted"
            size="md"
            currentStep={4}
            totalSteps={5}
            label="Document setup"
          />
          <span style={inverseLabelStyle}>Review and confirm</span>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Externally controlled pagination</h3>
        <PaginationExample />
      </div>

      <div style={cardStyle}>
        <h3 style={headingStyle}>Domain-specific value text</h3>
        <div style={inlineGroupStyle}>
          <ProgressIndicator
            currentStep={2}
            totalSteps={4}
            label="Estate plan setup"
            getValueText={(step, total) => `Section ${step} of ${total}`}
          />
          <span style={labelStyle}>Beneficiary details</span>
        </div>
      </div>
    </div>
  ),
};
