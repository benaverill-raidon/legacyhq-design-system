# Tag Group

## Purpose
Tag Group lays out a wrapping row of Tags, with an optional overflow tag - a "+N more" Tag that
opens a Dropdown Menu holding whichever tags got truncated once the group exceeds `maxVisible`.

## When to use
Use Tag Group for a list of entity references, classifications, or filters that may not all need to
show inline at once - a task's linked entities, a filter bar's active filters, a record's tags.

## When not to use
Do not reach for Tag Group for a single tag - use Tag directly. Do not reach for it for a fixed,
small set of tags that always fits - `maxVisible` is optional; omitting it renders every tag,
wrapping onto new lines with no overflow tag at all. Do not reach for it for a group of Buttons -
use Button Group.

## Design intent
Tag Group is a thin composition, the same philosophy as Dropdown Menu: a wrapping flex row (gap
`spacing-sm`, matching the real Figma component's measured 8px row/column gap exactly) of `Tag`
instances, with the tail end optionally replaced by an overflow `Tag` wrapped in a `DropdownMenu`.
It introduces no new visual language of its own - every visible pixel is Tag's own tone/size
styling, and the overflow panel is Dropdown Menu's and Menu's own skin.

Tag Group is classified as a molecule, even though its overflow panel composes Dropdown Menu, an
organism - a deliberate, documented exception to the usual "molecules compose only from
atoms/primitives" layering rule (see CLAUDE.md). Re-implementing a lighter panel directly on Popup
to stay tier-pure would duplicate Menu's own row/keyboard-navigation behavior; reclassifying Menu
and Dropdown Menu down to molecules to make the dependency tier-consistent was considered and
rejected as a larger, separate change unrelated to this component.

The real Figma source lives on the file's "✅ Tag Group" page, but the component set itself is named
`tab-group` - a naming typo, verified directly against the file (four variants crossing `size` and
`alignment`, each a wrapping row of ten `tag` instances plus one `dropdown-menu` instance whose
trigger slot holds an eleventh `tag` reading "+5 more"). Code follows the real structure, not the
mislabeled name.

`size` (`'sm' | 'md'`, default `'sm'`) maps to Figma's own `size` axis (`sm (24)` / `md (32)`) and
applies uniformly to every visible tag and to the overflow tag - Figma gives every `tag` instance
inside a variant that variant's own size, so there is no per-tag size mixing and `TagGroupItem`
omits `size` entirely. The `sm` default is a deliberate divergence from Tag's own `md` default,
matching the first variant in Figma's grid.

`alignment` (`'left' | 'right'`, default `'left'`) controls only where the overflow tag renders -
trailing (`left`) or leading (`right`) - not which tags are visible or truncated. The nested Dropdown
Menu's own panel alignment stays `left` in every Figma variant (measured directly, not assumed), so
Tag Group does not flip it based on its own `alignment` prop. Figma's `alignment` axis also reports
two auto-generated placeholder values (`alignment3`/`alignment4`) that are really just the `size=md`
row of `left`/`right`; code models the two real values only.

Figma's example is a fixed illustrative count (10 visible + "+5 more" = 15 total) with no exposed
`count`/list-editing property of its own - the same "closed demo becomes an open, data-driven prop"
adaptation Menu made for its own `sections`. Tag Group takes a generic `tags` array and a
`maxVisible` number instead of hardcoding 10.

Tag Group never assumes what selecting a truncated tag from the overflow panel means - the same
"never assume" rule Menu and Dropdown Menu already follow for their own `onSelect`/`onOpenChange`.
Selecting a row calls `onOverflowTagSelect(tag, event)` with that tag's own data; navigating,
removing, or closing the panel from there is the consumer's responsibility.

The overflow tag itself needed a way to be a plain, focusable click target with no navigation and no
remove affordance - a gap in Tag's own API, since Tag was previously only focusable via `href` or its
remove button. `isInteractive` was added to Tag to close that gap (see `tag.contract.json`'s
`apiAdaptationNotes`), gated the same way Avatar already gates its own `isInteractive` -
`isInteractive || typeof onClick === 'function'`.

## Accessibility
Inherited from Tag (each visible tag's own navigation/removal semantics) and Dropdown Menu/Menu
(the overflow panel's `aria-expanded`/`aria-controls` on the overflow tag, `role="menu"` and
`menuitem` rows inside it). The overflow tag is a real `<button>` (Tag's `isInteractive` form), so
Enter/Space activation and the native `disabled` attribute come for free. Pass
`overflowMenuAriaLabel` to give the overflow panel a specific accessible name; it defaults to
`${hiddenCount} more tags`.

## Related
Tag (every visible tag and the overflow tag), Dropdown Menu (the overflow tag's floating panel),
Menu (the overflow panel's content), Button Group (the equivalent composition for Buttons).
