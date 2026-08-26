import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './slider.module.css';
import type { SliderOrientation, SliderProps, SliderSize } from './slider.types';

type SliderFillMode = 'standard' | 'centered';
type SliderTrackBounds = Pick<DOMRect, 'bottom' | 'height' | 'left' | 'right' | 'top' | 'width'>;

type SliderStyle = React.CSSProperties & {
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
  '--slider-origin-position'?: string;
  '--slider-start-position'?: string;
  '--slider-value-position'?: string;
  '--slider-value-percent'?: string;
};

interface SliderBaseComponentProps extends SliderProps {
  fillMode: SliderFillMode;
  defaultMin: number;
  defaultMax: number;
  defaultDefaultValue: number;
}

type SliderStepPlacement = 'start' | 'middle' | 'end';

interface SliderStep {
  value: number;
  percent: number;
  position: string;
  active: boolean;
  placement: SliderStepPlacement;
}

const maxAutoSteps = 25;
const minPositionVariable = 'var(--slider-min-position)';
const maxPositionVariable = 'var(--slider-max-position)';
const originPositionVariable = 'var(--slider-origin-position)';
const valuePositionVariable = 'var(--slider-value-position)';

export function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function roundValueToStep(value: number, min: number, step: number) {
  if (!Number.isFinite(step) || step <= 0) {
    return value;
  }

  const decimalPlaces = `${step}`.includes('.') ? `${step}`.split('.')[1]?.length ?? 0 : 0;
  const roundedValue = Math.round((value - min) / step) * step + min;

  return Number(roundedValue.toFixed(decimalPlaces));
}

export function getPercent(value: number, min: number, max: number) {
  if (max === min) {
    return 0;
  }

  return clampValue(((value - min) / (max - min)) * 100, 0, 100);
}

export function getVisualPosition(percent: number) {
  const clampedPercent = clampValue(percent, 0, 100);
  return `calc(var(--slider-value-scale-inset) + ((100% - var(--slider-value-scale-inset) - var(--slider-value-scale-inset)) * ${clampedPercent / 100}))`;
}

export const getInsetPosition = getVisualPosition;

export function getDerivedSteps(showSteps: boolean, steps: number[] | undefined, min: number, max: number, step: number) {
  const edgeSteps = [min, max];
  const sortedUniqueSteps = (values: number[]) =>
    Array.from(new Set(values)).filter((stepValue) => stepValue >= min && stepValue <= max).sort((a, b) => a - b);

  if (steps?.length) {
    return showSteps ? sortedUniqueSteps([...edgeSteps, ...steps]) : sortedUniqueSteps(edgeSteps);
  }

  if (!showSteps) {
    return sortedUniqueSteps(edgeSteps);
  }

  if (step <= 0) {
    return sortedUniqueSteps(edgeSteps);
  }

  const count = Math.floor((max - min) / step) + 1;

  if (count < 2 || count > maxAutoSteps) {
    return sortedUniqueSteps(edgeSteps);
  }

  return sortedUniqueSteps([min, ...Array.from({ length: count }, (_, index) => min + index * step), max]);
}

function beforeSegmentBoundary(position: string) {
  return `calc(${position} - var(--component-slider-handle-half-width) - var(--slider-internal-gap))`;
}

function afterSegmentBoundary(position: string) {
  return `calc(${position} + var(--component-slider-handle-half-width) + var(--slider-internal-gap))`;
}

