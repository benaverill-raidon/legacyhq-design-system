import * as React from 'react';
import { CloseIcon } from '../../../assets/icons';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { Avatar } from '../../atoms/avatar';
import type { AvatarProps } from '../../atoms/avatar';
import { Tooltip } from '../../atoms/tooltip';
import { DropdownMenu } from '../../organisms/dropdown-menu';
import { useChipSize } from './chip-size-context';
import styles from './chip.module.css';
import type { ChipProps, ChipSegment, ChipSize } from './chip.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

/**
 * The `elemBefore` leading avatar is sized to the chip, matching Figma's own elemBefore part
 * (`element=avatar, size=sm` = 16px, `size=md` = 24px). An Avatar otherwise defaults to `xs` (24px),
 * which is right for md but oversized for sm - so map the chip size to the avatar size and clone.
 * Icons (always 16px in Figma's `element=icon` variant) and every other node pass through untouched.
 * The `.elemBefore` box hugs whatever this produces.
 *
 * Deliberately NOT applied to `valuePreview`: that slot is an open, content-hugging preview (an
 * Avatar Group, status icons, ...) whose size the consumer controls - see the `.preview` note in the
 * CSS. Only the fixed leading slot is normalized.
 */
const LEADING_AVATAR_SIZE: Record<ChipSize, NonNullable<AvatarProps['size']>> = { sm: 'xxs', md: 'xs' };

function fitChipLeadingAvatar(node: React.ReactNode, chipSize: ChipSize): React.ReactNode {
  if (React.isValidElement(node) && node.type === Avatar) {
    return React.cloneElement(node as React.ReactElement<AvatarProps>, { size: LEADING_AVATAR_SIZE[chipSize] });
  }
  return node;
}

function defaultRemoveAriaLabel(label: React.ReactNode, explicit?: string) {
  if (explicit) return explicit;
  return typeof label === 'string' ? `Remove ${label}` : 'Remove';
}

/**
 * One dropdown-backed segment (operator or value). Its own `open` state lives here rather than in
 * Chip, so an operator menu and a value menu never fight over a single flag - matching Figma, where
 * each segment is its own independent `dropdown-menu` instance with its own `isOpen`.
 */
function ChipDropdownSegment({
  segment,
  segmentClassName,
  disabled,
  preview,
  fallbackMenuName,
}: {
  segment: ChipSegment;
  segmentClassName: string;
  disabled: boolean;
  preview?: React.ReactNode;
  /**
   * Used when the consumer gives no `menuAriaLabel`. The segment's own label is the *current value*
   * ("on", "March 2"), which makes a poor panel name on its own - naming the panel after the
   * property and the segment's role ("Due date operator") says what choosing from it actually does.
   */
  fallbackMenuName?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu
      aria-label={segment.menuAriaLabel ?? fallbackMenuName}
      open={open}
      onOpenChange={setOpen}
      showSearch={false}
      sections={segment.sections}
    >
      <button
        type="button"
        className={mergeClassNames(
          styles.segment,
          segmentClassName,
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
        )}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        {preview ? (
          <span className={styles.preview} aria-hidden="true">
            {preview}
          </span>
        ) : null}
        <span className={styles.segmentLabel}>{segment.label}</span>
      </button>
    </DropdownMenu>
  );
}

export const Chip = React.memo(function Chip(props: ChipProps) {
  const { label, elemBefore, disabled = false, id, className } = props;
  // An explicit `size` wins; otherwise inherit Chip Group's, falling back to md.
  const size = useChipSize(props.size);

  const root = (children: React.ReactNode) => (
    <div
      id={id}
      className={mergeClassNames(styles.root, styles[`size_${size}`], styles[`mode_${props.mode}`], className)}
      data-size={size}
      data-mode={props.mode}
      data-disabled={disabled ? 'true' : undefined}
    >
      {children}
    </div>
  );

  const labelContent = (
    <>
      {elemBefore ? (
        <span className={styles.elemBefore} aria-hidden="true">
          {fitChipLeadingAvatar(elemBefore, size)}
        </span>
      ) : null}
      <span className={styles.label}>{label}</span>
    </>
  );

  /*
   * `search` is the only mode whose label segment is itself the control - Figma gives it the only
   * unselected variants, and its selected state is what the `selected` token family exists for. It
   * is a real toggle button (aria-pressed), the same semantics Toggle Button uses, rather than a
   * checkbox or a link.
   */
  if (props.mode === 'search') {
    const { isSelected = false, onSelectedChange, 'data-force-state': dataForceState } = props;

    return root(
      <button
        type="button"
        className={mergeClassNames(
          styles.segment,
          styles.labelSegment,
          isSelected && styles.selected,
          focusRingClassNames.focusRing,
          focusRingClassNames.focusRingDefault,
        )}
        disabled={disabled}
        aria-pressed={isSelected}
        data-force-state={dataForceState}
        onClick={() => onSelectedChange?.(!isSelected)}
      >
        {labelContent}
      </button>,
    );
  }

  /*
   * `filter` and `select` share the same leading label segment: a plain, non-interactive span.
   * Only the dropdown segments and the remove button are real controls, matching Figma - the label
   * names the property, it does not act on it.
   */
  const removeControl = (
    <button
      type="button"
      className={mergeClassNames(
        styles.segment,
        styles.removeButton,
        focusRingClassNames.focusRing,
        focusRingClassNames.focusRingDefault,
      )}
      disabled={disabled}
      aria-label={defaultRemoveAriaLabel(label, props.removeAriaLabel)}
      onClick={props.onRemove}
    >
      <CloseIcon size="md" decorative />
    </button>
  );

  /*
   * The tooltip is a hover/focus affordance only - the button's own `aria-label` is what actually
   * names it, so the tooltip is never the sole accessible name. It is skipped entirely while
   * disabled, for two reasons that happen to point the same way:
   *
   * 1. "Remove" on a chip that cannot be removed is misleading rather than explanatory, unlike
   *    IconButton's own disabled tooltips, which explain *why* an action is unavailable.
   * 2. Tooltip wraps a *disabled* child in an extra <span> so pointer events still fire (disabled
   *    buttons emit none). That wrapper would stop the button being a direct child of the root, so
   *    the `:first-child`/`:last-child`/`:not(:last-child)` segment rules would no longer match it -
   *    it would detach from the pill as its own fully-rounded, fully-bordered island. Not mounting
   *    Tooltip at all avoids the wrapper rather than trying to style around it.
   */
  const removeButton = disabled ? removeControl : <Tooltip content="Remove">{removeControl}</Tooltip>;

  if (props.mode === 'select') {
    return root(
      <>
        <span className={mergeClassNames(styles.segment, styles.labelSegment)}>{labelContent}</span>
        {removeButton}
      </>,
    );
  }

  const propertyName = typeof label === 'string' ? label : undefined;

  return root(
    <>
      <span className={mergeClassNames(styles.segment, styles.labelSegment)}>{labelContent}</span>
      {props.operator ? (
        <ChipDropdownSegment
          segment={props.operator}
          segmentClassName={styles.operatorSegment}
          disabled={disabled}
          fallbackMenuName={propertyName && `${propertyName} operator`}
        />
      ) : null}
      <ChipDropdownSegment
        segment={props.value}
        segmentClassName={styles.valueSegment}
        disabled={disabled}
        preview={props.valuePreview}
        fallbackMenuName={propertyName && `${propertyName} value`}
      />
      {removeButton}
    </>,
  );
});

Chip.displayName = 'Chip';
