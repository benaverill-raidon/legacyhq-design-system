import * as React from 'react';

export const TooltipScopeContext = React.createContext(false);

export function useTooltipScope() {
  return React.useContext(TooltipScopeContext);
}
