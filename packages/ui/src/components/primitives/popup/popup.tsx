import * as React from 'react';
import { createPortal } from 'react-dom';
import styles from './popup.module.css';
import type { PopupAlignment, PopupPadding, PopupProps } from './popup.types';

type Side = 'top' | 'bottom';
type Align = 'left' | 'right' | 'center';

const ALIGNMENT_FALLBACKS: PopupAlignment[] = [
  'topLeft',
  'topRight',
  'topCenter',
  'bottomLeft',
  'bottomRight',
  'bottomCenter',
];

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function getPaddingClassName(padding: PopupPadding) {
  if (padding === 'none') {
    return styles.padding_none;
  }
  if (padding === 'sm') {
    return styles.padding_sm;
  }
  if (padding === 'md') {
    return styles.padding_md;
  }
  return styles.padding_lg;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(value);
        return;
      }

      (ref as React.MutableRefObject<T | null>).current = value;
    });
  };
}

function getTokenPixels(tokenName: string) {
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  return Number.parseFloat(value);
}

function splitAlignment(alignment: PopupAlignment): { side: Side; align: Align } {
  const side: Side = alignment.startsWith('top') ? 'top' : 'bottom';
  const align: Align = alignment.endsWith('Left') ? 'left' : alignment.endsWith('Right') ? 'right' : 'center';
  return { side, align };
}

function combineAlignment(side: Side, align: Align): PopupAlignment {
  const alignPart = align === 'left' ? 'Left' : align === 'right' ? 'Right' : 'Center';
  return `${side}${alignPart}` as PopupAlignment;
}

function flipSide(alignment: PopupAlignment): PopupAlignment {
  const { side, align } = splitAlignment(alignment);
  return combineAlignment(side === 'top' ? 'bottom' : 'top', align);
}

function getAlignmentOrder(preferred: PopupAlignment) {
  // Try the same alignment on the opposite side before any other alignment, so a tied-overflow
  // fallback (e.g. topCenter -> bottomCenter) keeps the same horizontal alignment the consumer
  // asked for instead of jumping to an unrelated one earlier in ALIGNMENT_FALLBACKS.
  const flipped = flipSide(preferred);
  const rest = ALIGNMENT_FALLBACKS.filter((alignment) => alignment !== preferred && alignment !== flipped);
  return [preferred, flipped, ...rest];
}

function getCandidatePosition(
  alignment: PopupAlignment,
  triggerRect: DOMRect,
  panelRect: DOMRect,
  gap: number,
  viewportPadding: number,
) {
  const { side, align } = splitAlignment(alignment);
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const top = side === 'top' ? triggerRect.top - panelRect.height - gap : triggerRect.bottom + gap;
  const left =
    align === 'left'
      ? triggerRect.left
      : align === 'right'
        ? triggerRect.right - panelRect.width
        : triggerRect.left + triggerRect.width / 2 - panelRect.width / 2;

  const overflowTop = Math.max(0, viewportPadding - top);
  const overflowLeft = Math.max(0, viewportPadding - left);
  const overflowBottom = Math.max(0, top + panelRect.height - (viewportHeight - viewportPadding));
  const overflowRight = Math.max(0, left + panelRect.width - (viewportWidth - viewportPadding));

  const clampedTop = Math.min(
    Math.max(top, viewportPadding),
    Math.max(viewportPadding, viewportHeight - panelRect.height - viewportPadding),
  );
  const clampedLeft = Math.min(
    Math.max(left, viewportPadding),
    Math.max(viewportPadding, viewportWidth - panelRect.width - viewportPadding),
  );

  return {
    alignment,
    top: clampedTop,
    left: clampedLeft,
    overflow: overflowTop + overflowLeft + overflowBottom + overflowRight,
  };
}

