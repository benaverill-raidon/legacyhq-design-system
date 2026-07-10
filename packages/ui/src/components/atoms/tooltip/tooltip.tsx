import * as React from 'react';
import { createPortal } from 'react-dom';
import styles from './tooltip.module.css';
import { TooltipScopeContext } from './tooltip-context';
import type { TooltipPlacement, TooltipProps } from './tooltip.types';

type TriggerElement = HTMLElement;
type MeasurableEvent = { defaultPrevented?: boolean };

const DISABLED_NATIVE_TRIGGER_TYPES = new Set(['button', 'input', 'select', 'textarea', 'option', 'optgroup', 'fieldset']);
const PLACEMENT_FALLBACKS: TooltipPlacement[] = ['top', 'right', 'bottom', 'left'];

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function hasTooltipContent(content: React.ReactNode) {
  return React.Children.toArray(content).some((node) => {
    if (typeof node === 'string') {
      return node.trim().length > 0;
    }

    return node !== null && node !== undefined;
  });
}

function mergeDescribedBy(existing: string | undefined, tooltipId: string | undefined) {
  if (!tooltipId) {
    return existing;
  }

  if (!existing) {
    return tooltipId;
  }

  const ids = new Set(existing.split(/\s+/).filter(Boolean));
  ids.add(tooltipId);
  return Array.from(ids).join(' ');
}

function callHandler<EventType extends MeasurableEvent>(
  handler: ((event: EventType) => void) | undefined,
  event: EventType,
) {
  handler?.(event);
  return !event.defaultPrevented;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(value);
        return;
      }

      (ref as React.MutableRefObject<T | null>).current = value;
    });
  };
}

function getTokenPixels(tokenName: string, fallback: number) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = window.getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isDisabledTrigger(
  element: React.ReactElement<{
    disabled?: boolean;
    isDisabled?: boolean;
  }>,
) {
  if (typeof element.type === 'string') {
    return DISABLED_NATIVE_TRIGGER_TYPES.has(element.type) && Boolean(element.props.disabled);
  }

  return Boolean(element.props.disabled || element.props.isDisabled);
}

function getPlacementOrder(preferred: TooltipPlacement) {
  return [preferred, ...PLACEMENT_FALLBACKS.filter((placement) => placement !== preferred)];
}

function getCandidatePosition(
  placement: TooltipPlacement,
  triggerRect: DOMRect,
  tooltipRect: DOMRect,
  gap: number,
  viewportPadding: number,
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - gap;
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'right':
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.right + gap;
      break;
    case 'bottom':
      top = triggerRect.bottom + gap;
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'left':
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      left = triggerRect.left - tooltipRect.width - gap;
      break;
  }

  const overflowTop = Math.max(0, viewportPadding - top);
  const overflowLeft = Math.max(0, viewportPadding - left);
  const overflowBottom = Math.max(0, top + tooltipRect.height - (viewportHeight - viewportPadding));
  const overflowRight = Math.max(0, left + tooltipRect.width - (viewportWidth - viewportPadding));

  const clampedTop = Math.min(
    Math.max(top, viewportPadding),
    Math.max(viewportPadding, viewportHeight - tooltipRect.height - viewportPadding),
  );
  const clampedLeft = Math.min(
    Math.max(left, viewportPadding),
    Math.max(viewportPadding, viewportWidth - tooltipRect.width - viewportPadding),
  );

  return {
    placement,
    top: clampedTop,
    left: clampedLeft,
    overflow: overflowTop + overflowLeft + overflowBottom + overflowRight,
  };
}

