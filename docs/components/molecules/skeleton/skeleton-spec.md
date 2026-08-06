# Skeleton

## Overview

### Purpose
Skeleton renders a pulsing placeholder shape in place of content that hasn't finished loading,
preserving the layout the real content will fill.

### Description
Use Skeleton to sketch out a loading layout - a text line, an avatar circle, an image block, a
card - reducing perceived load time and layout shift versus a spinner or blank region.

### Category
Molecule

### Design Reference
- Figma Component: `skeleton` (component set, node `1565:3291`, file `Components v1.0.0`)
- Variant axis: `appearance` (2) = 2 variants (`default`, `subtle`)
- Figma's default variant example is 200x20px with a 4px corner radius; instances across the file
  freely override width, height, and corner radius per usage (avatar circles use `999` / full
  round, text lines and blocks use the default `4px` radius) rather than exposing those as named
  variants
- Figma's prototype includes an `AFTER_TIMEOUT` reaction smart-animating between the `default` and
  `subtle` variants every 1.5s (linear easing) - read as a demonstration of a pulsing loading
  effect inside Figma's prototype mode, not a literal spec for switching appearance at runtime.
  The component implements the pulse as a self-contained CSS opacity animation instead, so a
  single Skeleton pulses on its own regardless of which `appearance` is selected.

---

## Usage Guidelines

### Use When
- Content is being fetched and its final layout/shape is already known
- Preserving layout while content streams in reduces perceived load time or layout shift
- Composing a full loading skeleton for a card, list row, or page section

### Do Not Use When
- The final shape is unknown - use Spinner
- Progress is measurable - use ProgressBar
- The content is available but slow to compute inline - consider an inline Spinner instead of a
  full placeholder layout

---

## Anatomy

```text
Skeleton
└─ (optional) visually-hidden label text, when `label` is set
```

### Structure Notes
- Single root container (`div`)
- No visible children - the root itself is the placeholder shape
- No border by default
- Width defaults to 100% of the container; height defaults to one text line (`--size-250`, 20px);
  both are overridden per usage via `style` or `className`

---

## Variants

### Appearance

| Appearance | Description |
|------------|-------------|
| default | A more visible placeholder fill; use when the Skeleton is the only thing on screen |
| subtle | A lighter placeholder fill (the default); use in dense layouts alongside other content |

### Shape

| Shape | Description |
|-----------|-------------|
| rectangle | Standard small corner radius (the default) - text lines, cards, image blocks |
| circle | Fully round radius - avatar-shaped placeholders; pair with equal width/height |

`shape` is not a Figma variant axis - it mirrors how Figma instances achieve a circular skeleton by
overriding the instance's own corner radius rather than switching a named property. The component
formalizes that as a `shape` prop for ergonomics, following this system's existing convention (see
Icon Tile's `shape` prop) of a `rectangle`/`circle`-style enum instead of a raw radius override.

---

## Content Rules

### Supported Content
None. Skeleton has no children slot - it is the placeholder itself.

### Content Length
Not applicable.

---

## Properties (API)

| Property | Type | Required | Default |
|-----------|--------|----------|---------|
| appearance | `'default' \| 'subtle'` | No | `'subtle'` |
| shape | `'rectangle' \| 'circle'` | No | `'rectangle'` |
| label | string | No | undefined |
| className | string | No | undefined |
| ...rest | `React.HTMLAttributes<HTMLDivElement>` | No | - |

`...rest` (including `style`) forwards to the root `div`, which is how each usage sets its own
width/height to match the content it stands in for - Skeleton has no dedicated `width`/`height`
props, following the same forwarded-`style` convention as ProgressBar.

---

## Accessibility

### Keyboard Support
Not applicable. Skeleton is not interactive and not focusable.

### ARIA

- Default (`label` unset): `aria-hidden="true"`, no role - the loading state is assumed to have
  its own surrounding context.
- `label` set: `role="status"`, `aria-live="polite"`, and a visually-hidden span with the label
  text - the same pattern Spinner uses for its own `label` prop.

Example:

```tsx
<Skeleton label="Loading profile" />
```

---

## Design Tokens

### Colors

| Appearance | Token | Value (Light) | Value (Dark) |
|------------|------------------------------------|--------------------------------|--------------------------------|
| default | `--color-skeleton-default` (semantic) | `color-neutral-alpha-1200-08` | `color-neutral-alpha-100-08` |
| subtle | `--component-skeleton-color-subtle` (component) | `color-neutral-alpha-1200-04` | `color-neutral-alpha-100-04` |

Both were read directly off the Figma component's `boundVariables` via the Desktop Bridge plugin:
`default` binds a `Semantic: Colors` variable (`color/skeleton/default`), `subtle` binds a
`Component: Skeleton` variable (`color/skeleton/subtle`) - matching this design system's own
tiering (semantic tokens for the default case, a component-tier token for the one visual
exception), not a guess. Both are new tokens added alongside this component; no existing semantic
token already expressed "skeleton placeholder fill" (the closest match, `color-content-loading`,
resolves to the same primitive by coincidence but is a distinct, pre-existing, currently-unused
token for a different meaning - text/content loading tint - so it was left alone rather than
repurposed).

### Radius
`--border-radius-sm` (rectangle, default) or `--border-radius-full-round` (circle).

### Sizing
`inline-size: 100%` (fills container) by default; `block-size: var(--size-250)` (20px, one text
line) by default. Both are freely overridden via `style`/`className` per usage.

### Motion
`--pulse-loop` (new semantic motion token, `var(--duration-loop-slow) linear`) drives an infinite
opacity pulse (`1` \<-\> `0.5`). `--duration-loop-slow` (new primitive, `1500ms`) was added because
no existing duration primitive matched Figma's prototype timing (`--duration-loop`, used by
Spinner's spin, is `860ms` and governs a different motion). The animation is disabled under
`prefers-reduced-motion: reduce`, matching Switch and Spinner's existing convention.

### Typography
Not applicable - Skeleton has no text content of its own.

---

## Behaviors

### Default
Skeleton displays a colored, rounded placeholder shape that pulses in opacity on an infinite loop.

No interaction.

---

## Dependencies

### Uses
- None (no other component)

### Used By
- Cards, list rows, and page sections while their real content loads

---

## Engineering Notes

### Requirements
- React
- TypeScript
- CSS Modules
- CSS Variables

### Constraints
- No hardcoded colors, spacing, or radius
- No MUI dependency
- No Tailwind dependency
- The pulse animation must respect `prefers-reduced-motion: reduce`

---

## QA Checklist

### Visual
- [ ] Matches Figma for both `appearance` values
- [ ] Light mode works
- [ ] Dark mode works
- [ ] Both shapes render correctly
- [ ] Pulse animation runs on an infinite loop

### Functional
- [ ] appearance renders correctly
- [ ] shape renders correctly
- [ ] className applies correctly
- [ ] style (width/height) overrides apply correctly
- [ ] ref forwards to the root element

### Accessibility
- [ ] Default (no label) hides the element from the accessibility tree
- [ ] label exposes role="status", aria-live="polite", and a visually-hidden announcement
- [ ] Pulse animation is disabled under prefers-reduced-motion: reduce

---

## Future Enhancements
- A `text` shape preset that renders multiple lines of varying width in one component, if a
  recurring multi-line pattern emerges across products
