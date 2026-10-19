import * as React from 'react';

export type PopupAlignment = 'topLeft' | 'topRight' | 'topCenter' | 'bottomLeft' | 'bottomRight' | 'bottomCenter';

export type PopupPadding = 'none' | 'sm' | 'md' | 'lg';

export interface PopupProps {
  /** The trigger: one element, which Popup clones to add a ref and, with `manageTriggerAria`, `aria-expanded` and `aria-controls`. */
  children: React.ReactElement;
  /** What the panel shows while `open` is true. It can be interactive. */
  content: React.ReactNode;
  /** Whether the panel is shown. Popup has no state of its own: when `false`, only the trigger renders. */
  open: boolean;
  /** Called with `false` on Escape or a press outside the trigger and the panel. Popup doesn't close itself: set `open` in response. */
  onOpenChange?: (open: boolean) => void;
  /** The side of the trigger the panel opens on and the edge it lines up with. A preference: if it overflows the viewport, the panel moves to the alignment that overflows least. */
  alignment?: PopupAlignment;
  /** Calls `onOpenChange(false)` when Escape is pressed while open, wherever focus is, if this is the topmost open Popup or dialog: one opened inside a Modal Dialog or another Popup closes first. Even with it off, an open Popup keeps the layers under it from taking Escape. */
  closeOnEscape?: boolean;
  /** Calls `onOpenChange(false)` on a pointer press outside the trigger and the panel. */
  closeOnOutsideClick?: boolean;
  /** The panel's id, which the trigger's `aria-controls` points to while open. Generated when omitted. */
  id?: string;
  /** The panel's role, such as `menu`, `dialog`, or `tooltip`. There's no default: pass the role of what you're building. */
  role?: React.AriaRole;
  /** Added to the panel's classes. */
  className?: string;
  /** Leaves off Popup's surface (background, border, padding, radius, shadow), keeping position and the fade. For a different look of your own, as Tooltip has. */
  unstyled?: boolean;
  /** The surface's padding: 0, 8, 12, or 16px from `none` to `lg`. Ignored when `unstyled` is set. */
  padding?: PopupPadding;
  /** Sets `aria-expanded` and `aria-controls` on the trigger. Turn it off when the trigger relates to the panel another way, as Tooltip's `aria-describedby` does. */
  manageTriggerAria?: boolean;
  /** An element to position against, match in width, and treat as inside for outside presses, in place of the trigger. Date Picker and Time Picker pass their field frame, which holds the trigger. */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /** Makes the panel as wide as the trigger, or the `anchorRef` element, instead of its content. The content has to be able to fill that width. */
  matchTriggerWidth?: boolean;
}
