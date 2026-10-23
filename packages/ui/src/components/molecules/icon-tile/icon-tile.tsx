import * as React from 'react';
import styles from './icon-tile.module.css';
import type { IconTileProps } from './icon-tile.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function warnForMissingAccessibleName(decorative: boolean, label?: string) {
  if (import.meta.env?.PROD) {
    return;
  }

  if (decorative || label) {
    return;
  }

  console.warn(
    'IconTile with `decorative={false}` needs `aria-label` for an accessible name. Without it, the tile is an unnamed image.',
  );
}

export const IconTile = React.memo(function IconTile({
  children,
  tone: requestedTone = 'brand',
  appearance = 'default',
  shape = 'square',
  size = 'md',
  decorative = true,
  'aria-label': ariaLabel,
  ariaLabel: deprecatedAriaLabel,
  className,
}: IconTileProps) {
  // `gray` is the deprecated name for `taupe`.
  const tone = requestedTone === 'gray' ? 'taupe' : requestedTone;
  // `ariaLabel` is the deprecated name for the native `aria-label`.
  const label = ariaLabel ?? deprecatedAriaLabel;

  React.useEffect(() => {
    warnForMissingAccessibleName(decorative, label);
  }, [decorative, label]);
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
      aria-label={decorative ? undefined : label}
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
