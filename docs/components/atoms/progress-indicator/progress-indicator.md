# Progress Indicator

Progress Indicator is an atom that shows users where they are within a finite sequence of steps. It renders a row of dots with one selected dot representing the current position.

Use it for onboarding, guided setup, multi-step forms, carousels, and other journeys where relative position matters. Do not use it for percentage-based system progress, indeterminate loading, tabs, or labeled step navigation. Use Progress Bar for determinate process completion and a future Stepper pattern for labeled or interactive steps.

The component supports `default`, `primary`, and `inverted` appearances in small and medium sizes. The number of dots is dynamic and comes from `totalSteps`; it is not limited to the five-dot Figma example. Only one dot is selected, and the component does not represent completed steps separately.

Progress Indicator remains controlled by `currentStep` and `totalSteps`. External Previous and Next buttons belong to surrounding composition, not to the component itself. The component may optionally support direct dot selection through `onStepChange`; when that callback is not provided, dots remain passive and non-focusable.

Progress Indicator exposes progress semantics through `role="progressbar"` with one-based minimum, maximum, and current values. It announces `Step X of Y` by default and supports custom value text. In passive mode, dots are decorative and hidden from assistive technology. In interactive mode, each dot becomes a native button with an accessible label and the selected step exposes `aria-current="step"`.

Implementation should use React, TypeScript, CSS Modules, design tokens, and the shared Focus Ring behavior for interactive dots. Dots should be rendered with CSS rather than Figma-exported images. The Figma-only Indicator Dot part remains private component anatomy and should not be exported independently.

The interactive dot's hover/press overlay and the selected/unselected color swap both use the `fade-quick` semantic motion token rather than snapping instantly.
