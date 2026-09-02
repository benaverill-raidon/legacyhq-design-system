import * as React from 'react';
import { focusRingClassNames } from '../../primitives/focus-ring';
import { TabsContext } from './tabs-context';
import type { TabsContextValue } from './tabs-context';
import styles from './tabs.module.css';
import type { TabsProps } from './tabs.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    type = 'line',
    tabs,
    value,
    defaultValue,
    onValueChange,
    showBorder,
    className,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  forwardedRef,
) {
  const baseId = React.useId();
  const isControlled = value !== undefined;
  const firstEnabledValue = tabs.find((tab) => !tab.disabled)?.value;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? firstEnabledValue);
  const activeValue = isControlled ? value : internalValue;

  const tabRefs = React.useRef(new Map<string, HTMLButtonElement>());

  const getTabId = React.useCallback((tabValue: string) => `${baseId}-tab-${tabValue}`, [baseId]);
  const getPanelId = React.useCallback((tabValue: string) => `${baseId}-panel-${tabValue}`, [baseId]);

  const select = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  // Both types show their border by default: the bottom line for `line`, the container border for
  // `contained`. `showBorder` turns it off.
  const bordered = showBorder ?? true;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = tabs.map((tab, tabIndex) => ({ tab, tabIndex })).filter((entry) => !entry.tab.disabled);
    if (enabled.length === 0) {
      return;
    }

    const position = enabled.findIndex((entry) => entry.tabIndex === index);
    let nextPosition: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextPosition = (position + 1) % enabled.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextPosition = (position - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        nextPosition = 0;
        break;
      case 'End':
        nextPosition = enabled.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextTab = enabled[nextPosition].tab;
    tabRefs.current.get(nextTab.value)?.focus();
    select(nextTab.value);
  };

  const context = React.useMemo<TabsContextValue>(
    () => ({ activeValue, type, getTabId, getPanelId }),
    [activeValue, type, getTabId, getPanelId],
  );

  return (
    <TabsContext.Provider value={context}>
      <div {...rest} ref={forwardedRef} className={mergeClassNames(styles.root, className)} data-type={type}>
        <div
          role="tablist"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-orientation="horizontal"
          className={mergeClassNames(styles.tablist, bordered && styles.tablistBordered)}
        >
          {tabs.map((tab, index) => {
            const selected = tab.value === activeValue;

            return (
              <button
                key={tab.value}
                ref={(element) => {
                  if (element) {
                    tabRefs.current.set(tab.value, element);
                  } else {
                    tabRefs.current.delete(tab.value);
                  }
                }}
                type="button"
                role="tab"
                id={getTabId(tab.value)}
                aria-selected={selected}
                aria-controls={getPanelId(tab.value)}
                tabIndex={selected ? 0 : -1}
                disabled={tab.disabled}
                className={mergeClassNames(styles.tab, focusRingClassNames.focusRing, focusRingClassNames.focusRingDefault)}
                onClick={() => select(tab.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {children}
      </div>
    </TabsContext.Provider>
  );
});

Tabs.displayName = 'Tabs';
