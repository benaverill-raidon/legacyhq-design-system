# Avatar Group Checklist

## Component Information

### Name
Avatar Group

### Category
Molecule

### Related Components
- Avatar (every visible avatar)
- Button (the overflow trigger, reshaped into a circle)
- Dropdown Menu (the overflow trigger's floating panel)
- Menu (the overflow panel's content)
- Tag Group (the equivalent composition for Tags)

---

## Purpose

### What problem does this component solve?
Gives an overlapping stack of Avatars a ready-made overflow behavior - once the stack exceeds
`maxVisible` people, the rest collapse behind a "+N" trigger that opens a Dropdown Menu, instead of
every consumer wiring truncation-plus-panel by hand.

### Why does it need to exist?
Avatar's own doc (`avatar.md`) already named this component explicitly: "Do not use it for avatar
groups... Use Avatar Group... instead." Figma's own `avatar-group` component set (correctly named,
unlike Tag Group's `tab-group` typo) demonstrates the exact same shape Tag Group already
established a code pattern for: real atom instances (here, `avatar`) followed by a
`dropdown-menu`-wrapped overflow trigger.

### What user goal does it support?
- See a bounded number of people inline as a compact overlapping stack
- Reach the rest via a single additional click, keyboard-accessible like any other Dropdown Menu
- Act on a truncated person (e.g. navigate to their profile) via `onOverflowAvatarSelect`

---

## Usage

### Where will this component be used?
Anywhere a list of people needs a compact, overlapping presentation - task assignee stacks, matter
team rosters, document collaborator lists.

### What are the most common use cases?
- A task's assignees, shown as a small overlapping stack
- A matter's team, bounded to a handful visible with the rest reachable through "+N"
- An unbounded list with no truncation at all (`maxVisible` omitted)

### When should this component NOT be used?
- A single person - use Avatar directly
- Non-person entities (firms, trusts, accounts) - Avatar Group inherits Avatar's own scope

---

## Content

### What content can be displayed?
Whatever Avatar can display, per item - `AvatarGroupItem` is Avatar's own props (minus `size`) plus
a required `id`.

### Does it render children?
No - `avatars` is a data array (`AvatarGroupItem[]`), not `children`. Matches Tag Group's own
`tags` pattern rather than expecting hand-placed `<Avatar>` elements.

---

## Variants

### Size
- xs (24px)
- sm (32px)
- md (40px)
- lg (48px, default - matches Figma's own `avatar-group` default exactly)

Applied uniformly to every avatar, including the overflow trigger. `xxs` and `xl` (Avatar's other
two sizes) are not part of Avatar Group - Figma's own `avatar-group` component set only has these
four.

### Token Mapping
No new tokens - the overlap amount per size, both separating rings, the overflow trigger's forced
square dimensions, its background, and its typography all reuse existing tokens (`overlap-sm/md/lg`
- the dedicated negative-valued semantic token family for exactly this, not the generic `spacing-*`
scale; `color-elevation-surface-raised-default`; `color-border-inverse`;
`color-elevation-surface-sunken-default/hover/press` - the overflow trigger's background,
overriding Button's own subtle-appearance background entirely; `typography-body-sm/md/lg` - the
overflow trigger's text, overriding Button's own per-size heading-based type scale;
`border-radius-full-round`; `border-width-sm`; `size-control-xs/sm/md/lg`). See
`avatar-group-spec.md`'s overlap table and "Overflow trigger" section for the exact per-size
mapping.

---

## States

Required:
- No overflow (avatars.length <= maxVisible, or maxVisible omitted)
- Overflow, panel closed
- Overflow, panel open

Not required:
- Hover/active/focus/disabled at the Avatar Group level - each Avatar, the overflow trigger
  (Button), and the overflow panel own their own states independently.

---

## Accessibility

### Does this support keyboard navigation?
Yes, entirely inherited: each visible Avatar's own keyboard behavior is unchanged; the overflow
trigger is a real `<button>` (Button, unmodified) so Enter/Space activation is native; arrow
keys/Home/End/Enter navigate the open overflow panel (Menu).

### What ARIA is applied?
`aria-expanded`/`aria-controls` on the overflow trigger (Popup, via Dropdown Menu); `role="menu"`
with an accessible name (`overflowMenuAriaLabel`, default `${hiddenCount} more people`) and per-row
`menuitem` on the panel (Menu), each with a decorative leading avatar.

### Is this an interactive component?
Partially - visible avatars are interactive only if their own `isInteractive`/`onClick` is set; the
overflow trigger, when present, is always interactive (it must be, to open the panel).

---

## Responsive Behavior

### Mobile
The stack hugs its own content width at any container size; the overflow panel inherits Popup's
resize/scroll-driven repositioning and touch-friendly outside-dismissal (`pointerdown`) identically
to Dropdown Menu.

### Tablet
Same as desktop.

### Desktop
Same as Dropdown Menu - the panel's alignment falls back automatically near a viewport edge.

---

## Dependencies

### What components does this depend on?
Avatar, Button, Dropdown Menu, Menu (transitively, via Dropdown Menu).

### What components depend on it?
None yet.

---

## Notes

Final implementation decisions:
- Figma's component set is correctly named `avatar-group` (unlike Tag Group's `tab-group` typo) -
  filed on the file's own "✅⏲️ Avatar Group" page, verified directly against the file.
- `maxVisible` is optional and unbounded when omitted - Figma's own example is a fixed illustrative
  `number` (2/3/4) plus a separate `showMore` boolean toggle; both are replaced by one derived
  `hasOverflow` boolean so a consumer can't set `showMore` inconsistently with the real data.
- The overflow trigger's Figma part (`figma-parts / more-trigger`) is, one level deeper, the real
  `Button` component with several instance-level overrides verified across all 16 of its own
  size x state variants - not a bespoke new component: forced square size, fully-rounded corner
  radius, a `sunken`-surface background instead of Button's own subtle-appearance background, and
  Body/S-M-L-L typography instead of Button's own per-size heading-based type scale. Code reuses
  `Button` directly with the same overrides applied via CSS, rather than reimplementing a circular
  button from scratch.
- All 16 more-trigger variants (every size x every state) measure the identical background fill -
  Figma models no hover/press differentiation for this part. Treated as an unfinished mockup, not
  intentional static styling: code still differentiates hover/press using the same `sunken` token
  family's sibling values (`-hover`/`-press`), consistent with every other interactive control
  in this system.
- Padding-inline for sm/md/lg (8/12/16, measured) already equals Button's own natural per-size
  default - no override needed. `xs` measures 6px, off the spacing scale entirely (nearest tokens
  are 4 and 8) - left as Button's own natural 8px rather than introducing a raw, off-scale value for
  a 2px difference at the smallest size only.
- Avatar and Button both needed zero changes to support this component - unlike Tag Group, which
  needed to add `isInteractive` to Tag first. Avatar already had `isInteractive`/`onClick`; Button's
  own sizing tokens already measure identically to Avatar's own sizing tokens at every shared size.
- `maxVisible` is clamped to a minimum of 1 whenever there is overflow - a "+N" trigger with zero
  avatars next to it reads as an anonymous count badge, not a group of people. Figma's own
  component set was edited (2026-08-21) to drop `number=4`, leaving `number=1/2/3` - every example
  still pairs the trigger with at least one real avatar, confirming this is real design intent.
  Logs a dev-only warning when clamping actually occurs.
- Fixed a real stacking-order bug, verified live in a browser (not reproducible under jsdom):
  `.avatarRing` and `.overflowTrigger` both need `position: relative` so every direct child of
  `.root` lands in the same CSS paint tier. Avatar's own root is already `position: relative`
  (promoting it into the higher "positioned" paint tier, which always beats static content
  regardless of DOM order); Button's own root is `position: static`, so without this fix the
  overflow trigger - last in DOM, meant to be on top - always lost to the avatar before it. This is
  why the bug only showed up at the avatar-to-trigger junction, never between two avatars (both
  already positioned there via Avatar's own root).
- Two distinct separating-ring tokens, both verified directly against Figma rather than assumed
  interchangeable just because they render identically in light mode:
  `color-elevation-surface-raised-default` around each avatar, `color-border-inverse` around the
  overflow trigger (the same token Avatar's own badge container already uses for its own cutout
  ring).
- `size` defaults to `lg` here (unlike Avatar's own code default of `md`), matching Figma's own
  `avatar-group` default exactly - same reasoning Tag Group already applied for its own default.
- `avatar-group.module.css` uses `margin-inline-start: var(--avatar-group-overlap)` for the
  overlap, since CSS `gap` cannot be negative unlike Figma's own auto-layout `itemSpacing`. The
  dedicated `overlap-sm/md/lg` semantic tokens are already negative-valued, so no `calc()`/sign-flip
  is needed - discovered after initially (incorrectly) reusing the generic `spacing-*` scale with a
  `calc(-1 * ...)` workaround; corrected once the purpose-built token family was found.
