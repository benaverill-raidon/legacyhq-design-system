import * as React from 'react';
import type { ComponentType } from 'react';
import { StatusErrorIcon, StatusWarningIcon } from '../../../assets/icons';
import type { IconProps } from '../../primitives/icon';
import styles from './banner.module.css';
import type { BannerAppearance, BannerProps } from './banner.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/*
 * `default` has no dedicated status icon - matching Figma (its default variant falls back to a
 * generic placeholder glyph rather than a real one) and InlineMessage's own `default` tone. A plain
 * CSS dot substitutes here instead of fabricating a "default status" icon that isn't in the source
 * library. `warning` and `error` use the real status glyphs. Every icon inherits the banner's own
 * content color (set per appearance), not its own status color, so it reads correctly on the bold
 * background - see the `[data-color]` override in banner.module.css.
 */
const APPEARANCE_ICONS: Partial<Record<BannerAppearance, ComponentType<IconProps>>> = {
  warning: StatusWarningIcon,
  error: StatusErrorIcon,
};

export const Banner = React.memo(
  React.forwardRef<HTMLDivElement, BannerProps>(function Banner(
    { appearance = 'default', children, showIcon = true, actions, className, role = 'status', ...rest },
    forwardedRef,
  ) {
    const StatusIcon = APPEARANCE_ICONS[appearance];

    return (
      <div
        {...rest}
        ref={forwardedRef}
        role={role}
        className={mergeClassNames(styles.banner, styles[`appearance_${appearance}`], className)}
      >
        <div className={styles.message}>
          {showIcon ? (
            <span className={styles.iconSlot} aria-hidden="true">
              {StatusIcon ? (
                <StatusIcon size="md" spacing="spacious" />
              ) : (
                <span className={styles.dot} />
              )}
            </span>
          ) : null}

          <span className={styles.text}>{children}</span>
        </div>

        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    );
  }),
);

Banner.displayName = 'Banner';
