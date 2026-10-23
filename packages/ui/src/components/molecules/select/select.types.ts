import type * as React from 'react';

export type SelectSize = 'sm' | 'md' | 'lg';

/** The trigger's context, as Text Field's: `inline` is chromeless until hovered or focused (Figma's context). */
export type SelectContext = 'default' | 'inline';
/** @deprecated Use `SelectContext`: `subtle` and `inline` are both `inline`. */
export type SelectTone = 'default' | 'subtle' | 'inline';

export interface SelectOption {
  /** Stable identity, and the value reported through onChange. */
  value: string;
  /** Visible row label, and (single-select) the text shown in the trigger once chosen. */
  label: string;
  /**
   * Optional leading icon/avatar for the option row, for the trigger once it's chosen (single-select,
   * before the value), and for its chip (multi-select). Decorative: the label carries the meaning.
   */
  icon?: React.ReactNode;
  /** Optional secondary text under the label in the option row. */
  description?: React.ReactNode;
  /** Shows the row but it can't be chosen, and the arrow keys skip it. */
  disabled?: boolean;
  /** Optional group heading; consecutive options sharing a group render under one section heading. */
  group?: string;
}

interface SelectCommonProps {
  /** The options, in order. Options with the same `group` in a row are listed under one heading. */
  options: SelectOption[];
  /** The field's height: `sm` (32px), `md` (40px), or `lg` (48px). Multi-select chips are `sm`, or `md` in an `lg` field. */
  size?: SelectSize;
  /** `default` (bordered) or `inline` (chromeless until hovered or focused), as Text Field's. Defaults to `default`. */
  context?: SelectContext;
  /** @deprecated Use `context`: `subtle` and `inline` map to `context="inline"`. Still accepted. */
  tone?: SelectTone;
  /** @deprecated Use `context`: `subtle` and `inline` map to `context="inline"`. Still accepted. */
  appearance?: SelectTone;
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  /** Disables the input with the native attribute: it can't open, and multi-select chips can't be removed. */
  disabled?: boolean;
  /** Renders the invalid treatment (red border) and sets aria-invalid on the input. */
  invalid?: boolean;
  /**
   * Controlled search text, shown in the input while the menu is open. Omit it to let Select keep the
   * text itself. Pair it with `onSearchChange` to filter externally, e.g. for async option loading.
   */
  searchValue?: string;
  /** Called with the typed text. While it's set, Select stops filtering the options itself: pass the matching ones. */
  onSearchChange?: (value: string) => void;
  /** Shown in the panel when the query matches no options. */
  emptyMessage?: React.ReactNode;
  /** Accessible name for the trigger input and its menu; use when there is no visible <label> wired by id. */
  'aria-label'?: string;
  /**
   * Ids of elements that name the input and the menu. Field passes its label's id. With neither this
   * nor `aria-label`, the menu takes its name from the input's native `<label>`.
   */
  'aria-labelledby'?: string;
  /** Ids of elements that describe the input, such as Field's message. */
  'aria-describedby'?: string;
  /** Marks the input invalid, as `invalid` does. Field passes it for an error. */
  'aria-invalid'?: boolean | 'true' | 'false';
  /** Sets the input's native `required`. Field passes it when its `required` is set. */
  required?: boolean;
  /** Set on the input, so a native `label` can point at it. Field passes one. */
  id?: string;
  /** Added to the field frame's classes. */
  className?: string;
}

/** Single-select: one value, chosen from radio rows; the trigger shows the selected label. */
export interface SelectSingleProps extends SelectCommonProps {
  /** `single`, the default: one value, chosen from radio rows. */
  inputType?: 'single';
  /** The chosen option's `value`, or `null` for none. */
  value: string | null;
  /** Called with the option chosen. Select never clears the value itself. */
  onChange: (value: string | null) => void;
}

/** Multi-select: an array of values, chosen from checkbox rows; the trigger shows removable chips. */
export interface SelectMultiProps extends SelectCommonProps {
  /** `multi`: several values, chosen from checkbox rows and shown as chips. */
  inputType: 'multi';
  /** The chosen options' values, in the order they were chosen. */
  value: string[];
  /** Called with the next array when a row is toggled, a chip is removed, or Backspace removes the last chip. */
  onChange: (value: string[]) => void;
  /**
   * Builds each chip's remove-button name from the option's label, passed to Chip's `removeLabel`.
   * Defaults to `Remove <label>`; pass a translation.
   */
  getRemoveLabel?: (label: string) => string;
}

/**
 * Discriminated on `inputType`, so single-select's scalar value and multi-select's array cannot be
 * mixed up - the same pattern Chip uses for its `mode`. `inputType` defaults to `'single'`, so the
 * common case needs no discriminant.
 */
export type SelectProps = SelectSingleProps | SelectMultiProps;
