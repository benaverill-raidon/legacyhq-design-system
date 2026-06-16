import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import {
  clampValue,
  getPercent,
  getStepModels,
  getVisualPosition,
  mergeClassNames,
  useSliderDragState,
} from './slider';
import styles from './slider.module.css';
import type { SliderOrientation, SliderRangeProps, SliderSize } from './slider.types';

type SliderRangeStyle = React.CSSProperties & {
  '--slider-active-end'?: string;
  '--slider-active-start'?: string;
  '--slider-fill-start'?: string;
  '--slider-fill-end'?: string;
  '--slider-max-position'?: string;
  '--slider-min-position'?: string;
  '--slider-inactive-end-end'?: string;
  '--slider-inactive-end-start'?: string;
  '--slider-inactive-start-end'?: string;
  '--slider-inactive-start-start'?: string;
  '--slider-end-position'?: string;
  '--slider-lower-position'?: string;
  '--slider-lower-percent'?: string;
  '--slider-start-position'?: string;
  '--slider-upper-position'?: string;
  '--slider-upper-percent'?: string;
};

function getEffectiveMinDistance(minDistance: number, min: number, max: number) {
  if (!Number.isFinite(minDistance)) {
    return 0;
  }

  return Math.min(Math.max(0, minDistance), Math.max(0, max - min));
}

function normalizeRangeValue(value: [number, number], min: number, max: number, minDistance = 0): [number, number] {
  const lower = clampValue(Math.min(value[0], value[1]), min, max);
  const upper = clampValue(Math.max(value[0], value[1]), min, max);
  const effectiveMinDistance = getEffectiveMinDistance(minDistance, min, max);

  if (upper - lower >= effectiveMinDistance) {
    return [lower, upper];
  }

  if (lower + effectiveMinDistance <= max) {
    return [lower, lower + effectiveMinDistance];
  }

  return [upper - effectiveMinDistance, upper];
}

const minPositionVariable = 'var(--slider-min-position)';
const maxPositionVariable = 'var(--slider-max-position)';
const lowerPositionVariable = 'var(--slider-lower-position)';
const upperPositionVariable = 'var(--slider-upper-position)';

function beforeSegmentBoundary(position: string) {
  return `calc(${position} - var(--slider-internal-gap))`;
}

function afterSegmentBoundary(position: string) {
  return `calc(${position} + var(--slider-internal-gap))`;
}

function getRootClasses(orientation: SliderOrientation, size: SliderSize, className?: string) {
  return mergeClassNames(
    styles.root,
    styles.rangeRoot,
    styles[`orientation_${orientation}`],
    styles[`size_${size}`],
    className,
  );
}

