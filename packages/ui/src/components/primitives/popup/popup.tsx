import * as React from 'react';
import { createPortal } from 'react-dom';
import { EditableCellContext, useEditableCellSize } from '../editable-cell-context';
import { LAYERS, LayerContext, useLayer } from '../layers';
import styles from './popup.module.css';
import type { DeprecatedPopupAlignment, PopupAlignment, PopupPadding, PopupProps } from './popup.types';

type Side = 'top' | 'bottom';
type Align = 'start' | 'end' | 'center';

const ALIGNMENT_FALLBACKS: PopupAlignment[] = [
  'topStart',
  'topEnd',
  'topCenter',
  'bottomStart',
  'bottomEnd',
  'bottomCenter',
];

// The physical names alignment had before it took logical start/end, still accepted.
const DEPRECATED_ALIGNMENTS: Record<DeprecatedPopupAlignment, PopupAlignment> = {
  topLeft: 'topStart',
  topRight: 'topEnd',
  bottomLeft: 'bottomStart',
  bottomRight: 'bottomEnd',
};

function normalizeAlignment(alignment: PopupAlignment | DeprecatedPopupAlignment): PopupAlignment {
  return alignment in DEPRECATED_ALIGNMENTS
    ? DEPRECATED_ALIGNMENTS[alignment as DeprecatedPopupAlignment]
    : (alignment as PopupAlignment);
}

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
  const align: Align = alignment.endsWith('Start') ? 'start' : alignment.endsWith('End') ? 'end' : 'center';
  return { side, align };
}

function combineAlignment(side: Side, align: Align): PopupAlignment {
  const alignPart = align === 'start' ? 'Start' : align === 'end' ? 'End' : 'Center';
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
  // Placement is left-to-right only: start is the trigger's left edge and end its right edge, even
  // in a right-to-left page.
  const left =
    align === 'start'
      ? triggerRect.left
      : align === 'end'
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
  alignment: requestedAlignment = 'topStart',
  closeOnEscape = true,
  closeOnOutsideClick = true,
  id,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
  unstyled = false,
  padding = 'lg',
  manageTriggerAria = true,
  anchorRef,
  matchTriggerWidth = false,
}: PopupProps) {
  const alignment = normalizeAlignment(requestedAlignment);
  const cellSize = useEditableCellSize();
  const generatedId = React.useId();
  const contentId = id ?? generatedId;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [resolvedAlignment, setResolvedAlignment] = React.useState<PopupAlignment>(alignment);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [panelWidth, setPanelWidth] = React.useState<number | null>(null);
  const [triggerOutOfView, setTriggerOutOfView] = React.useState(false);
  // Every open Popup is a layer, even with closeOnEscape off, so a dialog under it doesn't take
  // the Escape that belongs to it. A popup or dialog opened from its content is a layer above it.
  const { claimEscape, layer } = useLayer(open);

  // The element the panel positions against and matches width to - the anchor (e.g. a field frame)
  // when given, otherwise the cloned trigger child itself.
  const getMeasureEl = React.useCallback(() => anchorRef?.current ?? triggerRef.current, [anchorRef]);

  const updatePosition = React.useCallback(() => {
    const measureEl = getMeasureEl();
    if (!measureEl || !panelRef.current) {
      return;
    }

    const triggerRect = measureEl.getBoundingClientRect();
    if (matchTriggerWidth) {
      setPanelWidth(triggerRect.width);
    }
    const panelRect = panelRef.current.getBoundingClientRect();
    const gap = getTokenPixels(cellSize ? '--spacing-xs' : '--spacing-sm');
    const viewportPadding = getTokenPixels('--spacing-sm');

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
  }, [alignment, getMeasureEl, matchTriggerWidth, cellSize]);

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
    const measureEl = getMeasureEl();
    if (resizeObserver && measureEl) {
      resizeObserver.observe(measureEl);
    }
    if (resizeObserver && panelRef.current) {
      resizeObserver.observe(panelRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleWindowUpdate);
      window.removeEventListener('scroll', handleWindowUpdate, true);
      resizeObserver?.disconnect();
    };
  }, [open, updatePosition, getMeasureEl]);

  React.useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    // Only the topmost open layer acts on Escape (see layers.ts): a popup opened inside a dialog,
    // or on top of another popup, closes first.
    function handleKeyDown(event: KeyboardEvent) {
      if (closeOnEscape && claimEscape(event)) {
        onOpenChange?.(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!closeOnOutsideClick) {
        return;
      }

      const target = event.target as Node;
      // Use the anchor (e.g. the whole field frame) as the trigger boundary when given, so a click
      // anywhere inside the control - not only on the inset input child - keeps the panel open.
      if (panelRef.current?.contains(target) || getMeasureEl()?.contains(target)) {
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
  }, [open, closeOnEscape, closeOnOutsideClick, onOpenChange, getMeasureEl, claimEscape]);

  const child = React.Children.only(children) as React.ReactElement<
    React.HTMLAttributes<HTMLElement> & { 'aria-controls'?: string; ref?: React.Ref<HTMLElement> }
  >;
  const childProps = child.props;
  // React 19 passes ref as a prop; reading element.ref is deprecated (and warns in development).
  const childRef = childProps.ref;

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
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              className={mergeClassNames(
                styles.panel,
                !unstyled && styles.panelSurface,
                !unstyled && getPaddingClassName(padding),
                className,
              )}
              data-alignment={resolvedAlignment}
              data-trigger-out-of-view={triggerOutOfView ? 'true' : undefined}
              // z-index comes from the one layer scale (layers.ts): above dialogs and toasts, plus
              // the layers it's inside, so a popup opened from another popup's content is above it
              // even when both mount open in the same render (and the outer portal lands later).
              style={
                triggerOutOfView || !position
                  ? { zIndex: LAYERS.popup + layer.depth, visibility: 'hidden' }
                  : {
                      zIndex: LAYERS.popup + layer.depth,
                      top: `${position.top}px`,
                      left: `${position.left}px`,
                      ...(matchTriggerWidth && panelWidth !== null ? { width: `${panelWidth}px` } : {}),
                    }
              }
            >
              <LayerContext.Provider value={layer}>
                <EditableCellContext.Provider value={null}>{content}</EditableCellContext.Provider>
              </LayerContext.Provider>
            </div>,
            document.body,
          )
        : null}
    </>
  );
});

Popup.displayName = 'Popup';
