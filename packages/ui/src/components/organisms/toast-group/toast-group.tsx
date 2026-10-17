import * as React from 'react';
import { Toast } from '../toast';
import { resolveToastTone, TOAST_STATUS_LABELS } from '../toast/toast-status';
import { LAYERS } from '../../primitives/layers';
import { toastStore } from './toast-store';
import type { ToastItem } from './toast-store';
import styles from './toast-group.module.css';
import type { ToastGroupProps } from './toast-group.types';

const DEFAULT_DURATION = 5000;
const COLLAPSED_PEEK = 16; // px each stacked toast peeks above the front one
const SCALE_STEP = 0.05; // scale reduction per depth when collapsed
const EXPANDED_GAP = 8; // px between toasts when the stack is expanded
const SWIPE_DISMISS_THRESHOLD = 80; // px of horizontal travel before a swipe dismisses
// The exit fade is --fade-long (--duration-slow, 300ms); the toast is removed once it has finished.
const EXIT_MS = 300;

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/** One stack item (internal). */
interface StackedToastProps {
  /** The toast to show, from the store. */
  item: ToastItem;
  /** Its depth in the stack; 0 is the front (newest). */
  index: number;
  /** Whether the stack is expanded into a list. */
  expanded: boolean;
  /** Whether it's past `maxVisible` and waiting: invisible, inert, and its timer paused. */
  hidden: boolean;
  /** Its distance from the bottom in the expanded list, in px. */
  offset: number;
  /** The group's default duration, used when the toast has none. */
  duration: number;
  /** Reports the item's height, for the expanded layout. */
  onHeight: (id: string, height: number) => void;
  /** Removes the toast from the store, after its exit fade. */
  onDismiss: (id: string) => void;
}

function StackedToast({ item, index, expanded, hidden, offset, duration, onHeight, onDismiss }: StackedToastProps) {
  const ref = React.useRef<HTMLLIElement>(null);
  const [exiting, setExiting] = React.useState(false);
  const [entered, setEntered] = React.useState(false);
  const [swipeX, setSwipeX] = React.useState(0);
  const pointerStart = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return undefined;
    }

    const report = () => onHeight(item.id, el.offsetHeight);
    report();

    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [item.id, onHeight]);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleDismiss = React.useCallback(() => {
    setExiting(true);
    window.setTimeout(() => onDismiss(item.id), EXIT_MS);
  }, [item.id, onDismiss]);

  // A loading toast stays until it's updated; otherwise the toast's own duration, else the group's.
  const isLoading = resolveToastTone(item.tone, item.appearance) === 'loading';
  const toastDuration = item.duration ?? (isLoading ? Infinity : duration);
  // The timer runs only while the toast is in view and the stack is collapsed. Pausing keeps the time
  // left and the timer resumes from it; an update (a new item) or a new duration starts it over.
  const paused = expanded || hidden || exiting;
  const timeLeft = React.useRef<{ item: ToastItem; total: number; remaining: number } | null>(null);
  React.useEffect(() => {
    if (!timeLeft.current || timeLeft.current.item !== item || timeLeft.current.total !== toastDuration) {
      timeLeft.current = { item, total: toastDuration, remaining: toastDuration };
    }

    if (paused || !Number.isFinite(toastDuration) || toastDuration <= 0) {
      return undefined;
    }

    const state = timeLeft.current;
    const startedAt = Date.now();
    const timer = window.setTimeout(handleDismiss, Math.max(0, state.remaining));
    return () => {
      window.clearTimeout(timer);
      state.remaining -= Date.now() - startedAt;
    };
  }, [paused, item, toastDuration, handleDismiss]);

  const handlePointerDown = (event: React.PointerEvent<HTMLLIElement>) => {
    if (event.button !== 0) {
      return;
    }
    pointerStart.current = event.clientX;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLLIElement>) => {
    if (pointerStart.current === null) {
      return;
    }
    setSwipeX(event.clientX - pointerStart.current);
  };

  const endSwipe = (event: React.PointerEvent<HTMLLIElement>) => {
    if (pointerStart.current === null) {
      return;
    }
    const delta = event.clientX - pointerStart.current;
    pointerStart.current = null;

    if (Math.abs(delta) > SWIPE_DISMISS_THRESHOLD) {
      setSwipeX(Math.sign(delta) * 480);
      handleDismiss();
    } else {
      setSwipeX(0);
    }
  };

  const translateY = expanded ? -offset : -(index * COLLAPSED_PEEK);
  const scale = expanded ? 1 : Math.max(0, 1 - index * SCALE_STEP);

  const style = {
    '--toast-y': `${translateY}px`,
    '--toast-scale': scale,
    '--toast-x': `${swipeX}px`,
    zIndex: 1000 - index,
    opacity: hidden ? 0 : undefined,
    pointerEvents: hidden ? 'none' : undefined,
  } as React.CSSProperties;

  return (
    <li
      ref={ref}
      className={styles.item}
      // A waiting toast stays out of the accessibility tree and the tab order until it's in view.
      inert={hidden || undefined}
      aria-hidden={hidden || undefined}
      data-entered={entered ? 'true' : undefined}
      data-exiting={exiting ? 'true' : undefined}
      data-swiping={swipeX !== 0 ? 'true' : undefined}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endSwipe}
      onPointerCancel={endSwipe}
    >
      <Toast
        // The group's live region announces each toast, so the card isn't a live region itself.
        role="none"
        tone={item.tone ?? item.appearance}
        title={item.title}
        description={item.description}
        actions={item.actions}
        expanded={expanded}
        isDismissible={item.isDismissible}
        onDismiss={handleDismiss}
      />
    </li>
  );
}

