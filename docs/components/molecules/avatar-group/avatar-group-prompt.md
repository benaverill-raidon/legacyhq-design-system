# Generate Avatar Group Molecule

Use `avatar-group-spec.md` as the source of truth.

## Goal

Generate a production-ready Avatar Group molecule for our internal React component library.
Avatar Group lays out an overlapping stack of Avatars with an optional overflow trigger - a "+N"
button that opens a Dropdown Menu holding whichever people got truncated - a thin composition, not
a third independent implementation of overlap layout or floating-panel behavior.

Avatar Group is classified as a molecule despite composing Dropdown Menu, an organism - the same
documented tier exception Tag Group already established (see CLAUDE.md and
`avatar-group-spec.md`'s own reasoning; this prompt does not re-derive it).

---

## Inputs

Use these inputs:
- `avatar-group-checklist.md` for design/product context
- `avatar-group-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma component set `avatar-group` (fileKey `M0eINB6n1BfrXu7ntYqb1i`, "Components v1.0.0",
  componentSetNodeId `2067:119864`, filed on the "✅⏲️ Avatar Group" page) - verified live via the
  Desktop Bridge plugin, correctly named (unlike Tag Group's own `tab-group` typo)
- Figma part `figma-parts / more-trigger` (componentSetNodeId `4609:78602`) - the overflow
  trigger's real source, itself a `Button` instance with a forced-square-size and
  fully-rounded-corner-radius override
- The existing Avatar atom (`packages/ui/src/components/atoms/avatar/`) - render every visible
  avatar through it directly, do not re-derive image/fallback/presence/status/interactive rendering
- The existing Button atom (`packages/ui/src/components/atoms/button/`) - render the overflow
  trigger through it directly (reshaped via CSS, not a new component)
- The existing Dropdown Menu organism (`packages/ui/src/components/organisms/dropdown-menu/`) -
  render the overflow panel through it directly

If anything conflicts, follow `avatar-group-spec.md`.

---

## Framework

- React
- TypeScript
- CSS Modules (`avatar-group.module.css` - overlap layout + two separating rings + the overflow
  trigger's forced square dimensions; no raw values, every declaration is a `var(--...)` reference)

---

## Implementation

Create:

```txt
packages/ui/src/components/molecules/avatar-group/
├─ avatar-group.tsx
├─ avatar-group.types.ts
├─ avatar-group.module.css
├─ AvatarGroup.test.tsx
├─ AvatarGroup.stories.tsx
├─ avatar-group.mdx
└─ index.ts
```

No changes to Avatar or Button are needed - both already support everything this composition
requires (Avatar's `isInteractive`/`onClick`; Button's own sizing tokens already matching Avatar's
sizing tokens at every shared size).

---

## Component API

```ts
export type AvatarGroupSize = 'xs' | 'sm' | 'md' | 'lg';

export interface AvatarGroupItem extends Omit<AvatarProps, 'size' | 'id'> {
  id: string;
}

export interface AvatarGroupProps {
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

Defaults:

```ts
size = 'lg' // matches Figma's own avatar-group default exactly, not Avatar's own md default
overflowLabel = (hiddenCount) => `+${hiddenCount}`
// overflowMenuAriaLabel defaults at render time to `${hiddenCount} more people`
```

---

## Behavioral Requirements

- Compute `hasOverflow = typeof maxVisible === 'number' && avatars.length > maxVisible`. When
  false, render every avatar in `avatars`, in order, with no overflow trigger. When true, compute
  `effectiveMaxVisible = Math.max(1, maxVisible)` - **never let it go below 1** - and render
  `avatars.slice(0, effectiveMaxVisible)` as visible avatars and put
  `avatars.slice(effectiveMaxVisible)` behind the overflow trigger. A `maxVisible` of `0` or
  negative must still show at least one real avatar next to the trigger - a "+N" badge with zero
  avatars next to it doesn't give enough visual context that the group represents people. Log a
  dev-only warning (gated on `import.meta.env?.PROD`, same pattern as Avatar's own accessible-name
  warning) when clamping actually occurs; do not throw.
- Hold exactly one piece of state - `overflowOpen` (boolean) - to drive the overflow
  `DropdownMenu`, which is itself fully controlled.
- Wrap each visible avatar in a `<span>` carrying the separating ring
  (`box-shadow: 0 0 0 var(--border-width-sm) var(--color-elevation-surface-raised-default)`),
  applied uniformly regardless of position (including the first avatar), matching Figma exactly.
  This wrapping `<span>` (`.avatarRing`) and the overflow trigger (`.overflowTrigger`) both need
  `position: relative` set explicitly - see the dedicated CSS note below. Skipping it silently
  breaks stacking order: the overflow trigger (last in DOM, meant to paint on top) loses to the
  avatar before it, because Avatar's own root is already `position: relative` (landing it in a
  higher paint tier that beats static content regardless of DOM order) while Button's own root is
  `position: static`.
- Render the overflow trigger as `<Button size={size} appearance="subtle"
  className={styles.overflowTrigger} onClick={...toggle overflowOpen...}>` wrapped in
  `<DropdownMenu open={overflowOpen} onOpenChange={setOverflowOpen} showSearch={false}
  aria-label={overflowMenuAriaLabel ?? \`${hiddenAvatars.length} more people\`} sections={...}>`,
  where `sections` is one section (`id: 'overflow'`) with one `MenuItem` per hidden avatar: `id`,
  `label` (`avatar.name ?? avatar.alt ?? 'Unnamed'`), `leadingElement` (a decorative `<Avatar
  src={...} name={...} alt={...} entityType={...} size="xs" decorative />` of that same avatar -
  forward `entityType` explicitly, not just `src`/`name`/`alt`, so a truncated team entity shows the
  team fallback in its own overflow row too), `disabled` (that avatar's own `isDisabled`), and
  `onSelect` calling `onOverflowAvatarSelect?.(avatar, event)` - nothing else.
- `.overflowTrigger`'s CSS must reproduce every one of the real Figma `figma-parts / more-trigger`
  part's instance-level overrides (re-verified across all 16 of its own size x state variants, not
  sampled from one) - do not stop at radius/size:
  - Override `--button-border-radius` to `var(--border-radius-full-round)`, and set `inline-size` to
    the same size-control token Button's own `min-block-size` already uses at that size
    (`--size-control-xs/sm/md/lg`) - do not invent a new radius or size token.
  - Override `background` to `var(--color-elevation-surface-sunken-default)` at rest,
    `var(--color-elevation-surface-sunken-hover)` on hover/focus-visible, and
    `var(--color-elevation-surface-sunken-press)` on press - using selector specificity that
    matches (and beats) `button.module.css`'s own `.appearance_subtle`/`:hover`/`:active` rules
    (e.g. prefix with the root class) so the override wins regardless of CSS import order. Figma
    itself measures the identical fill across all 4 states (no hover/press differentiation
    modeled) - treat that as an unfinished mockup, not a deliberate static design, and still
    differentiate hover/press using the same token family's sibling values, consistent with every
    other interactive control in this system.
  - Override typography per size to the `body` scale, not Button's own per-size heading-based type
    styles: `typography-body-sm` (xs), `typography-body-md` (sm), `typography-body-lg` (md AND lg -
    Button's own `size=lg` normally steps up to a larger heading style; the more-trigger's `lg`
    variant instead reuses the exact same Body/L style as `md`).
  - Do not override `padding-inline` - Button's own per-size default already matches Figma's
    measured value for sm/md/lg (8/12/16) exactly. `xs` measures 6px in Figma, which isn't on the
    spacing scale (nearest tokens are 4 and 8) - leave it at Button's own natural 8px rather than
    introducing a raw, off-scale value for a 2px difference at the smallest size only.
- Set `position: relative` on both `.avatarRing` and `.overflowTrigger` - required for correct
  stacking order (later child paints on top), not decorative. Without it, `.overflowTrigger` (whose
  root, Button's own, is `position: static`) always loses to the avatar before it, because Avatar's
  own root is already `position: relative` and therefore already in the CSS "positioned" paint
  tier, which always beats static content regardless of DOM order. No `z-index` needed once both
  are in the same tier - DOM order alone then decides correctly at every junction.
- Apply the overlap via `margin-inline-start: var(--avatar-group-overlap)` on every child after the
  first (`.root > * + *`), with `--avatar-group-overlap` set per size to the dedicated
  `overlap-sm` (xs, sm), `overlap-md` (md), or `overlap-lg` (lg) semantic token - already
  negative-valued, so no `calc()`/sign flip is needed. Do not reuse the generic `spacing-*` scale
  for this - see `avatar-group-spec.md`'s overlap table. Do not use CSS `gap` for this either - it
  cannot be negative.
- Apply `size` uniformly to every rendered `Avatar`, including passing it straight to the overflow
  trigger `Button` - `AvatarGroupItem` omits `size` from Avatar's own props for exactly this reason.
- Spread every other `AvatarGroupItem` prop (`src`, `alt`, `name`, `presence`, `status`,
  `isSelected`, `isDisabled`, `isInteractive`, `decorative`, `onClick`, any generic HTML attribute)
  straight onto the rendered `Avatar`.
- Never call `onOverflowAvatarSelect`'s implied navigation automatically - only call the callback
  itself, exactly like a Menu item's `onSelect`.

---

## Accessibility Rules

- Do not add any custom key handling to the overflow trigger - it's a real `<button>` (Button,
  unmodified), so Enter/Space activation is native.
- Do not set a `role` on the root element - it is a plain layout container; each visible Avatar and
  the overflow panel already carry their own correct roles.
- Forward `overflowMenuAriaLabel` (or its computed default) to `DropdownMenu`'s `aria-label`, which
  forwards it to Menu's `role="menu"` container.
- Every overflow-panel leading avatar must be `decorative` - it is not itself a separately
  focusable or announced element; the row's own `label` already carries the accessible name.

---

## Storybook Requirements

Create stories for:
- Playground (prop exploration via Storybook controls)
- Stack (no `maxVisible` - every avatar renders as one overlapping stack, at every `size`)
- Overflow (8 people truncated to 4 visible, at every `size`)
- Content (realistic team/assignee examples - a short unbounded list, and a bounded list with
  truncation)
- EdgeCases (selecting a truncated avatar via `onOverflowAvatarSelect`; a single avatar well under
  `maxVisible` showing the overflow trigger is genuinely optional; individually-interactive avatars
  inside a group)

---

## Test Requirements

Create tests for:
- Renders every avatar when there is no `maxVisible`
- Renders every avatar (no overflow trigger) when `avatars.length` does not exceed `maxVisible`
- Truncates beyond `maxVisible` and renders a `+N` overflow trigger with the correct hidden count
- Overflow trigger renders after the visible avatars
- Opens a menu holding every remaining truncated avatar when the overflow trigger is activated
- Calls `onOverflowAvatarSelect` with the selected truncated avatar's own data
- Does not close the overflow panel on its own when a truncated avatar is selected
- Closes the overflow panel on an outside click and on Escape (inherited from Popup)
- Supports a custom `overflowLabel`
- Defaults the overflow menu's accessible name to `${hiddenCount} more people`; supports a custom
  `overflowMenuAriaLabel`
- Applies `size` uniformly to every visible avatar and the overflow trigger
- Forwards each avatar item's own props (`src`, `isInteractive`, `onClick`, `isDisabled`) to the
  rendered Avatar
- Falls back through `name` -> `alt` -> `'Unnamed'` for the overflow menu item label
- Forwards a truncated avatar's own `entityType` to its overflow menu row's leading avatar
- Keeps at least one avatar visible even when `maxVisible` is `0` or negative
- Warns in development (does not throw) when `maxVisible` is clamped to 1
- Supports a custom `id`/`className` on the root

Stacking order (later avatar, or the overflow trigger, painting on top) is not meaningfully
unit-testable under jsdom - it has no real layout/paint engine. Verify it live in a browser via
`document.elementFromPoint()` at each overlap boundary instead.

---

## Rules

1. Follow `avatar-group-spec.md` exactly.
2. Do not duplicate any Avatar, Button, Popup, Menu, or Dropdown Menu behavior - render through all
   of them, don't re-implement any of it.
3. No MUI. No Tailwind. No hardcoded colors/spacing - `avatar-group.module.css` uses `var(--...)`
   exclusively, including inside `calc()`.
4. Export the component and its types.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript compiles.
- Verify ESLint passes.
- Verify `npm run lint:css` passes (no raw values in `avatar-group.module.css`).
- Verify Storybook compiles.
- Verify tests pass.
- Verify the implementation matches the real Figma structure (the `size`/`number`/`showMore`
  variant grid, the measured per-size overlap amounts, and the `more-trigger` part's real identity
  as a reshaped `Button`).
