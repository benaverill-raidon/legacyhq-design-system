# Chip Group Component Spec

## Overview

Chip Group is a wrapping, aligned row of Chips sharing one size. It is pure layout: no padding,
background, border, or interactive element of its own.

No tier exception applies. Chip Group composes only Chip (a molecule) and renders a plain `div` -
it does not reach into any organism itself. Chip's own `mode="filter"` composes Dropdown Menu, but
that is Chip's documented exception, not this one's.

## Anatomy

```txt
ChipGroup
└─ root (wrapping flex row, 8px gap both axes, align-items center, no padding)
   └─ children  (Chips)
```

## Public API

```ts
type ChipGroupAlignment = 'left' | 'right';

interface ChipGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: ChipSize;
  alignment?: ChipGroupAlignment;
}
```

`children`, not a data array. Tag Group and Avatar Group own their items because they must decide
which are visible and which are truncated. Chip Group has no overflow behaviour, and Chip's own props
are a discriminated union on `mode` that a flat item type could not express without duplicating the
whole union. Button Group - the closest analogue in this system - is likewise a children-based layout
wrapper.

Extending `React.HTMLAttributes<HTMLDivElement>` and forwarding a ref matches Button Group exactly.

## Defaults

```txt
alignment: left     (Figma's own first variant)
size:      unset    (each Chip keeps its own default)
```

`size` is deliberately **not** defaulted to `md`. An unset group means "I am not opinionated about
size", which leaves each Chip on its own default - distinct from a group that actively sets `md`.

## Sharing size

`size` reaches each Chip through `ChipSizeContext`, not by cloning children:

```tsx
// chip/chip-size-context.ts
export const ChipSizeContext = React.createContext<ChipSize | undefined>(undefined);
export function useChipSize(explicitSize: ChipSize | undefined): ChipSize {
  return explicitSize ?? React.useContext(ChipSizeContext) ?? 'md';
}
```

Three properties follow, and all three are the reason context beat the alternatives:

1. **It survives wrappers.** `cloneElement` only reaches direct children, so a Chip inside a Tooltip,
   returned from a `.map`, or rendered conditionally would silently miss the group's size. That is the
   same structural fragility that detached Chip's own remove button from its pill.
2. **Explicit still wins.** Chip resolves `size ?? groupSize ?? 'md'`, so setting `size` on one Chip
   overrides the group.
3. **An unset group is inert.** The provider is only mounted when `size` is actually set, so a Chip
   Group without one does not override anything with `undefined`.

The context lives with Chip rather than with Chip Group, so Chip can consume it without importing its
own group (which would be a cycle).

## Alignment

`alignment` maps to Figma's own axis, measured as `primaryAxisAlignItems`:

| alignment | Figma | CSS |
|---|---|---|
| `left` (default) | MIN | `justify-content: flex-start` |
| `right` | MAX | `justify-content: flex-end` |

**This is not Tag Group's `alignment`,** despite the identical name. There, `alignment` decides where
the *overflow tag* renders (leading vs trailing). Chip Group has no overflow, so here it means what it
looks like: which edge the chips pack against.

## Geometry

Measured directly from Figma, identical across all four variants:

| property | value | token |
|---|---|---|
| layoutMode | HORIZONTAL | `display: flex` |
| layoutWrap | WRAP | `flex-wrap: wrap` |
| itemSpacing | 8 | `gap: var(--spacing-sm)` |
| counterAxisSpacing | 8 | (same `gap` covers both axes) |
| counterAxisAlignItems | CENTER | `align-items: center` |
| padding | 0 | none |

No fill, no stroke, no radius. The group contributes exactly one token reference - the gap.

## What it deliberately does not do

- **No overflow or truncation.** Figma models none; all ten chips in every variant are plain, equal
  siblings. Chip Group is not Tag Group with chips in it.
- **No selection management.** Figma's variants are all `isSelected=false` search chips, which are
  independent on/off toggles, so one-of-N coordination belongs to the consumer holding the
  state - exactly as with Toggle Button.
- **No roving tabindex.** The chips are independent controls, not one composite widget, so each
  Chip's own controls stay individually tabbable.

## Accessibility

- `role="group"` only when `aria-label` or `aria-labelledby` is provided. An unnamed group is a
  boundary a screen-reader user steps through for no benefit - the same rule Button Group follows.
- No focus or keyboard behaviour of its own; everything belongs to the Chips inside.

## Storybook

```txt
Chip Group
├─ Docs (.mdx)
├─ Playground
├─ Alignment
├─ Sizes
├─ Wrapping
├─ Content
└─ EdgeCases
```

- **Alignment** - both values inside a bounded, visibly-outlined container so the packing edge is
  legible.
- **Sizes** - both sizes, plus one Chip opting out of the group's size.
- **Wrapping** - a narrow container forcing a second line.
- **Content** - a live scope selector and a live, removable filter bar.
- **EdgeCases** - a single chip, mixed modes in one group, disabled chips, dark surface.

## Tests

```txt
renders its children
defaults to left alignment
supports right alignment
applies its size to every Chip inside
lets an individual Chip's own size win over the group's
leaves Chips on their own default when the group sets no size
reaches a Chip through a wrapper (the reason this uses context, not cloneElement)
does not manage selection - each search Chip stays independent
is announced as a group only when it has an accessible name
forwards a ref and passes native div attributes through
supports a custom className alongside its own
wraps with a single 8px gap on both axes, matching Figma
maps alignment to justify-content, matching Figma primaryAxisAlignItems MIN/MAX
adds no padding of its own - the group is pure layout
```

## Future considerations

- Overflow truncation behind a "+N more" chip, if a real filter bar needs it - would need a Figma
  variant first.
- A vertical orientation, if chips ever stack; Figma models horizontal only.

Do not implement these unless requested.
