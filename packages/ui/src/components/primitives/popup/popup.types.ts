import * as React from 'react';

export type PopupAlignment = 'topLeft' | 'topRight' | 'topCenter' | 'bottomLeft' | 'bottomRight' | 'bottomCenter';

export type PopupPadding = 'sm' | 'md' | 'lg';

export interface PopupProps {
  /** The single trigger element the popup is anchored to. Cloned to attach a measurement ref and `aria-expanded`/`aria-controls`. */
  children: React.ReactElement;
  /** Content rendered inside the floating panel while `open` is true. */
  content: React.ReactNode;
  /** Controlled visibility - Popup renders nothing when false. */
  open: boolean;
  /** Called with `false` when Escape or an outside click should dismiss the popup. Popup does not change its own visibility - the consumer updates `open` in response. */
  onOpenChange?: (open: boolean) => void;
  /** Which side of the trigger the panel opens on, and how it aligns. Falls back to whichever alignment overflows the viewport least. */
  alignment?: PopupAlignment;
  /** Dismiss on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  /** Dismiss on a pointer press outside the trigger and panel. Defaults to true. */
  closeOnOutsideClick?: boolean;
  /** Id applied to the floating panel; also wired to the trigger's `aria-controls` while open. Generated when omitted. */
  id?: string;
  /** ARIA role for the floating panel. No default - the role depends on what the consumer is building (menu, dialog, alert, ...). */
  role?: React.AriaRole;
  /** Composes with the panel's class list. */
  className?: string;
  /**
   * Skips Popup's own visual skin (background, border, padding, radius, shadow) on the panel,
   * leaving only the structural positioning (fixed placement, content-hugging size, fade
   * animation). Set this when a consumer needs Popup's positioning/dismissal but has an entirely
   * different visual design of its own (e.g. Tooltip). Defaults to false.
   */
  unstyled?: boolean;
  /**
   * Padding for Popup's own visual skin, mapped to the spacing scale. Defaults to `'lg'`
   * (`--spacing-lg`), matching Figma's `popup` component. Use `'sm'`/`'md'` for denser content
   * (e.g. a menu's rows) while still sharing Popup's background/border/radius/shadow. Ignored when
   * `unstyled` is true.
   */
  padding?: PopupPadding;
  /**
   * Sets `aria-expanded`/`aria-controls` on the trigger while true (the default). Set to false
   * when the consumer already manages the trigger's own ARIA relationship to the panel content
   * (e.g. Tooltip uses `aria-describedby`, since `aria-expanded`/`aria-controls` are disclosure-
   * widget attributes that don't apply to a supplemental hint).
   */
  manageTriggerAria?: boolean;
}
