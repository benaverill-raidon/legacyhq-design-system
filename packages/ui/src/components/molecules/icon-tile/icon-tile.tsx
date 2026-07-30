import * as React from 'react';
import styles from './icon-tile.module.css';
import type { IconTileProps } from './icon-tile.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const IconTile = React.memo(function IconTile({
  children,
  tone = 'brand',
  appearance = 'default',
  shape = 'square',
  size = 'md',
  decorative = true,
  ariaLabel,
  className,
}: IconTileProps) {
  const classNames = mergeClassNames(
    styles.root,
    styles[`tone_${tone}`],
    styles[`appearance_${appearance}`],
    styles[`shape_${shape}`],
    styles[`size_${size}`],
    className,
  );

  return (
    <div
      className={classNames}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : ariaLabel}
      data-tone={tone}
      data-appearance={appearance}
      data-shape={shape}
      data-size={size}
    >
      <span className={styles.icon}>{children}</span>
    </div>
  );
});

IconTile.displayName = 'IconTile';
