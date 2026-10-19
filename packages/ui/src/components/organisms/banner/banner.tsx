import * as React from 'react';
import type { ComponentType } from 'react';
import { StatusErrorIcon, StatusWarningIcon } from '../../../assets/icons';
import type { IconProps } from '../../primitives/icon';
import styles from './banner.module.css';
import type { BannerProps, BannerTone } from './banner.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/*
 * `default` has no dedicated status icon - matching Figma (its default variant falls back to a
 * generic placeholder glyph rather than a real one) and InlineMessage's own `default` tone. A plain
 * CSS dot substitutes here instead of fabricating a "default status" icon that isn't in the source
 * library. `warning` and `error` use the real status glyphs. Every icon inherits the banner's own
 * content color (set per tone), not its own status color, so it reads correctly on the bold
 * background - see the `[data-color]` override in banner.module.css.
 */
const TONE_ICONS: Partial<Record<BannerTone, ComponentType<IconProps>>> = {
  warning: StatusWarningIcon,
  error: StatusErrorIcon,
};

/** What each tone announces before the message; `default` carries no status. */
const STATUS_LABELS: Partial<Record<BannerTone, string>> = {
  warning: 'Warning',
  error: 'Error',
};

export const Banner = React.memo(
  React.forwardRef<HTMLDivElement, BannerProps>(function Banner(
    { tone: requestedTone, appearance, children, showIcon = true, statusLabel, actions, className, role = 'status', ...rest },
    forwardedRef,
  ) {
    // `appearance` is the deprecated name for `tone`.
    const tone: BannerTone = requestedTone ?? appearance ?? 'default';
    const StatusIcon = TONE_ICONS[tone];
    const status = statusLabel ?? STATUS_LABELS[tone];

    return (
      <div
        {...rest}
        ref={forwardedRef}
        role={role}
        className={mergeClassNames(styles.banner, styles[`tone_${tone}`], className)}
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

          {status ? (
            <>
              <span className={styles.visuallyHidden}>{status}:</span>{' '}
            </>
          ) : null}
          <span className={styles.text}>{children}</span>
        </div>

        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    );
  }),
);

Banner.displayName = 'Banner';
