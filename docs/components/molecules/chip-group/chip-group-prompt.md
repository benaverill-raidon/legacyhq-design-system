# Generate Chip Group Molecule

Use `chip-group-spec.md` as the source of truth.

## Goal

Generate a production-ready Chip Group molecule for our internal React component library. Chip Group
lays out a wrapping row of Chips at one shared size and alignment. It is **pure layout** - no padding,
background, border, or interactive element of its own.

No tier exception applies: Chip Group composes only Chip and renders a plain `div`.

---

## Inputs

- `chip-group-checklist.md` for design/product context
- `chip-group-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma component set `chip-group` (fileKey `M0eINB6n1BfrXu7ntYqb1i`, "Components v1.0.0",
  componentSetNodeId `4636:84492`, page "✅⏲️ Chip Group") - 4 variants, verified live via the
  Desktop Bridge plugin
- The existing Chip molecule and its `ChipSizeContext`
- The existing Button Group molecule - the closest structural precedent

If anything conflicts, follow `chip-group-spec.md`.

---

## Framework

- React + TypeScript
- CSS Modules (`chip-group.module.css`) - one token reference only (`gap`), plus layout keywords

---

## Implementation

```txt
packages/ui/src/components/molecules/chip-group/
├─ chip-group.tsx
├─ chip-group.types.ts
├─ chip-group.module.css
├─ ChipGroup.test.tsx
├─ ChipGroup.stories.tsx
├─ chip-group.mdx
└─ index.ts
```

Chip needs one change: it must resolve its size as `size ?? groupSize ?? 'md'` via
`ChipSizeContext`. That context file lives with **Chip** (`chip/chip-size-context.ts`), not here, so
Chip can consume it without importing its own group - which would be a cycle.

---

## Component API

```ts
type ChipGroupAlignment = 'left' | 'right';

interface ChipGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: ChipSize;
  alignment?: ChipGroupAlignment;
}
```

Take **`children`, not a data array.** Tag Group and Avatar Group own their items because they decide
which are visible vs truncated; Chip Group has no overflow, and Chip's props are a discriminated union
on `mode` that a flat item type could not express without duplicating the union. Follow Button Group:
extend `React.HTMLAttributes<HTMLDivElement>` and forward a ref.

Defaults:

```ts
alignment = 'left'   // Figma's own first variant
size       = unset   // deliberately NOT 'md' - see below
```

---

## Behavioral Requirements

- Share `size` with descendant Chips through **React context**, never `React.cloneElement`. Cloning
  only reaches direct children, so a Chip inside a Tooltip, returned from a `.map`, or rendered
  conditionally would silently miss the size - the same structural fragility that once detached Chip's
  own remove button from its pill.
- An explicit `size` on an individual Chip must win over the group's.
- **Mount the provider only when `size` is set.** An unset group means "not opinionated about size"
  and must leave every Chip on its own default rather than overriding it with `undefined`. Do not
  default `size` to `'md'` - that would erase this distinction.
- Apply `role="group"` **only** when `aria-label` or `aria-labelledby` is given, matching Button Group.
  An unnamed group is a boundary a screen-reader user steps through for no benefit.
- Add **no** roving tabindex or arrow-key handling: the chips are independent controls, not one
  composite widget.
- Never manage selection or removal between chips. Figma's variants are all `isSelected=false` scope
  chips, and scope chips are independent on/off toggles - one-of-N coordination belongs to the
  consumer, exactly as with Toggle Button.
- Do **not** implement overflow or truncation. Figma models none; all ten chips in every variant are
  plain, equal siblings. Chip Group is not Tag Group with chips in it.
- Expose `data-alignment` and `data-size` on the root for testing and debugging.

---

## CSS Requirements

- `.root`: `display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-sm);` - matching
  Figma's measured layoutMode HORIZONTAL, layoutWrap WRAP, counterAxisAlignItems CENTER, and
  itemSpacing 8 / counterAxisSpacing 8 (one `gap` covers both axes).
- `.alignment_left { justify-content: flex-start; }` and
  `.alignment_right { justify-content: flex-end; }`, matching Figma's `primaryAxisAlignItems` MIN/MAX.
- **No padding, background, border, or radius.** The group is pure layout; every visible pixel belongs
  to the Chips. A test asserts the absence of padding.
- Exactly one token reference (`gap`); everything else is layout keywords.

---

## Storybook Requirements

- Playground (prop exploration)
- Alignment (both values, inside a bounded outlined container so the packing edge is legible)
- Sizes (both sizes, plus one Chip opting out of the group's size)
- Wrapping (a narrow container forcing a second line)
- Content (a live scope selector and a live, removable filter bar)
- EdgeCases (a single chip, mixed modes in one group, disabled chips, dark surface)

---

## Test Requirements

See the list in `chip-group-spec.md`. The one that must not be dropped: **a Chip behind a wrapper
still inherits the group's size** - that case is the entire reason this uses context rather than
cloning, and it is what a future refactor would break first.

---

## Rules

1. Follow `chip-group-spec.md` exactly.
2. Do not reimplement anything Chip already does.
3. No MUI. No Tailwind. No hardcoded values.
4. Export the component and its types.

---

## Validation

- Verify all files exist.
- `npm run typecheck`, `npm run lint`, `npm run lint:css`, `npm test` all pass.
- Verify live in Storybook: an 8px gap on both axes when wrapping, chips packing against the correct
  edge for each alignment, a uniform chip height across the group, and a per-Chip size override still
  winning.
