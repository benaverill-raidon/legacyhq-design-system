# Avatar Group Component Spec

## Overview

Avatar Group is a thin composition: an overlapping row of `Avatar` instances, with the tail end
optionally extended by an overflow trigger (a `Button`, reshaped into a circle) wrapped in a
`DropdownMenu`, whose panel lists whichever people got truncated. It introduces very little visual
language of its own beyond the overlap layout and two separating rings - every other visible pixel
is Avatar's, Button's, or Dropdown Menu/Menu's own.

## Anatomy

```txt
AvatarGroup
├─ root (inline-flex row, each child after the first pulled left by a per-size negative margin)
│  ├─ avatarRing (1..maxVisible or all of `avatars` if maxVisible is omitted)
│  │  └─ Avatar
│  └─ overflow trigger, optional - present only when avatars.length > maxVisible
│     └─ DropdownMenu (trigger = a reshaped Button)
│        └─ Menu (one section, one item per truncated avatar)
```

## Public API

```ts
type AvatarGroupSize = 'xs' | 'sm' | 'md' | 'lg';

interface AvatarGroupItem extends Omit<AvatarProps, 'size' | 'id'> {
  id: string;
}

interface AvatarGroupProps {
  avatars: AvatarGroupItem[];
  maxVisible?: number;
  size?: AvatarGroupSize;
  overflowLabel?: (hiddenCount: number) => React.ReactNode;
  overflowMenuAriaLabel?: string;
  onOverflowAvatarSelect?: (
    avatar: AvatarGroupItem,
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
  ) => void;
  id?: string;
  className?: string;
}
```

Unlike `TagGroupItem`, `AvatarGroupItem` does not need to omit anything beyond `size`/`id` - Avatar
already supports `isInteractive`/`onClick` for individually-clickable avatars, and there is no
`isRemovable`-equivalent concept to worry about colliding with the group's own behavior.

## Defaults

```txt
size: lg
overflowLabel: (hiddenCount) => `+${hiddenCount}`
overflowMenuAriaLabel: `${hiddenCount} more people`
```

`size` defaults to `lg`, matching Figma's own `avatar-group` default variant exactly (`lg (48px)`)
- a deliberate difference from Avatar's own code default of `md`, the same reasoning Tag Group
already applied for its own `size` default (match the *group's* verified Figma default, not the
atom's independently-chosen one).

## Truncation

```ts
const hasOverflow = typeof maxVisible === 'number' && avatars.length > maxVisible;
const effectiveMaxVisible = hasOverflow ? Math.max(1, maxVisible) : maxVisible;
const visibleAvatars = hasOverflow ? avatars.slice(0, effectiveMaxVisible) : avatars;
const hiddenAvatars = hasOverflow ? avatars.slice(effectiveMaxVisible) : [];
```

Identical shape to Tag Group's own truncation logic, with one addition Tag Group doesn't need:
- `maxVisible` omitted: every avatar renders, no overflow trigger at all.
- `avatars.length <= maxVisible`: every avatar renders, no overflow trigger - `maxVisible` is a
  ceiling, not a fixed slice count.
- `avatars.length > maxVisible`: the first `effectiveMaxVisible` avatars render; the rest render as
  `hiddenAvatars.length` (`+N`) behind the overflow trigger.
- **`effectiveMaxVisible` is `maxVisible` clamped to a minimum of 1** - a `maxVisible` of `0` or
  negative would otherwise render *only* the overflow trigger with zero real avatars next to it,
  which reads as an anonymous count badge rather than a group of people (there's nothing in the
  trigger alone - just a number - to suggest it represents people at all). Figma's own current
  examples never show this either: every `avatar-group` variant pairs the overflow trigger with at
  least one real avatar (`number` 1, 2, or 3 - never 0). Clamping logs a dev-only warning
  (suppressed in production, same `import.meta.env?.PROD` gate Avatar's own accessible-name warning
  uses) so misuse is visible in development without throwing.

This replaces Figma's own `number` (a fixed illustrative axis) and `showMore` (a boolean toggle,
`defaultValue: true`) with a single derived boolean - a consumer cannot get `showMore` and the real
truncated count out of sync, since there is no separate manual toggle to set inconsistently with
`avatars`/`maxVisible`.

