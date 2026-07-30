import * as React from 'react';
import { Link } from '../../atoms/link';
import styles from './breadcrumbs.module.css';
import type { BreadcrumbItem, BreadcrumbsProps } from './breadcrumbs.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function ItemContent({ iconBefore, iconAfter, label }: Pick<BreadcrumbItem, 'iconBefore' | 'iconAfter' | 'label'>) {
  return (
    <span className={styles.itemContent}>
      {iconBefore ? (
        <span className={styles.icon} aria-hidden="true">
          {iconBefore}
        </span>
      ) : null}
      <span className={styles.label}>{label}</span>
      {iconAfter ? (
        <span className={styles.icon} aria-hidden="true">
          {iconAfter}
        </span>
      ) : null}
    </span>
  );
}

export const Breadcrumbs = React.memo(function Breadcrumbs({
  items,
  ariaLabel = 'Breadcrumb',
  className,
}: BreadcrumbsProps) {
  return (
    <nav aria-label={ariaLabel} className={mergeClassNames(styles.root, className)}>
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            {index > 0 ? (
              <span className={styles.separator} aria-hidden="true">
                /
              </span>
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                target={item.target}
                appearance="subtle"
                size="md"
                className={styles.link}
                onClick={item.onClick}
              >
                <ItemContent iconBefore={item.iconBefore} iconAfter={item.iconAfter} label={item.label} />
              </Link>
            ) : (
              <span className={styles.current} aria-current="page">
                <ItemContent iconBefore={item.iconBefore} iconAfter={item.iconAfter} label={item.label} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';
