import type * as React from 'react';

export interface InlineEditableProps {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  autoFocus?: boolean;
}

export interface InlineEditProps {
  /** The last confirmed value. Owned by the parent - InlineEdit only tracks the in-progress draft. */
  value: string;
  /** A single controlled input-like element (e.g. `<TextField appearance="subtle" />`) InlineEdit clones for both the read-only display and the editable control. */
  children: React.ReactElement<InlineEditableProps>;
  /** Called with the draft value when the confirm button (or Enter) commits the edit. */
  onConfirm?: (value: string) => void;
  /** Called when the cancel button (or Escape) discards the draft and reverts to `value`. */
  onCancel?: () => void;
  /** Whether to render the confirm/cancel IconButton pair while editing. Enter/Escape still work when false. */
  actionButtons?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
}
