# Card specification

## Source and scope

- Figma file: Components v1.0.0 (`M0eINB6n1BfrXu7ntYqb1i`).
- Component set: `card`, `4968:153931` (30 variants).
- Inspected via Figma Console on 2026-09-22, including bound variable names and native slot nodes.
- User intent: a surface and border radius containing an unrestricted content slot.

## API and structure

Export `Card`, `CardProps`, `CardSurface`, and `CardBorderRadius` from the component index.
Render one native `div` with `children` directly inside it. Forward the root ref and native div
attributes; compose the consumer's class with the CSS Module class. Use `data-surface` and
`data-border-radius` plus `data-border` for the independent visual axes. No generated IDs, state, or event handlers.

| Prop | Values | Default |
| --- | --- | --- |
| surface | raised, default, sunken, deep, none | raised |
| border | true, false | true |
| borderRadius | lg, xl, xxl | lg |
| children | ReactNode | empty |

## Token mapping

| Property | Token |
| --- | --- |
| Raised surface | `--color-elevation-surface-raised-default` |
| Default surface | `--color-elevation-surface-default` |
| Sunken surface | `--color-elevation-surface-sunken-default` |
| Deep surface | `--color-elevation-surface-deep-default` |
| None surface | `transparent` (no fill) |
| Border enabled | `--border-width-sm` (1px), solid `--color-border-default` |
| lg | `--border-radius-lg` (8px) |
| xl | `--border-radius-xl` (12px) |
| xxl | `--border-radius-xxl` (16px) |

Figma's border paint resolves its own alpha through the border token; do not multiply another
opacity onto the card. No shadow/effect is present, even for the raised surface.

## Layout and slot

Figma has zero padding and gap, an optional inside 1px stroke, clipped corners, and one FILL/FILL slot.
`border={false}` uses `border: none`, with no invisible reserved width.
`surface="none"` uses a transparent background and leaves children fully opaque.
CSS uses border-box sizing and `overflow: hidden`. Content goes directly inside the root; there is
no implementation-only wrapper that constrains the consumer's composition. Normal block layout
fills available width and grows with content. `min-inline-size: 0` permits shrinking in flex/grid.
Consumer CSS or `style` may size the card or provide layout and spacing.

The Figma masters use demonstration sizes, not fixed component dimensions. The varying horizontal
and vertical auto-layout directions across radius variants are authoring details of the single
slot, not different code behavior. Do not encode either as a radius-dependent layout.

## Behavior and accessibility

The card is presentational and has no hover/focus/press/selected/disabled axis. It does not create
a landmark, heading, button, link, or tab stop. Its children own semantics, focus, and behavior.
Changing a surface, border, or radius keeps the same root and child identities. Text styling is inherited;
content components should use their own theme-aware typography and content tokens.

Clipping is intentional. Keep controls away from the edge enough to show their focus indicators.
For overlays use existing portaled components. No card-specific tooltip, menu, or focus logic.

## Deliverables and verification

Component, types, CSS Module, barrel export, tests, stories, and attached MDX documentation.
Six source documentation files plus generated registry/exemplar entries and `llms.txt` index.
Storybook: Playground, AllVariants, NoSurface, ContentSlot, EdgeToEdge, WithForm. Inspect all 30 combinations
in light/dark themes and responsive content; verify a nested form stays usable.
