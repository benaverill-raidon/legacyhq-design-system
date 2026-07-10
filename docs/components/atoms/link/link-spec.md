# Link Component Spec

## Overview
`Link` is an atom used to navigate users to another location in the product or another website. It renders a native anchor element and should remain intentionally small, accessible, and predictable.

## Anatomy
```txt
Link
├─ anchor element
├─ text content
└─ optional external-link icon
```

The external-link icon is rendered automatically when `target="_blank"` is used.

## Location
```txt
packages/ui/src/components/atoms/link/
```

Required files:
```txt
link.tsx
link.types.ts
link.module.css
link.test.tsx
link.stories.tsx
index.ts
```

## API
```tsx
<Link href="/clients">Clients</Link>
```

```tsx
<Link href="https://example.com" target="_blank">
  External website
</Link>
```

## Props
```ts
export type LinkAppearance = 'default' | 'subtle' | 'inverse';
export type LinkSize = 'sm' | 'md';

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  appearance?: LinkAppearance;
  size?: LinkSize;
  children: React.ReactNode;
}
```

## Defaults
```ts
appearance = 'default'
size = 'md'
target = '_self'
```

## Variants

### Appearance
| Appearance | Purpose |
|---|---|
| `default` | Standard product link |
| `subtle` | Lower-emphasis supporting link |
| `inverse` | Link on dark or bold surfaces |

### Size
| Size | Typography |
|---|---|
| `sm` | `heading-xxs` |
| `md` | `heading-xs` |

## States
Supported:
```txt
default
hover
press
focus
visited
```

Do not support disabled links. If the destination is unavailable, do not render a link.

## Behavior

### Navigation
- Use native anchor navigation.
- `href` is required.
- `target` supports standard anchor target values. Documentation covers `_self` and `_blank`.

### External links
When `target="_blank"`:
- render an external-link icon after the text
- apply `rel="noopener noreferrer"` automatically
- preserve any user-provided `rel` values while ensuring `noopener noreferrer` are included

### Visited links
Do not add a `hasVisited` prop. Use native CSS `:visited`.

### Underline behavior
- Default: no underline
- Hover: underline
- Press/active: underline
- Visited: color change only unless hovered or pressed

## Token mapping

Use CSS variables only.

### Typography
| Size | Token |
|---|---|
| `sm` | heading-xxs |
| `md` | heading-xs |

### Colors
Use generated token names from `tokens.css`, `light.css`, and `dark.css`.

Expected mappings:
- default: link default token
- pressed: link pressed token
- visited default: link visited default token
- visited pressed: link visited pressed token
- subtle: content/text subtle token
- inverse: content/text inverse token

If the system uses `--color-text-*` instead of `--color-content-*`, use the generated token names from the current token output.

### Icon
External-link icon inherits color with `currentColor`.

### Spacing
Use a semantic spacing token for icon gap, such as spacing-025 or the closest available generated token.

## Styling requirements
The Link should:
- render inline-flex when an external icon is present
- align icon and text visually
- use tokenized typography
- use tokenized colors
- use `currentColor` for external icon
- use underline on hover/press
- preserve native anchor behavior
- support light and dark themes

## Accessibility
- Render a native `<a>`.
- Require `href`.
- Do not add custom roles.
- Do not use button semantics.
- Do not implement disabled links.
- Preserve keyboard access.
- Use shared Focus Ring primitive.
- External-link icon is decorative: `aria-hidden="true"` and `focusable="false"`.
- Automatically add `rel="noopener noreferrer"` for `target="_blank"`.

## Engineering requirements
- React
- TypeScript
- CSS Modules
- CSS variables
- No MUI
- No Tailwind
- No hardcoded colors
- No hardcoded typography
- No hardcoded spacing
- No router abstraction in v1

## Storybook
Use atom structure:
```txt
Link
├─ Playground
├─ Variants
└─ Examples
```

Include:
- default appearance
- subtle appearance
- inverse appearance
- sm size
- md size
- target `_self`
- target `_blank`
- inline text example
- dark surface example
- visited-state note

## Tests
Use Vitest and React Testing Library.

Test:
- renders children
- renders native anchor
- applies href
- appearance classes
- size classes
- forwards native anchor attributes
- supports custom className
- `target="_blank"` renders external icon
- `target="_blank"` applies `noopener noreferrer`
- preserves existing rel values
- external icon is decorative
- no disabled behavior
- focus ring integration exists

## QA checklist
- Link renders as anchor
- Link text is visible and readable
- Light and dark themes work
- Hover underlines
- Pressed underlines
- Visited color uses native `:visited`
- External icon appears for `_blank`
- External icon does not appear for `_self`
- `rel` is secure for `_blank`
- Focus ring appears on keyboard focus
- No MUI
- No Tailwind
- No hardcoded design values
