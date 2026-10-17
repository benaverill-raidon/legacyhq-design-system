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
    appearance: requestedAppearance,
    type,
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
  // `type` is the deprecated name for `appearance`.
  const appearance = requestedAppearance ?? type ?? 'line';
  const baseId = React.useId();
  const isControlled = value !== undefined;
  const firstEnabledValue = tabs.find((tab) => !tab.disabled)?.value;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? firstEnabledValue);
  const activeValue = isControlled ? value : internalValue;
  // The tab Tab reaches: the selected tab, or the first enabled one when the selection matches no
  // enabled tab, so the tab list is never left out of the tab order.
  const tabStopValue = tabs.some((tab) => tab.value === activeValue && !tab.disabled) ? activeValue : firstEnabledValue;

  // Values of the TabPanels currently rendered (counted, in case two share a value): a tab sets
  // aria-controls only when its panel exists, so it never points at a missing id.
  const [panelCounts, setPanelCounts] = React.useState<ReadonlyMap<string, number>>(() => new Map());
  const registerPanel = React.useCallback((panelValue: string) => {
    const change = (delta: number) =>
      setPanelCounts((previous) => {
        const next = new Map(previous);
        const count = (next.get(panelValue) ?? 0) + delta;
        if (count > 0) {
          next.set(panelValue, count);
        } else {
          next.delete(panelValue);
        }
        return next;
      });
    change(1);
    return () => change(-1);
  }, []);

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

  // Both appearances show their border by default: the bottom line for `line`, the container border for
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
    () => ({ activeValue, appearance, getTabId, getPanelId, registerPanel }),
    [activeValue, appearance, getTabId, getPanelId, registerPanel],
  );

  return (
    <TabsContext.Provider value={context}>
      <div {...rest} ref={forwardedRef} className={mergeClassNames(styles.root, className)} data-appearance={appearance}>
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
                aria-controls={panelCounts.has(tab.value) ? getPanelId(tab.value) : undefined}
                tabIndex={tab.value === tabStopValue ? 0 : -1}
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
