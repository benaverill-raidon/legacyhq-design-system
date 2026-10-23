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
  /** Set to `true` while `validate` rejects the draft, for the control's error border. Its own `true` wins. */
  invalid?: boolean;
  /** Set to `true` while `validate` rejects the draft, or passed on from Inline Edit's own (Field's). Its own value wins. */
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
  /**
   * Inline Edit's own `aria-describedby` (Field's message) is added after the child's own, and the
   * error message's id after both, while `validate` rejects the draft.
   */
  'aria-describedby'?: string;
  /** Inline Edit's own `id` (Field's) is passed on when the child sets none. */
  id?: string;
  /** Inline Edit's own `aria-labelledby` (Field's label) is passed on when the child has no name of its own. */
  'aria-labelledby'?: string;
  /** Inline Edit's own `required` (Field's) is passed on when the child sets none. */
  required?: boolean;
  /** Inline Edit's own `context` (Field's) is passed on when the child sets none. */
  context?: 'default' | 'inline';
}

export interface InlineEditProps {
  /** The last confirmed value. Owned by the parent - InlineEdit only tracks the in-progress draft. */
  value: string;
  /** A single controlled input-like element (e.g. `<TextField context="inline" />`) InlineEdit clones for both the read-only display and the editable control. */
  children: React.ReactElement<InlineEditableProps>;
  /**
   * Called with the draft when confirmed: by the confirm button, Enter (Ctrl/Cmd+Enter in a
   * textarea), or focus leaving Inline Edit. Leaving focus with an unchanged draft just ends editing
   * without calling it. With `validate`, it's called only for a draft that passes.
   */
  onConfirm?: (value: string) => void;
  /**
   * Checks the draft on every confirm: Enter, the confirm button, or focus leaving Inline Edit. Return
   * a message to reject it, or `undefined` to accept it. A rejected draft stays in the field, still
   * editing: the message shows under it in Field's error look, the field gets `aria-invalid`, and
   * focus stays in the field (or, when focus left, the draft waits there). From then on the message
   * follows the draft as it changes. Escape and the cancel button still discard it.
   */
  validate?: (value: string) => string | undefined;
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
  /**
   * Passed on to the child, so a Field around Inline Edit wires its control: clicking Field's label
   * focuses it. The child's own `id` wins.
   */
  id?: string;
  /**
   * Ids of the elements that name the child, such as Field's label. Passed on unless the child has
   * its own `aria-labelledby` or `aria-label`.
   */
  'aria-labelledby'?: string;
  /**
   * Ids of elements that describe the child, such as Field's message. Added after the child's own,
   * and before `validate`'s message while it shows.
   */
  'aria-describedby'?: string;
  /**
   * Marks the child invalid, as Field does for an error. Passed on; the child's own wins. `validate`
   * sets it too while it rejects the draft.
   */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Sets the child's native `required`, as Field does. Passed on; the child's own wins. */
  required?: boolean;
  /**
   * `inline` is passed on to a child that sets no `context` of its own (nor a deprecated
   * `appearance` or `tone`), as Field passes it when it's inline.
   */
  context?: 'default' | 'inline';
  /** Internal: Field's Storybook state preview, passed on to a child that has none. */
  'data-force-state'?: string;
}
