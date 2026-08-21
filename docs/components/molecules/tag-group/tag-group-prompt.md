# Generate Tag Group Molecule

Use `tag-group-spec.md` as the source of truth.

## Goal

Generate a production-ready Tag Group molecule for our internal React component library. Tag Group
lays out a wrapping row of Tags with an optional overflow tag - a "+N more" Tag that opens a
Dropdown Menu holding whichever tags got truncated - a thin composition, not a third independent
implementation of wrapping-row layout or floating-panel behavior.

Tag Group is classified as a molecule, but its overflow panel composes Dropdown Menu, which is an
organism. This is a deliberate, documented exception to the usual "molecules compose only from
atoms/primitives" rule (see CLAUDE.md and `tag-group-spec.md`'s own note on it) - accepted rather
than either duplicating Menu's search/keyboard-nav machinery inside Tag Group or reclassifying
Dropdown Menu/Menu themselves.

---

## Inputs

Use these inputs:
- `tag-group-checklist.md` for design/product context
- `tag-group-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma component set `tab-group` (fileKey `M0eINB6n1BfrXu7ntYqb1i`, "Components v1.0.0",
  componentSetNodeId `2140:64654`, filed on the "✅ Tag Group" page) - verified live via the Desktop
  Bridge plugin. The component's real Figma name is `tab-group`, a naming typo; it is unambiguously
  Tag Group (a wrapping row of `tag` instances plus a `tag`-triggered `dropdown-menu` for overflow),
  not tabs
- The existing Tag atom (`packages/ui/src/components/atoms/tag/`) - render every visible tag and
  the overflow tag through it directly, do not re-derive tone/size/removal/navigation styling
- The existing Dropdown Menu organism (`packages/ui/src/components/organisms/dropdown-menu/`) -
  render the overflow panel through it directly. Tag Group depends on this organism as a documented
  exception to the usual molecule-tier rule; do not attempt to route around it by re-implementing a
  lighter panel

If anything conflicts, follow `tag-group-spec.md`.

---

## Framework

- React
- TypeScript
- CSS Modules (`tag-group.module.css` - one rule: the wrapping row layout)

---

## Implementation

Create:

```txt
packages/ui/src/components/molecules/tag-group/
├─ tag-group.tsx
├─ tag-group.types.ts
├─ tag-group.module.css
├─ TagGroup.test.tsx
├─ TagGroup.stories.tsx
├─ tag-group.mdx
└─ index.ts
```

Also extend the existing Tag atom (`packages/ui/src/components/atoms/tag/`) with an `isInteractive`
prop - see Tag Extension below. Update Tag's own docs/tests/stories alongside it; this is a real,
scoped change to Tag, not logic duplicated inside Tag Group.

---

## Tag Extension (prerequisite)

Add to `TagProps`:

```ts
isInteractive?: boolean;
```

In `Tag`, compute `const isButton = isInteractive || typeof onClick === 'function';` (same gate
Avatar already uses for its own `isInteractive`). When there is no `href` and `isRemovable` is
false:
- `isButton` true: render a real `<button type="button">` reusing `.standalone`/`.contentInteractive`
  (the same classes the navigational-anchor form already uses for its hover/pressed treatment and
  focus ring), with the native `disabled` attribute driven by `isDisabled`.
- `isButton` false: render the existing plain `<span>`, unchanged.

Add `appearance: none; -webkit-appearance: none; margin: 0;` to `.contentInteractive` in
`tag.module.css` (harmless for the anchor case, resets UA button chrome for the new button case),
and add `.contentInteractive:disabled` alongside the existing `.contentInteractive[aria-disabled='true']`
selector wherever `cursor: not-allowed` is set for the disabled state.

---

## Component API

```ts
export type TagGroupAlignment = 'left' | 'right';

export interface TagGroupItem extends Omit<TagProps, 'size' | 'children' | 'id' | 'isInteractive'> {
  id: string;
  label: React.ReactNode;
}

