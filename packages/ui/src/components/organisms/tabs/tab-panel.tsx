import * as React from 'react';
import { useTabsContext } from './tabs-context';
import styles from './tabs.module.css';
import type { TabPanelProps } from './tabs.types';

function mergeClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { value, children, className, ...rest },
  forwardedRef,
) {
  const { activeValue, getTabId, getPanelId, registerPanel } = useTabsContext('TabPanel');
  const active = value === activeValue;

  // Tell Tabs this panel exists, so its tab points at it with aria-controls.
  React.useLayoutEffect(() => registerPanel(value), [registerPanel, value]);

  return (
    <div
      {...rest}
      ref={forwardedRef}
      role="tabpanel"
      id={getPanelId(value)}
      aria-labelledby={getTabId(value)}
      tabIndex={0}
      hidden={!active}
      className={mergeClassNames(styles.panel, className)}
    >
      {active ? children : null}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';
