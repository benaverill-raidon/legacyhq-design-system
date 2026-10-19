import * as React from 'react';

/**
 * Layering for everything that floats above the page, in one place: the stacking order (z-index)
 * and which open layer Escape belongs to.
 *
 * z-index isn't a design token: Figma has no stacking order and nothing about it changes with the
 * theme, so these are code-only values, set inline by the components that use them. From the bottom:
 *
 * - `dialog`: Modal Dialog's backdrop and panel.
 * - `toast`: Toast Group's stack, above a dialog so a toast raised from inside one is seen.
 * - `popup`: Popup's panel, and everything built on it (Tooltip, Dropdown Menu, Select, the
 *   pickers, Inline Message). Top, because a popup belongs to a trigger that may itself be in a
 *   dialog or a toast. Popups at the same layer stack in the order they open, as later portals do.
 *
 * In-page stacking (a checkbox's input over its box, Rich Text Area's caret picker inside its
 * field) stays local to each component and is below all of these.
 */
export const LAYERS = {
  dialog: 1000,
  toast: 1100,
  popup: 1200,
} as const;

type Layer = object;

/** Open layers (dialogs and popups), in the order they opened: the last one is the topmost. */
const openLayers: Layer[] = [];

function isTopmost(layer: Layer) {
  return openLayers[openLayers.length - 1] === layer;
}

/**
 * Registers an open dialog or popup as a layer, and returns `claimEscape`: call it from a document
 * `keydown` listener, and act on Escape only when it returns `true`. It does so only for the
 * topmost open layer, and only once per key press, so Escape closes the open menu or tooltip
 * inside a dialog before the dialog, and the top one of two stacked dialogs. Claiming calls
 * `preventDefault()`; an Escape that something inside already handled that way (Inline Message,
 * Rich Text Area's picker, Time Picker) is never claimed.
 *
 * Layers order by when they open. A layer that's open but handles Escape itself, or not at all,
 * still sits above the ones below it, so they don't close under it.
 */
export function useLayer(open: boolean) {
  const [layer] = React.useState<Layer>(() => ({}));

  React.useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }
    openLayers.push(layer);
    return () => {
      const index = openLayers.indexOf(layer);
      if (index !== -1) {
        openLayers.splice(index, 1);
      }
    };
  }, [open, layer]);

  return React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || !isTopmost(layer)) {
        return false;
      }
      event.preventDefault();
      return true;
    },
    [layer],
  );
}