export interface TagGroupProps {
  tags: TagGroupItem[];
  maxVisible?: number;
  size?: TagSize;
  alignment?: TagGroupAlignment;
  overflowLabel?: (hiddenCount: number) => React.ReactNode;
  overflowMenuAriaLabel?: string;
  onOverflowTagSelect?: (
    tag: TagGroupItem,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
  id?: string;
  className?: string;
}
```

Defaults:

```ts
size = 'sm' // matches Figma's own tab-group example, not Tag's own md default
alignment = 'left'
overflowLabel = (hiddenCount) => `+${hiddenCount} more`
// overflowMenuAriaLabel defaults at render time to `${hiddenCount} more tags`
```

---

## Behavioral Requirements

- Compute `hasOverflow = typeof maxVisible === 'number' && tags.length > maxVisible`. When false,
  render every tag in `tags`, in order, with no overflow tag. When true, render
  `tags.slice(0, maxVisible)` as visible tags and put `tags.slice(maxVisible)` behind the overflow
  tag.
- Hold exactly one piece of state - `overflowOpen` (boolean) - to drive the overflow `DropdownMenu`,
  which is itself fully controlled.
- Render the overflow tag as `<Tag isInteractive size={size} onClick={...toggle overflowOpen...}>`
  wrapped in `<DropdownMenu open={overflowOpen} onOpenChange={setOverflowOpen} showSearch={false}
  aria-label={overflowMenuAriaLabel ?? \`${hiddenTags.length} more tags\`} sections={...}>`, where
  `sections` is one section (`id: 'overflow'`) with one `MenuItem` per hidden tag: `id`, `label`
  (from the tag's own `label`), `leadingElement` (the tag's own `elemBefore`, decorative), `disabled`
  (the tag's own `isDisabled`), and `onSelect` calling `onOverflowTagSelect?.(tag, event)` - nothing
  else.
- `alignment === 'right'` renders the overflow tag before the visible tags; `alignment === 'left'`
  (default) renders it after. Do not change which tags are sliced into `visibleTags`/`hiddenTags`
  based on `alignment`.
- Do not pass `alignment` through to the nested `DropdownMenu` - always use Dropdown Menu's own
  default (`left`), matching the measured Figma value in both `tab-group` variants.
- Apply `size` uniformly to every rendered `Tag`, including the overflow tag - `TagGroupItem` omits
  `size` from Tag's own props for exactly this reason.
- Spread every other `TagGroupItem` prop (`tone`, `href`, `target`, `rel`, `isRemovable`,
  `isDisabled`, `elemBefore`, `onRemove`, `removeLabel`, any generic HTML attribute) straight onto
  the rendered `Tag`, using `label` as its `children`.
- Never call `onOverflowTagSelect`'s implied navigation/removal automatically - only call the
  callback itself, exactly like a Menu item's `onSelect`.

---

## Accessibility Rules

- Do not add any custom key handling to the overflow tag - it's a real `<button>` (Tag's
  `isInteractive` form), so Enter/Space activation is native.
- Do not set a `role` on the root row element - it is a plain layout container, not a listbox/group;
  each visible Tag and the overflow panel already carry their own correct roles.
- Forward `overflowMenuAriaLabel` (or its computed default) to `DropdownMenu`'s `aria-label`, which
  forwards it to Menu's `role="menu"` container.

---

## Storybook Requirements

Create stories for:
- Playground (prop exploration via Storybook controls)
- Wrapping (no `maxVisible` - every tag renders, wrapping onto new lines in a narrow container)
- Overflow (both `alignment` values side by side, truncating 15 tags to 10 visible + "+5 more")
- Content (realistic entity-reference tags - tone, `href`, `elemBefore`, a removable tag - with no
  truncation)
- EdgeCases (selecting a truncated tag via `onOverflowTagSelect`; a single tag well under
  `maxVisible` showing the overflow tag is genuinely optional)

---

## Test Requirements

Create tests for:
- Renders every tag when there is no `maxVisible`
- Renders every tag (no overflow tag) when `tags.length` does not exceed `maxVisible`
- Truncates beyond `maxVisible` and renders a `+N more` overflow tag with the correct hidden count
- Overflow tag renders trailing when `alignment` is `left` (default), leading when `right`
- Opens a menu holding every remaining truncated tag when the overflow tag is activated
- Calls `onOverflowTagSelect` with the selected truncated tag's own data
- Does not close the overflow panel on its own when a truncated tag is selected
- Closes the overflow panel on an outside click and on Escape (inherited from Popup)
- Supports a custom `overflowLabel`
- Defaults the overflow menu's accessible name to `${hiddenCount} more tags`; supports a custom
  `overflowMenuAriaLabel`
- Applies `size` uniformly to every visible tag and the overflow tag
- Forwards each tag item's own props (`tone`, `href`, `isRemovable`, `onRemove`, `elemBefore`) to
  the rendered Tag
- Supports a custom `id`/`className` on the root

Also extend `tag.test.tsx` with tests for the new `isInteractive` form (renders a button, activates
via click, natively disables, uses the shared focus ring classes) - see `tag-spec.md`.

---

## Rules

1. Follow `tag-group-spec.md` exactly.
2. Do not duplicate any Tag, Popup, Menu, or Dropdown Menu behavior - render through all of them,
   don't re-implement any of it.
3. No MUI. No Tailwind. No hardcoded colors/spacing - `tag-group.module.css`'s one rule uses
   `var(--spacing-sm)`, not a raw pixel value.
4. Export the component and its types.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript compiles.
- Verify ESLint passes.
- Verify `npm run lint:css` passes (no raw values in `tag-group.module.css` or the `tag.module.css`
  edits).
- Verify Storybook compiles.
- Verify tests pass, including the extended `tag.test.tsx`.
- Verify the implementation matches the real Figma structure (the `alignment` variant pair, the
  wrapping row's measured 8px gap, and the nested `dropdown-menu`/`tag` overflow trigger) even
  though the Figma component set is misnamed `tab-group`.
