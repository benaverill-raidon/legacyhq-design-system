import * as React from 'react';
import styles from './icon.module.css';
import type { IconBaseProps } from './icon.types';

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export const IconBase = React.memo(function IconBase({
  size = 'md',
  spacing = 'none',
  color = 'default',
  title,
  decorative = true,
  className,
  testId,
  viewBox,
  children,
}: IconBaseProps) {
  const titleId = React.useId();
  const hasTitle = Boolean(title);
  const classNames = mergeClassNames(
    styles.root,
    styles[`size_${size}`],
    styles[`spacing_${spacing}`],
    styles[`color_${color}`],
    className,
  );

  return (
    <span className={classNames} data-testid={testId} data-size={size} data-spacing={spacing} data-color={color}>
      <svg
        className={styles.svg}
        viewBox={viewBox}
        fill="currentColor"
        focusable="false"
        aria-hidden={decorative ? true : undefined}
        role={decorative ? undefined : 'img'}
        aria-labelledby={!decorative && hasTitle ? titleId : undefined}
      >
        {!decorative && hasTitle ? <title id={titleId}>{title}</title> : null}
        {children}
      </svg>
    </span>
  );
});

IconBase.displayName = 'IconBase';
