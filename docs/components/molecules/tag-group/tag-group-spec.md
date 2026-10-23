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
type TagGroupAlignment = 'start' | 'end';
/** @deprecated Physical names, still accepted and placed as start/end. */
type DeprecatedTagGroupAlignment = 'left' | 'right';

interface TagGroupItem extends Omit<TagProps, 'size' | 'children' | 'id' | 'isInteractive'> {
  id: string;
  label: React.ReactNode;
}

interface TagGroupProps {
  tags: TagGroupItem[];
  maxVisible?: number;
  size?: TagSize;
  alignment?: TagGroupAlignment | DeprecatedTagGroupAlignment;
  overflowLabel?: (hiddenCount: number) => React.ReactNode;
  overflowMenuAriaLabel?: string;
  onOverflowTagSelect?: (
    tag: TagGroupItem,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  id?: string;
  className?: string;
}
```

## Defaults

```txt
size: sm
alignment: start
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
  {alignment === 'end' ? overflowTag : null}
  {visibleTags.map((tag) => (
    <Tag key={tag.id} {...tagPropsWithoutIdAndLabel} size={size}>
      {tag.label}
    </Tag>
  ))}
  {alignment === 'start' ? overflowTag : null}
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

`alignment` (`'start' | 'end'`, default `'start'`) maps to Figma's own two `tab-group` variants:

- `start` (default): visible tags first, overflow tag trailing. Matches Figma's `alignment=left`.
- `end`: overflow tag first (leading), then the visible tags. Matches Figma's `alignment=right`.

Alignment is named by logical start and end, as Table and Form name it (shared-value-names); the
physical `left` and `right` were renamed on 2026-10-20 and stay accepted as deprecated aliases,
placed the same. It sets DOM order, so it follows the writing direction.

Both variants show the identical set of ten placeholder tags in Figma - `alignment` is an ordering
concern only, not a truncation concern. The nested Dropdown Menu's own panel alignment was measured
directly in both Figma variants and stays `left` (`bottomStart` in code) either way; Tag Group does
not recompute or flip it based on its own `alignment` - it hardcodes `DropdownMenu`'s default (`start`)
and relies on Popup's own viewport-fit fallback if that overflows in a given layout.

## Focus after removing a tag

Tag Group doesn't remove tags (the consumer takes the tag out of `tags` in `onRemove`), but it keeps
focus when one goes. When the tag holding focus (or the one just pressed, since Safari doesn't focus
a clicked button) leaves the DOM and focus falls to the page, focus moves to the tag now in its
place (a hidden tag moving up, or the overflow tag), else the previous tag, landing on the control
in the same position counted from the end (one remove button to the next); tags with no enabled
control are skipped. With no tag left, the root takes `tabindex="-1"` and focus, with the shared
Focus Ring, and is announced by its name when it has one. Empty, the root would have no height (and
no width in a row), so while it's `:empty` and focused it takes the size of a tag
(`--size-control-xs`, or `--size-control-sm` in a `md` group, read from `data-size`) as
`min-block-size` and `min-inline-size`; at rest an empty group still takes no space. Focus the page
has already moved is left alone. The root watches its children with a
MutationObserver (`primitives/focus-after-removal.ts`, shared with Chip Group).

## Overflow tag: Tag's `isInteractive` form

The overflow tag needs to be a real focusable click target with no navigation and no remove
affordance - a shape Tag didn't support before this component (Tag was previously focusable only via
`href` or its remove button). `isInteractive` was added to Tag (see `tag.contract.json`), gated as
`isInteractive || typeof onClick === 'function'`, the same pattern Avatar already uses for its own
`isInteractive` prop. This is a Tag-level change with its own tests/docs (see `tag-spec.md`), not
something reimplemented inside Tag Group.

## Selection never assumes anything

Tag Group does not navigate to a truncated tag's `href` and does not call its `onRemove` when a
truncated tag is selected. It only calls `onOverflowTagSelect(tag, event)`; Dropdown Menu then
closes the overflow panel and returns focus to the overflow tag, unless the callback calls
`event.preventDefault()`. A consumer wanting navigation or removal wires it from there:

```tsx
onOverflowTagSelect={(tag, event) => {
  if (tag.href) {
    router.push(tag.href);
  }
}}
```

## Accessibility

- `role="group"` only when `aria-label` or `aria-labelledby` is given, as Chip Group and Button Group
  do: an unnamed group is a boundary a screen-reader user steps through for no benefit. Name a group
  of removable tags, since focus lands on the root when the last one goes.
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

### Removal story

Removable tags, to try focus moving to the next tag as each is removed.

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
renders the overflow tag trailing when alignment is start (default)
renders the overflow tag leading when alignment is end
still accepts the deprecated left / right alignment, placed as start / end
opens a menu holding the remaining truncated tags when the overflow tag is activated
calls onOverflowTagSelect with the selected truncated tag
closes the overflow panel, returning focus to the trigger, when a truncated tag is selected
closes the overflow panel on outside click / Escape, inherited from Popup
supports a custom overflowLabel
defaults the overflow menu accessible name to "{count} more tags"
supports a custom overflowMenuAriaLabel
applies size uniformly to every visible tag and the overflow tag
forwards each tag item's own props (tone, href, isRemovable, onRemove, elemBefore) to the rendered Tag
supports a custom id/className on the root
moves focus to the next tag when a tag is removed from the keyboard
moves focus to the next tag when a tag is removed by a click that did not focus it
moves focus to the previous tag when the last tag is removed
moves focus to the tag that takes the place of the last visible one, before the overflow tag
moves focus to the group itself when its only tag is removed
lands on a group named by aria-label when its only tag is removed
gives the empty, focused group the size of a tag, so its focus ring shows
is a named group with aria-label / aria-labelledby, and has no group role without a name
```

## Future considerations

Potential future support:

- A `count`-only mode (numeric badge instead of a full "+N more" tag)
- Drag-to-reorder
- A `renderTag`/`renderOverflowItem` escape hatch for fully custom row content

Do not implement these unless requested.