export const Tooltip = React.memo(function Tooltip({
  content,
  children,
  placement = 'top',
  truncate = true,
  disabled = false,
  delay = 300,
  className,
}: TooltipProps) {
  const tooltipId = React.useId();
  const triggerRef = React.useRef<TriggerElement | null>(null);
  const tooltipRef = React.useRef<HTMLSpanElement | null>(null);
  const showTimeoutRef = React.useRef<number | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [resolvedPlacement, setResolvedPlacement] = React.useState<TooltipPlacement>(placement);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);

  const hasContent = hasTooltipContent(content);
  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      isDisabled?: boolean;
      'aria-describedby'?: string;
    }
  >;

  if (!hasContent) {
    return child;
  }

  const isDisabledChildTrigger = isDisabledTrigger(child);
  const childProps = child.props;
  const childRef = (child as React.ReactElement & { ref?: React.Ref<TriggerElement> }).ref;

  const clearShowTimer = React.useCallback(() => {
    if (showTimeoutRef.current !== null) {
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  }, []);

  const hideImmediately = React.useCallback(() => {
    clearShowTimer();
    setIsVisible(false);
  }, [clearShowTimer]);

  const scheduleShow = React.useCallback(() => {
    if (disabled) {
      return;
    }

    clearShowTimer();
    showTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      showTimeoutRef.current = null;
    }, delay);
  }, [clearShowTimer, delay, disabled]);

  React.useEffect(() => {
    if (disabled) {
      hideImmediately();
    }
  }, [disabled, hideImmediately]);

  React.useEffect(() => () => clearShowTimer(), [clearShowTimer]);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = getTokenPixels('--spacing-050', 4);
    const viewportPadding = gap;

    const bestCandidate = getPlacementOrder(placement)
      .map((candidatePlacement) =>
        getCandidatePosition(candidatePlacement, triggerRect, tooltipRect, gap, viewportPadding),
      )
      .sort((left, right) => left.overflow - right.overflow)[0];

    if (!bestCandidate) {
      return;
    }

    setResolvedPlacement(bestCandidate.placement);
    setPosition({ top: bestCandidate.top, left: bestCandidate.left });
  }, [placement]);

  React.useLayoutEffect(() => {
    if (!isVisible || disabled || typeof window === 'undefined') {
      return;
    }

    updatePosition();

    const handleWindowUpdate = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleWindowUpdate);
    window.addEventListener('scroll', handleWindowUpdate, true);

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleWindowUpdate) : null;
    if (resizeObserver && triggerRef.current) {
      resizeObserver.observe(triggerRef.current);
    }
    if (resizeObserver && tooltipRef.current) {
      resizeObserver.observe(tooltipRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleWindowUpdate);
      window.removeEventListener('scroll', handleWindowUpdate, true);
      resizeObserver?.disconnect();
    };
  }, [disabled, isVisible, updatePosition]);

  const clonedChild = React.cloneElement(child, {
    'aria-describedby': disabled
      ? childProps['aria-describedby']
      : mergeDescribedBy(childProps['aria-describedby'], isVisible ? tooltipId : undefined),
    ...(isDisabledChildTrigger
      ? {}
      : {
          ref: mergeRefs(childRef, triggerRef),
          onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
            if (!callHandler(childProps.onPointerEnter, event)) {
              return;
            }
            scheduleShow();
          },
          onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
            if (!callHandler(childProps.onPointerLeave, event)) {
              return;
            }
            hideImmediately();
          },
          onFocus: (event: React.FocusEvent<HTMLElement>) => {
            if (!callHandler(childProps.onFocus, event)) {
              return;
            }
            scheduleShow();
          },
          onBlur: (event: React.FocusEvent<HTMLElement>) => {
            if (!callHandler(childProps.onBlur, event)) {
              return;
            }
            hideImmediately();
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
            if (!callHandler(childProps.onKeyDown, event)) {
              return;
            }
            if (event.key === 'Escape') {
              hideImmediately();
            }
          },
        }),
  });

  const trigger = isDisabledChildTrigger ? (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      className={styles.triggerWrapper}
      onPointerEnter={() => {
        scheduleShow();
      }}
      onPointerLeave={() => {
        hideImmediately();
      }}
    >
      {clonedChild}
    </span>
  ) : (
    clonedChild
  );

  return (
    <TooltipScopeContext.Provider value={true}>
      {trigger}
      {isVisible && !disabled && typeof document !== 'undefined'
        ? createPortal(
            <span
              ref={tooltipRef}
              id={tooltipId}
              role="tooltip"
              className={mergeClassNames(
                styles.content,
                styles[`placement_${resolvedPlacement}`],
                truncate ? styles.truncate : styles.wrap,
                className,
              )}
              data-placement={resolvedPlacement}
              data-truncate={truncate ? 'true' : 'false'}
              style={
                position
                  ? {
                      top: `${position.top}px`,
                      left: `${position.left}px`,
                    }
                  : {
                      visibility: 'hidden',
                    }
              }
            >
              <span className={styles.contentText}>{content}</span>
            </span>,
            document.body,
          )
        : null}
    </TooltipScopeContext.Provider>
  );
});

Tooltip.displayName = 'Tooltip';
