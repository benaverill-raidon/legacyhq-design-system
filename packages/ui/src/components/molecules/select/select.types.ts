import type * as React from 'react';

export type SelectSize = 'sm' | 'md' | 'lg';

/** Maps to TextField's `appearance` - Figma's `tone` axis on the trigger. */
export type SelectTone = 'default' | 'subtle';

export interface SelectOption {
  /** Stable identity, and the value reported through onChange. */
  value: string;
  /** Visible row label, and (single-select) the text shown in the trigger once chosen. */
  label: string;
  /** Optional leading icon/avatar for the option row and, in multi-select, its chip. Decorative. */
  icon?: React.ReactNode;
  /** Optional secondary text under the label in the option row. */
  description?: React.ReactNode;
  disabled?: boolean;
  /** Optional group heading; consecutive options sharing a group render under one section heading. */
  group?: string;
}

interface SelectCommonProps {
  options: SelectOption[];
  size?: SelectSize;
  tone?: SelectTone;
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  disabled?: boolean;
  /** Renders the invalid treatment (red border) and sets aria-invalid on the input. */
  invalid?: boolean;
  /**
   * Controlled search text. Omit to let Select manage typeahead itself; provide it (with
   * onSearchChange) to control filtering externally - e.g. async option loading.
   */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Shown in the panel when the query matches no options. */
  emptyMessage?: React.ReactNode;
  /** Accessible name for the trigger input; use when there is no visible <label> wired by id. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  id?: string;
  className?: string;
}

/** Single-select: one value, chosen from radio rows; the trigger shows the selected label. */
export interface SelectSingleProps extends SelectCommonProps {
  inputType?: 'single';
  value: string | null;
  onChange: (value: string | null) => void;
}

/** Multi-select: an array of values, chosen from checkbox rows; the trigger shows removable chips. */
export interface SelectMultiProps extends SelectCommonProps {
  inputType: 'multi';
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Discriminated on `inputType`, so single-select's scalar value and multi-select's array cannot be
 * mixed up - the same pattern Chip uses for its `mode`. `inputType` defaults to `'single'`, so the
 * common case needs no discriminant.
 */
export type SelectProps = SelectSingleProps | SelectMultiProps;
