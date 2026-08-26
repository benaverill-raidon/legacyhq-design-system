import type * as React from 'react';

export type InlineMessageTone = 'default' | 'info' | 'success' | 'warning' | 'error' | 'discovery';

export interface InlineMessageProps {
  /** Bold lead text. */
  title: React.ReactNode;
  /** Optional muted trailing text, shown after the title. */
  secondaryText?: React.ReactNode;
  /** Semantic tone - selects the status icon and the tint shown while open. */
  tone?: InlineMessageTone;
  /**
   * Detail content revealed in a popup below the row when clicked. Omitting it renders a plain,
   * non-interactive status row with no button, no popup, and no expand affordance.
   */
  content?: React.ReactNode;
  /** Controlled open state for the detail popup. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. Defaults to false. */
  defaultOpen?: boolean;
  /** Called with the next open value whenever the row is clicked. */
  onOpenChange?: (open: boolean) => void;
  /** Composes with the root row's class list. */
  className?: string;
  /**
   * Documentation-only: mirrors `:hover`/`:focus-visible` as a static Storybook regression
   * reference, the same convention Button/Checkbox/Switch use. Not part of the public API.
   */
  'data-force-state'?: 'hover' | 'focus' | 'press';
}
