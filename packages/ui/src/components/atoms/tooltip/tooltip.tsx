import * as React from 'react';
import styles from './tooltip.module.css';
import type { TooltipProps } from './tooltip.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function mergeDescribedBy(existing: string | undefined, tooltipId: string | undefined) {
  if (!tooltipId) {
    return existing;
  }

  return existing ? `${existing} ${tooltipId}` : tooltipId;
}

function callHandler<EventType>(
  handler: ((event: EventType) => void) | undefined,
  event: EventType,
) {
  handler?.(event);
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
  const showTimeoutRef = React.useRef<number | null>(null);
  const hideTimeoutRef = React.useRef<number | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  const clearTimers = React.useCallback(() => {
    if (showTimeoutRef.current !== null) {
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleShow = React.useCallback(() => {
    if (disabled) {
      return;
    }

    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (showTimeoutRef.current !== null) {
      return;
    }

    showTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      showTimeoutRef.current = null;
    }, delay);
  }, [delay, disabled]);

  const scheduleHide = React.useCallback(() => {
    if (showTimeoutRef.current !== null) {
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
      hideTimeoutRef.current = null;
    }, 0);
  }, []);

  const hideImmediately = React.useCallback(() => {
    clearTimers();
    setIsVisible(false);
  }, [clearTimers]);

  React.useEffect(() => {
    if (disabled) {
      hideImmediately();
    }
  }, [disabled, hideImmediately]);

  React.useEffect(() => () => clearTimers(), [clearTimers]);

  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & {
      'aria-describedby'?: string;
    }
  >;
  const childProps = child.props;

  const trigger = React.cloneElement(child, {
    'aria-describedby': disabled
      ? childProps['aria-describedby']
      : mergeDescribedBy(childProps['aria-describedby'], isVisible ? tooltipId : undefined),
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      callHandler(childProps.onMouseEnter, event);
      scheduleShow();
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      callHandler(childProps.onMouseLeave, event);
      scheduleHide();
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      callHandler(childProps.onFocus, event);
      scheduleShow();
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      callHandler(childProps.onBlur, event);
      hideImmediately();
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      callHandler(childProps.onKeyDown, event);

      if (event.key === 'Escape') {
        hideImmediately();
      }
    },
  });

  return (
    <span className={styles.root}>
      {trigger}

      {isVisible && !disabled ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={mergeClassNames(
            styles.content,
            styles[`placement_${placement}`],
            truncate ? styles.truncate : styles.wrap,
            className,
          )}
          data-placement={placement}
          data-truncate={truncate ? 'true' : 'false'}
          onMouseEnter={() => {
            if (hideTimeoutRef.current !== null) {
              window.clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            hideImmediately();
          }}
        >
          <span className={styles.contentText}>{content}</span>
        </span>
      ) : null}
    </span>
  );
});

Tooltip.displayName = 'Tooltip';
