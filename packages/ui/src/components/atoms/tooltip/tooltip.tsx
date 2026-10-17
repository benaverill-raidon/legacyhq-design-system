import * as React from 'react';
import { Popup } from '../../primitives/popup';
import styles from './tooltip.module.css';
import { TooltipScopeContext } from './tooltip-context';
import type { TooltipProps } from './tooltip.types';

type MeasurableEvent = { defaultPrevented?: boolean };

const DISABLED_NATIVE_TRIGGER_TYPES = new Set(['button', 'input', 'select', 'textarea', 'option', 'optgroup', 'fieldset']);

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

type TriggerProps = React.HTMLAttributes<HTMLElement> & {
  /** A native control's disabled state, which makes Tooltip wrap the trigger for hover. */
  disabled?: boolean;
  /** A component's disabled state, read the same way as `disabled`. */
  isDisabled?: boolean;
  /** The trigger's own ref, merged with the one set on Tooltip. */
  ref?: React.Ref<HTMLElement>;
  [key: string]: unknown;
};

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

/**
 * Props a wrapper put on the Tooltip element itself (Popup's aria-expanded and aria-controls,
 * Dropdown Menu's aria-haspopup, a data attribute, a handler), merged onto the child the way
 * cloneElement would put them there: the wrapper's value wins, except that two handlers both run
 * (the child's first), styles merge, and aria-describedby ids are kept from both.
 */
function mergeForwardedProps(forwarded: Record<string, unknown>, childProps: Record<string, unknown>) {
  const merged: Record<string, unknown> = {};
  Object.entries(forwarded).forEach(([key, value]) => {
    // Popup sets aria-controls to undefined while closed; that mustn't erase the child's own.
    if (value === undefined) return;
    const childValue = childProps[key];
    if (/^on[A-Z]/.test(key) && typeof value === 'function' && typeof childValue === 'function') {
      merged[key] = (...args: unknown[]) => {
        childValue(...args);
        value(...args);
      };
    } else if (key === 'style' && value && childValue) {
      merged[key] = { ...(childValue as React.CSSProperties), ...(value as React.CSSProperties) };
    } else if (key === 'aria-describedby') {
      merged[key] = mergeDescribedBy(childValue as string | undefined, value as string | undefined);
    } else {
      merged[key] = value;
    }
  });
  return merged;
}

export const Tooltip = React.memo(function Tooltip({
  content,
  children,
  truncate = true,
  disabled = false,
  delay = 300,
  className,
  ref,
  ...forwardedProps
}: TooltipProps) {
  const tooltipId = React.useId();
  const showTimeoutRef = React.useRef<number | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

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

  const hasContent = hasTooltipContent(content);
  const child = React.Children.only(children) as React.ReactElement<TriggerProps>;
  const childRef = child.props.ref;
  // Tooltip is often the child of a component that wires its trigger by cloning it (Popup, Dropdown
  // Menu). What that wrapper sets on the Tooltip element - its ref, aria-expanded, aria-controls,
  // aria-haspopup - belongs on the real trigger, so it's passed through to the child.
  const mergedRef = React.useMemo(() => (ref ? mergeRefs(childRef, ref) : childRef), [childRef, ref]);
  const forwarded = mergeForwardedProps(forwardedProps, child.props);
  // The trigger's props as they'll end up, so Tooltip's own handlers below chain onto both.
  const childProps: TriggerProps = { ...child.props, ...forwarded };

  if (!hasContent) {
    return React.cloneElement(child, { ...forwarded, ref: mergedRef });
  }

  const isDisabledChildTrigger = isDisabledTrigger(child);

  const clonedChild = React.cloneElement(child, {
    ...forwarded,
    ref: mergedRef,
    'aria-describedby': disabled
      ? childProps['aria-describedby']
      : mergeDescribedBy(childProps['aria-describedby'], isVisible ? tooltipId : undefined),
    ...(isDisabledChildTrigger
      ? {}
      : {
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
      <Popup
        open={isVisible && !disabled}
        alignment="topCenter"
        role="tooltip"
        id={tooltipId}
        manageTriggerAria={false}
        closeOnEscape={false}
        closeOnOutsideClick={false}
        unstyled
        className={mergeClassNames(styles.content, truncate ? styles.truncate : styles.wrap, className)}
        content={<span className={styles.contentText}>{content}</span>}
      >
        {trigger}
      </Popup>
    </TooltipScopeContext.Provider>
  );
});

Tooltip.displayName = 'Tooltip';
