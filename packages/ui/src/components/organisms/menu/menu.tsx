import * as React from 'react';
import { CloseIcon } from '../../../assets/icons';
import { IconButton } from '../../atoms/icon-button';
import { Spinner } from '../../atoms/spinner';
import { TextField } from '../../molecules/text-field';
import { focusRingClassNames } from '../../primitives/focus-ring';
import styles from './menu.module.css';
import type { MenuItem, MenuProps, MenuSection } from './menu.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function getItemRole(item: MenuItem): React.AriaRole {
  if (item.selectionType === 'checkbox') {
    return 'menuitemcheckbox';
  }
  if (item.selectionType === 'radio') {
    return 'menuitemradio';
  }
  return 'menuitem';
}

// Only filters on plain-string label/description - an item with non-string content for both
// can't be substring-matched, so it stays visible rather than silently disappearing from a search
// Menu has no way to evaluate.
function matchesQuery(item: MenuItem, query: string) {
  if (!query) {
    return true;
  }

  const labelText = typeof item.label === 'string' ? item.label : '';
  const descriptionText = typeof item.description === 'string' ? item.description : '';
  const searchableText = `${labelText} ${descriptionText}`.trim();

  if (!searchableText) {
    return true;
  }

  return searchableText.toLowerCase().includes(query.toLowerCase());
}

interface VisibleSection {
  section: MenuSection;
  items: MenuItem[];
}

function MenuItemRow({
  item,
  isRovingTabStop,
  registerRef,
  onFocus,
}: {
  item: MenuItem;
  isRovingTabStop: boolean;
  registerRef: (id: string, element: HTMLButtonElement | null) => void;
  onFocus: (id: string) => void;
}) {
  return (
    <button
      ref={(element) => registerRef(item.id, element)}
      type="button"
      role={getItemRole(item)}
      aria-checked={item.selectionType ? Boolean(item.selected) : undefined}
      disabled={item.disabled}
      tabIndex={isRovingTabStop ? 0 : -1}
      data-selected={item.selected ? 'true' : undefined}
      className={mergeClassNames(
        styles.item,
        item.selected && styles.item_selected,
        focusRingClassNames.focusRing,
        focusRingClassNames.focusRingDefault,
      )}
      onFocus={() => onFocus(item.id)}
      onClick={(event) => {
        if (item.disabled) {
          return;
        }
        item.onSelect?.(event);
      }}
    >
      {item.leadingElement ? (
        <span className={styles.elemBefore} aria-hidden="true">
          {item.leadingElement}
        </span>
      ) : null}
      <span className={styles.content}>
        <span className={styles.titleRow}>
          {item.titleLeadingElement ? (
            <span className={styles.titleIcon} aria-hidden="true">
              {item.titleLeadingElement}
            </span>
          ) : null}
          <span className={styles.label}>{item.label}</span>
        </span>
        {item.description ? <span className={styles.description}>{item.description}</span> : null}
      </span>
      {item.trailingElement ? (
        <span className={styles.elemAfter} aria-hidden="true">
          {item.trailingElement}
        </span>
      ) : null}
    </button>
  );
}

export const Menu = React.memo(function Menu({
  sections,
  size = 'sm',
  showSearch = true,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  showScrollbar = true,
  maxHeight,
  loading = false,
  loadingLabel = 'Loading…',
  emptyMessage = 'No results',
  fullWidth = false,
  id,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: MenuProps) {
  const itemRefs = React.useRef(new Map<string, HTMLButtonElement>());

  const visibleSections = React.useMemo<VisibleSection[]>(() => {
    const query = searchValue ?? '';
    return sections
      .map((section) => ({ section, items: section.items.filter((item) => matchesQuery(item, query)) }))
      .filter(({ items }) => items.length > 0 || !query);
  }, [sections, searchValue]);

  const enabledIds = React.useMemo(
    () => visibleSections.flatMap(({ items }) => items.filter((item) => !item.disabled).map((item) => item.id)),
    [visibleSections],
  );

  // Derived, not effect-synced: falls back to the first enabled item whenever the last
  // manually-set one is no longer visible/enabled (e.g. filtered out by search), without a
  // render-triggering effect.
  const [manualActiveId, setActiveId] = React.useState<string | undefined>(undefined);
  const activeId = manualActiveId && enabledIds.includes(manualActiveId) ? manualActiveId : enabledIds[0];

  const registerRef = React.useCallback((itemId: string, element: HTMLButtonElement | null) => {
    if (element) {
      itemRefs.current.set(itemId, element);
    } else {
      itemRefs.current.delete(itemId);
    }
  }, []);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (enabledIds.length === 0) {
        return;
      }

      const currentIndex = activeId ? enabledIds.indexOf(activeId) : -1;
      let nextIndex: number | null = null;

      if (event.key === 'ArrowDown') {
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % enabledIds.length;
      } else if (event.key === 'ArrowUp') {
        nextIndex = currentIndex < 0 ? enabledIds.length - 1 : (currentIndex - 1 + enabledIds.length) % enabledIds.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = enabledIds.length - 1;
      }

      if (nextIndex === null) {
        return;
      }

      event.preventDefault();
      const nextId = enabledIds[nextIndex];
      setActiveId(nextId);
      itemRefs.current.get(nextId)?.focus();
    },
    [enabledIds, activeId],
  );

  const hasAnyVisibleItems = visibleSections.some(({ items }) => items.length > 0);

  return (
    <div id={id} className={mergeClassNames(styles.menu, fullWidth ? styles.fullWidth : styles[`size_${size}`], className)}>
      {showSearch ? (
        <div className={styles.search}>
          <TextField
            type="text"
            size="md"
            appearance="subtle"
            // This field only ever mounts while a containing Dropdown Menu is open (Popup
            // unmounts its content while closed), so autoFocus here means "focus search every
            // time the menu opens", not "steal focus on page load" - the anti-pattern the
            // jsx-a11y rule below guards against.
            // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional, see comment above
            autoFocus
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder ?? 'Search'}
            iconAfter={
              searchValue ? (
                <IconButton aria-label="Clear search" appearance="subtle" size="sm" onClick={() => onSearchChange?.('')}>
                  <CloseIcon size="sm" decorative />
                </IconButton>
              ) : undefined
            }
          />
        </div>
      ) : null}
      {loading ? (
        <div className={styles.loadingRow} role="status">
          <Spinner size="sm" />
          <span>{loadingLabel}</span>
        </div>
      ) : (
        <div
          role="menu"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={mergeClassNames(styles.sections, showScrollbar && styles.scrollable)}
          style={maxHeight ? { maxHeight } : undefined}
          onKeyDown={handleKeyDown}
        >
          {visibleSections.map(({ section, items }, index) => (
            <div key={section.id} className={styles.section}>
              {index > 0 || showSearch ? <div className={styles.divider} role="separator" /> : null}
              <div className={styles.sectionBody}>
                {section.heading ? (
                  <div className={styles.heading}>
                    {section.headingLeadingElement ? (
                      <span className={styles.headingIcon} aria-hidden="true">
                        {section.headingLeadingElement}
                      </span>
                    ) : null}
                    <span>{section.heading}</span>
                  </div>
                ) : null}
                <div className={styles.list}>
                  {items.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      isRovingTabStop={item.id === activeId}
                      registerRef={registerRef}
                      onFocus={setActiveId}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
          {!hasAnyVisibleItems ? <div className={styles.empty}>{emptyMessage}</div> : null}
        </div>
      )}
    </div>
  );
});

Menu.displayName = 'Menu';
