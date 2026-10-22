import * as React from 'react';

/**
 * Keeps focus in a group when the item someone just used is removed from it (Chip Group's chips,
 * Tag Group's tags). Without this, removing the focused item drops focus to the page, and a
 * keyboard or screen-reader user has to find their way back from the top.
 *
 * The group's items are its root's element children. When the item holding the control someone
 * focused or pressed leaves the DOM, and focus went with it (to the page body), focus moves to:
 * 1. the item that now takes its place (the next one),
 * 2. or, if it was the last, the item before it,
 * 3. or, if none is left, the group's root itself, which takes `tabindex="-1"` for it.
 * Within the item, it lands on the control in the same place counted from the end, so removing with
 * one chip's remove button lands on the next chip's remove button, and falls back to the first.
 * Items with no enabled control are skipped. If the page has already moved focus, it's left alone.
 *
 * Removal is watched with a MutationObserver on the root, so it works however the item was removed:
 * the group re-rendering with fewer children, or a child component removing its own.
 */

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]';

interface UsedControl {
  element: HTMLElement;
  /** The control's position among its item's controls, counted from the end. */
  positionFromEnd: number;
}

function getControls(item: Element): HTMLElement[] {
  const candidates = [item, ...Array.from(item.querySelectorAll(FOCUSABLE))];
  return candidates.filter(
    (candidate): candidate is HTMLElement =>
      candidate instanceof HTMLElement &&
      candidate.matches(FOCUSABLE) &&
      candidate.tabIndex >= 0 &&
      candidate.getAttribute('aria-disabled') !== 'true',
  );
}

/** The root's child that holds `element`, or null when `element` isn't in the root's DOM (a portal). */
function getItem(root: HTMLElement, element: Element): Element | null {
  let node: Element | null = element;
  while (node && node.parentElement !== root) {
    node = node.parentElement;
  }
  return node;
}

function focusInItem(item: Element, positionFromEnd: number) {
  const controls = getControls(item);
  if (controls.length === 0) {
    return false;
  }
  const index = controls.length - 1 - positionFromEnd;
  (controls[index] ?? controls[0]).focus();
  return true;
}

function isFocusLost() {
  const active = document.activeElement;
  return !active || active === document.body || !active.isConnected;
}

export function useFocusAfterRemoval<T extends HTMLElement>() {
  const rootRef = React.useRef<T | null>(null);
  const usedRef = React.useRef<UsedControl | null>(null);
  const clearTimerRef = React.useRef<number | undefined>(undefined);

  const remember = React.useCallback((target: EventTarget | null) => {
    const root = rootRef.current;
    if (!root || !(target instanceof HTMLElement)) {
      return;
    }
    const item = getItem(root, target);
    // Focus inside a portal (a chip's open menu) keeps the control that opened it.
    if (!item) {
      return;
    }
    const controls = getControls(item);
    const control = controls.find((candidate) => candidate === target || candidate.contains(target)) ?? target;
    const index = controls.indexOf(control);
    usedRef.current = {
      element: control,
      positionFromEnd: index === -1 ? 0 : controls.length - 1 - index,
    };
  }, []);

  const handleFocus = React.useCallback(
    (event: React.FocusEvent<T>) => {
      window.clearTimeout(clearTimerRef.current);
      remember(event.target);
    },
    [remember],
  );

  // React focus events bubble through portals, so focus moving from a chip into its own menu
  // fires a focus here right after this blur and cancels the clear.
  const handleBlur = React.useCallback(() => {
    window.clearTimeout(clearTimerRef.current);
    clearTimerRef.current = window.setTimeout(() => {
      usedRef.current = null;
    });
  }, []);

  // A click doesn't focus a button in every browser (Safari), so a press counts as using it too.
  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<T>) => {
      remember(event.target);
    },
    [remember],
  );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof MutationObserver === 'undefined') {
      return undefined;
    }

    const observer = new MutationObserver((records) => {
      const used = usedRef.current;
      if (!used || used.element.isConnected) {
        return;
      }
      usedRef.current = null;
      if (!isFocusLost()) {
        return;
      }

      const removal = records.find((record) =>
        Array.from(record.removedNodes).some((node) => node === used.element || node.contains(used.element)),
      );
      let previous = removal?.previousSibling ?? null;
      while (previous && !(previous instanceof Element)) {
        previous = previous.previousSibling;
      }
      const items = Array.from(root.children);
      // The removed item's slot: just after the item before it, or the first slot if it was first.
      let slot = 0;
      if (previous instanceof Element && previous.isConnected && previous.parentElement === root) {
        slot = items.indexOf(previous) + 1;
      } else if (previous) {
        slot = items.length;
      }

      const after = items.slice(slot);
      const before = items.slice(0, slot).reverse();
      for (const item of [...after, ...before]) {
        if (focusInItem(item, used.positionFromEnd)) {
          return;
        }
      }

      if (!root.hasAttribute('tabindex')) {
        root.setAttribute('tabindex', '-1');
      }
      root.focus();
    });

    observer.observe(root, { childList: true });
    return () => {
      observer.disconnect();
      window.clearTimeout(clearTimerRef.current);
    };
  }, []);

  return { rootRef, handleFocus, handleBlur, handlePointerDown };
}
