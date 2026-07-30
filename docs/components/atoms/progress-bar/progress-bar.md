# Progress Bar

Progress Bar is an atom that communicates how much of a determinate system process has completed. It supports a linear bar for layouts with horizontal space and a circular indicator for compact summaries.

Use it for processes such as document generation, uploads, imports, onboarding completion, or other operations that can report a value between 0 and 100. Do not use it for indeterminate loading, interactive value selection, data visualization, or step-based workflow navigation. Use Spinner for indeterminate loading and Slider for user-controlled values.

The design intent is to make completed and remaining progress immediately distinguishable while keeping both variants driven by one shared value model. The linear version is fluid-width and preserves fixed stop marks at the track endpoints. The circular version uses vector geometry, begins at 12 o'clock, and advances clockwise. Figma-only parts remain private implementation anatomy rather than public components.

Each track-stop mark stays legible against whichever segment it currently sits on top of: it renders in the progress-fill color when the remaining track is underneath it, and in the remaining-track color when the progress fill is underneath it, rather than using one fixed color regardless of position.

Progress Bar is read-only and non-focusable. It exposes native progress semantics through `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`. Every meaningful instance needs an accessible name through `aria-label`, `aria-labelledby`, or the `label` prop. A custom `aria-valuetext` can be generated for domain-specific descriptions.

Implementation must use React, TypeScript, CSS Modules, and design tokens. Linear progress should be rendered with CSS, while circular progress should use inline SVG rather than exported Figma images. Values are clamped to the 0–100 range, and component tokens should be limited to anatomy-specific dimensions.
