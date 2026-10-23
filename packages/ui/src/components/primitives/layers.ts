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
 *   dialog or a toast. A popup adds its depth (`layer.depth` from `useLayer`: how many dialogs
 *   and popups it's inside), so one opened from another popup is above it even when both mount
 *   open in the same render; otherwise popups stack in the order they open, as later portals do.
 *
 * In-page stacking (a checkbox's input over its box, Rich Text Area's caret picker inside its
 * field) stays local to each component and is below all of these.
 */
export const LAYERS = {
  dialog: 1000,
  toast: 1100,
  popup: 1200,
} as const;

/** An open dialog or popup. `parent` is the layer it was rendered inside, through portals too. */
interface Layer {
  parent: Layer | null;
  /** How many layers it's inside: 0 at the page. */
  depth: number;
}

/**
 * The layer a component is rendered inside. A dialog or popup provides its own layer to what it
 * shows (`<LayerContext.Provider value={layer}>`), so a layer opened from inside it knows it
 * belongs above it.
 */
export const LayerContext = React.createContext<Layer | null>(null);

/** Open layers (dialogs and popups), bottom to top: the last one is the topmost. */
const openLayers: Layer[] = [];

function isTopmost(layer: Layer) {
  return openLayers[openLayers.length - 1] === layer;
}

function isInside(layer: Layer, ancestor: Layer) {
  for (let current = layer.parent; current; current = current.parent) {
    if (current === ancestor) {
      return true;
    }
  }
  return false;
}

/**
 * Adds an opening layer to the stack: on top, unless a layer inside it is already open. React runs
 * a child's effects before its parent's, so a dialog and the popup inside it that mount already
 * open in the same render register popup first. The dialog then goes in below the popup, not
 * above it.
 */
function openLayer(layer: Layer) {
  const firstInside = openLayers.findIndex((open) => isInside(open, layer));
  if (firstInside === -1) {
    openLayers.push(layer);
  } else {
    openLayers.splice(firstInside, 0, layer);
  }
}

/**
 * Registers an open dialog or popup as a layer. Returns `claimEscape`: call it from a document
 * `keydown` listener, and act on Escape only when it returns `true`. It does so only for the
 * topmost open layer, and only once per key press, so Escape closes the open menu or tooltip
 * inside a dialog before the dialog, and the top one of two stacked dialogs. Claiming calls
 * `preventDefault()`; an Escape that something inside already handled that way (Inline Message,
 * Rich Text Area's picker, Time Picker) is never claimed.
 *
 * Also returns `layer`, which the component provides to what it shows through `LayerContext`, and
 * the layer's `depth`, for stacking popups inside popups.
 *
 * A layer opened from inside another (rendered inside its `LayerContext`) is always above it,
 * whichever registered first. Otherwise layers order by when they open. A layer that's open but
 * handles Escape itself, or not at all, still sits above the ones below it, so they don't close
 * under it.
 */
export function useLayer(open: boolean) {
  const parent = React.useContext(LayerContext);
  const layer = React.useMemo<Layer>(() => ({ parent, depth: parent ? parent.depth + 1 : 0 }), [parent]);

  React.useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }
    openLayer(layer);
    return () => {
      const index = openLayers.indexOf(layer);
      if (index !== -1) {
        openLayers.splice(index, 1);
      }
    };
  }, [open, layer]);

  const claimEscape = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || !isTopmost(layer)) {
        return false;
      }
      event.preventDefault();
      return true;
    },
    [layer],
  );

  return { claimEscape, layer };
}