export const Popup = React.memo(function Popup({
  children,
  content,
  open,
  onOpenChange,
  alignment = 'topLeft',
  closeOnEscape = true,
  closeOnOutsideClick = true,
  id,
  role,
  className,
  unstyled = false,
  padding = 'lg',
  manageTriggerAria = true,
}: PopupProps) {
  const generatedId = React.useId();
  const contentId = id ?? generatedId;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [resolvedAlignment, setResolvedAlignment] = React.useState<PopupAlignment>(alignment);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [triggerOutOfView, setTriggerOutOfView] = React.useState(false);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current || !panelRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    const gap = getTokenPixels('--spacing-sm');
    const viewportPadding = gap;

    // Without this, clamping the panel to stay fully on-screen (below) leaves it visibly "stuck"
    // at the viewport edge once the trigger scrolls out of view entirely, floating with no visible
    // anchor. Hiding it instead - rather than clamping to an edge - until the trigger scrolls back
    // into view at least partially. Gated on the trigger actually having a measured size - an
    // unlaid-out trigger (e.g. jsdom's default zero-rect in tests that don't mock layout) would
    // otherwise always read as "out of view" at (0,0,0,0).
    const hasMeasuredSize = triggerRect.width > 0 || triggerRect.height > 0;
    const isTriggerOutOfView =
      hasMeasuredSize &&
      (triggerRect.bottom <= 0 ||
        triggerRect.top >= window.innerHeight ||
        triggerRect.right <= 0 ||
        triggerRect.left >= window.innerWidth);
    setTriggerOutOfView(isTriggerOutOfView);

    const bestCandidate = getAlignmentOrder(alignment)
      .map((candidateAlignment) => getCandidatePosition(candidateAlignment, triggerRect, panelRect, gap, viewportPadding))
      .sort((left, right) => left.overflow - right.overflow)[0];

    if (!bestCandidate) {
      return;
    }

    setResolvedAlignment(bestCandidate.alignment);
    setPosition({ top: bestCandidate.top, left: bestCandidate.left });
  }, [alignment]);

  React.useLayoutEffect(() => {
    if (!open || typeof window === 'undefined') {
      return;
    }

    updatePosition();

    const handleWindowUpdate = () => {
      updatePosition();
    };

    window.addEventListener('resize', handleWindowUpdate);
    window.addEventListener('scroll', handleWindowUpdate, true);

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleWindowUpdate) : null;
    if (resizeObserver && triggerRef.current) {
      resizeObserver.observe(triggerRef.current);
    }
    if (resizeObserver && panelRef.current) {
      resizeObserver.observe(panelRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleWindowUpdate);
      window.removeEventListener('scroll', handleWindowUpdate, true);
      resizeObserver?.disconnect();
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (closeOnEscape && event.key === 'Escape') {
        onOpenChange?.(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!closeOnOutsideClick) {
        return;
      }

      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }

      onOpenChange?.(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [open, closeOnEscape, closeOnOutsideClick, onOpenChange]);

  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & { 'aria-controls'?: string; ref?: React.Ref<HTMLElement> }
  >;
  const childProps = child.props;
  const childRef = (child as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref;

  const clonedChild = React.cloneElement(child, {
    ref: mergeRefs(childRef, triggerRef),
    ...(manageTriggerAria
      ? {
          'aria-expanded': open,
          'aria-controls': open ? contentId : childProps['aria-controls'],
        }
      : {}),
  });

  return (
    <>
      {clonedChild}
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              id={contentId}
              role={role}
              className={mergeClassNames(
                styles.panel,
                !unstyled && styles.panelSurface,
                !unstyled && getPaddingClassName(padding),
                className,
              )}
              data-alignment={resolvedAlignment}
              data-trigger-out-of-view={triggerOutOfView ? 'true' : undefined}
              style={
                triggerOutOfView || !position
                  ? { visibility: 'hidden' }
                  : { top: `${position.top}px`, left: `${position.left}px` }
              }
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
});

Popup.displayName = 'Popup';
