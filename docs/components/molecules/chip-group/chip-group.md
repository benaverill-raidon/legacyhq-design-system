# Chip Group

## Purpose
Chip Group lays out a wrapping row of [Chips](../chip/chip.md) at one shared size and alignment. It
is pure layout - it draws nothing of its own, and every visible pixel belongs to the Chips inside it.

## When to use
Use Chip Group whenever more than one Chip appears together: a row of selectable search scopes, or a
bar of active filter chips above a task or matter list. Setting `size` once on the group is the main
reason to reach for it - in a *wrapping* row, one chip left at the wrong size visibly breaks the line
it lands on.

## When not to use
Do not use Chip Group when the collection needs to truncate behind a "+N more" affordance - that is
[Tag Group](../tag-group/tag-group.md), with Tags. Do not use it for a row of buttons
([Button Group](../button-group/button-group.md)). And do not expect it to decide which chips are
selected: it is layout, not state.

## Design intent
The real Figma source (`chip-group`, on the file's own "✅⏲️ Chip Group" page) is four variants
crossing `size` (`sm (24)` / `md (32)`) with `alignment` (left/right). Each is a single auto-layout
frame - `layoutWrap: WRAP`, `itemSpacing: 8`, `counterAxisSpacing: 8`, `counterAxisAlignItems: CENTER`,
zero padding - holding ten plain `chip` instances. There is no overflow instance, no divider, and no
fill or stroke on the container.

So Chip Group is deliberately **not** Tag Group with chips in it. Tag Group owns its items as a data
array because it has to decide which are visible and which are truncated; Chip Group has no overflow
behaviour, so it takes `children` instead - the same shape Button Group uses, and the only shape that
works cleanly with Chip's discriminated-union props.

**`alignment` means something different here than in Tag Group**, despite the shared axis name. In
Figma it measures `primaryAxisAlignItems: MIN`/`MAX` - literally which edge the chips pack against, so
in code it is `justify-content`. Tag Group's `alignment` decides where its *overflow tag* renders;
Chip Group has no overflow, so there is nothing to place.

**`size` reaches each Chip through React context rather than by cloning children.** `cloneElement`
only reaches direct children, so a Chip inside a Tooltip, returned from a `.map`, or rendered
conditionally would silently miss the group's size - the same structural fragility that once detached
Chip's own remove button from its pill. Context reaches any descendant regardless of what sits
between, and an explicit `size` on an individual Chip still wins, because Chip resolves
`size ?? groupSize ?? 'md'`.

## Accessibility
Chip Group renders no interactive element of its own, so it has no focus or keyboard behaviour beyond
its children's. It becomes `role="group"` only when given an accessible name via `aria-label` or
`aria-labelledby` - an unnamed group is a boundary a screen-reader user has to step through for no
benefit, the same rule Button Group follows. There is deliberately no roving tabindex: the chips are
independent controls, not one composite widget.

## Related
Chip (what the group lays out), Tag Group (the truncating equivalent, with Tags), Button Group (the
same children-based layout-wrapper shape), Avatar Group (a group that does own its items, because it
truncates).
