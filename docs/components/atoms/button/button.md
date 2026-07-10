# Button

Button is an atom used to trigger a user-initiated action. It renders a native `button` element and provides the system’s standard action control for forms, workflows, dialogs, and contextual actions.

## When to use

Use Button when the user is performing an action, such as saving, submitting, confirming, canceling, opening a dialog, or starting a workflow. Use semantic tones when the action carries meaning, such as warning, destructive/error, or discovery-oriented actions.

## When not to use

Do not use Button for navigation-only behavior; use Link or Link Button instead. Do not use Button for icon-only actions; use Icon Button. Do not use Button for persistent selected/unselected state; use Toggle Button. Do not use Button as a loading indicator without an associated user action.

## Design intent

Button separates visual emphasis from semantic meaning. `appearance` controls emphasis (`default`, `primary`, `subtle`) and `tone` controls intent (`neutral`, `warning`, `error`, `discovery`). This avoids a large variant matrix while keeping action meaning explicit.

Button is text-first. It may include leading or trailing icons, but icon-only usage belongs to Icon Button. Loading should preserve the action label and avoid layout shift.

## Accessibility expectations

Button must render a native `<button>`, default to `type="button"`, support native `type="submit"` and `type="reset"`, and use the native `disabled` attribute when disabled. Loading buttons set `aria-busy="true"`, prevent duplicate activation, and expose a non-interactive busy state without removing the action label. Focus must use the shared Focus Ring pattern.

## Implementation constraints

Use CSS Modules and design tokens. Use component tokens only for button min-height. Use semantic tokens for colors, spacing, radius, typography, border width, and focus treatment. Do not use MUI, Tailwind, hardcoded colors, hardcoded typography, or an icon-size prop. Icons use the medium icon size for all button sizes.

## Related components

- Icon Button
- Link Button
- Toggle Button
- Toggle Icon Button
- Spinner
- Focus Ring
