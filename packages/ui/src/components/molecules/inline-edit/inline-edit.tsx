import * as React from 'react';
import { CheckIcon, CloseIcon, EditIcon, StatusErrorIcon } from '../../../assets/icons';
import { useEditableCellSize } from '../../primitives/editable-cell-context';
import { IconButton } from '../../atoms/icon-button';
import { ButtonGroup } from '../button-group';
import styles from './inline-edit.module.css';
import type { InlineEditProps } from './inline-edit.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const InlineEdit = React.memo(function InlineEdit({
  value,
  children,
  onConfirm,
  onCancel,
  validate,
  actionButtons = true,
  actionPlacement = 'below',
  actionAlignment = 'center',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  className,
}: InlineEditProps) {
  const cellSize = useEditableCellSize();
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  // What `validate` said about the draft. Checked on each confirm; after one fails, it follows the
  // draft as it changes (the system's rule: check on submit, then follow the value).
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [isChecking, setIsChecking] = React.useState(false);
  const errorId = `${React.useId()}-error`;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const controlSize = children.props.size === 'sm' || children.props.size === 'lg' ? children.props.size : 'md';
  // Set on mousedown for the cancel/confirm buttons themselves, so the blur that mousedown causes
  // (moving focus off the field) doesn't get treated as "clicked off" - see handleBlur. Needed
  // because a couple of browsers don't reliably move focus to a clicked <button>, which would
  // otherwise make handleBlur's relatedTarget check alone unreliable for that specific case.
  const suppressBlurRef = React.useRef(false);

  const clearError = () => {
    setError(undefined);
    setIsChecking(false);
  };

  const startEditing = () => {
    suppressBlurRef.current = false;
    setDraft(value);
    clearError();
    setIsEditing(true);
  };

  // The field is the same element in both modes, so returning focus to it lands on the read-only
  // value once editing ends. Focusing it while still editing doesn't restart editing (only the
  // read-only clone starts editing on focus).
  const focusField = () => {
    rootRef.current?.querySelector<HTMLElement>(`.${styles.content} :is(input, textarea)`)?.focus();
  };

  // A draft `validate` rejects isn't confirmed: editing goes on, with the message under the field.
  const confirm = () => {
    const message = validate?.(draft);
    if (message) {
      setError(message);
      setIsChecking(true);
      return;
    }
    clearError();
    onConfirm?.(draft);
    setIsEditing(false);
  };

  const cancel = () => {
    clearError();
    onCancel?.();
    setIsEditing(false);
  };

  const changeDraft = (next: string) => {
    setDraft(next);
    if (isChecking) setError(validate?.(next));
  };

  // The cancel and confirm buttons unmount when editing ends, so focus goes back to the field
  // rather than to the page.
  const confirmFromButton = () => {
    focusField();
    confirm();
  };

  const cancelFromButton = () => {
    focusField();
    cancel();
  };

  const handleActionMouseDown = () => {
    suppressBlurRef.current = true;
  };

  // Clicking (or Tab-ing) off the field - anywhere other than the cancel/confirm buttons - commits
  // the draft, the same as clicking confirm. Moving focus to the cancel/confirm buttons themselves
  // (by click or by Tab) must not trigger this - their own onClick already has the right behavior.
  // An unchanged draft isn't confirmed: tabbing through the field and its buttons without typing
  // just ends editing, so onConfirm only ever hears about an edit (or an explicit confirm).
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!isEditing) {
      return;
    }

    if (suppressBlurRef.current) {
      suppressBlurRef.current = false;
      return;
    }

    const nextFocusTarget = event.relatedTarget;
    if (nextFocusTarget && rootRef.current?.contains(nextFocusTarget)) {
      return;
    }

    if (draft === value) {
      clearError();
      setIsEditing(false);
      return;
    }

    confirm();
  };

  // Enter and Escape leave focus on the field, which turns read-only, so the person stays where
  // they were; from a cancel/confirm button (Escape), focus moves to the field first, since the
  // buttons unmount. Enter (or a click) on the read-only field starts editing again.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEditing || event.defaultPrevented || event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === 'Enter') {
      // Multiline fields keep native newlines; Ctrl/Cmd+Enter confirms the draft.
      if (event.target instanceof HTMLTextAreaElement && !event.ctrlKey && !event.metaKey) return;
      // Let focused action buttons handle Enter themselves (especially Cancel).
      if (event.target instanceof HTMLElement && event.target.closest('button')) return;
      event.preventDefault();
      confirm();
    } else if (event.key === 'Escape') {
      // Handled here, so a Modal Dialog around the field doesn't close on the same key press.
      event.preventDefault();
      focusField();
      cancel();
    }
  };

  // While read-only, the field may already have focus (after Enter or Escape), so focusing it again
  // can't start editing: a click or Enter does. The child's own handlers still run first.
  const childProps = children.props;
  const handleReadOnlyClick = (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    childProps.onClick?.(event);
    if (!event.defaultPrevented) startEditing();
  };
  const handleReadOnlyKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    childProps.onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    // Also keeps Enter from submitting a surrounding form.
    event.preventDefault();
    startEditing();
  };

  // Clones the same child for both modes - a read-only clone (value, focusable but not editable,
  // starts editing on focus/click) or an editable clone (draft, tracks typing) - rather than
  // swapping between two different elements, so the underlying DOM node (and its focus) persists
  // across the transition.
  // While `validate` rejects the draft, the field is marked invalid and described by the message;
  // the child's own values win, and its own description keeps its place.
  const hasError = isEditing && error !== undefined;
  const control = isEditing
    ? React.cloneElement(children, {
        value: draft,
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => changeDraft(event.target.value),
        ...(cellSize ? { iconAfter: undefined } : {}),
        ...(hasError
          ? {
              invalid: true,
              'aria-invalid': childProps['aria-invalid'] ?? true,
              'aria-describedby': [childProps['aria-describedby'], errorId].filter(Boolean).join(' '),
            }
          : {}),
      })
    : React.cloneElement(children, {
        value,
        readOnly: true,
        onFocus: startEditing,
        onClick: handleReadOnlyClick,
        onKeyDown: handleReadOnlyKeyDown,
        ...(cellSize ? {
          iconAfter: <span className={styles.editIcon} aria-hidden="true"><EditIcon size="md" decorative /></span>,
        } : {}),
      });

  // onKeyDown/onBlur below only catch events bubbled up from the always-focusable child clone
  // (`control`); this div is never itself a focus or interaction target, so it doesn't need a
  // role or its own key handling.
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={rootRef}
      className={mergeClassNames(styles.root, actionPlacement === 'end' && styles.placement_end, actionPlacement === 'end' && actionAlignment === 'start' && styles.alignment_start, className)}
      data-editing={isEditing ? 'true' : 'false'}
      data-control-size={controlSize}
      data-editable-cell={cellSize ?? undefined}
      data-has-actions={isEditing && actionButtons ? 'true' : undefined}
      data-invalid={hasError ? 'true' : undefined}
      onKeyDown={isEditing ? handleKeyDown : undefined}
      onBlur={isEditing ? handleBlur : undefined}
    >
      <div className={styles.content}>{control}</div>

      {/*
        A polite live region, there from the start of editing, so a message that appears after Enter
        is read out even though focus doesn't move. The message also describes the field.
      */}
      {isEditing && validate ? (
        <div className={styles.messageRegion} aria-live="polite">
          {hasError ? (
            <div id={errorId} className={styles.message}>
              <span className={styles.messageIcon} aria-hidden="true">
                <StatusErrorIcon size="sm" spacing="none" color="error" />
              </span>
              <span className={styles.messageText}>{error}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {isEditing && actionButtons ? (
        <ButtonGroup className={styles.actions}>
          <IconButton size="xs" appearance="default" aria-label={cancelLabel} onMouseDown={handleActionMouseDown} onClick={cancelFromButton}>
            <CloseIcon />
          </IconButton>
          <IconButton size="xs" appearance="default" aria-label={confirmLabel} onMouseDown={handleActionMouseDown} onClick={confirmFromButton}>
            <CheckIcon />
          </IconButton>
        </ButtonGroup>
      ) : null}
    </div>
  );
});

InlineEdit.displayName = 'InlineEdit';
