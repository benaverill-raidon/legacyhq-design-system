import * as React from 'react';
import { CaretDownIcon } from '../../../assets/icons';
import { TextField } from '../text-field';
import { useEditableCellSize } from '../../primitives/editable-cell-context';
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

const defaultGetRemoveLabel = (label: string) => `Remove ${label}`;

/** A label's text, leaving out the field itself when the label wraps it (its chips' text). */
function getLabelText(label: HTMLLabelElement, field: Element | null) {
  let text = '';
  const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (!field?.contains(walker.currentNode)) text += walker.currentNode.textContent ?? '';
  }
  return text.replace(/\s+/g, ' ').trim();
}

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
  const cellSize = useEditableCellSize();
  const {
    options,
    size = 'md',
    context,
    tone,
    appearance,
    placeholder,
    disabled = false,
    invalid: requestedInvalid = false,
    searchValue,
    onSearchChange,
    emptyMessage = 'No matches',
    id,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    required,
  } = props;
  const invalid = requestedInvalid || ariaInvalid === true || ariaInvalid === 'true';

  // `tone` and `appearance` are deprecated names for `context`: their subtle and inline values are inline.
  const legacy = tone ?? appearance;
  const resolvedContext = context ?? (legacy && legacy !== 'default' ? 'inline' : 'default');

  const multi = props.inputType === 'multi';

  const [open, setOpen] = React.useState(false);
  // The menu's name when the field is named only by a native <label> (no aria-label or
  // aria-labelledby): read from the label when the menu opens, so the menu isn't left unnamed.
  const [nativeLabelName, setNativeLabelName] = React.useState<{ 'aria-label'?: string; 'aria-labelledby'?: string }>({});
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

  const readNativeLabel = React.useCallback(() => {
    if (ariaLabel || ariaLabelledBy) return;
    const labels = Array.from(inputRef.current?.labels ?? []);
    const frame = frameRef.current;
    // A label that points at the field by id names the menu by reference; one that wraps the field
    // would name it with the field's value too, so its own text is copied instead.
    if (labels.length > 0 && labels.every((label) => label.id && !label.contains(frame))) {
      setNativeLabelName({ 'aria-labelledby': labels.map((label) => label.id).join(' ') });
      return;
    }
    const text = labels.map((label) => getLabelText(label, frame)).filter(Boolean).join(' ');
    setNativeLabelName(text ? { 'aria-label': text } : {});
  }, [ariaLabel, ariaLabelledBy]);

  const openMenu = React.useCallback(() => {
    // A disabled fieldset around the Select disables its input without the `disabled` prop; the
    // menu stays shut then too, from the frame, the caret, or the input.
    if (inputRef.current?.matches(':disabled')) return;
    readNativeLabel();
    setOpen(true);
  }, [readNativeLabel]);

  // Clicks on the TextField frame's own padding (between its border and child elements) don't reach
  // the <input> or caret handlers. This listener catches those so the entire trigger surface opens
  // the dropdown — event.target === frame confirms the click hit the frame itself, not a child.
  React.useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const handleFrameMouseDown = (event: MouseEvent) => {
      if (disabled) return;
      if (event.target !== frame) return;
      event.preventDefault();
      openMenu();
      inputRef.current?.focus();
    };
    frame.addEventListener('mousedown', handleFrameMouseDown);
    return () => frame.removeEventListener('mousedown', handleFrameMouseDown);
  }, [disabled, openMenu]);

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
        // The chosen row unmounts with the menu, so focus goes back to the field rather than the page.
        focusInput();
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

  // Popup calls this for Escape and for a click outside. Escape from inside the menu has already
  // returned focus to the field (the panel's keydown handler below); a click outside leaves focus
  // where the click put it.
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) {
        openMenu();
        return;
      }
      setOpen(false);
      setQuery('');
    },
    [openMenu, setQuery],
  );

  const closeMenu = React.useCallback(() => handleOpenChange(false), [handleOpenChange]);

  // Dropdown Menu leaves a combobox trigger to manage focus itself, so Select does it here, while
  // the menu is open:
  // - Escape inside the menu returns focus to the field (Popup then closes the menu).
  // - Tab or Shift+Tab inside the menu closes it and returns focus to the field, as Dropdown Menu
  //   does for its own triggers; the portalled menu would otherwise tab to the end of the page.
  // - Focus moving anywhere outside the field and the menu (Tab out of the field, a click on another
  //   control) closes the menu. A blur with no new target (a click on nothing focusable, or the
  //   window losing focus) leaves it to Popup's outside click.
  React.useEffect(() => {
    if (!open || disabled) return undefined;
    const panel = document.getElementById(panelId);
    const frame = frameRef.current;
    if (!panel) return undefined;

    const handlePanelKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        focusInput();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        focusInput();
        closeMenu();
      }
    };
    const handleFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      if (next && !panel.contains(next) && !frame?.contains(next)) closeMenu();
    };

    panel.addEventListener('keydown', handlePanelKeyDown);
    panel.addEventListener('focusout', handleFocusOut);
    frame?.addEventListener('focusout', handleFocusOut);
    return () => {
      panel.removeEventListener('keydown', handlePanelKeyDown);
      panel.removeEventListener('focusout', handleFocusOut);
      frame?.removeEventListener('focusout', handleFocusOut);
    };
  }, [open, disabled, panelId, focusInput, closeMenu]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        openMenu();
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
        openMenu();
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

  const getRemoveLabel = (multi ? props.getRemoveLabel : undefined) ?? defaultGetRemoveLabel;

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
            removeLabel={getRemoveLabel(option.label)}
            onRemove={() => removeValue(value)}
          />
        );
      })
    : null;

  return (
    <DropdownMenu
      id={panelId}
      aria-label={ariaLabel ?? nativeLabelName['aria-label']}
      aria-labelledby={ariaLabelledBy ?? nativeLabelName['aria-labelledby']}
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
        context={resolvedContext}
        data-force-state={cellSize && open && !disabled ? 'focus' : undefined}
        invalid={invalid}
        disabled={disabled}
        role="combobox"
        aria-haspopup="menu"
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={inputPlaceholder}
        value={inputValue}
        // Single-select shows the chosen option's icon before its label (Figma's elemBeforeInput slot);
        // it stays while the menu is open, since the value doesn't change until a new pick.
        iconBefore={selectedSingleOption?.icon}
        leadingContent={chips}
        iconAfter={
          <span
            className={mergeClassNames(styles.caret, cellSize && styles.cellCaret, open && !cellSize && styles.caretOpen, disabled && styles.caretDisabled)}
            aria-hidden="true"
            onMouseDown={(event) => {
              event.preventDefault();
              if (!disabled) {
                if (open) closeMenu();
                else openMenu();
                focusInput();
              }
            }}
          >
            <CaretDownIcon size="md" decorative />
          </span>
        }
        onChange={(event) => {
          setQuery(event.target.value);
          if (!open) openMenu();
        }}
        onMouseDown={() => {
          if (!disabled && !open) openMenu();
        }}
        onClick={() => {
          if (cellSize && !disabled && !open) openMenu();
        }}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        required={required}
      />
    </DropdownMenu>
  );
});

Select.displayName = 'Select';
