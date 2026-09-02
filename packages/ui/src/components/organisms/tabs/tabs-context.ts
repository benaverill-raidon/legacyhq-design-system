import * as React from 'react';
import type { TabsType } from './tabs.types';

export interface TabsContextValue {
  activeValue: string | undefined;
  type: TabsType;
  getTabId: (value: string) => string;
  getPanelId: (value: string) => string;
}

export const TabsContext = React.createContext<TabsContextValue | null>(null);

export function useTabsContext(component: string): TabsContextValue {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error(`${component} must be rendered inside <Tabs>.`);
  }

  return context;
}
