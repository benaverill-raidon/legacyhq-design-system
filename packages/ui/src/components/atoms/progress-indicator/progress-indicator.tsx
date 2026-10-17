import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './progress-indicator.module.css';
import type {
  ProgressIndicatorAppearance,
  ProgressIndicatorProps,
  ProgressIndicatorSize,
} from './progress-indicator.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function normalizeTotalSteps(totalSteps: number) {
  if (!Number.isFinite(totalSteps)) {
    return 1;
  }

  return Math.max(1, Math.trunc(totalSteps));
}

function normalizeCurrentStep(currentStep: number, totalSteps: number) {
  if (!Number.isFinite(currentStep)) {
    return 1;
  }

  return Math.min(totalSteps, Math.max(1, Math.trunc(currentStep)));
}

function getAccessibleNameProps(
  ariaLabel: string | undefined,
  ariaLabelledBy: string | undefined,
  label: string | undefined,
) {
  if (ariaLabel) {
    return { 'aria-label': ariaLabel };
  }

  if (ariaLabelledBy) {
    return { 'aria-labelledby': ariaLabelledBy };
  }

  if (label) {
    return { 'aria-label': label };
  }

  return {};
}

function getDefaultValueText(currentStep: number, totalSteps: number) {
  return `Step ${currentStep} of ${totalSteps}`;
}

function defaultGetStepLabel(step: number) {
  return `Go to step ${step}`;
}

function renderDots(
  totalSteps: number,
  currentStep: number,
  appearance: ProgressIndicatorAppearance,
  size: ProgressIndicatorSize,
  onStepChange: ((step: number) => void) | undefined,
  getStepLabel: (step: number, totalSteps: number) => string,
) {
  return Array.from({ length: totalSteps }, (_, index) => {
    const stepNumber = index + 1;
    const isSelected = stepNumber === currentStep;
    const dotVisualClassName = mergeClassNames(
      styles.dotVisual,
      isSelected ? styles.dotSelected : styles.dotUnselected,
    );
    const dotTargetClassName = mergeClassNames(
      styles.dotTarget,
      styles[`appearance_${appearance}`],
      styles[`size_${size}`],
      onStepChange && styles.dotInteractive,
      onStepChange && focusRingClassNames.focusRing,
      onStepChange && focusRingClassNames.focusRingDefault,
    );

    if (onStepChange) {
      return (
        <button
          key={`progress-indicator-dot-${stepNumber}`}
          type="button"
          className={dotTargetClassName}
          data-selected={isSelected ? 'true' : undefined}
          aria-label={getStepLabel(stepNumber, totalSteps)}
          aria-current={isSelected ? 'step' : undefined}
          onClick={() => onStepChange(stepNumber)}
        >
          <span className={dotVisualClassName} />
        </button>
      );
    }

    return (
      <span
        key={`progress-indicator-dot-${stepNumber}`}
        className={dotTargetClassName}
        data-selected={isSelected ? 'true' : undefined}
        aria-hidden="true"
      >
        <span className={dotVisualClassName} />
      </span>
    );
  });
}

export const ProgressIndicator = React.memo(
  React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(function ProgressIndicator(
    {
      currentStep,
      totalSteps,
      appearance: requestedAppearance = 'default',
      size = 'sm',
      label,
      getValueText,
      onStepChange,
      getStepLabel = defaultGetStepLabel,
      className,
      role,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-valuetext': ariaValueText,
      ...rest
    },
    forwardedRef,
  ) {
    // `inverted` is the deprecated name for `inverse`.
    const appearance: ProgressIndicatorAppearance = requestedAppearance === 'inverted' ? 'inverse' : requestedAppearance;
    const normalizedTotalSteps = normalizeTotalSteps(totalSteps);
    const normalizedCurrentStep = normalizeCurrentStep(currentStep, normalizedTotalSteps);
    const accessibleNameProps = getAccessibleNameProps(ariaLabel, ariaLabelledBy, label);
    const rootClassName = mergeClassNames(
      styles.root,
      styles[`appearance_${appearance}`],
      styles[`size_${size}`],
      className,
    );
    const isInteractive = Boolean(onStepChange);
    const resolvedValueText = getValueText
      ? getValueText(normalizedCurrentStep, normalizedTotalSteps)
      : (ariaValueText ?? getDefaultValueText(normalizedCurrentStep, normalizedTotalSteps));
    // A progressbar's children are presentational, so assistive technology may not expose buttons
    // inside one. Interactive dots sit in a named group instead, and the current dot carries
    // `aria-current="step"`; only the decorative indicator is a progressbar with a value.
    const semanticProps = isInteractive
      ? { role: role ?? 'group' }
      : {
          role: role ?? 'progressbar',
          'aria-valuemin': 1,
          'aria-valuemax': normalizedTotalSteps,
          'aria-valuenow': normalizedCurrentStep,
          'aria-valuetext': resolvedValueText,
        };

    return (
      <div
        {...rest}
        {...accessibleNameProps}
        {...semanticProps}
        ref={forwardedRef}
        className={rootClassName}
        data-appearance={appearance}
        data-interactive={isInteractive ? 'true' : undefined}
        data-size={size}
      >
        <div className={styles.dots}>
          {renderDots(
            normalizedTotalSteps,
            normalizedCurrentStep,
            appearance,
            size,
            onStepChange,
            getStepLabel,
          )}
        </div>
      </div>
    );
  }),
);

ProgressIndicator.displayName = 'ProgressIndicator';
