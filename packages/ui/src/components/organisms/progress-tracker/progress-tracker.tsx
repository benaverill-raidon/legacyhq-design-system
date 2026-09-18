import * as React from 'react';
import { Link } from '../../atoms/link';
import styles from './progress-tracker.module.css';
import type { ProgressTrackerProps, ProgressTrackerStep } from './progress-tracker.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function clampCurrentStep(currentStep: number, totalSteps: number) {
  if (totalSteps <= 0 || !Number.isFinite(currentStep)) {
    return 0;
  }

  return Math.min(totalSteps, Math.max(1, Math.trunc(currentStep)));
}

function StepLabel({
  step,
  interactive,
  isCurrent,
  isDisabled,
}: {
  step: ProgressTrackerStep;
  interactive: boolean;
  isCurrent: boolean;
  isDisabled: boolean;
}) {
  if (interactive && step.href) {
    return (
      <Link
        href={step.href}
        target={step.target}
        onClick={step.onClick}
        appearance="subtle"
        size="md"
        className={styles.link}
      >
        {step.label}
      </Link>
    );
  }

  return (
    <span
      className={mergeClassNames(
        styles.label,
        isCurrent && styles.labelCurrent,
        isDisabled && styles.labelDisabled,
      )}
      aria-current={isCurrent ? 'step' : undefined}
    >
      {step.label}
    </span>
  );
}

export const ProgressTracker = React.forwardRef<HTMLElement, ProgressTrackerProps>(
  function ProgressTracker(
    {
      steps,
      currentStep,
      size = 'md',
      disabled = false,
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    forwardedRef,
  ) {
    const totalSteps = steps.length;
    const normalizedCurrentStep = clampCurrentStep(currentStep, totalSteps);
    const fillPercent = totalSteps > 0 ? (normalizedCurrentStep / totalSteps) * 100 : 0;

    const rootClassName = mergeClassNames(styles.root, styles[`size_${size}`], className);
    const trackStyle = { '--progress-tracker-fill': `${fillPercent}%` } as React.CSSProperties;

    return (
      <nav
        {...rest}
        ref={forwardedRef}
        aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? 'Progress')}
        aria-labelledby={ariaLabelledBy}
        className={rootClassName}
        data-size={size}
        data-disabled={disabled ? 'true' : undefined}
      >
        <div className={styles.track} style={trackStyle} data-fill={`${fillPercent}%`} aria-hidden="true">
          <div className={styles.fill} />
        </div>

        <ol className={styles.steps}>
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCurrent = stepNumber === normalizedCurrentStep;
            const isVisited = stepNumber < normalizedCurrentStep;
            const stepDisabled = disabled || Boolean(step.disabled);
            const interactive = Boolean(step.href) && !stepDisabled && !isCurrent && isVisited;

            return (
              <li key={index} className={styles.step}>
                <StepLabel
                  step={step}
                  interactive={interactive}
                  isCurrent={isCurrent}
                  isDisabled={stepDisabled}
                />
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);

ProgressTracker.displayName = 'ProgressTracker';
