import * as React from 'react';
import { Toast } from '../toast';
import { toastStore } from './toast-store';
import type { ToastItem } from './toast-store';
import styles from './toast-group.module.css';
import type { ToastGroupProps } from './toast-group.types';

const DEFAULT_DURATION = 5000;
const COLLAPSED_PEEK = 16; // px each stacked toast peeks above the front one
const SCALE_STEP = 0.05; // scale reduction per depth when collapsed
const EXPANDED_GAP = 8; // px between toasts when the stack is expanded
const SWIPE_DISMISS_THRESHOLD = 80; // px of horizontal travel before a swipe dismisses
const EXIT_MS = 200; // exit-animation duration before the toast is removed

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

interface StackedToastProps {
  item: ToastItem;
  index: number;
  expanded: boolean;
  hidden: boolean;
  offset: number;
  duration: number;
  onHeight: (id: string, height: number) => void;
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

  const toastDuration = item.duration ?? duration;
  React.useEffect(() => {
    if (expanded || exiting || !Number.isFinite(toastDuration) || toastDuration <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(handleDismiss, toastDuration);
    return () => window.clearTimeout(timer);
  }, [expanded, exiting, toastDuration, handleDismiss]);

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
        appearance={item.appearance}
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

export function ToastGroup({ maxVisible = 3, duration = DEFAULT_DURATION, label = 'Notifications', className }: ToastGroupProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [expanded, setExpanded] = React.useState(false);
  const [heights, setHeights] = React.useState<Record<string, number>>({});

  React.useEffect(() => toastStore.subscribe(setToasts), []);

  const setHeight = React.useCallback((id: string, height: number) => {
    setHeights((prev) => (prev[id] === height ? prev : { ...prev, [id]: height }));
  }, []);

  const dismiss = React.useCallback((id: string) => toastStore.dismiss(id), []);

  if (toasts.length === 0) {
    return null;
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
    <ol
      aria-label={label}
      className={mergeClassNames(styles.region, className)}
      data-expanded={expanded ? 'true' : undefined}
      style={regionHeight ? { blockSize: `${regionHeight}px` } : undefined}
      onPointerEnter={() => setExpanded(true)}
      onPointerLeave={() => setExpanded(false)}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setExpanded(false);
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
  );
}

ToastGroup.displayName = 'ToastGroup';
