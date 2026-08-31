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
  /** Controlled value - the node array. */
  value: RichTextValue;
  onChange: (value: RichTextValue) => void;
  /** Resolves the `/query` into grouped entity results (async supported). */
  onSearch: EntitySearch;
  /** Shown when the picker opens with an empty query. If omitted, `onSearch('')` is used. */
  recents?: EntitySection[];
  /** Maps each entityType to a tag tone + default icon (for tags and section headings). */
  entityConfig?: Record<string, EntityTypeConfig>;
  /** md / lg - reuses Text Area's frame sizing. */
  size?: TextAreaSize;
  /** default / subtle - reuses Text Area's appearance. */
  appearance?: TextAreaAppearance;
  /** Which edges the user can drag to resize the editor. Defaults to `vertical`, like Text Area. */
  resize?: TextAreaResize;
  invalid?: boolean;
  disabled?: boolean;
  /** Shown when the editor is empty. */
  placeholder?: string;
  /** Placeholder inside the `/` slash-input before a query is typed. Defaults to "Type to search". */
  searchPlaceholder?: string;
  /** Message when a search returns nothing. Defaults to "No matches". */
  emptyMessage?: React.ReactNode;
  /** Approximate initial height, in rows (line-height units). Defaults to 3. */
  rows?: number;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
