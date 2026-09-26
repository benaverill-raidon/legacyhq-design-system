import { createContext, useContext } from 'react';

/** Internal composition context. Popup content resets this so only the cell trigger inherits it. */
export const EditableCellContext = createContext<'sm' | 'md' | null>(null);

export function useEditableCellSize() {
  return useContext(EditableCellContext);
}