## Composition

```tsx
<div className={styles.root}>
  {visibleAvatars.map((avatar) => (
    <span key={avatar.id} className={styles.avatarRing}>
      <Avatar {...avatarPropsWithoutId} size={size} />
    </span>
  ))}
  {overflowTrigger}
</div>
```

Where `overflowTrigger` (only rendered when `hasOverflow`) is:

```tsx
<DropdownMenu
  aria-label={overflowMenuAriaLabel ?? `${hiddenAvatars.length} more people`}
  open={overflowOpen}
  onOpenChange={setOverflowOpen}
  showSearch={false}
  sections={[{
    id: 'overflow',
    items: hiddenAvatars.map((avatar) => ({
      id: avatar.id,
      label: avatar.name ?? avatar.alt ?? 'Unnamed',
      leadingElement: <Avatar src={avatar.src} name={avatar.name} alt={avatar.alt} size="xs" decorative />,
      disabled: avatar.isDisabled,
      onSelect: (event) => onOverflowAvatarSelect?.(avatar, event),
    })),
  }]}
>
  <Button size={size} appearance="subtle" className={styles.overflowTrigger} onClick={() => setOverflowOpen((c) => !c)}>
    {overflowLabel(hiddenAvatars.length)}
  </Button>
</DropdownMenu>
```

Avatar Group holds exactly one piece of state - `overflowOpen` - to drive the overflow Dropdown
Menu, since Dropdown Menu is itself fully controlled and holds no state of its own. Identical to
Tag Group's own state shape.

### Overflow panel item label

`avatar.name ?? avatar.alt ?? 'Unnamed'` - Avatar's own `name` and `alt` are both optional (an
avatar can be purely decorative or image-only), so the overflow panel needs a defined fallback
chain rather than rendering a blank or undefined row label. Each row's `leadingElement` is that same
avatar's own picture, rendered `decorative` (Avatar's own prop for exactly this: hidden from the
accessibility tree, matching Menu's "leadingElement is decorative-only" rule) at `size="xs"` -
Avatar's smallest size that still fits Menu's fixed 24px leading slot exactly. `entityType` is
forwarded too, not just `src`/`name`/`alt` - a truncated team/partner entity must show the team
fallback in its own overflow row, not silently fall back to the person artwork.

## Overflow trigger: reusing Button, reshaped

Figma's own `figma-parts / more-trigger` part is, one level deeper, the real `Button` component
(`appearance="subtle"`, `buttonText` bound to whatever count string is needed), instance-overridden
across every size/state variant - all 16 re-measured directly, not sampled from one variant:

