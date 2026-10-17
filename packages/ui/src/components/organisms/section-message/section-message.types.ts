import type * as React from 'react';

export type SectionMessageTone = 'information' | 'success' | 'warning' | 'error';
/** @deprecated Renamed to `SectionMessageTone`. */
export type SectionMessageAppearance = SectionMessageTone;

export interface SectionMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** What the message means. Sets the background, the border, and the status icon. Defaults to `information`. */
  tone?: SectionMessageTone;
  /** @deprecated Renamed to `tone`, the name every component uses for meaning. Still accepted. */
  appearance?: SectionMessageTone;
  /**
   * Visually hidden text read before the title, since the icon is decorative. Defaults to the tone's
   * name: "Information", "Success", "Warning", or "Error". Pass a translation, or an empty string to
   * leave it out.
   */
  statusLabel?: string;
  /** A bold line above the description. Leave it out for a description on its own. */
  title?: React.ReactNode;
  /** The description. It wraps onto as many lines as it needs. */
  children: React.ReactNode;
  /**
   * Actions below the description, usually Link Buttons. Put two or more in a Button Group; pass a
   * single one on its own. Section Message adds no separators between them.
   */
  actions?: React.ReactNode;
  /** Shows a dismiss button in the top corner. Dismissing hides the message for as long as it's mounted. */
  isDismissible?: boolean;
  /** The dismiss button's accessible name and tooltip. Defaults to "Dismiss"; pass a translation. */
  dismissLabel?: string;
  /** Called when the dismiss button is clicked. The message hides itself either way. */
  onDismiss?: () => void;
  /**
   * Defaults to `status`, a polite live region. Use `alert` for an urgent error that must interrupt
   * what the user is doing.
   */
  role?: React.AriaRole;
}
