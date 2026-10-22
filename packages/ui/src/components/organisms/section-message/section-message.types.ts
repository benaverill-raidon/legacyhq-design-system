import type * as React from 'react';

export type SectionMessageTone = 'information' | 'success' | 'warning' | 'error';
/** @deprecated Renamed to `SectionMessageTone`. */
export type SectionMessageAppearance = SectionMessageTone;

/** One entry in Section Message's `errors`: a field that needs fixing, linked to its control. */
export interface SectionMessageError {
  /** The field's name, as its label shows it. It's the link's text. */
  label: React.ReactNode;
  /**
   * What to do, shown after the label and a colon: "Enter the client's first and last name." Leave
   * it out when the field's own error says it.
   */
  message?: React.ReactNode;
  /**
   * The `id` of the control to move focus to, such as the one set on a Field's Text Field. The link's
   * `href` is `#` and this id. When that element can't take focus, such as a Radio Group's fieldset,
   * the first control inside it gets focus.
   */
  targetId: string;
}

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
  /**
   * The description. It wraps onto as many lines as it needs. Required unless `errors` lists what's
   * wrong; leave it out when the title and the list say enough.
   */
  children?: React.ReactNode;
  /**
   * The fields that need fixing, for the summary at the top of a form after a failed submit. Each is
   * listed under the description as a link that moves focus to its control. An empty array shows no
   * list.
   */
  errors?: SectionMessageError[];
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
