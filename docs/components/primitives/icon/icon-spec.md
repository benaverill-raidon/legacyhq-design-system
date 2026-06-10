# Icon

## Overview

### Purpose
Icon provides a consistent, reusable system for rendering SVG symbols across the product.

### Description
Use Icon components to communicate actions, objects, statuses, and visual cues. Icons should be sized, spaced, colored, and labeled consistently through shared props and generated React components.

### Category
Atom / Foundational UI Asset

### Design Reference
- Figma Component: Icon
- Figma Properties:
  - `size`: `sm`, `md`
  - `spacing`: `none`, `spacious`
- Current source assets:
  - `packages/ui/src/assets/icons/source/`

---

## Design Philosophy

Icon is a foundational UI asset.

The system should make icons:
- easy to use
- easy to search
- accessible by default
- tree-shakable
- consistent in size, spacing, and color

Icons should not expose whether they originated from MUI or were custom-created. Once an icon enters the system, it becomes part of the internal icon set.

---

## Usage Guidelines

### Use When
- Supporting an action label
- Representing a known object or entity
- Improving visual scanning
- Providing status or feedback cues
- Building compact UI patterns

### Do Not Use When
- A logo is needed
- The icon would be the only indicator of critical meaning without accessible text
- The meaning is unclear without a label
- The icon is being used as decoration or illustration
- A new icon is needed but an existing icon is being forced into the wrong meaning

---

## Icon Classification

### Multi-Purpose Icons
Multi-purpose icons can be used in a variety of contexts. They are named descriptively after what they represent.

Examples:
- Add
- Search
- Archive
- ArrowRight

### Single-Purpose Icons
Single-purpose icons are reserved for a dedicated meaning and should not be reused casually.

Examples:
- AdministrativeAccount
- AutoEdit
- DocumentAdd

### Classification Rules
- Do not split icon files into separate folders by classification.
- Store classification in metadata.
- Use metadata to generate Storybook galleries.

Recommended metadata:

```json
{
  "name": "add",
  "component": "AddIcon",
  "category": "multi-purpose",
  "keywords": ["add", "create", "plus"]
}
```

---

## Folder Structure

Recommended structure:

```txt
packages/ui/src/assets/icons/
├─ source/
│  ├─ add.svg
│  ├─ archive.svg
│  ├─ auto-edit.svg
│  └─ ...
│
├─ generated/
│  ├─ AddIcon.tsx
│  ├─ ArchiveIcon.tsx
│  ├─ AutoEditIcon.tsx
│  └─ ...
│
├─ metadata/
│  └─ icons.json
│
└─ index.ts
```

Shared icon support files:

```txt
packages/ui/src/components/atoms/Icon/
├─ IconBase.tsx
├─ Icon.types.ts
├─ Icon.module.css
├─ Icon.stories.tsx
└─ index.ts
```

---

## Generation Strategy

Use an SVG-to-React generation pipeline.

Flow:

```txt
SVG source files
↓
SVGR or equivalent transform
↓
generated React icon components
↓
shared IconProps
↓
Storybook gallery
```

Generated icon components should:
- be tree-shakable
- use shared props
- use `fill="currentColor"`
- support consistent size, spacing, color, title, and decorative behavior

---

## Variants

### Size

| Size | Icon Size | Description |
|------|-----------|-------------|
| sm | 12px | Compact icon size |
| md | 16px | Default icon size |

### Spacing

| Spacing | Container | Description |
|---------|-----------|-------------|
| none | matches icon size | No extra spacing |
| spacious | 24px | Centers icon in a 24px box |

### Color

| Color | Token |
|-------|-------|
| default | `--color-content-default` |
| subtle | `--color-content-subtle` |
| inverse | `--color-content-inverse` |
| brand | `--color-content-brand` |
| success | `--color-content-success` |
| warning | `--color-content-warning` |
| error | `--color-content-error` |
| information | `--color-content-information` |
| disabled | `--color-content-disabled` |

### Default Values
- `size = 'md'`
- `spacing = 'none'`
- `color = 'default'`
- `decorative = true`

---

## Properties (API)

Every generated icon component should support the same props.

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| size | `'sm' \| 'md'` | No | `'md'` | Icon glyph size |
| spacing | `'none' \| 'spacious'` | No | `'none'` | Icon container size behavior |
| color | IconColor | No | `'default'` | Semantic content color |
| title | string | No | undefined | Accessible title when icon is meaningful |
| decorative | boolean | No | true | Hides icon from assistive technology |
| className | string | No | undefined | Optional class name |
| testId | string | No | undefined | Optional test id |

Recommended TypeScript:

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

Example:

```tsx
<SearchIcon />
<SearchIcon size="sm" />
<SearchIcon spacing="spacious" />
<SearchIcon color="subtle" />
<SearchIcon title="Search" decorative={false} />
```

---

## Accessibility

### Decorative Icons
Most icons are decorative when paired with visible text.

```tsx
<SearchIcon decorative />
```

Expected behavior:
- `aria-hidden="true"`
- no required title

### Meaningful Icons
If the icon communicates meaning without visible text, provide a title and set decorative to false.

```tsx
<SearchIcon title="Search" decorative={false} />
```

Expected behavior:
- `role="img"`
- accessible title is available

### Rules
- Default to decorative icons.
- Do not rely on icons alone for critical meaning.
- If the icon is interactive, the parent control is responsible for the accessible name.
- Do not add click handlers to icons.
- Do not make icons focusable by default.

---

## Design Tokens

### Color
Use semantic content tokens only.

```css
.icon {
  color: var(--color-content-default);
  fill: currentColor;
}
```

### Size
Use component CSS classes or data attributes.

```css
.icon[data-size='sm'] {
  width: 12px;
  height: 12px;
}

.icon[data-size='md'] {
  width: 16px;
  height: 16px;
}
```

### Spacing
Use a wrapper or root class.

```css
.root[data-spacing='none'] {
  width: var(--icon-size);
  height: var(--icon-size);
}

.root[data-spacing='spacious'] {
  width: 24px;
  height: 24px;
}
```

---

## Behaviors

### Default
Icon renders as a non-interactive SVG.

### Interaction
Icon itself is not interactive.

Interactive behavior belongs to parent components such as IconButton, Button, MenuItem, or Link.

### Disabled
Use the `disabled` color token when the parent component is disabled.

---

## Storybook Structure

Use:

```txt
Icon
├─ Playground
├─ Sizes
├─ Colors
├─ Spacing
├─ Multi-Purpose Icons
└─ Single-Purpose Icons
```

### Playground
Controls:
- icon
- size
- spacing
- color
- decorative

### Gallery
Use metadata to group icons:
- Multi-Purpose Icons
- Single-Purpose Icons

---

## QA Checklist

### Visual
- [ ] All icons render
- [ ] Icons use fill/currentColor
- [ ] sm renders as 12px
- [ ] md renders as 16px
- [ ] spacious renders in 24px container
- [ ] Color tokens render correctly
- [ ] Icons align visually with text

### Functional
- [ ] Generated icons export correctly
- [ ] Individual icon imports work
- [ ] Index exports work
- [ ] Tree-shaking is preserved
- [ ] Metadata file works
- [ ] Storybook gallery renders

### Accessibility
- [ ] Decorative icons are aria-hidden
- [ ] Meaningful icons expose title
- [ ] Icons are not focusable by default
- [ ] Parent controls retain responsibility for interaction semantics

---

## Future Enhancements
- Searchable icon gallery
- Automated metadata generation
- SVG linting
- SVG optimization
- Icon contribution guidelines
- Icon deprecation process
