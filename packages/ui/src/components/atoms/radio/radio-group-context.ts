import * as React from 'react';

/**
 * What a Radio Group passes to every Radio inside it, from `options` or `children`: the group's
 * `disabled` (so the radios look disabled, not only natively disabled by the fieldset) and its
 * `required` (so each radio is natively required without showing its own `*`).
 */
export interface RadioGroupContextValue {
  disabled: boolean;
  required: boolean;
}

export const RadioGroupContext = React.createContext<RadioGroupContextValue>({ disabled: false, required: false });
