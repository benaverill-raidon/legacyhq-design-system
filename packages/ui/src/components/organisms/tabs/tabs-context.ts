import * as React from 'react';
import type { TabsAppearance } from './tabs.types';

export interface TabsContextValue {
  activeValue: string | undefined;
  appearance: TabsAppearance;
  getTabId: (value: string) => string;
  getPanelId: (value: string) => string;
  /** Called by a TabPanel while it's mounted, so its tab sets `aria-controls`. Returns the cleanup. */
  registerPanel: (value: string) => () => void;
}

export const TabsContext = React.createContext<TabsContextValue | null>(null);

export function useTabsContext(component: string): TabsContextValue {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error(`${component} must be rendered inside <Tabs>.`);
  }

  return context;
}
