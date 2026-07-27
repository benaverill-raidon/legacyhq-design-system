import * as React from 'react';
import styles from './progress-bar.module.css';
import type { ProgressBarProps, ProgressBarSize } from './progress-bar.types';

type ProgressBarStyle = React.CSSProperties & {
  '--progress-bar-value'?: string;
};

const circularDiameter = 72;
const circularRadiusBySize: Record<ProgressBarSize, number> = {
  md: 30,
  lg: 24,
};

const circularStrokeWidthBySize: Record<ProgressBarSize, number> = {
  md: 12,
  lg: 24,
};

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function clampValue(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
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

/*
 * `stroke-dasharray="100"` (equivalent to "100 100") combined with an offset computed as
 * `100 - value` lands exactly on the dash/gap boundary at value 0 and 100. Browsers render that
 * exact seam inconsistently - a hairline sliver of the dark progress stroke can bleed through at
 * 0%, and a hairline gap of the light track can show through the "closed" ring at 100%. Special-
 * casing the two exact endpoints with an explicit, unambiguous dash/gap split avoids relying on
 * that boundary at all.
 */
function getCircularDashProps(clampedValue: number) {
  if (clampedValue <= 0) {
    return { strokeDasharray: '0 100', strokeDashoffset: 0 };
  }

  if (clampedValue >= 100) {
    return { strokeDasharray: '100 0', strokeDashoffset: 0 };
  }

  return { strokeDasharray: '100', strokeDashoffset: 100 - clampedValue };
}

function renderCircularSvg(size: ProgressBarSize, clampedValue: number) {
  const radius = circularRadiusBySize[size];
  const strokeWidth = circularStrokeWidthBySize[size];
  const innerStrokeWidth = Math.max(strokeWidth - 2, 0);
  const dashProps = getCircularDashProps(clampedValue);

  return (
    <svg
      className={styles.circularSvg}
      viewBox={`0 0 ${circularDiameter} ${circularDiameter}`}
      focusable="false"
      aria-hidden="true"
    >
      <circle
        className={styles.circularTrackBorder}
        cx={circularDiameter / 2}
        cy={circularDiameter / 2}
        r={radius}
        pathLength={100}
        strokeWidth={strokeWidth}
      />
      <circle
        className={styles.circularTrack}
        cx={circularDiameter / 2}
        cy={circularDiameter / 2}
        r={radius}
        pathLength={100}
        strokeWidth={innerStrokeWidth}
      />
      <circle
        className={styles.circularProgressBorder}
        cx={circularDiameter / 2}
        cy={circularDiameter / 2}
        r={radius}
        pathLength={100}
        strokeWidth={strokeWidth}
        strokeDasharray={dashProps.strokeDasharray}
        strokeDashoffset={dashProps.strokeDashoffset}
      />
      <circle
        className={styles.circularProgress}
        cx={circularDiameter / 2}
        cy={circularDiameter / 2}
        r={radius}
        pathLength={100}
        strokeWidth={innerStrokeWidth}
        strokeDasharray={dashProps.strokeDasharray}
        strokeDashoffset={dashProps.strokeDashoffset}
      />
    </svg>
  );
}

export const ProgressBar = React.memo(
  React.forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
    {
      value,
      variant = 'linear',
      size = 'md',
      label,
      getValueText,
      className,
      style,
      role,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-valuetext': ariaValueText,
      ...rest
    },
    forwardedRef,
  ) {
    const clampedValue = clampValue(value);
    const accessibleNameProps = getAccessibleNameProps(ariaLabel, ariaLabelledBy, label);
    const rootClassName = mergeClassNames(
      styles.root,
      styles[`variant_${variant}`],
      styles[`size_${size}`],
      className,
    );
    const rootStyle = {
      ...(style ?? {}),
      '--progress-bar-value': `${clampedValue}%`,
    } satisfies ProgressBarStyle;
    const resolvedValueText = getValueText ? getValueText(clampedValue) : ariaValueText;

    return (
      <div
        {...rest}
        {...accessibleNameProps}
        ref={forwardedRef}
        role={role ?? 'progressbar'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedValue}
        aria-valuetext={resolvedValueText}
        className={rootClassName}
        data-complete={clampedValue === 100 ? 'true' : undefined}
        data-empty={clampedValue === 0 ? 'true' : undefined}
        data-size={size}
        data-variant={variant}
        style={rootStyle}
      >
        {variant === 'linear' ? (
          <div className={styles.track} aria-hidden="true">
            <span className={styles.remainingTrack} />
            <span className={styles.progressSegment} />
            <span className={mergeClassNames(styles.stopContainer, styles.stopStart)}>
              <span className={styles.stopShape} />
            </span>
            <span className={mergeClassNames(styles.stopContainer, styles.stopEnd)}>
              <span className={styles.stopShape} />
            </span>
          </div>
        ) : (
          <div className={styles.circularViewport} aria-hidden="true">
            {renderCircularSvg(size, clampedValue)}
            <span className={mergeClassNames(styles.stopContainer, styles.stopTop)}>
              <span className={styles.stopShape} />
            </span>
          </div>
        )}
      </div>
    );
  }),
);

ProgressBar.displayName = 'ProgressBar';
