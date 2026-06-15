import * as React from 'react';
import { SliderBase } from './slider';
import type { SliderCenteredProps } from './slider.types';

export const SliderCentered = React.memo(
  React.forwardRef<HTMLInputElement, SliderCenteredProps>(function SliderCentered(props, forwardedRef) {
    return (
      <SliderBase
        {...props}
        ref={forwardedRef}
        fillMode="centered"
        defaultMin={-100}
        defaultMax={100}
        defaultDefaultValue={0}
      />
    );
  }),
);

SliderCentered.displayName = 'SliderCentered';
