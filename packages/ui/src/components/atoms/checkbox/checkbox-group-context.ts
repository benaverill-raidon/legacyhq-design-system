import * as React from 'react';

/**
 * What a Checkbox Group passes to every Checkbox inside it, from `options` or `children`: the
 * group's `disabled`, so the checkboxes look disabled, not only natively disabled by the fieldset.
 */
export interface CheckboxGroupContextValue {
  disabled: boolean;
}

export const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue>({ disabled: false });
