# Avatar Group

## Purpose
Avatar Group lays out an overlapping stack of Avatars, with an optional overflow trigger - a "+N"
button that opens a Dropdown Menu holding whichever people got truncated once the group exceeds
`maxVisible`.

## When to use
Use Avatar Group for a list of people that reads better as a compact overlapping stack than a full
name list - a task's assignees, a matter's team, a document's collaborators.

## When not to use
Do not reach for Avatar Group for a single person - use Avatar directly. Do not reach for it for a
fixed, small set of people that always fits - `maxVisible` is optional; omitting it renders every
avatar as one overlapping stack with no overflow trigger at all. Avatar Group inherits Avatar's own
scope - people only, not firms, trusts, or accounts.

## Design intent
Avatar Group is a thin composition, the same philosophy as Tag Group: an overlapping row (negative
margin between avatars, matching the real Figma component's measured overlap exactly per size) of
`Avatar` instances, with the tail end optionally extended by an overflow trigger wrapped in a
`DropdownMenu`. It introduces very little visual language of its own - each visible pixel is
Avatar's, Button's, or Dropdown Menu/Menu's own - beyond two separating rings that exist only to
keep overlapping circles visually distinct.

The real Figma source (`avatar-group`, correctly named this time - unlike Tag Group's `tab-group`
typo) is filed on the file's own "✅⏲️ Avatar Group" page: 12 variants crossing `size`
(xs/sm/md/lg, matching Avatar's own xs/sm/md/lg exactly - `xxs` and `xl` are not part of Avatar
Group) and `number` (2/3/4, the count of visible avatars), plus a `showMore` boolean
(`defaultValue: true`) that toggles the overflow trigger. Each variant is `avatar` instances
(unmodified from the atom, aside from an instance-level separating-ring stroke) followed by one
`dropdown-menu` instance (`trigger=more-avatar`) whose trigger slot holds a
`figma-parts / more-trigger` part - which, traced one level deeper, is itself just the real `Button`
component (`appearance=subtle` in code, called `tone=subtle` in Figma's own variant name - same
naming divergence Tag's own `tone` already has), instance-overridden to a fixed square size and a
fully-rounded corner radius so it reads as a circle matching Avatar's own diameter.

`showMore` and `number` are both fixed illustrative axes in Figma (no real component can express
"here's an actual array of N people" statically) - the same "closed demo becomes an open,
data-driven prop" adaptation Tag Group already made for its own `tab-group` source. Avatar Group
takes a generic `avatars` array and a `maxVisible` number instead of `showMore`/`number`; whether
the overflow trigger renders is derived from whether `avatars.length` actually exceeds
`maxVisible`, not a separate manual toggle a consumer could set inconsistently with the real data.

Avatar Group never assumes what selecting a truncated avatar from the overflow panel means - the
same "never assume" rule Menu, Dropdown Menu, and Tag Group already follow. Selecting a row calls
`onOverflowAvatarSelect(avatar, event)` with that avatar's own data; navigating from there is the
consumer's responsibility.

No atom needed extending for this component to compose Button/Dropdown Menu - Avatar already
supports `isInteractive`/`onClick` for individually-clickable avatars, and Button is reused as-is
(just reshaped via Avatar Group's own CSS) for the overflow trigger. Compare Tag Group, which needed
to add `isInteractive` to Tag first.

Avatar separately gained `entityType` (`'person' | 'team'`, no Figma variant - see
`avatar.contract.json`) so a team/partner entity can sit inside an otherwise person-populated
roster without its empty-state fallback implying an individual. Avatar Group forwards every one of
an item's own props straight to Avatar as already documented, so `entityType` needs no special
handling in Avatar Group's own props - except in the overflow panel, where each row's decorative
leading avatar must forward `entityType` explicitly alongside `src`/`name`/`alt` (easy to miss,
since it's a second Avatar instance Avatar Group constructs itself rather than a passthrough).

## Accessibility
Inherited from Avatar (each visible avatar's own accessible-name and interactive semantics) and
Dropdown Menu/Menu (the overflow trigger's `aria-expanded`/`aria-controls`, `role="menu"` and
`menuitem` rows inside the panel, each with a decorative leading avatar). Pass
`overflowMenuAriaLabel` to give the overflow panel a specific accessible name; it defaults to
`${hiddenCount} more people`.

## Related
Avatar (every visible avatar), Button (the overflow trigger), Dropdown Menu (the overflow trigger's
floating panel), Menu (the overflow panel's content), Tag Group (the equivalent composition for
Tags).