/**
 * What the live region reads for a toast: its status, title, and description. The live region is the
 * only place a toast is announced from; the cards in the list aren't live regions.
 */
function Announcement({ item }: { item: ToastItem }) {
  const status = TOAST_STATUS_LABELS[resolveToastTone(item.tone, item.appearance)];
  const hasDescription = item.description !== undefined && item.description !== null;

  return (
    <div>
      {status ? `${status}: ` : null}
      {item.title}
      {hasDescription ? <div>{item.description}</div> : null}
    </div>
  );
}

export function ToastGroup({ maxVisible = 3, duration = DEFAULT_DURATION, label = 'Notifications', className }: ToastGroupProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  // The stack is expanded while it's hovered or while focus is inside it; either one keeps it open.
  const [hovered, setHovered] = React.useState(false);
  const [focusWithin, setFocusWithin] = React.useState(false);
  const [heights, setHeights] = React.useState<Record<string, number>>({});
  const listRef = React.useRef<HTMLOListElement>(null);

  React.useEffect(() => toastStore.subscribe(setToasts), []);

  // The list leaves the page with its last toast, and no pointer or blur event says so: start over.
  if (toasts.length === 0 && (hovered || focusWithin)) {
    setHovered(false);
    setFocusWithin(false);
  }

  // A focused toast that's removed takes focus with it, and not every browser fires blur for that.
  React.useEffect(() => {
    if (focusWithin && !listRef.current?.contains(document.activeElement)) {
      setFocusWithin(false);
    }
  }, [toasts, focusWithin]);

  const setHeight = React.useCallback((id: string, height: number) => {
    setHeights((prev) => (prev[id] === height ? prev : { ...prev, [id]: height }));
  }, []);

  const dismiss = React.useCallback((id: string) => toastStore.dismiss(id), []);

  const expanded = hovered || focusWithin;

  // The live region stays on the page, so screen readers announce what's added to it. Each toast in
  // view is added as it arrives, and again when it's updated (a new revision); a waiting toast is
  // added when it comes into view.
  const liveRegion = (
    <div className={styles.announcer} role="status" aria-atomic="false">
      {toasts.slice(0, maxVisible).map((item) => (
        <Announcement key={`${item.id}-${item.revision}`} item={item} />
      ))}
    </div>
  );

  if (toasts.length === 0) {
    return liveRegion;
  }

  // toasts[0] is the newest = the front of the stack (index 0). Build cumulative offsets so the
  // expanded layout places each toast above the ones in front of it. Only the first `maxVisible`
  // toasts are shown (stacked or expanded); the rest stay queued and move in as visible ones dismiss.
  const offsets: number[] = [];
  let cumulative = 0;
  toasts.forEach((item, index) => {
    offsets[index] = cumulative;
    if (index < maxVisible) {
      cumulative += (heights[item.id] ?? 0) + EXPANDED_GAP;
    }
  });

  const frontHeight = heights[toasts[0].id] ?? 0;
  const totalHeight = Math.max(0, cumulative - EXPANDED_GAP);
  // When collapsed, grow the hover region to cover the toasts peeking up behind the front one.
  const collapsedPeek = Math.min(maxVisible - 1, toasts.length - 1) * COLLAPSED_PEEK;
  const regionHeight = expanded ? totalHeight : frontHeight + collapsedPeek;

  return (
    <>
      {liveRegion}
      <ol
        ref={listRef}
        aria-label={label}
        className={mergeClassNames(styles.region, className)}
        data-expanded={expanded ? 'true' : undefined}
        // Above Modal Dialog and below Popup: see primitives/layers.ts.
        style={{ zIndex: LAYERS.toast, ...(regionHeight ? { blockSize: `${regionHeight}px` } : {}) }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocusCapture={() => setFocusWithin(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setFocusWithin(false);
          }
        }}
      >
        {toasts.map((item, index) => (
          <StackedToast
            key={item.id}
            item={item}
            index={index}
            expanded={expanded}
            hidden={index >= maxVisible}
            offset={offsets[index]}
            duration={duration}
            onHeight={setHeight}
            onDismiss={dismiss}
          />
        ))}
      </ol>
    </>
  );
}

ToastGroup.displayName = 'ToastGroup';
