# Icon Tile

## Overview

### Purpose
Icon Tile pairs a single icon with a colored, sized background shape for use cases that need
greater visual emphasis than a bare icon.

### Description
Use Icon Tile to give an icon a scannable, colored container - a feature call-out, an empty-state
graphic, or a leading visual in a list or card.

### Category
Molecule

### Design Reference
- Figma Component: `icon-tile` (component set, node `1555:3436`, file `Components v1.0.0`)
- Variant axes: `size` (5) x `shape` (2) x `appearance` (20) = 200 variants
- Icon content is a single Figma `INSTANCE_SWAP` property (`icon`), not a Figma slot

---

## Usage Guidelines

### Use When
- A feature or benefit needs a small, colored icon graphic (marketing sections, onboarding, empty
  states)
- A list or card needs a leading visual that categorizes its content by color/hue
- An icon needs more visual weight than the Icon primitive alone provides, without becoming a
  button

### Do Not Use When
- The icon should be clickable - use Icon Button
- The content is a count or short text value - use Badge or Tag
- The icon needs hover/focus/pressed/disabled states

---

## Anatomy

```text
IconTile
└─ Icon (children - a generated icon component, e.g. <CheckIcon />)
```

### Structure Notes
- Single root container (`div`)
- Single icon slot (`children`) - exactly one icon, centered
- No text content
- No border by default

---

## Variants

### Tone (Figma `appearance` hue segment)

| Tone | Description |
|--------|-------------|
| gray | Neutral emphasis |
| brand | Brand emphasis |
| red | Accent - red hue |
| orange | Accent - orange hue |
| yellow | Accent - yellow hue |
| green | Accent - green hue |
| teal | Accent - teal hue |
| blue | Accent - blue hue |
| purple | Accent - purple hue |
| magenta | Accent - magenta hue |

### Appearance (Figma `appearance` bold segment)

| Appearance | Description |
|------------|-------------|
| default | Subtle tint background, tinted icon |
| bold | Solid, saturated background, inverse (white) icon |

Figma models `tone` and `appearance` as a single flattened 20-value `appearance` property (e.g.
`red`, `redBold`). The component splits this into two independent props - `tone` for hue/meaning
and `appearance` for visual weight - following this design system's existing convention of
separating emphasis from meaning (see Button's `appearance`/`tone` split). This avoids a
20-value enum and lets `tone` and `appearance` be reasoned about independently.

### Shape

| Shape | Description |
|--------|-------------|
| square | Rounded-square container (Figma `square`) |
| round | Fully rounded/circular container (Figma `circle`, renamed to match Icon Button's `shape` prop naming) |

### Size

| Size | Container | Icon |
|------|-----------|------|
| xxs | 16px | ~10.67px (2/3 of container) |
| xs | 24px | 16px |
| sm | 32px | ~21.33px |
| md | 40px | ~26.67px |
| lg | 48px | 32px |

The icon-to-container ratio is exactly 2/3 at every size in the source Figma file (verified across
all five sizes), so the component derives icon size with `calc()` from the container size rather
than hardcoding five icon-size tokens.

---

## Content Rules

### Supported Content
A single icon element from the shared icon set (e.g. `<CheckIcon />`, `<StarStarredIcon />`) or any
element that exposes a `currentColor`-based SVG.

### Content Length
Exactly one icon. No text, no multiple icons.

---

## Properties (API)

| Property | Type | Required | Default |
|-----------|--------|----------|---------|
| children | ReactNode | Yes | - |
| tone | `'gray' \| 'brand' \| 'red' \| 'orange' \| 'yellow' \| 'green' \| 'teal' \| 'blue' \| 'purple' \| 'magenta'` | No | `'brand'` |
| appearance | `'default' \| 'bold'` | No | `'default'` |
| shape | `'square' \| 'round'` | No | `'square'` |
| size | `'xxs' \| 'xs' \| 'sm' \| 'md' \| 'lg'` | No | `'md'` |
| decorative | boolean | No | `true` |
| ariaLabel | string | No | undefined |
| className | string | No | undefined |

---

## Accessibility

### Keyboard Support
Not applicable. Icon Tile is not interactive and not focusable.

### ARIA

- Default (`decorative=true`): `aria-hidden="true"`, no role - the icon is assumed to be
  reinforcing meaning already present in surrounding text.
- `decorative={false}`: `role="img"` and `aria-label={ariaLabel}` - use when the tile is the sole
  carrier of meaning (no adjacent text label).

Example:

```tsx
<IconTile decorative={false} ariaLabel="Verified">
  <CheckIcon />
</IconTile>
```

---

## Design Tokens

### Colors

Background and icon color both come from the semantic accent-color layer, keyed by `tone` and
`appearance`:

| Tone | Appearance | Background Token | Icon Color Token |
|---------|------------|------------------------------------------------------|--------------------------------------------|
| gray | default | `--color-background-accent-gray-default-default` | `--color-content-default` |
| gray | bold | `--color-background-accent-gray-bold-default` | `--color-content-inverse` |
| brand | default | `--color-background-brand-primary-default-default` | `--color-content-brand-primary-default` |
| brand | bold | `--color-background-brand-primary-bold-default` | `--color-content-inverse` |
| {hue} | default | `--color-background-accent-{hue}-default-default` | `--color-content-accent-{hue}-default` |
| {hue} | bold | `--color-background-accent-{hue}-bold-default` | `--color-content-inverse` |

`{hue}` is one of `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `purple`, `magenta`. These
mappings were read directly off representative Figma nodes' `boundVariables` (not guessed) via the
Desktop Bridge plugin, then matched to their generated CSS custom-property names in
`packages/ui/src/tokens/generated/light.css`.

### Radius

| Size | Token (square) |
|------|----------------------|
| xxs, xs | `--border-radius-sm` |
| sm, md | `--border-radius-lg` |
| lg | `--border-radius-xl` |

`shape="round"` always uses `--border-radius-full-round` regardless of size (matches Icon Button's
`shape="round"` token).

### Sizing
Container size uses the generic semantic size scale: `--size-200` (xxs), `--size-300` (xs),
`--size-400` (sm), `--size-500` (md), `--size-600` (lg). Icon size is `calc(container * 2 / 3)`.

### Typography
Not applicable - Icon Tile has no text content.

---

## Behaviors

### Default
Icon Tile displays a centered icon inside a colored, sized, rounded container.

No interaction. No animation.

---

## Dependencies

### Uses
- Icon (primitive) - via `children`, any icon from the generated icon set

### Used By
- Feature/benefit lists
- Empty states
- Cards
- List items

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
- The passed-in icon must not impose its own color or size - the CSS module overrides the icon's
  own `data-color`/`data-size` attributes (the same technique Icon Button already uses for its
  `.content :global([data-color])` rule) so the icon always inherits the tile's computed color and
  fills the tile's computed icon-size box, regardless of the icon component's own defaults.

---

## QA Checklist

### Visual
- [ ] Matches Figma across all `tone` x `appearance` combinations
- [ ] Light mode works
- [ ] Dark mode works
- [ ] Both shapes render correctly at all five sizes

### Functional
- [ ] children (icon) renders and fills the icon box
- [ ] tone renders correctly
- [ ] appearance renders correctly
- [ ] shape renders correctly
- [ ] size renders correctly
- [ ] className applies correctly

### Accessibility
- [ ] decorative default hides the tile from the accessibility tree
- [ ] decorative=false + ariaLabel exposes role="img" and the label

---

## Future Enhancements
- Additional tones if Figma adds more accent hues
- An `xl` size if a larger variant is added to Figma
