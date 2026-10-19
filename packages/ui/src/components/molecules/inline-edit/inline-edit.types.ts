import type * as React from 'react';

/** The props Inline Edit sets on its child, so the child must accept them (Text Field and Text Area do). */
export interface InlineEditableProps {
  /** Design-system control size; native input numeric sizes do not affect action alignment. */
  size?: 'sm' | 'md' | 'lg' | number;
  /** Set to `value` while read-only, and to the draft while editing. */
  value?: string;
  /** Replaced while editing, to track the draft. */
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  /** Replaced while read-only: focusing the child starts editing. */
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  /** Set to `true` while read-only, so the child stays focusable but can't be edited. */
  readOnly?: boolean;
  /** Accepted for the child's own use; Inline Edit doesn't set it. */
  autoFocus?: boolean;
  /** Wrapped while read-only: it still runs, then a click starts editing (the field may already have focus). */
  onClick?: React.MouseEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  /** Wrapped while read-only: it still runs, then Enter starts editing (the field may already have focus). */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  /** Inside a Table's editable cell, replaced by an edit icon while read-only and removed while editing. */
  iconAfter?: React.ReactNode;
}

export interface InlineEditProps {
  /** The last confirmed value. Owned by the parent - InlineEdit only tracks the in-progress draft. */
  value: string;
  /** A single controlled input-like element (e.g. `<TextField context="inline" />`) InlineEdit clones for both the read-only display and the editable control. */
  children: React.ReactElement<InlineEditableProps>;
  /**
   * Called with the draft when confirmed: by the confirm button, Enter (Ctrl/Cmd+Enter in a
   * textarea), or focus leaving Inline Edit. Leaving focus with an unchanged draft just ends editing
   * without calling it.
   */
  onConfirm?: (value: string) => void;
  /** Called when the cancel button (or Escape) discards the draft and reverts to `value`. */
  onCancel?: () => void;
  /** Whether to render the confirm/cancel IconButton pair while editing. Enter/Escape still work when false. */
  actionButtons?: boolean;
  /** Where to float the action buttons. 'below' (default) places them beneath the field; 'end' places them outside its trailing edge without shrinking it. Allow space outside the field for the buttons. */
  actionPlacement?: 'below' | 'end';
  /** End-placed action alignment. start centers within the child's minimum sm/md/lg control height at the top, so actions stay fixed as multiline content grows. */
  actionAlignment?: 'center' | 'start';
  /** Accessible name, and tooltip, of the confirm button. Defaults to `Confirm`. */
  confirmLabel?: string;
  /** Accessible name, and tooltip, of the cancel button. Defaults to `Cancel`. */
  cancelLabel?: string;
  /** Added to the root `div`'s classes. */
  className?: string;
}
