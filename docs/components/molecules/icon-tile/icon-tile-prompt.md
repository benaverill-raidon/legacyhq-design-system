# Generate Icon Tile Component

Use `icon-tile-spec.md` as the source of truth.

## Goal

Generate a production-ready Icon Tile component.

Icon Tile is a non-interactive molecule that pairs a single icon with a colored, sized background
shape.

---

## Framework

- React
- TypeScript

---

## Styling

- CSS Modules
- CSS Variables only
- Use generated token CSS
- No hardcoded values

---

## Expected Files

```txt
icon-tile/
├─ icon-tile.tsx
├─ icon-tile.types.ts
├─ icon-tile.module.css
├─ IconTile.test.tsx
├─ IconTile.stories.tsx
├─ icon-tile.mdx
└─ index.ts
```

---

## Props

```ts
export interface IconTileProps {
  children: React.ReactNode;

  tone?:
    | 'gray'
    | 'brand'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'teal'
    | 'blue'
    | 'purple'
    | 'magenta';

  appearance?: 'default' | 'bold';
  shape?: 'square' | 'round';
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  decorative?: boolean;
  ariaLabel?: string;
  className?: string;
}
```

Defaults:

```ts
tone = 'brand'
appearance = 'default'
shape = 'square'
size = 'md'
decorative = true
```

---

## Accessibility Rules

- Icon Tile is not interactive
- Icon Tile is not focusable
- `decorative=true` (default): `aria-hidden="true"`, no role
- `decorative=false`: `role="img"`, `aria-label` from `ariaLabel`

---

## Storybook Stories

Create:
- Playground
- Variants (tone x appearance matrix)
- Sizes
- Shapes
- Composition (in cards/lists)

---

## Test Requirements

Create tests for:
- children (icon) rendering
- default tone/appearance/shape/size
- each prop overriding its default
- decorative default (aria-hidden, no role)
- decorative=false + ariaLabel (role="img")
- className support
- radius/size tokens present in the CSS module

---

## Rules

1. Follow icon-tile-spec.md exactly.
2. Use semantic CSS variables - never primitives.
3. No MUI.
4. No Tailwind.
5. No hardcoded design values.
6. Export component and types.
7. The passed-in icon must inherit the tile's color and fill the tile's icon-size box - override
   its own `data-color`/`data-size` via CSS, following Icon Button's existing
   `.content :global([data-color])` precedent.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript types compile.
- Verify Storybook compiles and renders every tone/appearance/shape/size.
- Verify CSS uses variables.
- Verify implementation matches the spec.
