import type * as React from 'react';
import type { TagTone } from '../../../atoms/tag';
import type { TextAreaAppearance, TextAreaResize, TextAreaSize } from '../text-area.types';

/**
 * The editor's value is a flat array of nodes - runs of plain text interleaved with entity tags -
 * the "structured node array" model. It is what you persist and read back; serialize it however your
 * store needs. A single continuous typed paragraph is one `text` node; each linked entity is one
 * `entity` node.
 */
export type RichTextNode =
  | { type: 'text'; text: string }
  | { type: 'entity'; entity: RichTextEntity };

export type RichTextValue = RichTextNode[];

/** A linked entity, as it lives in the value (what renders as an inline navigational tag). */
export interface RichTextEntity {
  /** Stable id of the linked record. */
  id: string;
  /** Consumer-defined category (e.g. 'account' | 'matter' | 'roadmap' | 'document') - drives the tag's tone/icon via `entityConfig`. */
  entityType: string;
  /** The tag's visible text. */
  label: string;
  /** Where the tag navigates to when clicked. */
  href?: string;
}

/** One entity in a picker result - the row shown when searching. */
export interface EntityOption {
  id: string;
  entityType: string;
  label: string;
  /** Secondary line (a role, a matter number, ...). */
  description?: string;
  href?: string;
  /** Leading visual for the row - an Avatar for people/accounts, a tinted icon otherwise. Falls back to `entityConfig[entityType].icon`. */
  leadingElement?: React.ReactNode;
}

/** A group of results, one per entity type - rendered as a Menu section with a heading. */
export interface EntitySection {
  id: string;
  heading: string;
  /** Drives the heading's leading icon/tone via `entityConfig`. */
  entityType: string;
  items: EntityOption[];
}

/**
 * Called with the current `/query` as the user types. Returns the grouped results (sync or async).
 * Called with an empty string when the picker first opens - return your `recents` there, or provide
 * them separately via the `recents` prop.
 */
export type EntitySearch = (query: string) => Promise<EntitySection[]> | EntitySection[];

/** Per-entity-type presentation: the tag tone and the default icon for tags and headings. */
export interface EntityTypeConfig {
  tone?: TagTone;
  icon?: React.ReactNode;
}

export interface RichTextAreaProps {
  /**
   * The starting content, as a node array. Read once, when the editor mounts; after that the editor
   * leads, and `onChange` reports each change.
   */
  value: RichTextValue;
  /** Called with the whole node array after every edit, including adding or deleting a tag. */
  onChange: (value: RichTextValue) => void;
  /** Returns the grouped results for the typed query, directly or as a promise. Called with `''` when the list opens, unless `recents` is given. */
  onSearch: EntitySearch;
  /** Shown when the list opens, before a query is typed. If omitted, `onSearch('')` is used. */
  recents?: EntitySection[];
  /**
   * The tag tone and default icon for each `entityType`, used for tags and section headings. Merges
   * over the built-in tones for `account`, `person`, `matter`, `roadmap`, and `document`.
   */
  entityConfig?: Record<string, EntityTypeConfig>;
  /** `md` or `lg`, with Text Area's padding, corners, and text size. `sm` is accepted but renders as `md`. */
  size?: TextAreaSize;
  /**
   * `default` is the bordered field; `subtle` has no border or background until hovered or focused.
   * Use one of those two: `inline` is accepted but has no styles yet.
   */
  appearance?: TextAreaAppearance;
  /** Which way someone can drag the editor to resize it. Defaults to `vertical`, like Text Area. */
  resize?: TextAreaResize;
  /** Shows the error border and sets `aria-invalid` on the editor. */
  invalid?: boolean;
  /** Turns off editing, takes the editor out of the tab order, and stops the `/` command. */
  disabled?: boolean;
  /** Shown when the editor is empty. */
  placeholder?: string;
  /** Placeholder inside the `/` query box before a query is typed. Defaults to "Type to search". */
  searchPlaceholder?: string;
  /** Message when a search returns nothing. Defaults to "No matches". */
  emptyMessage?: React.ReactNode;
  /** The editor's starting height, in lines; it grows as the text gets longer. Defaults to 3. */
  rows?: number;
  /** Added to the wrapper around the editor. */
  className?: string;
  /** Set on the editor. A `label` with `htmlFor` can't name it, because it isn't a native control; use `aria-labelledby`. */
  id?: string;
  /** The editor's accessible name, when there's no visible label. */
  'aria-label'?: string;
  /** The id of a visible label that names the editor. */
  'aria-labelledby'?: string;
}
