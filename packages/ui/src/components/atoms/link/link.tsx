import * as React from 'react';
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

function ExternalLinkIcon() {
  return (
    <span className={styles.icon} aria-hidden="true">
      <svg className={styles.iconSvg} viewBox="0 0 16 16" fill="currentColor" focusable="false" aria-hidden="true">
        <path d="M12.6667 12.6667H3.33333V3.33333H8V2H3.33333C2.59333 2 2 2.6 2 3.33333V12.6667C2 13.4 2.59333 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V8H12.6667V12.6667ZM9.33333 2V3.33333H11.7267L5.17333 9.88667L6.11333 10.8267L12.6667 4.27333V6.66667H14V2H9.33333Z" />
      </svg>
    </span>
  );
}

export const Link = React.memo(
  React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
    {
      appearance = 'default',
      size = 'md',
      target = '_self',
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
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
      >
        <span className={styles.content}>{children}</span>
        {isExternal ? <ExternalLinkIcon /> : null}
      </a>
    );
  }),
);

Link.displayName = 'Link';
