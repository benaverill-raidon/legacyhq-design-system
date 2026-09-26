import * as React from 'react';
import styles from './key-value-pair.module.css';
import type { KeyValuePairProps } from './key-value-pair.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/**
 * Key Value Pair maps a descriptive label to a static or inline-editable value for scannable
 * metadata presentation. Pass plain `value` text for read-only display, or provide children
 * (a TextField / TextArea / Select with `appearance="inline"`) for inline editing.
 */
export const KeyValuePair = React.memo(function KeyValuePair({
  label,
  value,
  size = 'md',
  underline = false,
  className,
  children,
}: KeyValuePairProps) {
  const hasChildren = children != null;

  return (
    <div
      className={mergeClassNames(
        styles.root,
        styles[`size_${size}`],
        underline && styles.underline,
        className,
      )}
      data-size={size}
    >
      <dt className={styles.key}>{label}</dt>
      <dd className={mergeClassNames(styles.value, !hasChildren && styles.value_static)}>
        {hasChildren ? children : value}
      </dd>
    </div>
  );
});

KeyValuePair.displayName = 'KeyValuePair';
