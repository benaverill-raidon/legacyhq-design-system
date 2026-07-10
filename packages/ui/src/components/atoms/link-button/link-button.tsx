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
      tone = 'neutral',
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
      ...rest
    },
    forwardedRef,
  ) {
    const isInactive = isDisabled || isLoading;
    const hasLeading = isLoading || Boolean(iconBefore);

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
        href={href}
        target={target}
        rel={getLinkButtonRel(target, rel)}
        tabIndex={isDisabled ? -1 : tabIndex}
        className={mergeClassNames(
          styles.linkButton,
          styles[`size_${size}`],
          styles[`appearance_${appearance}`],
          styles[`tone_${tone}`],
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        aria-disabled={isDisabled ? true : undefined}
        aria-busy={isLoading ? true : undefined}
        data-disabled={isDisabled ? 'true' : undefined}
        data-loading={isLoading ? 'true' : undefined}
        onClick={handleClick}
      >
        {hasLeading ? (
          <span className={styles.leading} aria-hidden={isLoading ? undefined : true}>
            {isLoading ? <Spinner size="sm" className={styles.spinner} /> : iconBefore}
          </span>
        ) : null}

        <span className={styles.content}>{children}</span>

        {iconAfter ? (
          <span className={styles.trailing} aria-hidden="true">
            {iconAfter}
          </span>
        ) : null}
      </a>
    );
  }),
);

LinkButton.displayName = 'LinkButton';
