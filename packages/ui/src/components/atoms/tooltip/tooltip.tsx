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

export const Tooltip = React.memo(function Tooltip({
  content,
  children,
  truncate = true,
  disabled = false,
  delay = 300,
  className,
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

  const clonedChild = React.cloneElement(child, {
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
