import * as React from 'react';
import styles from './progress-bar.module.css';
import type { ProgressBarProps, ProgressBarSize, ProgressBarVariant } from './progress-bar.types';

type ProgressBarStyle = React.CSSProperties & {
  '--progress-bar-value'?: string;
  '--progress-bar-fill'?: number;
};

// The circular geometry, in viewBox units (1 unit = 1px at the 80px token size). Figma
// (progress-bar-circular): the ring's outer edge is radius 38 from the center, with a 1px border
// outside it on both edges; the hole radius sets the thickness. Figma has md and lg only, so the
// circular variant does too.
const circularViewBox = 80;
const circularCenter = circularViewBox / 2;
const circularOuterRadius = 38;
type CircularSize = Exclude<ProgressBarSize, 'sm'>;
const circularHoleRadiusBySize: Record<CircularSize, number> = {
  md: 22,
  lg: 10,
};

/** The deprecated circular `sm` renders exactly as `md`. */
function toCircularSize(size: ProgressBarSize): CircularSize {
  return size === 'sm' ? 'md' : size;
}

/** The size that renders, for the root's class and `data-size`. */
function resolveSize(variant: ProgressBarVariant, size: ProgressBarSize): ProgressBarSize {
  return variant === 'circular' ? toCircularSize(size) : size;
}

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

function renderCircularSvg(size: CircularSize, clampedValue: number) {
  const holeRadius = circularHoleRadiusBySize[size];
  const thickness = circularOuterRadius - holeRadius;
  // Every circle is drawn at the ring's mid radius, so a stroke of the thickness fills the ring.
  const radius = holeRadius + thickness / 2;
  const dashProps = getCircularDashProps(clampedValue);
  const circleProps = { cx: circularCenter, cy: circularCenter, r: radius, pathLength: 100 };

  return (
    <svg
      className={styles.circularSvg}
      viewBox={`0 0 ${circularViewBox} ${circularViewBox}`}
      focusable="false"
      aria-hidden="true"
    >
      {/* 2 wider than the ring, so 1px of border shows outside both edges. */}
      <circle className={styles.circularTrackBorder} {...circleProps} strokeWidth={thickness + 2} />
      <circle className={styles.circularTrack} {...circleProps} strokeWidth={thickness} />
      <circle
        className={styles.circularProgress}
        {...circleProps}
        strokeWidth={thickness}
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
      size: sizeProp = 'md',
      label,
      getValueText,
      className,
      style,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-valuetext': ariaValueText,
      ...rest
    },
    forwardedRef,
  ) {
    const size = resolveSize(variant, sizeProp);
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
      '--progress-bar-fill': clampedValue / 100,
    } satisfies ProgressBarStyle;
    const resolvedValueText = getValueText ? getValueText(clampedValue) : ariaValueText;

    return (
      <div
        {...rest}
        {...accessibleNameProps}
        ref={forwardedRef}
        // Always a progressbar: aria-valuenow and the rest need that role, and it's what the bar is.
        // Set after the spread, so a role from a plain-JS caller can't replace it.
        role="progressbar"
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
            {/* The fill sits inside the remaining track, which clips it to its inner edge. */}
            <span className={styles.remainingTrack}>
              <span className={styles.progressSegment} />
            </span>
          </div>
        ) : (
          <div className={styles.circularViewport} aria-hidden="true">
            {renderCircularSvg(toCircularSize(size), clampedValue)}
          </div>
        )}
      </div>
    );
  }),
);

ProgressBar.displayName = 'ProgressBar';
