import * as React from 'react';
import { LinkExternalIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './link.module.css';
import type { LinkProps } from './link.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export function getSecureRel(target: React.HTMLAttributeAnchorTarget | undefined, rel: string | undefined) {
  if (target !== '_blank') {
    return rel;
  }

  const relValues = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  relValues.add('noopener');
  relValues.add('noreferrer');

  return Array.from(relValues).join(' ');
}

export const Link = React.memo(
  React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
    {
      appearance = 'default',
      size = 'md',
      emphasis = 'strong',
      target = '_self',
      newTabLabel = '(opens in a new tab)',
      rel,
      href,
      children,
      className,
      ...rest
    },
    forwardedRef,
  ) {
    const isExternal = target === '_blank';

    return (
      <a
        {...rest}
        ref={forwardedRef}
        href={href}
        target={target}
        rel={getSecureRel(target, rel)}
        className={mergeClassNames(
          styles.root,
          styles[`appearance_${appearance}`],
          styles[`size_${size}`],
          styles[`emphasis_${emphasis}`],
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
      >
        <span className={styles.content}>{children}</span>
        {isExternal ? (
          <>
            {/* The icon shows that the link opens a new tab; the hidden text says so to assistive technology. */}
            <span className={styles.icon} aria-hidden="true">
              <LinkExternalIcon size={size} />
            </span>
            {/* A flex container doesn't render this space, but it separates the label in the name. */}{' '}
            <span className={styles.visuallyHidden}>{newTabLabel}</span>
          </>
        ) : null}
      </a>
    );
  }),
);

Link.displayName = 'Link';
