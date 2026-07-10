# Spinner Component Checklist

## Purpose

Spinner is a compact animated loading indicator used when content, data, or an action result is in progress and the wait time is unknown.

Reference: Atlassian describes a spinner as an animated spinning icon that lets users know content is being loaded.

## Use Cases

Use Spinner when:

- A small area of the UI is loading.
- A button or form action is processing.
- A panel, table, card, or async section is waiting for data.
- The loading duration is indeterminate.

Do not use Spinner when:

- Progress can be measured. Use a progress indicator instead.
- The entire page needs a structured loading state. Use skeletons or a page-level loading pattern.
- The loading state is so brief that showing motion creates unnecessary visual noise.

## Component Type

- Category: Primitive
- Component name: Spinner
- Interactivity: Non-interactive
- Rendered element: `span` wrapper with inline `svg`
- Behavior: Visual loading indication only

## Variants

### Size

- `sm` = 12px
- `md` = 16px
- `lg` = 24px
- `xl` = 48px

Default: `lg`

## Accessibility Requirements

Spinner should be decorative by default.

Default behavior:

- `aria-hidden="true"`
- no role
- no label
- no keyboard behavior
- not focusable

When a label is provided:

- expose `role="status"`
- expose a visually hidden accessible label
- set `aria-live="polite"`
- keep the visual spinner itself hidden from assistive technologies

This keeps the primitive flexible. A spinner used next to visible loading text does not need to announce itself, while a standalone loading indicator can provide accessible context.

## Reduced Motion

Spinner must respect `prefers-reduced-motion: reduce`.

Recommended behavior:

- Stop continuous rotation.
- Preserve the visible partial arc.
- Do not replace with a different component.

## Token Strategy

Spinner size and stroke width are component-specific geometry decisions. They should not be added to the global semantic border-width scale.

Recommended component modifier tokens:

```css
--spinner-size-sm: 12px;
--spinner-size-md: 16px;
--spinner-size-lg: 24px;
--spinner-size-xl: 48px;

--spinner-stroke-width-sm: 1px;
--spinner-stroke-width-md: 1.5px;
--spinner-stroke-width-lg: 2px;
--spinner-stroke-width-xl: 3px;
```

Color should use the semantic token requested for the component:

```css
--color-border-bold
```

If `--color-border-bold` does not exist in the current generated token CSS, document it as missing rather than replacing it silently.

## Design Decisions

- Use SVG instead of CSS border tricks for better control over arc geometry.
- Use `currentColor` inside the SVG so color can be controlled at the wrapper level.
- Use component-level stroke-width tokens because spinner stroke is not a general UI border.
- Do not expose tone variants for now.
- Do not add interaction, focus styles, or keyboard behavior.

## Dependencies

- React
- TypeScript
- CSS Modules
- Storybook
- Vitest
- React Testing Library
- Generated CSS variables

## QA Checklist

- Renders at all supported sizes.
- Default size is `lg`.
- Uses `--color-border-bold` for color.
- Uses component-level size/stroke tokens.
- Animation works in normal motion mode.
- Animation stops or is reduced when `prefers-reduced-motion` is enabled.
- Decorative spinner is hidden from assistive tech by default.
- Labeled spinner exposes accessible loading status.
- No MUI dependency.
- No Tailwind dependency.
- No hardcoded colors.
- No hardcoded spacing.
