# Tag Group Component Spec

## Overview

Tag Group is a thin composition: a wrapping row of `Tag` instances, with the tail end optionally
replaced by an overflow `Tag` (Tag's `isInteractive` button form) wrapped in a `DropdownMenu`, whose
panel lists whichever tags got truncated. It introduces no visual language of its own beyond the row
layout - every visible pixel is Tag's, Dropdown Menu's, or Menu's own.

**Tier exception.** Tag Group is a molecule, but Dropdown Menu (and, transitively, Menu) are
organisms. CLAUDE.md's repo layout states molecules compose "from atoms/primitives" only - this is
a deliberate, documented exception, not an oversight. It was chosen over the two alternatives:
duplicating Menu's row/keyboard-navigation behavior inside a Popup-only panel to stay tier-pure, or
reclassifying Dropdown Menu/Menu down to molecules, which would be a larger change unrelated to Tag
Group itself.

## Anatomy

```txt
TagGroup
├─ root (wrapping flex row, gap: spacing-sm)
│  ├─ Tag (visible, 1..maxVisible or all of `tags` if maxVisible is omitted)
│  └─ overflow Tag, optional - present only when tags.length > maxVisible
│     └─ DropdownMenu (trigger = the overflow Tag itself, isInteractive)
│        └─ Menu (one section, one item per truncated tag)
```

## Public API

```ts
type TagGroupAlignment = 'left' | 'right';

interface TagGroupItem extends Omit<TagProps, 'size' | 'children' | 'id' | 'isInteractive'> {
  id: string;
  label: React.ReactNode;
}

interface TagGroupProps {
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

## Defaults

```txt
size: sm
alignment: left
overflowLabel: (hiddenCount) => `+${hiddenCount} more`
overflowMenuAriaLabel: `${hiddenCount} more tags`
```

`size` carries Tag's own `TagSize` (`'sm' | 'md'`), mapping to Figma's `size` axis - `sm (24)` and
`md (32)`, measured 24px and 32px respectively. It applies uniformly to every visible tag and to the
overflow tag, because that is exactly what Figma does: within any one variant, all eleven `tag`
instances (the ten visible plus the overflow trigger's) carry that variant's own size. No per-tag
mixing exists in the source, which is why `TagGroupItem` omits `size` from Tag's props.

`size` defaults to `sm` - a deliberate difference from Tag's own code default of `md`, since Tag
Group's default should match its verified Figma source exactly (`size=sm (24)` is the first variant
in the grid and the one the illustrative examples use) rather than inherit Tag's independently-chosen
default.

## Truncation

```ts
const hasOverflow = typeof maxVisible === 'number' && tags.length > maxVisible;
const visibleTags = hasOverflow ? tags.slice(0, maxVisible) : tags;
const hiddenTags = hasOverflow ? tags.slice(maxVisible) : [];
```

- `maxVisible` omitted: every tag renders, no overflow tag at all. This is the common case for a
  short, bounded list and is why the overflow tag is documented as optional throughout.
- `tags.length <= maxVisible`: every tag renders, no overflow tag - `maxVisible` is a ceiling, not a
  fixed slice count.
- `tags.length > maxVisible`: the first `maxVisible` tags render; the rest render as `hiddenTags.length`
  ("+N more") behind the overflow tag.
- Which tags count as "visible" (always `tags.slice(0, maxVisible)`) does not change with
  `alignment` - only render order does. See Alignment below.

## Composition

```tsx
<div className={styles.root} data-alignment={alignment}>
  {alignment === 'right' ? overflowTag : null}
  {visibleTags.map((tag) => (
    <Tag key={tag.id} {...tagPropsWithoutIdAndLabel} size={size}>
      {tag.label}
    </Tag>
  ))}
  {alignment === 'left' ? overflowTag : null}
</div>
```

Where `overflowTag` (only rendered when `hasOverflow`) is:

```tsx
<DropdownMenu
  aria-label={overflowMenuAriaLabel ?? `${hiddenTags.length} more tags`}
  open={overflowOpen}
  onOpenChange={setOverflowOpen}
  showSearch={false}
  sections={[{
    id: 'overflow',
    items: hiddenTags.map((tag) => ({
      id: tag.id,
      label: tag.label,
      leadingElement: tag.elemBefore,
      disabled: tag.isDisabled,
      onSelect: (event) => onOverflowTagSelect?.(tag, event),
    })),
  }]}
>
  <Tag isInteractive size={size} onClick={() => setOverflowOpen((current) => !current)}>
    {overflowLabel(hiddenTags.length)}
  </Tag>
</DropdownMenu>
```

Tag Group holds exactly one piece of state - `overflowOpen` - to drive the overflow Dropdown Menu,
since Dropdown Menu is itself fully controlled and holds no state of its own.

## Alignment

`alignment` (`'left' | 'right'`, default `'left'`) maps directly to Figma's own two `tab-group`
variants:

- `left` (default): visible tags first, overflow tag trailing. Matches Figma's `alignment=left`.
- `right`: overflow tag first (leading), then the visible tags. Matches Figma's `alignment=right`.

Both variants show the identical set of ten placeholder tags in Figma - `alignment` is an ordering
concern only, not a truncation concern. The nested Dropdown Menu's own panel alignment was measured
directly in both Figma variants and stays `left` (`bottomLeft`) either way; Tag Group does not
recompute or flip it based on its own `alignment` - it hardcodes `DropdownMenu`'s default (`left`)
and relies on Popup's own viewport-fit fallback if that overflows in a given layout.

## Overflow tag: Tag's `isInteractive` form

The overflow tag needs to be a real focusable click target with no navigation and no remove
affordance - a shape Tag didn't support before this component (Tag was previously focusable only via
`href` or its remove button). `isInteractive` was added to Tag (see `tag.contract.json`), gated as
`isInteractive || typeof onClick === 'function'`, the same pattern Avatar already uses for its own
`isInteractive` prop. This is a Tag-level change with its own tests/docs (see `tag-spec.md`), not
something reimplemented inside Tag Group.

## Selection never assumes anything

Same rule as Menu and Dropdown Menu: Tag Group does not navigate to a truncated tag's `href`, does
not call its `onRemove`, and does not close the overflow panel when a truncated tag is selected. It
only calls `onOverflowTagSelect(tag, event)`. A consumer wanting any of those wires it from there:

```tsx
onOverflowTagSelect={(tag, event) => {
  if (tag.href) {
    router.push(tag.href);
  }
}}
```

## Accessibility

- The overflow tag is a real `<button>` (Tag's `isInteractive` form) - Enter/Space activation and
  the native `disabled` attribute come for free, no custom key handling.
- `aria-expanded`/`aria-controls` on the overflow tag come from Popup (via Dropdown Menu), reflecting
  the panel's open state.
- The overflow panel carries `role="menu"` (from Menu) with the accessible name
  `overflowMenuAriaLabel` (default `${hiddenCount} more tags`).
- Each truncated tag renders as a `menuitem` row; `disabled` mirrors that tag's own `isDisabled`.
- Visible tags keep their own independent accessibility exactly as documented in `tag-spec.md` -
  Tag Group changes none of it besides applying a uniform `size`.

## Styling and tokens

`tag-group.module.css` contains exactly one rule: a wrapping flex row with `gap: var(--spacing-sm)`,
matching Figma's measured 8px `itemSpacing`/`counterAxisSpacing` on both axes of the wrap layout.
Every other visible pixel is Tag's own tone/size tokens or Dropdown Menu/Menu's own panel and row
tokens - Tag Group introduces no component tokens of its own.

## Storybook

```txt
TagGroup
├─ Docs (.mdx)
├─ Playground
├─ Wrapping
├─ Overflow
├─ Content
└─ EdgeCases
```

### Wrapping story

No `maxVisible` - every tag renders, wrapping onto new lines as a narrow container fills.

### Overflow story

Both `alignment` values side by side, each truncating 15 tags to 10 visible plus a "+5 more"
overflow tag, to show the ordering difference directly.

### Content story

Realistic entity-reference tags (tone, `href`, `elemBefore`, a removable tag) inside a Tag Group with
no truncation.

### EdgeCases story

Selecting a truncated tag from the overflow panel via `onOverflowTagSelect`, and a single tag well
under `maxVisible` to show the overflow tag is genuinely optional (renders nothing extra at all).

## Tests

Required tests:

```txt
renders every tag when there is no maxVisible
renders every tag when tags.length does not exceed maxVisible (no overflow tag)
truncates beyond maxVisible and renders a "+N more" overflow tag
renders the overflow tag trailing when alignment is left (default)
renders the overflow tag leading when alignment is right
opens a menu holding the remaining truncated tags when the overflow tag is activated
calls onOverflowTagSelect with the selected truncated tag
does not close the overflow panel on its own when a truncated tag is selected
closes the overflow panel on outside click / Escape, inherited from Popup
supports a custom overflowLabel
defaults the overflow menu accessible name to "{count} more tags"
supports a custom overflowMenuAriaLabel
applies size uniformly to every visible tag and the overflow tag
forwards each tag item's own props (tone, href, isRemovable, onRemove, elemBefore) to the rendered Tag
supports a custom id/className on the root
```

## Future considerations

Potential future support:

- A `count`-only mode (numeric badge instead of a full "+N more" tag)
- Drag-to-reorder
- A `renderTag`/`renderOverflowItem` escape hatch for fully custom row content

Do not implement these unless requested.
