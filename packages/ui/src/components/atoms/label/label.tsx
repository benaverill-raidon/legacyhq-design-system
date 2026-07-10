import * as React from 'react';
import styles from './label.module.css';
import type { LabelProps } from './label.types';

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export const Label = React.memo(function Label({
  children,
  size = 'md',
  tone = 'default',
  emphasis = 'subtle',
  className,
  ...rest
}: LabelProps) {
  const classNames = mergeClassNames(
    styles.label,
    styles[`size_${size}`],
    styles[`tone_${tone}`],
    styles[`emphasis_${emphasis}`],
    className,
  );

  return (
    <span {...rest} className={classNames}>
      {children}
    </span>
  );
});

Label.displayName = 'Label';

