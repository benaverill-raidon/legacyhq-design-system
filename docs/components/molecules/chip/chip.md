# Chip

## Purpose
Chip is a compact segmented pill covering three closely-related jobs: showing and editing an active
**filter**, showing an applied **property**, and selecting a search **scope**. All three share one
visual language - a bordered pill whose segments read as one continuous shape - so they use one
component with one mental model.

## When to use
- **`mode="filter"`** - an active filter across one property, where the value is editable in place.
  Most often several of these sit in a row above a task list: status, assignee, due date.
- **`mode="property"`** - a single already-applied property. The value *is* the label, so there is
  nothing to open; the only affordance is removing it.
- **`mode="scope"`** - narrowing a search to a broader category than a single property
  (Everything / Matters / Documents / People). Selectable rather than removable.

## When not to use
Do not use Chip for a plain, non-removable label - that is [Tag](../../atoms/tag/tag.md). Do not use
it for a group needing overflow truncation - that is [Tag Group](../tag-group/tag-group.md), or a
wrapping row of Chips you compose yourself. Do not use it as a primary action
([Button](../../atoms/button/button.md), or [Split Button](../split-button/split-button.md) when the
action has close alternatives), for a persistent on/off setting
([Switch](../../atoms/switch/switch.md)), or as a bordered text toggle
([Toggle Button](../../atoms/toggle-button/toggle-button.md)).

## Design intent
Chip is a thin composition, the same philosophy as Tag Group, Avatar Group, and Split Button: the
label segment and remove button are Chip's own, and every dropdown-backed segment renders through
[Dropdown Menu](../../organisms/dropdown-menu/dropdown-menu.md).

The real Figma source (`chip`, on the file's own "✅⏲️ Chip" page) is one component set with four
axes - `mode` (filtering/scope/property), `size` (`sm (24)` / `md (32)`), `filter type`, and
`isSelected` - of which only 14 of 60 combinations exist. Every variant is a horizontal row of
segment instances with `itemSpacing: 0`, joined by squared interior corners into one pill: the same
construction Split Button uses.

**Its three modes genuinely differ in shape**, which is why the props are a discriminated union on
`mode` rather than a bag of optional props:

| mode | segments | interactive parts |
|---|---|---|
| `filter` | label + optional operator + value + remove | operator, value, remove |
| `property` | label + remove | remove |
| `scope` | label only | the label itself |

`scope` is the only mode whose label segment is itself a control, and the only one Figma gives an
unselected state - so it renders as a real toggle button carrying `aria-pressed`, and its selected
state is exactly what the `selected` token family exists for. Each scope chip is an **independent
on/off toggle**, not a radio group: several can be on at once, and Chip never coordinates siblings.
In `filter` and `property` the label is a plain non-interactive span: it *names* the property rather
than acting on it, which is also why it uses the subtler `content/subtle` text while the value and
operator segments use `content/default`.

**The label segment has no hover or press treatment in any mode.** Figma models a state axis on
`chip-base`, but skipping it is deliberate: a passive label shouldn't light up as though it does
something, and for `scope` the selected/unselected distinction is already the feedback. Interaction
fills belong to the segments that act - the operator, the value, and remove. The label's icon
inherits the label's own colour, so it tracks subtle → selected → disabled with the text.

**Figma's `filter type` axis is not a prop.** Its four values (status, context, assignee, due date)
differ only in their data - icon, label, value - with one structural exception: `due date` has an
operator segment and the others do not. Code exposes that fact directly as an optional `operator`,
so any filter can carry a comparison and a fifth product category never needs a code change.
Figma's four types are four examples in the stories instead.

## Accessibility
Every real control is a native `<button>` with the shared Focus Ring, and the focused segment is
lifted above its neighbours so the ring is never clipped by the segment beside it. The remove button
carries a "Remove" tooltip on hover and focus - supplementary only, since its `aria-label` is the real
accessible name - and both the tooltip and the button itself are suppressed when the chip is disabled.
`scope` carries `aria-pressed` (Toggle Button's semantics, not a checkbox or a link). Dropdown
segments get
`aria-expanded`/`aria-controls` from Popup via Dropdown Menu, and each panel is named from the
property and the segment's role ("Due date operator", "Due date value") rather than from the segment's
own label - the label is the *current value* ("on", "March 2"), which names a panel poorly.
`elemBefore` and `valuePreview` are both `aria-hidden`: the label and value text already carry the
meaning, and in scope mode the segment is already a button, so nesting anything focusable would be
invalid HTML.

## Related
Tag (the plain, non-removable label), Tag Group (a truncating group of tags), Dropdown Menu and Menu
(the segment panels), Toggle Button (the same `aria-pressed` selection semantics), Split Button (the
same segmented-pill construction), Avatar and Avatar Group (common `valuePreview` content).
