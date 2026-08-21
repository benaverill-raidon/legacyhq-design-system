import type * as React from 'react';
import type { TagProps, TagSize } from '../../atoms/tag';

export type TagGroupAlignment = 'left' | 'right';

export interface TagGroupItem extends Omit<TagProps, 'size' | 'children' | 'id' | 'isInteractive'> {
  /** Stable identity - used for the React key and as the Menu item id if this tag is truncated into the overflow panel. */
  id: string;
  /** The tag's visible text/content - forwarded to Tag as `children`. */
  label: React.ReactNode;
}

export interface TagGroupProps {
  /** The full set of tags, visible and truncated. */
  tags: TagGroupItem[];
  /** Once `tags.length` exceeds this, only the first `maxVisible` render as tags - the rest are truncated behind an overflow tag. No truncation when omitted. */
  maxVisible?: number;
  /** Applied uniformly to every rendered tag, including the overflow tag - matching Figma, which has no per-tag size mixing within one group. */
  size?: TagSize;
  /**
   * Where the overflow tag renders relative to the visible tags, matching Figma's own `tab-group`
   * (mislabeled - it is Tag Group) component exactly: `left` (default) renders it trailing, after
   * the visible tags; `right` renders it leading, before them. Both values are illustrative-order
   * only - which tags are "visible" vs. truncated does not change with alignment.
   */
  alignment?: TagGroupAlignment;
  /** Overflow tag text, given the truncated count. Defaults to `+${hiddenCount} more`, matching Figma exactly. */
  overflowLabel?: (hiddenCount: number) => React.ReactNode;
  /** Accessible name for the overflow panel (a Menu). Defaults to `${hiddenCount} more tags`. */
  overflowMenuAriaLabel?: string;
  /**
   * Called when a truncated tag is selected from the overflow panel. Tag Group does not navigate,
   * remove, or close the panel on its own - same "never assume" rule as Menu and Dropdown Menu. Wire
   * whatever the selected tag's own `href`/`onRemove` implies from here.
   */
  onOverflowTagSelect?: (
    tag: TagGroupItem,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
  id?: string;
  className?: string;
}
