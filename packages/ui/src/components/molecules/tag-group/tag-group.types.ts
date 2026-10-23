import type * as React from 'react';
import type { TagProps, TagSize } from '../../atoms/tag';

export type TagGroupAlignment = 'start' | 'end';
/**
 * @deprecated Use `start` or `end`: alignment is named by logical start and end, as Table and Form
 * name it. Still accepted, and placed the same.
 */
export type DeprecatedTagGroupAlignment = 'left' | 'right';

export interface TagGroupItem extends Omit<TagProps, 'size' | 'children' | 'id' | 'isInteractive'> {
  /** Stable identity - used for the React key and as the Menu item id if this tag is truncated into the overflow panel. */
  id: string;
  /** The tag's visible text/content - forwarded to Tag as `children`. */
  label: React.ReactNode;
}

export interface TagGroupProps {
  /** Every tag in the group, in order, visible or not. Each item takes Tag's props except `size`, `children`, and `isInteractive`, plus a unique `id` and its text as `label`. */
  tags: TagGroupItem[];
  /** How many tags show before the rest move behind the overflow tag. With no `maxVisible`, every tag shows, wrapping onto new lines, and there's no overflow tag. */
  maxVisible?: number;
  /** The size of every tag and of the overflow tag: `sm` (24px) or `md` (32px). Unlike Tag, the default is `sm`. */
  size?: TagSize;
  /**
   * Where the overflow tag sits: after the visible tags with `start`, the default, before them with
   * `end`. It doesn't change which tags are hidden. It follows the writing direction. `left` and
   * `right`, the earlier names, are still accepted.
   */
  alignment?: TagGroupAlignment | DeprecatedTagGroupAlignment;
  /** The overflow tag's text, from the number of hidden tags. Defaults to `+5 more` for five. */
  overflowLabel?: (hiddenCount: number) => React.ReactNode;
  /** The overflow menu's accessible name. Defaults to “5 more tags” for five. */
  overflowMenuAriaLabel?: string;
  /**
   * Called with the tag and the event when someone chooses a hidden tag from the overflow menu. The
   * menu then closes and focus returns to the overflow tag. Tag Group doesn't follow the tag's `href`
   * or call its `onRemove`, so do what the tag means from here.
   */
  onOverflowTagSelect?: (
    tag: TagGroupItem,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
  /**
   * Names the group, such as "Matter tags", making it a `role="group"`. Name it when the tags belong
   * together, and always when they're removable: when the last one is removed, focus moves to the
   * group, which then has a name to announce. Use `aria-labelledby` instead when a visible heading
   * names it.
   */
  'aria-label'?: string;
  /** The id of a visible element, such as a heading, that names the group. Makes it a `role="group"`, like `aria-label`. */
  'aria-labelledby'?: string;
  /** The root element's `id`. */
  id?: string;
  /** Added to the root element's classes. */
  className?: string;
}
