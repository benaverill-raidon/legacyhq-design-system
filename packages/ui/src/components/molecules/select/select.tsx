import * as React from 'react';
import { CaretDownIcon } from '../../../assets/icons';
import { TextField } from '../text-field';
import { Chip } from '../chip';
import { DropdownMenu } from '../../organisms/dropdown-menu';
import type { MenuSection, MenuItem } from '../../organisms/menu';
import styles from './select.module.css';
import type { SelectOption, SelectProps, SelectSize } from './select.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

let panelIdCounter = 0;

/** Chips sit at sm inside the sm/md triggers and md inside the lg trigger, matching Figma. */
const CHIP_SIZE_FOR: Record<SelectSize, 'sm' | 'md'> = { sm: 'sm', md: 'sm', lg: 'md' };

/** Group consecutive options by their `group` field into Menu sections, preserving order. */
function buildSections(
  options: SelectOption[],
  isSelected: (value: string) => boolean,
  selectionType: 'radio' | 'checkbox',
  onPick: (value: string) => void,
): MenuSection[] {
  const sections: MenuSection[] = [];
  for (const option of options) {
    const heading = option.group;
    let section = sections.find((s) => s.id === (heading ?? '__ungrouped__'));
    if (!section) {
      section = { id: heading ?? '__ungrouped__', heading, items: [] };
      sections.push(section);
    }
    const item: MenuItem = {
      id: option.value,
      label: option.label,
      description: option.description,
      leadingElement: option.icon,
      disabled: option.disabled,
      selected: isSelected(option.value),
      selectionType,
      onSelect: () => onPick(option.value),
    };
    section.items.push(item);
  }
  return sections;
}

export const Select = React.memo(function Select(props: SelectProps) {
  const {
    options,
    size = 'md',
    tone = 'default',
    placeholder,
    disabled = false,
    invalid = false,
    searchValue,
    onSearchChange,
    emptyMessage = 'No matches',
    id,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  } = props;

  const multi = props.inputType === 'multi';

  const [open, setOpen] = React.useState(false);
  const [internalQuery, setInternalQuery] = React.useState('');
  const query = searchValue ?? internalQuery;

  const inputRef = React.useRef<HTMLInputElement>(null);
  // The field frame (TextField's root) is the input's parent. Popup measures this - not the inset
  // input - so the panel aligns to and matches the field's width, not the padding-inset input box.
  const frameRef = React.useRef<HTMLElement | null>(null);
  const setTriggerRef = React.useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    frameRef.current = node?.parentElement ?? null;
  }, []);
  const panelId = React.useMemo(() => `select-panel-${(panelIdCounter += 1)}`, []);

  const setQuery = React.useCallback(
    (next: string) => {
      if (searchValue === undefined) setInternalQuery(next);
      onSearchChange?.(next);
    },
    [searchValue, onSearchChange],
  );

  const selectedValues = multi ? props.value : props.value !== null ? [props.value] : [];
  const selectedSingleOption = !multi && props.value !== null ? options.find((o) => o.value === props.value) : undefined;

  // Case-insensitive substring filter, unless a controlled searchValue is driving it externally.
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || onSearchChange) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, onSearchChange]);

  const focusInput = React.useCallback(() => inputRef.current?.focus(), []);

  const handlePick = React.useCallback(
    (value: string) => {
      if (multi) {
        const current = props.value;
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        props.onChange(next);
        setQuery('');
        focusInput(); // keep the field active for the next pick
      } else {
        props.onChange(value);
        setQuery('');
        setOpen(false);
      }
    },
    [multi, props, setQuery, focusInput],
  );

  const removeValue = React.useCallback(
    (value: string) => {
      if (!multi) return;
      props.onChange(props.value.filter((v) => v !== value));
    },
    [multi, props],
  );

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) {
        setQuery('');
        // Escape / outside-click close: return focus to the field, matching combobox convention.
        if (document.activeElement && inputRef.current?.contains(document.activeElement)) return;
      }
    },
    [setQuery],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      // Move into the Menu; its own roving tabindex takes over from there.
      const firstItem = document
        .getElementById(panelId)
        ?.querySelector<HTMLElement>('[role^="menuitem"]');
      firstItem?.focus();
      return;
    }
    if (event.key === 'Backspace' && multi && query === '' && selectedValues.length > 0) {
      removeValue(selectedValues[selectedValues.length - 1]);
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && !open) {
      // Space/Enter opens a closed field, unless the user is mid-word typing (space in a query).
      if (event.key === 'Enter' || query === '') {
        event.preventDefault();
        setOpen(true);
      }
    }
  };

  const sections = buildSections(
    filtered,
    (value) => selectedValues.includes(value),
    multi ? 'checkbox' : 'radio',
    handlePick,
  );

  // Trigger display text: while open, the live query; while closed, the single-select label (multi
  // shows chips instead, so its input stays a bare query field).
  const inputValue = open ? query : multi ? query : (selectedSingleOption?.label ?? '');
  const inputPlaceholder =
    multi
      ? selectedValues.length > 0
        ? ''
        : placeholder
      : open && selectedSingleOption
        ? selectedSingleOption.label // show the current choice as a hint while typing a new query
        : placeholder;

  const chips = multi
    ? selectedValues.map((value) => {
        const option = options.find((o) => o.value === value);
        if (!option) return null;
        return (
          <Chip
            key={value}
            mode="select"
            size={CHIP_SIZE_FOR[size]}
            label={option.label}
            elemBefore={option.icon}
            disabled={disabled}
            removeAriaLabel={`Remove ${option.label}`}
            onRemove={() => removeValue(value)}
          />
        );
      })
    : null;

  return (
    <DropdownMenu
      id={panelId}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      open={open && !disabled}
      onOpenChange={handleOpenChange}
      showSearch={false}
      size={size}
      emptyMessage={emptyMessage}
      sections={sections}
      anchorRef={frameRef}
      matchTriggerWidth
    >
      <TextField
        ref={setTriggerRef}
        id={id}
        className={mergeClassNames(styles.trigger, className)}
        size={size}
        appearance={tone}
        invalid={invalid}
        disabled={disabled}
        role="combobox"
        aria-haspopup="menu"
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={inputPlaceholder}
        value={inputValue}
        leadingContent={chips}
        iconAfter={
          <span
            className={mergeClassNames(styles.caret, open && styles.caretOpen, disabled && styles.caretDisabled)}
            aria-hidden="true"
          >
            <CaretDownIcon size="md" decorative />
          </span>
        }
        onChange={(event) => {
          setQuery(event.target.value);
          if (!open) setOpen(true);
        }}
        onMouseDown={() => {
          if (!disabled && !open) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      />
    </DropdownMenu>
  );
});

Select.displayName = 'Select';
