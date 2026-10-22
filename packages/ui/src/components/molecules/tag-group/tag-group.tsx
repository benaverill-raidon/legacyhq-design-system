import * as React from 'react';
import { Tag } from '../../atoms/tag';
import { DropdownMenu } from '../../organisms/dropdown-menu';
import type { MenuSection } from '../../organisms/menu';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { useFocusAfterRemoval } from '../../primitives/focus-after-removal';
import styles from './tag-group.module.css';
import type { DeprecatedTagGroupAlignment, TagGroupAlignment, TagGroupItem, TagGroupProps } from './tag-group.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

// `left` and `right` are the deprecated names for `start` and `end`, placed the same.
const ALIGNMENTS: Record<TagGroupAlignment | DeprecatedTagGroupAlignment, TagGroupAlignment> = {
  start: 'start',
  end: 'end',
  left: 'start',
  right: 'end',
};

function defaultOverflowLabel(hiddenCount: number) {
  return `+${hiddenCount} more`;
}

export const TagGroup = React.memo(function TagGroup({
  tags,
  maxVisible,
  size = 'sm',
  alignment: requestedAlignment = 'start',
  overflowLabel = defaultOverflowLabel,
  overflowMenuAriaLabel,
  onOverflowTagSelect,
  id,
  className,
}: TagGroupProps) {
  const alignment = ALIGNMENTS[requestedAlignment] ?? 'start';
  const [overflowOpen, setOverflowOpen] = React.useState(false);
  // When a removed tag took focus with it, focus moves to the next tag, the previous one, or this
  // group (see primitives/focus-after-removal.ts).
  const removalFocus = useFocusAfterRemoval<HTMLDivElement>();

  // A negative maxVisible would slice from the end; treat it as 0 (only the overflow tag).
  const limit = typeof maxVisible === 'number' ? Math.max(0, maxVisible) : undefined;
  const hasOverflow = limit !== undefined && tags.length > limit;
  const visibleTags = hasOverflow ? tags.slice(0, limit) : tags;
  const hiddenTags = hasOverflow ? tags.slice(limit) : [];

  const visibleTagElements = visibleTags.map(({ id: tagId, label, ...tagProps }) => (
    <Tag key={tagId} {...tagProps} size={size}>
      {label}
    </Tag>
  ));

  let overflowTag: React.ReactNode = null;
  if (hasOverflow) {
    const overflowSections: MenuSection[] = [
      {
        id: 'overflow',
        items: hiddenTags.map((tag: TagGroupItem) => ({
          id: tag.id,
          label: tag.label,
          leadingElement: tag.elemBefore,
          disabled: tag.disabled ?? tag.isDisabled,
          onSelect: (event) => onOverflowTagSelect?.(tag, event),
        })),
      },
    ];

    overflowTag = (
      <DropdownMenu
        key="tag-group-overflow"
        aria-label={overflowMenuAriaLabel ?? `${hiddenTags.length} more tags`}
        open={overflowOpen}
        onOpenChange={setOverflowOpen}
        showSearch={false}
        sections={overflowSections}
      >
        <Tag isInteractive size={size} onClick={() => setOverflowOpen((current) => !current)}>
          {overflowLabel(hiddenTags.length)}
        </Tag>
      </DropdownMenu>
    );
  }

  return (
    <div
      ref={removalFocus.rootRef}
      id={id}
      className={mergeClassNames(
        styles.root,
        // Shown only if focus falls back to the group itself, once its last tag is removed.
        focusRingClassNames.focusRing,
        focusRingClassNames.focusRingDefault,
        className,
      )}
      data-alignment={alignment}
      onFocus={removalFocus.handleFocus}
      onBlur={removalFocus.handleBlur}
      onPointerDown={removalFocus.handlePointerDown}
    >
      {alignment === 'end' ? overflowTag : null}
      {visibleTagElements}
      {alignment === 'start' ? overflowTag : null}
    </div>
  );
});

TagGroup.displayName = 'TagGroup';
