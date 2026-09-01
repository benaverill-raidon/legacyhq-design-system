import * as React from 'react';
import type { ComponentType } from 'react';
import {
  StatusErrorIcon,
  StatusInformationIcon,
  StatusSuccessIcon,
  StatusWarningIcon,
} from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Popup } from '../../primitives/popup';
import type { IconColor, IconProps } from '../../primitives/icon';
import styles from './inline-message.module.css';
import type { InlineMessageProps, InlineMessageTone } from './inline-message.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/*
 * `default` has no dedicated status icon - confirmed absent from the generated icon set, matching
 * Figma's own trigger, which falls back to an unrelated generic placeholder glyph ("node") for this
 * tone rather than a real one. A plain CSS dot (`.dot`) substitutes here instead of fabricating a
 * "default status" icon that doesn't exist in the source library.
 */
const TONE_ICONS: Partial<Record<InlineMessageTone, { Icon: ComponentType<IconProps>; color: IconColor }>> = {
  info: { Icon: StatusInformationIcon, color: 'information' },
  success: { Icon: StatusSuccessIcon, color: 'success' },
  warning: { Icon: StatusWarningIcon, color: 'warning' },
  error: { Icon: StatusErrorIcon, color: 'error' },
};

function ToneIcon({ tone }: { tone: InlineMessageTone }) {
  const mapped = TONE_ICONS[tone];

  return (
    <span className={styles.iconSlot} aria-hidden="true">
      {mapped ? <mapped.Icon size="md" spacing="spacious" color={mapped.color} /> : <span className={styles.dot} />}
    </span>
  );
}

export const InlineMessage = React.memo(function InlineMessage({
  title,
  secondaryText,
  tone = 'default',
  content,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  'data-force-state': dataForceState,
}: InlineMessageProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;
  const hasContent = content !== null && content !== undefined;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const row = (
    <>
      <ToneIcon tone={tone} />
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {secondaryText !== undefined ? <span className={styles.secondaryText}>{secondaryText}</span> : null}
      </span>
    </>
  );

  if (!hasContent) {
    return <div className={mergeClassNames(styles.root, className)}>{row}</div>;
  }

  return (
    <Popup
      open={isOpen}
      onOpenChange={handleOpenChange}
      alignment="bottomLeft"
      content={content}
    >
      <button
        type="button"
        className={mergeClassNames(
          styles.root,
          styles.trigger,
          styles[`tone_${tone}`],
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
          className,
        )}
        data-force-state={dataForceState}
        onClick={() => handleOpenChange(!isOpen)}
      >
        {row}
      </button>
    </Popup>
  );
});

InlineMessage.displayName = 'InlineMessage';