export const SliderRange = React.memo(
  React.forwardRef<HTMLInputElement, SliderRangeProps>(function SliderRange(
    {
      label,
      value,
      defaultValue = [25, 75],
      minDistance = 1,
      disableSwap = true,
      min = 0,
      max = 100,
      step = 1,
      orientation = 'horizontal',
      size = 'md',
      disabled = false,
      showSteps = false,
      steps,
      showValue = false,
      className,
      minLabel = 'Minimum value',
      maxLabel = 'Maximum value',
      name,
      onValueChange,
      id,
      ...rest
    },
    forwardedRef,
  ) {
    const generatedId = React.useId();
    const labelId = `${id ?? generatedId}-label`;
    const minInputId = `${id ?? generatedId}-min`;
    const maxInputId = `${id ?? generatedId}-max`;
    const minHandleLabelId = `${id ?? generatedId}-min-label`;
    const maxHandleLabelId = `${id ?? generatedId}-max-label`;
    const isControlled = value !== undefined;
    const effectiveMinDistance = getEffectiveMinDistance(minDistance, min, max);
    const [uncontrolledValue, setUncontrolledValue] = React.useState<[number, number]>(
      normalizeRangeValue(defaultValue, min, max, effectiveMinDistance),
    );
    const [activeHandle, setActiveHandle] = React.useState<'lower' | 'upper' | null>(null);
    const currentValue = normalizeRangeValue(isControlled ? value : uncontrolledValue, min, max, effectiveMinDistance);
    const [lowerValue, upperValue] = currentValue;
    const lowerPercent = getPercent(lowerValue, min, max);
    const upperPercent = getPercent(upperValue, min, max);
    const minPosition = getVisualPosition(0);
    const maxPosition = getVisualPosition(100);
    const lowerPosition = getVisualPosition(lowerPercent);
    const upperPosition = getVisualPosition(upperPercent);
    const stepModels = getStepModels(showSteps, steps, min, max, step, lowerPercent, upperPercent);
    const ariaLabelledByMin = label !== undefined ? `${labelId} ${minHandleLabelId}` : minHandleLabelId;
    const ariaLabelledByMax = label !== undefined ? `${labelId} ${maxHandleLabelId}` : maxHandleLabelId;
    const { isDragging, startDragging, stopDragging } = useSliderDragState();

    const commitValue = React.useCallback(
      (nextValue: [number, number], event: React.ChangeEvent<HTMLInputElement>) => {
        const normalizedValue = normalizeRangeValue(nextValue, min, max, effectiveMinDistance);

        if (!isControlled) {
          setUncontrolledValue(normalizedValue);
        }

        onValueChange?.(normalizedValue, event);
      },
      [effectiveMinDistance, isControlled, max, min, onValueChange],
    );

    const handleLowerChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextLower = disableSwap
          ? Math.min(event.currentTarget.valueAsNumber, upperValue - effectiveMinDistance)
          : event.currentTarget.valueAsNumber;
        setActiveHandle('lower');
        commitValue([nextLower, upperValue], event);
      },
      [commitValue, disableSwap, effectiveMinDistance, upperValue],
    );

    const handleUpperChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextUpper = disableSwap
          ? Math.max(event.currentTarget.valueAsNumber, lowerValue + effectiveMinDistance)
          : event.currentTarget.valueAsNumber;
        setActiveHandle('upper');
        commitValue([lowerValue, nextUpper], event);
      },
      [commitValue, disableSwap, effectiveMinDistance, lowerValue],
    );

    return (
      <div
        {...rest}
        className={getRootClasses(orientation, size, className)}
        data-active-handle={activeHandle ?? undefined}
        data-dragging={isDragging ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-orientation={orientation}
        data-show-value={showValue ? 'true' : undefined}
      >
        {label !== undefined ? (
          <span className={styles.label} id={labelId}>
            {label}
          </span>
        ) : null}
        <span className={styles.visuallyHidden} id={minHandleLabelId}>
          {minLabel}
        </span>
        <span className={styles.visuallyHidden} id={maxHandleLabelId}>
          {maxLabel}
        </span>

        <div
          className={styles.control}
          data-active-shape="middle"
          style={
            {
              '--slider-inactive-start-start': minPositionVariable,
              '--slider-inactive-start-end': beforeSegmentBoundary(lowerPositionVariable),
              '--slider-active-start': afterSegmentBoundary(lowerPositionVariable),
              '--slider-active-end': beforeSegmentBoundary(upperPositionVariable),
              '--slider-inactive-end-start': afterSegmentBoundary(upperPositionVariable),
              '--slider-inactive-end-end': maxPositionVariable,
              '--slider-fill-start': `${lowerPercent}%`,
              '--slider-fill-end': `${upperPercent}%`,
              '--slider-min-position': minPosition,
              '--slider-max-position': maxPosition,
              '--slider-start-position': lowerPosition,
              '--slider-end-position': upperPosition,
              '--slider-lower-position': lowerPosition,
              '--slider-lower-percent': `${lowerPercent}%`,
              '--slider-upper-position': upperPosition,
              '--slider-upper-percent': `${upperPercent}%`,
            } as SliderRangeStyle
          }
        >
          <div className={styles.track} aria-hidden="true">
            <div className={styles.inactiveTrackStart} />
            <div className={styles.activeTrack} />
            <div className={styles.inactiveTrackEnd} />
          </div>

          {stepModels.length ? (
            <div className={styles.steps} aria-hidden="true">
              {stepModels.map((stepMarker) => (
                <span
                  className={styles.step}
                  data-active={stepMarker.active ? 'true' : undefined}
                  key={stepMarker.value}
                  style={
                    {
                      '--slider-step-position': stepMarker.position,
                    } as React.CSSProperties
                  }
                >
                  <span className={styles.stepDot} />
                </span>
              ))}
            </div>
          ) : null}

          <div className={styles.valueIndicators}>
            <output className={mergeClassNames(styles.valueIndicator, styles.valueIndicatorLower)} htmlFor={minInputId}>
              {lowerValue}
            </output>
            <output className={mergeClassNames(styles.valueIndicator, styles.valueIndicatorUpper)} htmlFor={maxInputId}>
              {upperValue}
            </output>
          </div>

          <div className={styles.handles} aria-hidden="true">
            <span className={mergeClassNames(styles.handle, styles.handleLower)}>
              <span className={styles.handleVisual} />
            </span>
            <span className={mergeClassNames(styles.handle, styles.handleUpper)}>
              <span className={styles.handleVisual} />
            </span>
          </div>

          <input
            ref={forwardedRef}
            id={minInputId}
            aria-labelledby={ariaLabelledByMin}
            className={mergeClassNames(
              styles.input,
              styles.rangeInput,
              styles.rangeInputLower,
              focusRingClassNames.focusRing,
              focusRingClassNames.focusRingDefault,
            )}
            type="range"
            min={min}
            max={max}
            step={step}
            value={lowerValue}
            disabled={disabled}
            name={name}
            onBlur={() => {
              setActiveHandle(null);
              stopDragging();
            }}
            onChange={handleLowerChange}
            onFocus={() => setActiveHandle('lower')}
            onPointerCancel={stopDragging}
            onPointerDown={() => {
              setActiveHandle('lower');
              startDragging();
            }}
            onPointerUp={stopDragging}
          />
          <input
            id={maxInputId}
            aria-labelledby={ariaLabelledByMax}
            className={mergeClassNames(
              styles.input,
              styles.rangeInput,
              styles.rangeInputUpper,
              focusRingClassNames.focusRing,
              focusRingClassNames.focusRingDefault,
            )}
            type="range"
            min={min}
            max={max}
            step={step}
            value={upperValue}
            disabled={disabled}
            name={name ? `${name}Max` : undefined}
            onBlur={() => {
              setActiveHandle(null);
              stopDragging();
            }}
            onChange={handleUpperChange}
            onFocus={() => setActiveHandle('upper')}
            onPointerCancel={stopDragging}
            onPointerDown={() => {
              setActiveHandle('upper');
              startDragging();
            }}
            onPointerUp={stopDragging}
          />
        </div>
      </div>
    );
  }),
);

SliderRange.displayName = 'SliderRange';