function getSingleSegmentStyles(fillMode: SliderFillMode, valuePercent: number, originPercent: number) {
  if (fillMode === 'standard') {
    return {
      '--slider-inactive-start-start': minPositionVariable,
      '--slider-inactive-start-end': minPositionVariable,
      '--slider-active-start': minPositionVariable,
      '--slider-active-end': beforeSegmentBoundary(valuePositionVariable),
      '--slider-inactive-end-start': afterSegmentBoundary(valuePositionVariable),
      '--slider-inactive-end-end': maxPositionVariable,
    };
  }

  if (valuePercent >= originPercent) {
    return {
      '--slider-inactive-start-start': minPositionVariable,
      '--slider-inactive-start-end': beforeSegmentBoundary(originPositionVariable),
      '--slider-active-start': afterSegmentBoundary(originPositionVariable),
      '--slider-active-end': beforeSegmentBoundary(valuePositionVariable),
      '--slider-inactive-end-start': afterSegmentBoundary(valuePositionVariable),
      '--slider-inactive-end-end': maxPositionVariable,
    };
  }

  return {
    '--slider-inactive-start-start': minPositionVariable,
    '--slider-inactive-start-end': beforeSegmentBoundary(valuePositionVariable),
    '--slider-active-start': afterSegmentBoundary(valuePositionVariable),
    '--slider-active-end': beforeSegmentBoundary(originPositionVariable),
    '--slider-inactive-end-start': afterSegmentBoundary(originPositionVariable),
    '--slider-inactive-end-end': maxPositionVariable,
  };
}

export function getStepModels(
  showSteps: boolean,
  steps: number[] | undefined,
  min: number,
  max: number,
  step: number,
  startPercent: number,
  endPercent: number,
): SliderStep[] {
  const derivedSteps = getDerivedSteps(showSteps, steps, min, max, step);

  return derivedSteps.map((stepValue, index) => {
    const percent = getPercent(stepValue, min, max);
    const placement: SliderStepPlacement =
      derivedSteps.length === 1 ? 'middle' : index === 0 ? 'start' : index === derivedSteps.length - 1 ? 'end' : 'middle';

    return {
      value: stepValue,
      percent,
      position: getVisualPosition(percent),
      active: percent >= startPercent && percent <= endPercent,
      placement,
    };
  });
}

export function getSliderRatioFromPointer(
  clientX: number,
  clientY: number,
  bounds: SliderTrackBounds,
  orientation: SliderOrientation,
) {
  if (orientation === 'vertical') {
    if (bounds.height <= 0) {
      return 0;
    }

    return clampValue((bounds.bottom - clientY) / bounds.height, 0, 1);
  }

  if (bounds.width <= 0) {
    return 0;
  }

  return clampValue((clientX - bounds.left) / bounds.width, 0, 1);
}

export function getSliderValueFromPointer(
  clientX: number,
  clientY: number,
  bounds: SliderTrackBounds,
  orientation: SliderOrientation,
  min: number,
  max: number,
  step: number,
) {
  const ratio = getSliderRatioFromPointer(clientX, clientY, bounds, orientation);
  const rawValue = min + ratio * (max - min);

  return clampValue(roundValueToStep(rawValue, min, step), min, max);
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

export function useSliderDragState() {
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    if (!isDragging || typeof window === 'undefined') {
      return undefined;
    }

    const stopDragging = () => setIsDragging(false);

    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);

    return () => {
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [isDragging]);

  return {
    isDragging,
    startDragging: React.useCallback(() => setIsDragging(true), []),
    stopDragging: React.useCallback(() => setIsDragging(false), []),
  };
}

/*
 * The native range input has `pointer-events: none` (the outer `.control` owns all pointer/drag
 * handling), so dragging or clicking the handle focuses the input via an explicit `.focus()` call
 * rather than the browser's own click-to-focus behavior. Because the clicked element and the
 * focused element are never the same node, Chromium's `:focus-visible` heuristic can't recognize
 * this as an ordinary mouse-focus control and defaults to treating it as keyboard-style focus -
 * showing a focus ring on a plain click or drag. `markPointerFocusPending` records that the next
 * focus event on this input originated from our own pointer handling, so the ring can be
 * suppressed for that session; any real keyduwn while focused clears it again, since the user is
 * now clearly driving the handle by keyboard.
 */
