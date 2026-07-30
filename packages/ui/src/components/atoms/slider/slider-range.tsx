import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import {
  clampValue,
  getPercent,
  getSliderValueFromPointer,
  getStepModels,
  getVisualPosition,
  mergeClassNames,
  useSliderDragState,
  usePointerFocusRing,
} from './slider';
import styles from './slider.module.css';
import type { SliderOrientation, SliderRangeProps, SliderSize } from './slider.types';

type ActiveThumb = 0 | 1;

function getHandleName(activeThumb: ActiveThumb | null) {
  if (activeThumb === 0) {
    return 'lower';
  }

  if (activeThumb === 1) {
    return 'upper';
  }

  return undefined;
}

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

function getEffectiveMinDistance(minDistance: number | undefined, min: number, max: number) {
  if (minDistance === undefined || !Number.isFinite(minDistance)) {
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

function getNextRangeValue(
  nextThumbValue: number,
  activeThumb: ActiveThumb,
  currentValue: [number, number],
  min: number,
  max: number,
  minDistance: number,
  disableSwap: boolean,
): { activeThumb: ActiveThumb; value: [number, number] } {
  const nextValue = clampValue(nextThumbValue, min, max);
  const [lowerValue, upperValue] = currentValue;

  if (activeThumb === 0) {
    if (disableSwap) {
      return {
        activeThumb,
        value: normalizeRangeValue([Math.min(nextValue, upperValue - minDistance), upperValue], min, max, minDistance),
      };
    }

    if (nextValue > upperValue - minDistance) {
      return {
        activeThumb: 1,
        value: normalizeRangeValue([upperValue, Math.max(nextValue, upperValue + minDistance)], min, max, minDistance),
      };
    }

    return {
      activeThumb,
      value: normalizeRangeValue([nextValue, upperValue], min, max, minDistance),
    };
  }

  if (disableSwap) {
    return {
      activeThumb,
      value: normalizeRangeValue([lowerValue, Math.max(nextValue, lowerValue + minDistance)], min, max, minDistance),
    };
  }

  if (nextValue < lowerValue + minDistance) {
    return {
      activeThumb: 0,
      value: normalizeRangeValue([Math.min(nextValue, lowerValue - minDistance), lowerValue], min, max, minDistance),
    };
  }

  return {
    activeThumb,
    value: normalizeRangeValue([lowerValue, nextValue], min, max, minDistance),
  };
}

const minPositionVariable = 'var(--slider-min-position)';
const maxPositionVariable = 'var(--slider-max-position)';
const lowerPositionVariable = 'var(--slider-lower-position)';
const upperPositionVariable = 'var(--slider-upper-position)';

function beforeSegmentBoundary(position: string) {
  return `calc(${position} - var(--component-slider-handle-half-width) - var(--slider-internal-gap))`;
}

function afterSegmentBoundary(position: string) {
  return `calc(${position} + var(--component-slider-handle-half-width) + var(--slider-internal-gap))`;
}

function getNearestActiveThumb(nextValue: number, currentValue: [number, number], preferredThumb?: ActiveThumb | null) {
  const [lowerValue, upperValue] = currentValue;
  const lowerDistance = Math.abs(nextValue - lowerValue);
  const upperDistance = Math.abs(nextValue - upperValue);

  if (lowerDistance === upperDistance && preferredThumb !== undefined && preferredThumb !== null) {
    return preferredThumb;
  }

  return lowerDistance <= upperDistance ? 0 : 1;
}

function dispatchSliderInputValue(input: HTMLInputElement, nextValue: number) {
  const nextValueString = `${nextValue}`;

  if (input.value === nextValueString) {
    return;
  }

  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

  valueSetter?.call(input, nextValueString);
  input.dispatchEvent(new Event('input', { bubbles: true }));
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
      disableSwap = false,
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
    const [activeThumb, setActiveThumb] = React.useState<ActiveThumb | null>(null);
    const currentValue = normalizeRangeValue(isControlled ? value : uncontrolledValue, min, max, effectiveMinDistance);
    const [lowerValue, upperValue] = currentValue;
    const lowerPercent = getPercent(lowerValue, min, max);
    const upperPercent = getPercent(upperValue, min, max);
    // The track's own fill is flush with the control's true edges (matching Figma) - only the
    // handles and dots use the inset value-scale, so min/max position stay at the raw 0%/100%
    // here rather than reusing getVisualPosition.
    const minPosition = '0%';
    const maxPosition = '100%';
    const lowerPosition = getVisualPosition(lowerPercent);
    const upperPosition = getVisualPosition(upperPercent);
    const stepModels = getStepModels(showSteps, steps, min, max, step, lowerPercent, upperPercent);
    const ariaLabelledByMin = label !== undefined ? `${labelId} ${minHandleLabelId}` : minHandleLabelId;
    const ariaLabelledByMax = label !== undefined ? `${labelId} ${maxHandleLabelId}` : maxHandleLabelId;
    const { isDragging, startDragging, stopDragging } = useSliderDragState();
    const lowerFocusRing = usePointerFocusRing();
    const upperFocusRing = usePointerFocusRing();
    const isOverlapping = lowerValue === upperValue;
    const controlRef = React.useRef<HTMLDivElement>(null);
    const trackRef = React.useRef<HTMLDivElement>(null);
    const lowerInputRef = React.useRef<HTMLInputElement>(null);
    const upperInputRef = React.useRef<HTMLInputElement>(null);
    const dragPointerIdRef = React.useRef<number | null>(null);

    React.useImperativeHandle(forwardedRef, () => lowerInputRef.current as HTMLInputElement);

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

    const updateRangeValue = React.useCallback(
      (nextThumbValue: number, changedThumb: ActiveThumb, event: React.ChangeEvent<HTMLInputElement>) => {
        const nextRangeState = getNextRangeValue(
          nextThumbValue,
          isDragging ? (activeThumb ?? changedThumb) : changedThumb,
          currentValue,
          min,
          max,
          effectiveMinDistance,
          disableSwap,
        );

        setActiveThumb(nextRangeState.activeThumb);
        commitValue(nextRangeState.value, event);
      },
      [activeThumb, commitValue, currentValue, disableSwap, effectiveMinDistance, isDragging, max, min],
    );

    const handleLowerChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        updateRangeValue(event.currentTarget.valueAsNumber, 0, event);
      },
      [updateRangeValue],
    );

    const handleUpperChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        updateRangeValue(event.currentTarget.valueAsNumber, 1, event);
      },
      [updateRangeValue],
    );

    const updateFromPointer = React.useCallback(
      (clientX: number, clientY: number, thumbOverride?: ActiveThumb | null) => {
        const bounds = trackRef.current?.getBoundingClientRect();

        if (!bounds) {
          return;
        }

        const nextValue = getSliderValueFromPointer(clientX, clientY, bounds, orientation, min, max, step);
        const nextActiveThumb = getNearestActiveThumb(nextValue, currentValue, thumbOverride ?? activeThumb);
        const input = nextActiveThumb === 0 ? lowerInputRef.current : upperInputRef.current;

        if (!input) {
          return;
        }

        setActiveThumb(nextActiveThumb);
        (nextActiveThumb === 0 ? lowerFocusRing : upperFocusRing).markPointerFocusPending();
        input.focus();
        dispatchSliderInputValue(input, nextValue);
      },
      [activeThumb, currentValue, lowerFocusRing, max, min, orientation, step, upperFocusRing],
    );

    const stopPointerDrag = React.useCallback(
      (pointerId: number) => {
        if (dragPointerIdRef.current !== pointerId) {
          return;
        }

        if (controlRef.current?.hasPointerCapture?.(pointerId)) {
          controlRef.current.releasePointerCapture(pointerId);
        }

        dragPointerIdRef.current = null;
        stopDragging();
      },
      [stopDragging],
    );

    const handleControlPointerDown = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) {
          return;
        }

        dragPointerIdRef.current = event.pointerId;
        controlRef.current?.setPointerCapture?.(event.pointerId);
        startDragging();

        const handleTarget = (event.target as HTMLElement | null)?.closest('[data-slider-handle]');

        if (handleTarget instanceof HTMLElement) {
          const nextActiveThumb = handleTarget.dataset.sliderHandle === 'upper' ? 1 : 0;

          setActiveThumb(nextActiveThumb);
          (nextActiveThumb === 0 ? lowerFocusRing : upperFocusRing).markPointerFocusPending();
          (nextActiveThumb === 0 ? lowerInputRef.current : upperInputRef.current)?.focus();
        } else {
          updateFromPointer(event.clientX, event.clientY);
        }

        event.preventDefault();
      },
      [disabled, lowerFocusRing, startDragging, updateFromPointer, upperFocusRing],
    );

    const handleControlPointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (dragPointerIdRef.current !== event.pointerId || !isDragging) {
          return;
        }

        updateFromPointer(event.clientX, event.clientY, activeThumb);
      },
      [activeThumb, isDragging, updateFromPointer],
    );

    return (
      <div
        {...rest}
        className={getRootClasses(orientation, size, className)}
        data-active-handle={getHandleName(activeThumb)}
        data-dragging={isDragging ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-orientation={orientation}
        data-overlapping={isOverlapping ? 'true' : undefined}
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
          ref={controlRef}
          className={styles.control}
          data-has-steps={stepModels.length ? 'true' : undefined}
          onPointerCancel={(event) => stopPointerDrag(event.pointerId)}
          onPointerDown={handleControlPointerDown}
          onPointerMove={handleControlPointerMove}
          onPointerUp={(event) => stopPointerDrag(event.pointerId)}
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
          <div className={styles.track} aria-hidden="true" ref={trackRef}>
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
                  data-placement={stepMarker.placement}
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
            <span className={mergeClassNames(styles.handle, styles.handleLower)} data-slider-handle="lower">
              <span className={styles.handleVisual} />
            </span>
            <span className={mergeClassNames(styles.handle, styles.handleUpper)} data-slider-handle="upper">
              <span className={styles.handleVisual} />
            </span>
          </div>

          <input
            ref={lowerInputRef}
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
            data-pointer-focus={lowerFocusRing.isPointerFocused ? 'true' : undefined}
            onBlur={(event) => {
              if (!(event.relatedTarget instanceof Node) || !controlRef.current?.contains(event.relatedTarget)) {
                setActiveThumb(null);
                stopDragging();
              }

              lowerFocusRing.handleBlur();
            }}
            onChange={handleLowerChange}
            onFocus={() => {
              setActiveThumb(0);
              lowerFocusRing.handleFocus();
            }}
            onKeyDown={lowerFocusRing.handleKeyDown}
            onPointerCancel={() => stopDragging()}
            onPointerDown={() => {
              setActiveThumb(0);
              startDragging();
            }}
            onPointerUp={() => stopDragging()}
          />
          <input
            ref={upperInputRef}
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
            data-pointer-focus={upperFocusRing.isPointerFocused ? 'true' : undefined}
            onBlur={(event) => {
              if (!(event.relatedTarget instanceof Node) || !controlRef.current?.contains(event.relatedTarget)) {
                setActiveThumb(null);
                stopDragging();
              }

              upperFocusRing.handleBlur();
            }}
            onChange={handleUpperChange}
            onFocus={() => {
              setActiveThumb(1);
              upperFocusRing.handleFocus();
            }}
            onKeyDown={upperFocusRing.handleKeyDown}
            onPointerCancel={() => stopDragging()}
            onPointerDown={() => {
              setActiveThumb(1);
              startDragging();
            }}
            onPointerUp={() => stopDragging()}
          />
        </div>
      </div>
    );
  }),
);

SliderRange.displayName = 'SliderRange';
