import * as React from 'react';
import { CheckIcon, CloseIcon } from '../../../assets/icons';
import { IconButton } from '../../atoms/icon-button';
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
  actionButtons = true,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  className,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const rootRef = React.useRef<HTMLDivElement>(null);
  // Set on mousedown for the cancel/confirm buttons themselves, so the blur that mousedown causes
  // (moving focus off the field) doesn't get treated as "clicked off" - see handleBlur. Needed
  // because a couple of browsers don't reliably move focus to a clicked <button>, which would
  // otherwise make handleBlur's relatedTarget check alone unreliable for that specific case.
  const suppressBlurRef = React.useRef(false);

  const startEditing = () => {
    setDraft(value);
    setIsEditing(true);
  };

  const confirm = () => {
    onConfirm?.(draft);
    setIsEditing(false);
  };

  const cancel = () => {
    onCancel?.();
    setIsEditing(false);
  };

  const handleActionMouseDown = () => {
    suppressBlurRef.current = true;
  };

  // Clicking (or Tab-ing) off the field - anywhere other than the cancel/confirm buttons - commits
  // the draft, the same as clicking confirm. Moving focus to the cancel/confirm buttons themselves
  // (by click or by Tab) must not trigger this - their own onClick already has the right behavior.
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

    confirm();
  };

  // Blurring after a keyboard confirm/cancel would otherwise re-enter handleBlur with a stale
  // isEditing closure (still true, since the setIsEditing(false) above hasn't committed yet),
  // double-firing confirm - the same mousedown flag used for the action buttons suppresses it.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEditing) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      suppressBlurRef.current = true;
      confirm();
      (event.target as HTMLElement).blur();
    } else if (event.key === 'Escape') {
      suppressBlurRef.current = true;
      cancel();
      (event.target as HTMLElement).blur();
    }
  };

  // Clones the same child for both modes - a read-only clone (value, focusable but not editable,
  // starts editing on focus/click) or an editable clone (draft, tracks typing) - rather than
  // swapping between two different elements, so the underlying DOM node (and its focus) persists
  // across the transition.
  const control = isEditing
    ? React.cloneElement(children, {
        value: draft,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => setDraft(event.target.value),
      })
    : React.cloneElement(children, {
        value,
        readOnly: true,
        onFocus: startEditing,
      });

  // onKeyDown/onBlur below only catch events bubbled up from the always-focusable child clone
  // (`control`); this div is never itself a focus or interaction target, so it doesn't need a
  // role or its own key handling.
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={rootRef}
      className={mergeClassNames(styles.root, className)}
      data-editing={isEditing ? 'true' : 'false'}
      onKeyDown={isEditing ? handleKeyDown : undefined}
      onBlur={isEditing ? handleBlur : undefined}
    >
      <div className={styles.content}>{control}</div>

      {isEditing && actionButtons ? (
        <span className={styles.actions}>
          <IconButton size="sm" aria-label={cancelLabel} onMouseDown={handleActionMouseDown} onClick={cancel}>
            <CloseIcon />
          </IconButton>
          <IconButton size="sm" aria-label={confirmLabel} onMouseDown={handleActionMouseDown} onClick={confirm}>
            <CheckIcon />
          </IconButton>
        </span>
      ) : null}
    </div>
  );
});

InlineEdit.displayName = 'InlineEdit';
