# Card

Card wraps arbitrary content in an optional theme-aware surface, an optional thin border, and rounded corners.
Its single content slot is `children`. It owns no content layout or state.

## Use

```tsx
import { Card } from '../../components/organisms/card';

<Card surface="raised" borderRadius="xl">
  <section aria-labelledby="summary-title" style={{ padding: 'var(--spacing-2xl)' }}>
    <h2 id="summary-title">Summary</h2>
    <p>Any content can go here.</p>
  </section>
</Card>
```

- `surface`: `raised` (default), `default`, `sunken`, `deep`, `none` (transparent).
- `border`: `true` (default) or `false`.
- `borderRadius`: `lg` (8px, default), `xl` (12px), `xxl` (16px).
- `children`: any React content, including multiple nodes or complete components.
- Native div attributes, `className`, `style`, and an `HTMLDivElement` ref pass through.

The default border is 1px. Set `border={false}` to remove its width and paint.
Set `surface="none"` to show the background behind the card without fading its children.
These options work independently; radius and clipping remain active. Raised adds no shadow.
There is no built-in padding, gap, typography, header, footer, fixed width, or fixed height.
Content owns those decisions. A block card fills the available width; its height follows content.

## When to use

Group a summary, form, list, dashboard section, or other content on a distinct surface.
Use the same component for inset or nested panels by choosing another surface.

## When not to use

Use ordinary layout markup when no surface, border, or rounded clipping is needed. Card is not an interactive tile, navigation
link, selection control, or modal dialog. Put real links and buttons inside it for actions.

## Accessibility and clipping

The root is a neutral `div`: no implicit role, tab stop, click behavior, or keyboard handler.
Content supplies its semantics and accessible names. Surface and border changes do not remount the children.
Content is clipped at the rounded boundary, so inset controls to preserve their focus indicators;
use portaled popovers for overlays that should escape the card.

## Design and implementation

[Figma component set](https://www.figma.com/design/M0eINB6n1BfrXu7ntYqb1i/Components-v1.0.0?node-id=4968-153931),
verified through Figma Console on 2026-09-22. Semantic surface, border, and radius tokens plus
transparent/no-border styling cover all 30 combinations in both themes. No new tokens are required.

Tier exception: Card lives with organisms as the container for complete content sections, although
the component itself is deliberately just a surface shell and imports no other UI components.

See `card-spec.md` for exact mappings, `card.contract.json` for the machine-readable API, and the
Storybook Card Docs page for all variants and composition examples.
