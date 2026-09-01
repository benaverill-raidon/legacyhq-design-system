# Inline Message Component Prompt

Use `inline-message-spec.md` as the source of truth.

## Goal

Build Inline Message as a molecule that shows a short, tone-colored status row and optionally reveals
additional detail in a popup when clicked. Build it on top of the `Popup` primitive
(`packages/ui/src/components/primitives/popup`) rather than a local positioning implementation.

## Inputs

- `inline-message-spec.md` as the source of truth
- `inline-message-checklist.md` for design/product context
- Figma: `inline-message` component set (node `4589:2519`, file `Components v1.0.0`), and its
  `figma-parts / inline-message-trigger` sub-component (node `2448:72904`)
- `Popup` (`packages/ui/src/components/primitives/popup`) and `Tooltip`
  (`packages/ui/src/components/atoms/tooltip`) as the established pattern for building a component
  on top of Popup

If anything conflicts, follow `inline-message-spec.md`.

## Recommended API

```ts
export type InlineMessageTone = 'default' | 'info' | 'success' | 'warning' | 'error';

export interface InlineMessageProps {
  title: React.ReactNode;
  secondaryText?: React.ReactNode;
  tone?: InlineMessageTone;
  content?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
```

Defaults:

```txt
tone: 'default'
defaultOpen: false
```

## File Structure

Create:

```txt
packages/ui/src/components/molecules/inline-message/
├── inline-message.tsx
├── inline-message.types.ts
├── inline-message.module.css
├── InlineMessage.test.tsx
├── InlineMessage.stories.tsx
├── inline-message.mdx
└── index.ts
```

## Behavior Requirements

- Render a plain, non-interactive `div` (icon + title + optional secondary text) when `content` is
  absent - no button, no `aria-expanded`, no Popup mounted.
- Render a real `<button type="button">` when `content` is provided. Clicking toggles the popup
  open/closed.
- Do not open on hover or focus - Popup's own guidance reserves that pattern for Tooltip. Inline
  Message is click/keyboard-activated only.
- Support both controlled (`open`/`onOpenChange`) and uncontrolled (`defaultOpen`) usage.
- Render the popup through `Popup` with its **default styled skin** (not `unstyled`),
  `alignment="bottomLeft"`, and `manageTriggerAria` left at its default (`true`). Do not pass
  `closeOnEscape`/`closeOnOutsideClick` - leave both at Popup's own default (`true`), so the detail
  dismisses on Escape or an outside click like any other Popup consumer.
- Style the hover/open tint off Popup's own `aria-expanded` attribute on the trigger - do not add a
  redundant custom `data-open` attribute.

## Tone Requirements

Map each tone to its own status icon, icon color, and hover/open tint token - verified per tone
directly from Figma, not assumed to generalize from one sample:

```txt
default  -> plain dot (--color-content-default)     | --color-background-neutral-overlay-hover
info     -> StatusInformationIcon (information)     | --color-background-information-overlay-hover
success  -> StatusSuccessIcon (success)             | --color-background-success-overlay-hover
warning  -> StatusWarningIcon (warning)              | --color-background-warning-overlay-hover
error    -> StatusErrorIcon (error)                  | --color-background-error-overlay-hover
```

`default` has no matching status icon in the generated icon set (Figma's own `default`-tone trigger
falls back to an unrelated generic placeholder glyph too) - draw a plain CSS dot instead of
fabricating a new icon asset.

## Layout Requirements

Verified directly from Figma's auto-layout data:

```txt
icon container: --size-300 (24px), matching Icon's spacing="spacious"
row's own padding: none (--spacing-none) - reset explicitly, since a native <button> otherwise
  inherits the UA stylesheet's own default button padding
text group padding: --spacing-xs (4px) on both sides - covers the icon-to-title gap and the row's
  own trailing space after the secondary text
title-to-secondary-text gap: --spacing-sm (8px)
title typography: --typography-heading-xs-* (SemiBold, 14px/24px), --color-content-default
secondary text typography: --typography-body-md-* (Regular, 14px), --color-content-subtle
```

## Accessibility Requirements

- `aria-expanded`/`aria-controls` come from Popup automatically - do not duplicate them.
- Apply the shared Focus Ring primitive (`focusRingClassNames`) to the trigger button - do not
  write a one-off `:focus-visible` style local to this component.
- Keyboard focus (`:focus-visible`) shows the same tint as hover - group them in the same CSS rule,
  matching Button/IconButton/ToggleButton's own convention.
- No ARIA role on the detail panel.
- Icon is always `aria-hidden`.
- No `disabled` prop - not evidenced in Figma's own component set.

## Storybook Requirements

```txt
Inline Message
├─ Docs (.mdx)
├─ Playground
├─ Variants
├─ Content
└─ EdgeCases
```

- **Variants** - all six tones, each with `content` provided.
- **Content** - title only, title + secondary text, no `content` (plain row), a form composition.
- **EdgeCases** - viewport-edge alignment fallback, long wrapping detail content, dark surface.

## Test Requirements

```txt
renders title
renders/omits secondaryText correctly
renders a real status icon for a non-default tone
renders a plain dot for tone="default"
renders a plain row (no button) when content is omitted
renders a real button with aria-expanded when content is provided
toggles the popup open/closed on click (uncontrolled)
supports defaultOpen
supports controlled open/onOpenChange
closes on Escape and on an outside click, inherited from Popup
applies className to the root row
maps every tone to its own overlay/hover tint token
delegates positioning/portal/dismissal to Popup, not a local implementation
reuses Popup's own aria-expanded wiring instead of a custom attribute
```

## Do Not

- Do not use MUI or Tailwind.
- Do not hand-roll positioning, a portal, or Escape/outside-click handling - use Popup.
- Do not make the row open on hover or focus.
- Do not invent a `disabled` prop without Figma evidence.
- Do not fabricate a new status icon asset for `tone="default"` - use a plain CSS dot.

## Validation

Before finishing:

- Verify TypeScript compiles.
- Verify tests pass.
- Verify Storybook compiles.
- Verify no hardcoded colors/spacing/typography where a token exists.
- Verify `npm run generate:registry` and `npm run generate:exemplars` pick up the new contract and
  examples.
