import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './slider.module.css';
import type { SliderOrientation, SliderProps, SliderSize } from './slider.types';

type SliderFillMode = 'standard' | 'centered';

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

interface SliderStep {
  value: number;
  percent: number;
  position: string;
  active: boolean;
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

export function getPercent(value: number, min: number, max: number) {
  if (max === min) {
    return 0;
  }

  return clampValue(((value - min) / (max - min)) * 100, 0, 100);
}

export function getInsetPosition(percent: number) {
  const clampedPercent = clampValue(percent, 0, 100);
  return `calc(var(--slider-scale-inset) + ((100% - (var(--slider-scale-inset) * 2)) * ${clampedPercent / 100}))`;
}

export function getDerivedSteps(showSteps: boolean, steps: number[] | undefined, min: number, max: number, step: number) {
  const edgeSteps = [min, max];
  const sortedUniqueSteps = (values: number[]) =>
    Array.from(new Set(values)).filter((stepValue) => stepValue >= min && stepValue <= max).sort((a, b) => a - b);

  if (steps?.length) {
    return showSteps ? sortedUniqueSteps(steps) : sortedUniqueSteps(edgeSteps);
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
  return `calc(${position} - var(--slider-internal-gap))`;
}

function afterSegmentBoundary(position: string) {
  return `calc(${position} + var(--slider-internal-gap))`;
}

function getSingleSegmentStyles(fillMode: SliderFillMode, valuePercent: number, originPercent: number) {
  if (fillMode === 'standard') {
    return {
      activeShape: 'edge',
      segmentStyles: {
        '--slider-inactive-start-start': minPositionVariable,
        '--slider-inactive-start-end': minPositionVariable,
        '--slider-active-start': minPositionVariable,
        '--slider-active-end': beforeSegmentBoundary(valuePositionVariable),
        '--slider-inactive-end-start': afterSegmentBoundary(valuePositionVariable),
        '--slider-inactive-end-end': maxPositionVariable,
      },
    };
  }

  if (valuePercent >= originPercent) {
    return {
      activeShape: 'middle',
      segmentStyles: {
        '--slider-inactive-start-start': minPositionVariable,
        '--slider-inactive-start-end': beforeSegmentBoundary(originPositionVariable),
        '--slider-active-start': afterSegmentBoundary(originPositionVariable),
        '--slider-active-end': beforeSegmentBoundary(valuePositionVariable),
        '--slider-inactive-end-start': afterSegmentBoundary(valuePositionVariable),
        '--slider-inactive-end-end': maxPositionVariable,
      },
    };
  }

  return {
    activeShape: 'middle',
      segmentStyles: {
        '--slider-inactive-start-start': minPositionVariable,
        '--slider-inactive-start-end': beforeSegmentBoundary(valuePositionVariable),
        '--slider-active-start': afterSegmentBoundary(valuePositionVariable),
        '--slider-active-end': beforeSegmentBoundary(originPositionVariable),
        '--slider-inactive-end-start': afterSegmentBoundary(originPositionVariable),
        '--slider-inactive-end-end': maxPositionVariable,
    },
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
  return getDerivedSteps(showSteps, steps, min, max, step).map((stepValue) => {
    const percent = getPercent(stepValue, min, max);

    return {
      value: stepValue,
      percent,
      position: getInsetPosition(percent),
      active: percent >= startPercent && percent <= endPercent,
    };
  });
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
  const minPosition = getInsetPosition(0);
  const maxPosition = getInsetPosition(100);
  const valuePosition = getInsetPosition(valuePercent);
  const origin = clampValue(0, min, max);
  const originPercent = getPercent(origin, min, max);
  const originPosition = getInsetPosition(originPercent);
  const startPercent = fillMode === 'centered' ? Math.min(originPercent, valuePercent) : 0;
  const endPercent = fillMode === 'centered' ? Math.max(originPercent, valuePercent) : valuePercent;
  const startPosition = getInsetPosition(startPercent);
  const endPosition = getInsetPosition(endPercent);
  const stepModels = getStepModels(showSteps, steps, min, max, step, startPercent, endPercent);
  const { activeShape, segmentStyles } = getSingleSegmentStyles(fillMode, valuePercent, originPercent);
  const { isDragging, startDragging, stopDragging } = useSliderDragState();

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
        className={styles.control}
        data-active-shape={activeShape}
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
                    '--slider-step-percent': `${stepMarker.percent}%`,
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

        <input
          {...rest}
          ref={forwardedRef}
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
          onBlur={(event) => {
            stopDragging();
            onBlur?.(event);
          }}
          onChange={handleChange}
          onPointerCancel={(event) => {
            stopDragging();
            onPointerCancel?.(event);
          }}
          onPointerDown={(event) => {
            startDragging();
            onPointerDown?.(event);
          }}
          onPointerUp={(event) => {
            stopDragging();
            onPointerUp?.(event);
          }}
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
