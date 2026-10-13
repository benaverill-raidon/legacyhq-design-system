import type * as React from 'react';

export type SectionMessageTone = 'information' | 'success' | 'warning' | 'error';
/** @deprecated Renamed to `SectionMessageTone`. */
export type SectionMessageAppearance = SectionMessageTone;

export interface SectionMessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /** Semantic tone - sets the tinted background, border, and status icon. Defaults to `information`. */
  tone?: SectionMessageTone;
  /** @deprecated Renamed to `tone`, the name every component uses for meaning. Still accepted. */
  appearance?: SectionMessageTone;
  /**
   * Read by assistive technology before the message, since the status icon is decorative. Defaults
   * to the tone's name ("Information", "Success", "Warning", "Error"); pass a translation, or an empty string to omit it.
   */
  statusLabel?: string;
  /** Optional bold title, shown above the description. Omit to render the description alone. */
  title?: React.ReactNode;
  /** The message body. */
  children: React.ReactNode;
  /**
   * Optional trailing actions - typically `LinkButton` elements. Wrap multiple actions in a
   * `ButtonGroup` (which lays them out as a row); a single action can be passed bare.
   */
  actions?: React.ReactNode;
  /** Show a dismiss button in the top-right corner. Defaults to `false`. */
  isDismissible?: boolean;
  /** Accessible name for the dismiss button. Defaults to "Dismiss". */
  dismissLabel?: string;
  /** Called when the dismiss button is clicked. The message also hides itself. */
  onDismiss?: () => void;
}
