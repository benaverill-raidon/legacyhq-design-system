# Generate Popup Primitive

Use `popup-spec.md` as the source of truth.

## Goal

Generate a production-ready Popup primitive for our internal React component library. Popup
anchors a floating panel of arbitrary content to a trigger element, positions it to avoid clipping
the viewport, and dismisses it on Escape/outside click by default. It is the shared foundation
future components (Dropdown Menu, Inline Message) will build on.

---

## Inputs

Use these inputs:
- `popup-checklist.md` for design/product context
- `popup-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma component set `popup` (fileKey `M0eINB6n1BfrXu7ntYqb1i`, "Components v1.0.0"), verified live
  via the Desktop Bridge plugin
- Generated token CSS files:
  - `packages/ui/src/tokens/generated/tokens.css`
  - `packages/ui/src/tokens/generated/light.css`
  - `packages/ui/src/tokens/generated/dark.css`
- The existing Tooltip implementation (`packages/ui/src/components/atoms/tooltip/tooltip.tsx`) as
  the closest existing prior art for portal-based, viewport-aware positioning in this codebase -
  this repo doesn't have a separate shared floating-position utility yet, so Popup's positioning
  logic is written fresh rather than imported from anywhere.

If anything conflicts, follow `popup-spec.md`.

---

## Framework

- React
- TypeScript
- CSS Modules
- CSS Variables

---

## Implementation

Create:

```txt
packages/ui/src/components/primitives/popup/
├─ popup.tsx
├─ popup.types.ts
├─ popup.module.css
├─ popup.test.tsx
├─ popup.stories.tsx
├─ popup.mdx
└─ index.ts
```

---

## Component API

```ts
export type PopupAlignment = 'topLeft' | 'topRight' | 'topCenter' | 'bottomLeft' | 'bottomRight' | 'bottomCenter';

export interface PopupProps {
  children: React.ReactElement;
  content: React.ReactNode;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  alignment?: PopupAlignment;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  id?: string;
  role?: React.AriaRole;
  className?: string;
}
```

Defaults:

```ts
alignment = 'topLeft'
closeOnEscape = true
closeOnOutsideClick = true
```

---

## Styling Requirements

Use CSS Modules. Use CSS variables only - no raw color, spacing, radius, or typography values.

Required token mapping:

```txt
background        → --color-elevation-surface-raised-default
border             → --border-width-sm / --color-border-default
padding            → --spacing-lg
radius             → --border-radius-lg
inter-content gap  → --spacing-xs
trigger/panel gap  → --spacing-sm (used in JS positioning math, not CSS)
shadow             → --color-elevation-shadow-overlay-inner / -spread / -perimeter
```

`-spread` and `-perimeter` did not exist yet on `color-elevation-shadow-overlay-*` - add them to
both `semantic-color-light.json` and `semantic-color-dark.json`, mirroring the existing
`elevation.shadow.raised` family's shape (`default`/`spread`/`perimeter`/`inner`), then run
`npm run build` to regenerate the token CSS before writing component styles that reference them.

Important:
- The panel must hug its content on both axes - `display: inline-flex`, no explicit width/height,
  matching the Figma component's inner `Slot` (`layoutSizingHorizontal`/`Vertical`: `HUG`).
- Use the `fade-quick` semantic motion token for the mount animation, matching Tooltip's precedent
  for the same mount/unmount mechanic (a `@keyframes` animation, not a `transition`).
- Respect `prefers-reduced-motion: reduce`.
- Do not hardcode colors, spacing, or radius.
- Do not import MUI or Tailwind.

---

## Behavioral Requirements

- `open` is fully controlled - no internal open state, no `defaultOpen`.
- Popup never changes its own visibility in response to Escape/outside click - it only calls
  `onOpenChange(false)`.
- Clone the trigger to attach a measurement ref, `aria-expanded={open}`, and `aria-controls`
  (pointing at the panel id only while open; preserve any existing `aria-controls` while closed).
- Position via a portal at `document.body`, `position: fixed`, recalculating on trigger/panel
  resize (`ResizeObserver`), window resize, and scroll.
- Try the preferred `alignment` first, then all remaining five, and pick whichever overflows the
  viewport least - expose the resolved value via `data-alignment` on the panel.
- Escape (document-level `keydown`, gated by `closeOnEscape`) and outside pointer press
  (document-level `pointerdown` in the capture phase, gated by `closeOnOutsideClick`) both call
  `onOpenChange?.(false)`.
- Render nothing but the cloned trigger when `open` is `false` - no empty portal node stays
  mounted.

---

## Accessibility Rules

- Set `aria-expanded` on the trigger, always.
- Set `aria-controls` on the trigger to the panel id while open; preserve the trigger's existing
  `aria-controls` while closed.
- Do not set a default `role` on the panel - accept an optional `role` prop instead.
- Do not manage focus movement into or out of the panel - leave that to the consumer.

---

## Storybook Requirements

Create stories for:
- Playground (interactive - click the trigger to open, `alignment`/`closeOnEscape`/
  `closeOnOutsideClick` wired to controls)
- Variants (all six `alignment` values)
- Content (a menu-shaped consumer and a short-message-shaped consumer, previewing Dropdown Menu and
  Inline Message without building either)
- EdgeCases (alignment fallback near a viewport edge, default dismissal behavior, both dismissal
  flags turned off)

---

## Test Requirements

Create tests for:
- Renders only the trigger when closed; renders content when open
- Opens on trigger interaction (via consumer-owned `onOpenChange`)
- `aria-expanded` reflects `open`
- `aria-controls` wired to the panel id only while open; preserves an existing value while closed
- Applies the requested `role` to the panel; no role by default
- Escape and outside-pointer-press both call `onOpenChange(false)` by default
- `closeOnEscape={false}` / `closeOnOutsideClick={false}` suppress the corresponding dismissal
- A pointer press inside the panel or on the trigger itself does not trigger outside-click dismissal
- `data-alignment` reflects the requested (or resolved) alignment
- Supports a custom `id` and `className`
- CSS maps to the required tokens; panel hugs its content rather than stretching

---

## Rules

1. Follow `popup-spec.md` exactly.
2. Use CSS variables for every color, spacing, and radius value.
3. No MUI. No Tailwind.
4. Do not hardcode design values when a token exists - add the missing semantic shadow tokens
   rather than inlining a primitive alpha color into the component.
5. Keep the trigger-cloning surface minimal - ref, `aria-expanded`, `aria-controls` only. No
   open/close event handlers.
6. Export the component and its types.

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript compiles.
- Verify Storybook compiles.
- Verify tests pass.
- Verify CSS uses variables for color, spacing, and radius.
- Verify the implementation matches the Figma component set (all six `alignment` values, the
  `isOpen` variant's visual shell, and the hugging inner slot).
