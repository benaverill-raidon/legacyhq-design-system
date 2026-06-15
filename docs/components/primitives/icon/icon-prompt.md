# Generate Icon System

Use `icon-spec.md` as the source of truth.

## Goal

Generate a scalable Icon system for our internal React component library.

The system currently has about 230 SVG icons exported to:

```txt
packages/ui/src/assets/icons/source/
```

All icons are fill-based and should consume semantic `color-content` tokens.

---

## Inputs

Use these inputs:
- `icon-checklist.md` for product/design context
- `icon-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma screenshot as visual reference
- SVG source icons from `packages/ui/src/assets/icons/source/`
- Generated token CSS files:
  - `packages/ui/src/tokens/generated/tokens.css`
  - `packages/ui/src/tokens/generated/light.css`
  - `packages/ui/src/tokens/generated/dark.css`

If anything conflicts, follow `icon-spec.md`.

---

## Framework

- React
- TypeScript
- CSS Modules
- CSS Variables
- SVG assets
- SVGR or equivalent SVG-to-React generation

---

## Architecture Requirements

Create a generated icon component per SVG.

Do not create a single registry-based API as the primary implementation.

Preferred usage:

```tsx
<SearchIcon />
<SearchIcon size="sm" color="subtle" />
<SearchIcon spacing="spacious" />
<SearchIcon title="Search" decorative={false} />
```

This is preferred for:
- tree-shaking
- clear imports
- scalable maintenance
- simple component usage

---

## Folder Structure

Use:

```txt
packages/ui/src/assets/icons/
├─ source/
├─ generated/
├─ metadata/
│  └─ icons.json
└─ index.ts
```

Use shared Icon support files here:

```txt
packages/ui/src/components/atoms/Icon/
├─ IconBase.tsx
├─ Icon.types.ts
├─ Icon.module.css
├─ Icon.stories.tsx
└─ index.ts
```

---

## Shared Props

Every generated icon component must support:

```ts
export type IconSize = 'sm' | 'md';
export type IconSpacing = 'none' | 'spacious';

export type IconColor =
  | 'default'
  | 'subtle'
  | 'inverse'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'information'
  | 'disabled';

export interface IconProps {
  size?: IconSize;
  spacing?: IconSpacing;
  color?: IconColor;
  title?: string;
  decorative?: boolean;
  className?: string;
  testId?: string;
}
```

Defaults:

```ts
size = 'md'
spacing = 'none'
color = 'default'
decorative = true
```

---

## Variant Requirements

### Size
- sm = 12px
- md = 16px

### Spacing
- none = container matches icon size
- spacious = icon centered in 24px container

### Color
Map to semantic content tokens:

```txt
default     -> --color-content-default
subtle      -> --color-content-subtle
inverse     -> --color-content-inverse
brand       -> --color-content-brand
success     -> --color-content-success
warning     -> --color-content-warning
error       -> --color-content-error
information -> --color-content-information
disabled    -> --color-content-disabled
```

---

## SVG Requirements

All icons are fill icons.

Normalize SVGs so they use:

```svg
fill="currentColor"
```

or equivalent.

Do not preserve hardcoded fills unless an icon truly requires multiple internal colors. If that happens, report it.

Generated SVG components should:
- preserve viewBox
- remove unnecessary metadata
- not be focusable by default
- support accessible title behavior
- support decorative mode

---

## Accessibility Requirements

Every generated icon must support:

```tsx
<SearchIcon decorative />
```

and:

```tsx
<SearchIcon title="Search" decorative={false} />
```

Behavior:
- Decorative icons use `aria-hidden="true"`.
- Meaningful icons use `role="img"` and expose title.
- Icons do not add interaction behavior.
- Icons are not focusable by default.
- Parent controls are responsible for interaction semantics.

---

## Metadata Requirements

Create:

```txt
packages/ui/src/assets/icons/metadata/icons.json
```

Each icon entry should support:

```json
{
  "name": "add",
  "component": "AddIcon",
  "category": "multi-purpose",
  "keywords": ["add", "create", "plus"]
}
```

Initial category may be inferred from existing naming if possible, otherwise use `multi-purpose` as default and leave clear notes for manual refinement.

Do not create separate folders for:
- MUI vs custom
- single-purpose vs multi-purpose

Use metadata instead.

---

## Storybook Requirements

Create:

```txt
Icon
├─ Playground
├─ Sizes
├─ Colors
├─ Spacing
├─ Multi-Purpose Icons
└─ Single-Purpose Icons
```

Storybook should:
- show size options
- show spacing options
- show color options
- generate gallery pages from metadata
- avoid manually writing 230 individual stories

---

## Test Requirements

Create tests for:
- default render
- sm size
- md size
- none spacing
- spacious spacing
- content color classes
- decorative mode
- meaningful title mode
- className support
- testId support

Also add at least one test proving a generated icon component works.

---

## Quality Requirements

Before finishing:
- verify TypeScript compiles
- verify Storybook compiles
- verify tests compile
- verify icons render
- verify generated exports work
- verify SVGs use currentColor
- verify no MUI dependency is introduced
- verify no Tailwind dependency is introduced
- list any SVGs with hardcoded colors or unusual structures

---

## Final Output

After generating:
1. Explain the icon generation architecture.
2. Explain how to add a new icon.
3. Explain how metadata powers Storybook grouping.
4. List any assumptions.
5. List any icon source issues found.
