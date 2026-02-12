import * as React from 'react';
import styles from './button.module.css';
import type { ButtonOwnerState, ButtonProps } from './types';
import { ButtonContent } from './ButtonContent';

function getOwnerState(props: ButtonProps): ButtonOwnerState {
  const appearance = props.appearance ?? 'default';
  const spacing = props.spacing ?? 'default';

  const selected = Boolean(props.selected);
  const disabled = Boolean(props.disabled);
  const loading = Boolean(props.loading);

  const hasIconBefore = Boolean(props.iconBefore);
  const hasIconAfter = Boolean(props.iconAfter);
  const hasLabel = Boolean(props.children);

  // Strict rule: loading disables interaction.
  const isDisabled = disabled || loading;

  return {
    appearance,
    spacing,
    selected,
    disabled,
    loading,
    hasIconBefore,
    hasIconAfter,
    hasLabel,
    isDisabled,
  };
}

/**
 * ButtonBase
 * - Owns derived state, a11y attributes, and class composition.
 * - Intentionally does NOT accept className/style overrides (strict DS policy).
 */
export const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonProps>(function ButtonBase(
  {
    appearance,
    spacing,
    selected,
    disabled,
    loading,
    iconBefore,
    iconAfter,
    children,
    type = 'button',
    onClick,
    ...rest
  },
  ref,
) {
  // Strip escape hatches if consumers pass them.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { className: _className, style: _style, ...safeRest } = rest as any;

  const owner = getOwnerState({
    appearance,
    spacing,
    selected,
    disabled,
    loading,
    iconBefore,
    iconAfter,
    children,
    type,
    onClick,
    ...safeRest,
  });

  const classNames = [
    styles.button,
    styles[`appearance_${owner.appearance}`],
    styles[`spacing_${owner.spacing}`],
    owner.selected ? styles.isSelected : '',
    owner.loading ? styles.isLoading : '',
    owner.isDisabled ? styles.isDisabled : '',
    owner.hasIconBefore ? styles.hasIconBefore : '',
    owner.hasIconAfter ? styles.hasIconAfter : '',
    owner.hasLabel ? styles.hasLabel : styles.noLabel,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...safeRest}
      ref={ref}
      type={type}
      className={classNames}
      disabled={owner.isDisabled}
      aria-busy={owner.loading || undefined}
      aria-pressed={owner.selected || undefined}
      onClick={owner.isDisabled ? undefined : onClick}
    >
      <ButtonContent owner={owner} iconBefore={iconBefore} iconAfter={iconAfter}>
        {children}
      </ButtonContent>
    </button>
  );
});

ButtonBase.displayName = 'ButtonBase';
