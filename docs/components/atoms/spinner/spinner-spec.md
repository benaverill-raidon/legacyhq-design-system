# Spinner Component Spec

## Component Overview

Spinner is a non-interactive primitive used to communicate that content is loading. It is an animated partial circular icon used for indeterminate loading states.

## Status

- Component name: `Spinner`
- Component category: Primitive
- Stability target: Production-ready
- Default size: `lg`
- Default accessibility mode: Decorative

## Anatomy

```txt
Spinner
└─ Root span
   └─ SVG
      └─ Partial circular path
```

### Root

The root element controls:

- size
- color
- display behavior
- accessibility attributes

### SVG

The SVG controls:

- circular arc shape
- stroke width
- rotation animation

## Variants

### Size

| Size | Visual size | Intended use |
|---|---:|---|
| `sm` | 12px | Dense UI, inline loading, compact controls |
| `md` | 16px | Small controls, table rows, compact cards |
| `lg` | 24px | Default loading indicator, buttons, panels |
| `xl` | 48px | Larger empty/loading regions |

Default: `lg`

## Props API

```ts
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  label?: string;
}
```

### Prop Details

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | Controls the visual size of the spinner. |
| `label` | `string` | `undefined` | Optional accessible label for standalone loading states. |
| `className` | `string` | `undefined` | Allows custom class composition. |
| native span props | `React.HTMLAttributes<HTMLSpanElement>` | — | Allows `data-*`, `id`, and other safe span attributes. |

## Rendering Requirements

Spinner must render as a non-interactive inline element.

Recommended markup:

```tsx
<span className={...} aria-hidden="true">
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
    <path ... />
  </svg>
</span>
```

When `label` is provided:

```tsx
<span role="status" aria-live="polite" className={...}>
  <svg focusable="false" aria-hidden="true" ... />
  <span className="visuallyHidden">Loading</span>
</span>
```

## Design Token Requirements

Use CSS variables only.

### Color

Spinner color:

```css
color: var(--color-border-bold);
```

SVG path should use:

```css
stroke: currentColor;
```

### Size Tokens

Recommended component-level tokens:

```css
--component-spinner-size-sm: 12px;
--component-spinner-size-md: 16px;
--component-spinner-size-lg: 24px;
--component-spinner-size-xl: 48px;
```

### Spinner Implementation Tokens

Spinner stroke width mapping:

```css
sm: var(--component-spinner-border-width-sm);
md: var(--component-spinner-border-width-md);
lg: var(--component-spinner-border-width-lg);
xl: var(--component-spinner-border-width-xl);
```

Spinner stroke color:

```css
color: var(--color-border-bold);
```

These values should be component modifier tokens, not global semantic border-width tokens. This keeps `1.5px` available as a primitive, but prevents it from becoming a broad semantic border-width option.

## Figma-Derived Values

The provided Figma screenshots show approximate stroke widths:

| Size | Figma visual size | Figma stroke value | Recommended token value |
|---|---:|---:|---:|
| `sm` | ~12px | ~1.12px | 1px |
| `md` | ~16px | ~1.49px | 1.5px |
| `lg` | ~24px | ~2.24px | 2px |
| `xl` | ~48px | ~2.99px | 3px |

Rounding should favor clean implementation values that maintain the intended visual weight.

## CSS Requirements

Root should:

- use `display: inline-flex`
- use `align-items: center`
- use `justify-content: center`
- use tokenized width and height
- use `color: var(--color-border-bold)`
- not set layout-affecting margins
- not include pointer styles

SVG should:

- use `width: 100%`
- use `height: 100%`
- use `display: block`
- use `overflow: visible` if needed
- use `stroke: currentColor`
- use `fill: none`
- use `stroke-linecap: butt`
- render a fixed 90-degree arc, visually equal to 25% of the full circle

Animation should:

- use CSS keyframes
- rotate continuously in normal motion mode
- use an Atlassian-style `860ms` continuous rotation
- use easing that slows the rotation near the top/cycle boundary
- reduce/stop motion for `prefers-reduced-motion: reduce`

## Accessibility Requirements

Spinner is visual-only by default.

Default:

- no ARIA role
- `aria-hidden="true"`
- SVG `aria-hidden="true"`
- SVG `focusable="false"`
- no tab index
- no keyboard handlers

With `label`:

- root gets `role="status"`
- root gets `aria-live="polite"`
- root is not focusable
- visible SVG remains `aria-hidden="true"`
- label is rendered as visually hidden text

Do not use `aria-label` alone if the implementation can render visually hidden text, because visible-hidden text is easier to inspect and test.

## Storybook Structure

Primitive story structure:

```txt
Spinner
├─ Playground
└─ Examples
```

Stories to include:

- Playground
- Sizes
- Standalone accessible loading state
- Inline with text
- Button loading example
- Card or panel loading example
- Dark surface example
- Reduced motion note or demo if feasible

## Testing Requirements

Use Vitest and React Testing Library.

Test:

- renders without crashing
- renders default `lg` size class
- renders `sm`, `md`, `lg`, and `xl` size classes
- accepts custom `className`
- forwards native span attributes
- is decorative by default with `aria-hidden="true"`
- does not expose `role="status"` by default
- exposes `role="status"` when `label` is provided
- renders visually hidden label text when `label` is provided
- SVG is always `aria-hidden="true"` and `focusable="false"`

## Engineering Requirements

Create:

```txt
packages/ui/src/components/atoms/spinner/
├── spinner.tsx
├── spinner.types.ts
├── spinner.module.css
├── spinner.test.tsx
├── spinner.stories.tsx
└── index.ts
```

Do not use:

- MUI
- Tailwind
- hardcoded colors
- hardcoded semantic border tokens for spinner stroke
- external animation libraries

## QA Checklist

- TypeScript compiles.
- Tests compile and pass.
- Storybook compiles.
- Component exports from `index.ts`.
- All sizes render correctly.
- Default size is `lg`.
- Spinner uses `--color-border-bold`.
- Spinner uses component-specific size and stroke tokens.
- Normal animation works.
- Reduced-motion behavior works.
- Decorative and labeled accessibility modes work.
