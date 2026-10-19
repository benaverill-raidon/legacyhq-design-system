import * as React from 'react';
import { Spinner } from '../spinner';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './link-button.module.css';
import type { LinkButtonProps } from './link-button.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export function getLinkButtonRel(target: React.HTMLAttributeAnchorTarget | undefined, rel: string | undefined) {
  if (target !== '_blank' || rel) {
    return rel;
  }

  return 'noopener noreferrer';
}

export const LinkButton = React.memo(
  React.forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
    {
      href,
      size = 'md',
      appearance = 'default',
      tone = 'default',
      isInverse = false,
      isDisabled = false,
      isLoading = false,
      iconBefore,
      iconAfter,
      children,
      className,
      target,
      rel,
      onClick,
      tabIndex,
      newTabLabel = '(opens in a new tab)',
      ...rest
    },
    forwardedRef,
  ) {
    const isInactive = isDisabled || isLoading;

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (isInactive) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        onClick?.(event);
      },
      [isInactive, onClick],
    );

    return (
      <a
        {...rest}
        ref={forwardedRef}
        // While disabled or loading there's no href, so nothing can open it: not a click, a middle
        // click, or the context menu. role="link" keeps it announced as an (unavailable) link, and a
        // loading one stays focusable.
        href={isInactive ? undefined : href}
        role={isInactive ? 'link' : undefined}
        target={target}
        rel={getLinkButtonRel(target, rel)}
        tabIndex={isDisabled ? -1 : isLoading ? (tabIndex ?? 0) : tabIndex}
        className={mergeClassNames(
          styles.linkButton,
          styles[`size_${size}`],
          styles[`appearance_${appearance}`],
          styles[`tone_${tone}`],
          isInverse && styles.inverse,
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        aria-disabled={isInactive ? true : undefined}
        aria-busy={isLoading ? true : undefined}
        data-disabled={isDisabled ? 'true' : undefined}
        data-loading={isLoading ? 'true' : undefined}
        onClick={handleClick}
      >
        {iconBefore ? (
          <span className={styles.leading} aria-hidden="true">
            {iconBefore}
          </span>
        ) : null}

        <span className={styles.content}>{children}</span>

        {/* A flex container doesn't render this space, but it separates the label in the name. */}
        {target === '_blank' ? (
          <>
            {' '}
            <span className={styles.visuallyHidden}>{newTabLabel}</span>
          </>
        ) : null}

        {iconAfter ? (
          <span className={styles.trailing} aria-hidden="true">
            {iconAfter}
          </span>
        ) : null}

        {/* While loading, the spinner sits over the content, which keeps its space and stays the accessible name. */}
        {isLoading ? (
          <span className={styles.spinner} aria-hidden="true">
            <Spinner size="md" />
          </span>
        ) : null}
      </a>
    );
  }),
);

LinkButton.displayName = 'LinkButton';