export function usePointerFocusRing() {
  const pendingRef = React.useRef(false);
  const [isPointerFocused, setIsPointerFocused] = React.useState(false);

  const markPointerFocusPending = React.useCallback(() => {
    pendingRef.current = true;
  }, []);

  const handleFocus = React.useCallback(() => {
    if (pendingRef.current) {
      pendingRef.current = false;
      setIsPointerFocused(true);
    } else {
      setIsPointerFocused(false);
    }
  }, []);

  const handleBlur = React.useCallback(() => {
    pendingRef.current = false;
    setIsPointerFocused(false);
  }, []);

  const handleKeyDown = React.useCallback(() => {
    setIsPointerFocused(false);
  }, []);

  return { isPointerFocused, markPointerFocusPending, handleFocus, handleBlur, handleKeyDown };
}

function getRootClasses(orientation: SliderOrientation, size: SliderSize, className?: string) {
  return mergeClassNames(
    styles.root,
    styles[`orientation_${orientation}`],
    styles[`size_${size}`],
    className,
  );
}

export function SliderBaseComponent(
  {
    fillMode,
    defaultMin,
    defaultMax,
    defaultDefaultValue,
    label,
    value,
    defaultValue = defaultDefaultValue,
    min = defaultMin,
    max = defaultMax,
    step = 1,
    orientation = 'horizontal',
    size = 'md',
    disabled = false,
    showSteps = false,
    steps,
    showValue = false,
    className,
    id,
    onValueChange,
    onBlur,
    onFocus,
    onKeyDown,
    onPointerCancel,
    onPointerDown,
    onPointerUp,
    style,
    ...rest
  }: SliderBaseComponentProps,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const currentValue = clampValue(isControlled ? value : uncontrolledValue, min, max);
  const valuePercent = getPercent(currentValue, min, max);
  // The track's own fill is flush with the control's true edges (matching Figma) - only the
  // handle, dots, and origin position use the inset value-scale, so min/max position stay at the
  // raw 0%/100% here rather than reusing getVisualPosition.
  const minPosition = '0%';
  const maxPosition = '100%';
  const valuePosition = getVisualPosition(valuePercent);
  const origin = clampValue(0, min, max);
  const originPercent = getPercent(origin, min, max);
  const originPosition = getVisualPosition(originPercent);
  const startPercent = fillMode === 'centered' ? Math.min(originPercent, valuePercent) : 0;
  const endPercent = fillMode === 'centered' ? Math.max(originPercent, valuePercent) : valuePercent;
  const startPosition = getVisualPosition(startPercent);
  const endPosition = getVisualPosition(endPercent);
  const stepModels = getStepModels(showSteps, steps, min, max, step, startPercent, endPercent);
  const segmentStyles = getSingleSegmentStyles(fillMode, valuePercent, originPercent);
  const { isDragging, startDragging, stopDragging } = useSliderDragState();
  const pointerFocusRing = usePointerFocusRing();
  const controlRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const dragPointerIdRef = React.useRef<number | null>(null);

  React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = clampValue(event.currentTarget.valueAsNumber, min, max);

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue, event);
    },
    [isControlled, max, min, onValueChange],
  );

  const updateFromPointer = React.useCallback(
    (clientX: number, clientY: number) => {
      const bounds = trackRef.current?.getBoundingClientRect();
      const input = inputRef.current;

      if (!bounds || !input) {
        return;
      }

      const nextValue = getSliderValueFromPointer(clientX, clientY, bounds, orientation, min, max, step);
      dispatchSliderInputValue(input, nextValue);
    },
    [max, min, orientation, step],
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
      pointerFocusRing.markPointerFocusPending();
      inputRef.current?.focus();
      startDragging();
      onPointerDown?.(event as unknown as React.PointerEvent<HTMLInputElement>);

      const handleTarget = (event.target as HTMLElement | null)?.closest('[data-slider-handle]');

      if (!handleTarget) {
        updateFromPointer(event.clientX, event.clientY);
      }

      event.preventDefault();
    },
    [disabled, onPointerDown, pointerFocusRing, startDragging, updateFromPointer],
  );

  const handleControlPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (dragPointerIdRef.current !== event.pointerId || !isDragging) {
        return;
      }

      updateFromPointer(event.clientX, event.clientY);
    },
    [isDragging, updateFromPointer],
  );

  return (
    <div
      className={getRootClasses(orientation, size, className)}
      data-dragging={isDragging ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-orientation={orientation}
      data-show-value={showValue ? 'true' : undefined}
    >
      {label !== undefined ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}

      <div
        ref={controlRef}
        className={styles.control}
        data-has-steps={stepModels.length ? 'true' : undefined}
        onPointerCancel={(event) => {
          stopPointerDrag(event.pointerId);
          onPointerCancel?.(event as unknown as React.PointerEvent<HTMLInputElement>);
        }}
        onPointerDown={handleControlPointerDown}
        onPointerMove={handleControlPointerMove}
        onPointerUp={(event) => {
          stopPointerDrag(event.pointerId);
          onPointerUp?.(event as unknown as React.PointerEvent<HTMLInputElement>);
        }}
        style={
          {
            ...segmentStyles,
            '--slider-fill-start': `${startPercent}%`,
            '--slider-fill-end': `${endPercent}%`,
            '--slider-min-position': minPosition,
            '--slider-max-position': maxPosition,
            '--slider-start-position': startPosition,
            '--slider-end-position': endPosition,
            '--slider-origin-position': originPosition,
            '--slider-value-position': valuePosition,
            '--slider-value-percent': `${valuePercent}%`,
          } as SliderStyle
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
          <output className={styles.valueIndicator} htmlFor={inputId}>
            {currentValue}
          </output>
        </div>

        <div className={styles.handles} aria-hidden="true">
          <span className={mergeClassNames(styles.handle, styles.handleSingle)} data-slider-handle="single">
            <span className={styles.handleVisual} />
          </span>
        </div>

        <input
          {...rest}
          ref={inputRef}
          id={inputId}
          className={mergeClassNames(
            styles.input,
            styles.singleInput,
            focusRingClassNames.focusRing,
            focusRingClassNames.focusRingDefault,
          )}
          style={style}
          type="range"
          min={min}
          max={max}
          step={step}
          value={isControlled ? currentValue : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          disabled={disabled}
          data-pointer-focus={pointerFocusRing.isPointerFocused ? 'true' : undefined}
          onBlur={(event) => {
            if (!(event.relatedTarget instanceof Node) || !controlRef.current?.contains(event.relatedTarget)) {
              stopDragging();
            }

            pointerFocusRing.handleBlur();
            onBlur?.(event);
          }}
          onChange={handleChange}
          onFocus={(event) => {
            pointerFocusRing.handleFocus();
            onFocus?.(event);
          }}
          onKeyDown={(event) => {
            pointerFocusRing.handleKeyDown();
            onKeyDown?.(event);
          }}
          onPointerCancel={() => stopDragging()}
          onPointerDown={() => startDragging()}
          onPointerUp={() => stopDragging()}
        />
      </div>
    </div>
  );
}

export const SliderBase = React.forwardRef<HTMLInputElement, SliderBaseComponentProps>(SliderBaseComponent);

export const Slider = React.memo(
  React.forwardRef<HTMLInputElement, SliderProps>(function Slider(props, forwardedRef) {
    return (
      <SliderBase
        {...props}
        ref={forwardedRef}
        fillMode="standard"
        defaultMin={0}
        defaultMax={100}
        defaultDefaultValue={0}
      />
    );
  }),
);

Slider.displayName = 'Slider';

export const SliderCentered = React.memo(
  React.forwardRef<HTMLInputElement, SliderProps>(function SliderCentered(props, forwardedRef) {
    return (
      <SliderBase
        {...props}
        ref={forwardedRef}
        fillMode="centered"
        defaultMin={-100}
        defaultMax={100}
        defaultDefaultValue={0}
      />
    );
  }),
);

SliderCentered.displayName = 'SliderCentered';