- **Fixed `inline-size`** equal to Button's own `min-block-size` at that size (making it square) -
  `--size-control-xs/sm/md/lg` (Button's own sizing tokens) measure identically to
  `--size-avatar-xs/sm/md/lg` (Avatar's own sizing tokens) at every shared size, verified directly
  against the token file - not a coincidence to route around, a designed correspondence to build on.
- **A fully-rounded corner radius** (`--border-radius-full-round` - the same token Avatar's own root
  already uses for its own circular shape) instead of Button's own per-size radius token. Measured
  `cornerRadius: 999` on every one of the 16 variants.
- **Background overridden to the `sunken` surface family**, not Button's own subtle-appearance
  transparent/overlay backgrounds: `color-elevation-surface-sunken-default` at rest. All 16 Figma
  variants (every size x every state - default/hover/press/focus) measured the identical fill,
  which reads as an unfinished mockup rather than deliberate no-hover-feedback design intent, so
  code still differentiates hover (`color-elevation-surface-sunken-hover`) and press
  (`color-elevation-surface-sunken-press`) using the same token family's sibling values, rather
  than leaving the trigger visually static on interaction like every other button in this system.
- **Typography overridden to the `body` scale**, not Button's own per-size heading-based type
  styles: Body/S, M, L, L for xs/sm/md/lg respectively (12px/14px/16px/16px, weight 400 throughout -
  `typography-body-sm/md/lg/lg`). Button's own `size=lg` normally steps up to a larger heading
  style; the more-trigger's `lg` variant instead reuses the exact same Body/L style as `md` - text
  size does not grow with the trigger's own diameter past `md`.
- **Padding-inline matches Button's own per-size default almost exactly** - measured 8/12/16 for
  sm/md/lg align exactly with Button's own `spacing-sm/md/lg`, needing no override at all. `xs`
  measures 6px, which isn't on the spacing scale (nearest tokens are `spacing-xs` (4) and
  `spacing-sm` (8)) - left as Button's own natural 8px default rather than introducing a raw,
  off-scale value for a 2px difference at the smallest size only.

This is a code-level composition decision (override CSS properties via a class passed through
Button's own `className` prop, using selectors deliberately matching button.module.css's own
specificity so the override wins regardless of CSS import order), not a change to Button itself -
Button gets no new prop, no new variant. The separating ring around it (`color-border-inverse`,
`1px`, matching Figma's own `OUTSIDE`-aligned stroke on that part) is Avatar Group's own CSS, the
same token Avatar's own badge container already uses for its cutout ring against the avatar surface
behind it.

## Separating rings

Every visible avatar is wrapped in a ring (`box-shadow: 0 0 0 var(--border-width-sm)
var(--color-elevation-surface-raised-default)`) - measured directly from Figma, where every `avatar`
instance inside `avatar-group` (including the first, with nothing behind it to separate from) 
carries this exact stroke as an instance-level override, not part of Avatar's own base component.
Applied uniformly regardless of position, matching Figma's own uniform application.

The overflow trigger gets the same ring treatment but with `color-border-inverse` instead - a
different, deliberately verified token (not a copy-paste of the avatar ring's token), matching
Figma's own measured value on that specific part exactly.

## Stacking order - later avatars (and the overflow trigger) paint on top

Figma's own layer order paints each avatar over the one before it, and the overflow trigger over
the last avatar - later in the row wins. Getting this right in code needs an explicit
`position: relative` on both `.avatarRing` and `.overflowTrigger`, for a reason that isn't obvious
from CSS alone:

- Avatar's own root already renders `position: relative`. Neither `.avatarRing` (a plain wrapping
  `<span>`) nor Button's own root creates a stacking context of its own, so Avatar's `position:
  relative` promotes it directly into `.root`'s "positioned" paint tier - a tier that always paints
  above plain static content, *regardless of DOM order*, per normal CSS stacking rules.
- Button's own root is `position: static` (button.module.css sets no `position` at all). Without
  its own `position: relative`, the overflow trigger - despite being last in DOM, meant to be on
  top - would always lose to the avatar immediately before it, because it's stuck in the lower
  "static" paint tier while every avatar sits in the higher "positioned" one.
- This is why the bug only showed up at the avatar-to-trigger junction, never between two avatars:
  avatar-to-avatar comparisons are both already in the "positioned" tier (via Avatar's own root), so
  DOM order correctly decided between them on its own. Only the trigger needed the explicit nudge.

Setting `position: relative` on `.overflowTrigger` (and, for the same reason made explicit rather
than relying on Avatar's own internal implementation detail, on `.avatarRing` too) puts every direct
child of `.root` in the same paint tier, so DOM order - later child on top - governs consistently
across every junction, not just avatar-to-avatar ones. No `z-index` needed; the fix is entirely
about which paint tier each child lands in, not about ordering within a tier.

## Overlap amount per size

Measured directly against Figma (`itemSpacing` on the row, negative, per `size`):

| size | Avatar diameter | Measured overlap | Token |
|---|---:|---:|---|
| `xs` | 24px | -4px | `overlap-sm` |
| `sm` | 32px | -4px | `overlap-sm` |
| `md` | 40px | -8px | `overlap-md` |
| `lg` | 48px | -12px | `overlap-lg` |

Not a fixed percentage of diameter. Each value maps exactly onto the dedicated `overlap-*` semantic
token family (`semantic-dimension.json`: `overlap-xs/sm/md/lg/xl`, already negative-valued) - not
the generic `spacing-*` scale with a sign flip. Implemented as `margin-inline-start:
var(--avatar-group-overlap)` on every child after the first (CSS `gap` cannot be negative, unlike
Figma's own auto-layout `itemSpacing`, so this can't use `gap` directly).

## Accessibility

- Every visible avatar keeps its own accessibility exactly as documented in `avatar-checklist.md` -
  Avatar Group changes none of it besides applying a uniform `size`.
- The overflow trigger is a real `<button>` (Button, unmodified) - Enter/Space activation and the
  native `disabled` attribute come for free, no custom key handling.
- `aria-expanded`/`aria-controls` on the overflow trigger come from Popup (via Dropdown Menu),
  reflecting the panel's open state.
- The overflow panel carries `role="menu"` (from Menu) with the accessible name
  `overflowMenuAriaLabel` (default `${hiddenCount} more people`).
- Each truncated avatar renders as a `menuitem` row with a decorative leading avatar; `disabled`
  mirrors that avatar's own `isDisabled`.

## Styling and tokens

`avatar-group.module.css` contains no raw values - the overlap amount, both separating rings, and
the overflow trigger's forced square dimensions are all `var(--...)` references. No new tokens were
created; every value already exists (`overlap-sm/md/lg`, `color-elevation-surface-raised-default`,
`color-border-inverse`, `border-radius-full-round`, `border-width-sm`, `size-control-xs/sm/md/lg`).

## Storybook

```txt
AvatarGroup
├─ Docs (.mdx)
├─ Playground
├─ Stack
├─ Overflow
├─ Content
└─ EdgeCases
```

### Stack story

No `maxVisible` - every avatar renders as one overlapping stack, at every `size`.

### Overflow story

8 people truncated to 4 visible, at every `size`, to show the overflow trigger matches Avatar's own
diameter exactly regardless of size.

### Content story

Realistic team/assignee examples - a short unbounded list, and a bounded list with truncation.

### EdgeCases story

Selecting a truncated avatar via `onOverflowAvatarSelect`; a single avatar well under `maxVisible`
to show the overflow trigger is genuinely optional; individually-interactive avatars inside a group
to show Avatar Group only touches `size`, nothing else.

## Tests

Required tests:

```txt
renders every avatar when there is no maxVisible
renders every avatar when avatars.length does not exceed maxVisible (no overflow trigger)
truncates beyond maxVisible and renders a "+N" overflow trigger
renders the overflow trigger after the visible avatars
opens a menu holding the remaining truncated avatars when the overflow trigger is activated
calls onOverflowAvatarSelect with the selected truncated avatar
does not close the overflow panel on its own when a truncated avatar is selected
closes the overflow panel on outside click / Escape, inherited from Popup
supports a custom overflowLabel
defaults the overflow menu accessible name to "{count} more people"
supports a custom overflowMenuAriaLabel
applies size uniformly to every visible avatar and the overflow trigger
forwards each avatar item's own props (src, isInteractive, onClick, isDisabled) to the rendered Avatar
falls back through name -> alt -> "Unnamed" for the overflow menu item label
forwards a truncated avatar's own entityType to its overflow menu row's leading avatar
keeps at least one avatar visible even when maxVisible is 0
keeps at least one avatar visible even when maxVisible is negative
warns in development when maxVisible is clamped to 1
supports a custom id/className on the root
```

Stacking order (later avatar, or the overflow trigger, painting on top) is not meaningfully
unit-testable under jsdom, which has no real layout/paint engine - `getBoundingClientRect()` and
`elementFromPoint()` don't reflect actual visual stacking there. Verified instead directly in a
live browser via `document.elementFromPoint()` at each overlap boundary, both before and after the
`position: relative` fix (see "Stacking order" above).

## Future considerations

Potential future support:

- A `renderAvatar`/`renderOverflowItem` escape hatch for fully custom row content
- Drag-to-reorder
- A tooltip on hover listing every visible avatar's name (currently only the overflow panel
  surfaces names for people beyond `maxVisible`)

Do not implement these unless requested.
