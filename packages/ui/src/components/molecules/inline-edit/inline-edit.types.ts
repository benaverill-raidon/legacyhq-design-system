import type * as React from 'react';

export interface InlineEditableProps {
  /** Design-system control size; native input numeric sizes do not affect action alignment. */
  size?: 'sm' | 'md' | 'lg' | number;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  readOnly?: boolean;
  autoFocus?: boolean;
}

export interface InlineEditProps {
  /** The last confirmed value. Owned by the parent - InlineEdit only tracks the in-progress draft. */
  value: string;
  /** A single controlled input-like element (e.g. `<TextField appearance="subtle" />`) InlineEdit clones for both the read-only display and the editable control. */
  children: React.ReactElement<InlineEditableProps>;
  /** Called with the draft when confirmed. Enter confirms single-line fields; Ctrl/Cmd+Enter confirms textareas. */
  onConfirm?: (value: string) => void;
  /** Called when the cancel button (or Escape) discards the draft and reverts to `value`. */
  onCancel?: () => void;
  /** Whether to render the confirm/cancel IconButton pair while editing. Enter/Escape still work when false. */
  actionButtons?: boolean;
  /** Where to float the action buttons. 'below' (default) places them beneath the field; 'end' places them outside its trailing edge without shrinking it. Allow space outside the field for the buttons. */
  actionPlacement?: 'below' | 'end';
  /** End-placed action alignment. start centers within the child's minimum sm/md/lg control height at the top, so actions stay fixed as multiline content grows. */
  actionAlignment?: 'center' | 'start';
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
}
