import * as React from 'react';
import styles from './key-value-list.module.css';
import type { KeyValueListProps } from './key-value-list.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/**
 * Key Value List stacks Key Value Pair items vertically. It renders a `<dl>` (description list)
 * element so screen readers announce the key/value structure naturally. Set `underline` on each
 * child KeyValuePair to control divider lines.
 */
export const KeyValueList = React.memo(function KeyValueList({
  children,
  className,
}: KeyValueListProps) {
  return (
    <dl className={mergeClassNames(styles.root, className)}>
      {children}
    </dl>
  );
});

KeyValueList.displayName = 'KeyValueList';
