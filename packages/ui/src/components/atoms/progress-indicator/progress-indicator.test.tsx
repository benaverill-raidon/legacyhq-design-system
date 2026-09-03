// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readFileSync } from 'node:fs';
import * as React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { ProgressIndicator } from './progress-indicator';
import styles from './progress-indicator.module.css';

afterEach(cleanup);

const progressIndicatorCss = readFileSync(
  'packages/ui/src/components/atoms/progress-indicator/progress-indicator.module.css',
  'utf8',
);

describe('ProgressIndicator', () => {
  it('uses default appearance and sm size by default', () => {
    render(
      <ProgressIndicator
        data-testid="progress-indicator"
        currentStep={2}
        totalSteps={5}
        label="Client onboarding"
      />,
    );

    expect(screen.getByTestId('progress-indicator')).toHaveClass(
      styles.root,
      styles.appearance_default,
      styles.size_sm,
    );
  });

  it('renders progressbar semantics with one-based values', () => {
    render(<ProgressIndicator currentStep={3} totalSteps={5} label="Guided setup" />);

    const progressIndicator = screen.getByRole('progressbar', { name: 'Guided setup' });

    expect(progressIndicator).toHaveAttribute('aria-valuemin', '1');
    expect(progressIndicator).toHaveAttribute('aria-valuemax', '5');
    expect(progressIndicator).toHaveAttribute('aria-valuenow', '3');
    expect(progressIndicator).toHaveAttribute('aria-valuetext', 'Step 3 of 5');
  });

  it('supports custom value text', () => {
    const getValueText = vi.fn((step: number, total: number) => `Section ${step} of ${total}`);

    render(
      <ProgressIndicator
        currentStep={2}
        totalSteps={4}
        label="Estate plan setup"
        getValueText={getValueText}
      />,
    );

    const progressIndicator = screen.getByRole('progressbar', { name: 'Estate plan setup' });

    expect(progressIndicator).toHaveAttribute('aria-valuetext', 'Section 2 of 4');
    expect(getValueText).toHaveBeenCalledWith(2, 4);
  });

  it('prefers aria-label over label for naming', () => {
    render(
      <ProgressIndicator
        currentStep={2}
        totalSteps={5}
        aria-label="Explicit journey name"
        label="Fallback label"
      />,
    );

    expect(screen.getByRole('progressbar', { name: 'Explicit journey name' })).toBeInTheDocument();
  });

  it('supports aria-labelledby', () => {
    render(
      <>
        <span id="journey-title">Account setup</span>
        <ProgressIndicator currentStep={2} totalSteps={5} aria-labelledby="journey-title" />
      </>,
    );

    expect(screen.getByRole('progressbar', { name: 'Account setup' })).toBeInTheDocument();
  });

  it('normalizes totals below one and clamps current step to the valid range', () => {
    render(
      <ProgressIndicator
        data-testid="progress-indicator"
        currentStep={0}
        totalSteps={0}
        label="Normalized journey"
      />,
    );

    const progressIndicator = screen.getByTestId('progress-indicator');

    expect(progressIndicator).toHaveAttribute('aria-valuemax', '1');
    expect(progressIndicator).toHaveAttribute('aria-valuenow', '1');
    expect(progressIndicator).toHaveAttribute('aria-valuetext', 'Step 1 of 1');
  });

  it('clamps current step above the total', () => {
    render(
      <ProgressIndicator
        data-testid="progress-indicator"
        currentStep={12}
        totalSteps={5}
        label="Overflow journey"
      />,
    );

    expect(screen.getByTestId('progress-indicator')).toHaveAttribute('aria-valuenow', '5');
  });

  it('renders a dynamic dot count from total steps', () => {
    const { container } = render(
      <ProgressIndicator currentStep={4} totalSteps={8} label="Dynamic journey" />,
    );

    expect(container.querySelectorAll(`.${styles.dotTarget}`)).toHaveLength(8);
  });

  it('marks exactly one selected visual dot', () => {
    const { container } = render(
      <ProgressIndicator currentStep={3} totalSteps={5} label="Selected journey" />,
    );

    expect(container.querySelectorAll('[data-selected="true"]')).toHaveLength(1);
    expect(container.querySelectorAll(`.${styles.dotSelected}`)).toHaveLength(1);
  });


  it('applies size classes', () => {
    render(
      <ProgressIndicator
        data-testid="progress-indicator"
        currentStep={1}
        totalSteps={4}
        size="md"
        label="Medium journey"
      />,
    );

    expect(screen.getByTestId('progress-indicator')).toHaveClass(styles.size_md);
  });

  it('forwards the root ref', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<ProgressIndicator ref={ref} currentStep={2} totalSteps={5} label="Ref journey" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'progressbar');
  });

  it('forwards native data and aria attributes', () => {
    render(
      <ProgressIndicator
        data-testid="progress-indicator"
        currentStep={2}
        totalSteps={5}
        label="Forwarded journey"
        data-state="active"
        aria-describedby="journey-help"
      />,
    );

    const progressIndicator = screen.getByTestId('progress-indicator');

    expect(progressIndicator).toHaveAttribute('data-state', 'active');
    expect(progressIndicator).toHaveAttribute('aria-describedby', 'journey-help');
  });

  it('hides passive targets from assistive technology', () => {
    const { container } = render(
      <ProgressIndicator currentStep={2} totalSteps={5} label="Decorative dots" />,
    );

    const dotTargets = container.querySelectorAll(`.${styles.dotTarget}`);

    for (const dotTarget of dotTargets) {
      expect(dotTarget).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('renders passive targets as non-focusable spans instead of buttons', () => {
    const { container } = render(
      <ProgressIndicator currentStep={2} totalSteps={5} label="Passive dots" />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(container.querySelectorAll(`span.${styles.dotTarget}`)).toHaveLength(5);
    expect(container.querySelectorAll(`.${styles.dotVisual}`)).toHaveLength(5);
  });

  it('renders interactive dots as buttons and applies shared focus ring classes', () => {
    render(
      <ProgressIndicator
        currentStep={2}
        totalSteps={5}
        appearance="primary"
        label="Interactive dots"
        onStepChange={() => undefined}
      />,
    );

    const buttons = screen.getAllByRole('button');

    expect(buttons).toHaveLength(5);
    expect(buttons[0]).toHaveClass(
      styles.dotTarget,
      styles.dotInteractive,
      styles.appearance_primary,
      focusRingClassNames.focusRing,
      focusRingClassNames.focusRingDefault,
    );
  });

  it('clicking an interactive dot calls onStepChange with its one-based step', () => {
    const onStepChange = vi.fn();

    render(
      <ProgressIndicator
        currentStep={2}
        totalSteps={5}
        label="Clickable dots"
        onStepChange={onStepChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to step 4' }));

    expect(onStepChange).toHaveBeenCalledWith(4);
  });

  it('marks the selected interactive dot with aria-current step', () => {
    render(
      <ProgressIndicator
        currentStep={3}
        totalSteps={5}
        label="Current step"
        onStepChange={() => undefined}
      />,
    );

    expect(screen.getByRole('button', { name: 'Go to step 3' })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('supports external controlled updates through onStepChange', () => {
    function ControlledExample() {
      const [step, setStep] = React.useState(1);

      return (
        <ProgressIndicator
          currentStep={step}
          totalSteps={5}
          label="Controlled example"
          onStepChange={setStep}
        />
      );
    }

    render(<ControlledExample />);

    expect(screen.getByRole('progressbar', { name: 'Controlled example' })).toHaveAttribute(
      'aria-valuenow',
      '1',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go to step 4' }));

    expect(screen.getByRole('progressbar', { name: 'Controlled example' })).toHaveAttribute(
      'aria-valuenow',
      '4',
    );
    expect(screen.getByRole('button', { name: 'Go to step 4' })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('does not support the removed help appearance', () => {
    expect(styles).not.toHaveProperty('appearance_help');
  });

  it('keeps target and visual-dot classes wired for interactive dots', () => {
    expect(styles.dotTarget).toEqual(expect.any(String));
    expect(styles.dotInteractive).toEqual(expect.any(String));
    expect(styles.dotVisual).toEqual(expect.any(String));
  });

  it('keeps the root progress semantics when dots become interactive', () => {
    render(
      <ProgressIndicator
        currentStep={2}
        totalSteps={5}
        label="Interactive progress"
        onStepChange={() => undefined}
      />,
    );

    expect(screen.getByRole('progressbar', { name: 'Interactive progress' })).toHaveAttribute(
      'aria-valuenow',
      '2',
    );
  });
});

describe('ProgressIndicator CSS contract', () => {
  it('uses neutral overlay tokens for interactive target hover and pressed states', () => {
    expect(progressIndicatorCss).toContain('background: var(--color-background-neutral-overlay-bold-hover);');
    expect(progressIndicatorCss).toContain('background: var(--color-background-neutral-overlay-bold-press);');
  });

  it('keeps the target and visible dot fully rounded', () => {
    expect(progressIndicatorCss).toContain('.dotTarget {');
    expect(progressIndicatorCss).toContain('border-radius: var(--border-radius-full-round);');
    expect(progressIndicatorCss).toContain('.dotVisual {');
  });
});
