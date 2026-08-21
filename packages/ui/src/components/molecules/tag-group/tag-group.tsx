import * as React from 'react';
import { Tag } from '../../atoms/tag';
import { DropdownMenu } from '../../organisms/dropdown-menu';
import type { MenuSection } from '../../organisms/menu';
import styles from './tag-group.module.css';
import type { TagGroupItem, TagGroupProps } from './tag-group.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function defaultOverflowLabel(hiddenCount: number) {
  return `+${hiddenCount} more`;
}

export const TagGroup = React.memo(function TagGroup({
  tags,
  maxVisible,
  size = 'sm',
  alignment = 'left',
  overflowLabel = defaultOverflowLabel,
  overflowMenuAriaLabel,
  onOverflowTagSelect,
  id,
  className,
}: TagGroupProps) {
  const [overflowOpen, setOverflowOpen] = React.useState(false);

  const hasOverflow = typeof maxVisible === 'number' && tags.length > maxVisible;
  const visibleTags = hasOverflow ? tags.slice(0, maxVisible) : tags;
  const hiddenTags = hasOverflow ? tags.slice(maxVisible) : [];

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
          disabled: tag.isDisabled,
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
    <div id={id} className={mergeClassNames(styles.root, className)} data-alignment={alignment}>
      {alignment === 'right' ? overflowTag : null}
      {visibleTagElements}
      {alignment === 'left' ? overflowTag : null}
    </div>
  );
});

TagGroup.displayName = 'TagGroup';
