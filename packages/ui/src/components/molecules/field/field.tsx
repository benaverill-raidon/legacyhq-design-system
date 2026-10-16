import * as React from 'react';
import { StatusErrorIcon, StatusSuccessIcon } from '../../../assets/icons';
import type { IconColor, IconProps } from '../../primitives/icon';
import styles from './field.module.css';
import type { FieldProps } from './field.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

// `default` has no status icon (helper text only); `error` and `valid` each map to a decorative
// status glyph, matching Figma's <message> part. Kept as sm/none (the field message's compact icon)
// rather than the larger, spacious icon Inline Message uses.
const STATUS_ICONS: Partial<Record<'error' | 'valid', { Icon: React.ComponentType<IconProps>; color: IconColor }>> = {
  error: { Icon: StatusErrorIcon, color: 'error' },
  valid: { Icon: StatusSuccessIcon, color: 'success' },
};

export const Field = React.memo(function Field({
  children,
  label,
  message,
  state = 'default',
  context = 'default',
  size = 'md',
  required = false,
  controlId,
  className,
  labelClassName,
  messageClassName,
  'data-force-state': dataForceState,
  ...rest
}: FieldProps) {
  const reactId = React.useId();
  const child = React.isValidElement(children)
    ? (children as React.ReactElement<Record<string, unknown>>)
    : null;
  const childProps: Record<string, unknown> = child?.props ?? {};

  const resolvedControlId = (childProps.id as string | undefined) ?? controlId ?? `${reactId}-control`;
  const hasMessage = message !== null && message !== undefined;
  const messageId = hasMessage ? `${reactId}-message` : undefined;
  const hasLabel = label !== null && label !== undefined;
  const labelId = hasLabel ? `${reactId}-label` : undefined;
  const isError = state === 'error';

  // Merge, rather than replace, any aria-describedby the control already carries, so Field's message
  // adds to (never clobbers) an existing description.
  const describedBy =
    [childProps['aria-describedby'] as string | undefined, messageId].filter(Boolean).join(' ') || undefined;

  // The control's own props always win - Field only fills in wiring the consumer left unset. This is
  // why the field's `state` never overrides an explicit `aria-invalid`, and `required`/`id` defer to
  // whatever the control already declares.
  const injectedProps: Record<string, unknown> = {
    id: resolvedControlId,
    // The label names the control by id as well as by htmlFor, so a control that isn't a native
    // input (Rich Text Area's editor) is named too. A name the control already has wins.
    'aria-labelledby': childProps['aria-labelledby'] ?? (childProps['aria-label'] ? undefined : labelId),
    'aria-describedby': describedBy,
    'aria-invalid': childProps['aria-invalid'] ?? (isError ? true : undefined),
    required: (childProps.required as boolean | undefined) ?? (required || undefined),
    'data-force-state': childProps['data-force-state'] ?? dataForceState,
  };

  // `context` is a single shared axis in Figma: an inline field also renders its control inline
  // (borderless), so the whole field reads as one inline unit. Text Field, Text Area, and Select take
  // the same `context` prop; the control's own context (or deprecated appearance/tone) always wins.
  // This is deliberately unlike `state`, which maps to the control's *separate* invalid axis and so
  // stays the consumer's call.
  if (context === 'inline' && childProps.context === undefined && childProps.appearance === undefined && childProps.tone === undefined) {
    injectedProps.context = 'inline';
  }

  const control = child ? React.cloneElement(child, injectedProps) : children;

  const status = STATUS_ICONS[state as 'error' | 'valid'];

  return (
    <div
      {...rest}
      className={mergeClassNames(
        styles.root,
        styles[`context_${context}`],
        styles[`size_${size}`],
        styles[`state_${state}`],
        className,
      )}
      data-state={state}
      data-context={context}
      data-size={size}
    >
      {hasLabel ? (
        <label id={labelId} htmlFor={resolvedControlId} className={mergeClassNames(styles.label, labelClassName)}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {control}

      {hasMessage ? (
        <div id={messageId} className={mergeClassNames(styles.message, messageClassName)}>
          {status ? (
            <span className={styles.messageIcon} aria-hidden="true">
              <status.Icon size="sm" spacing="none" color={status.color} />
            </span>
          ) : null}
          <span className={styles.messageText}>{message}</span>
        </div>
      ) : null}
    </div>
  );
});

Field.displayName = 'Field';
