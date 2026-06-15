# Link Component Prompt

## Task
Create the `Link` atom for the React component library.

Use this file alongside:
- `link-component-checklist.md`
- `link-component-spec.md`
- Figma screenshots
- `tokens.css`
- `light.css`
- `dark.css`

Priority order:
1. `link-component-spec.md`
2. `link-component-prompt.md`
3. Figma screenshots
4. `link-component-checklist.md`

If requirements conflict, follow the highest-priority source.

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

## Implementation requirements
Build a production-ready `Link` atom.

Use:
- React
- TypeScript
- CSS Modules
- CSS variables
- semantic tokens
- native anchor element

Do not use:
- MUI
- Tailwind
- hardcoded colors
- hardcoded typography
- hardcoded spacing
- router abstractions
- disabled link behavior

## Public API
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

Defaults:
```ts
appearance = 'default'
size = 'md'
```

## Visual requirements
Support appearances:
```txt
default
subtle
inverse
```

Support sizes:
```txt
sm
md
```

Typography:
```txt
sm → heading-xxs
md → heading-xs
```

Underline:
```txt
default: no underline
hover: underline
press: underline
visited: color change only unless hovered/pressed
```

## External link behavior
When `target="_blank"`:
- automatically render an external-link icon after the text
- automatically apply `rel="noopener noreferrer"`
- preserve existing `rel` values
- icon inherits current color
- icon is decorative

Icon accessibility:
```tsx
aria-hidden="true"
focusable="false"
```

Do not support `iconBefore` in v1.
Do not expose a manual `iconAfter` prop in v1 unless the existing system requires it.

## Visited links
Do not implement a `hasVisited` prop.
Use native CSS `:visited`.

## Focus
Consume the shared Focus Ring primitive.
Do not create custom focus styling.
Use `:focus-visible`.

## Accessibility
Use a native `<a>` element.

Requirements:
- meaningful link text
- required `href`
- keyboard accessible
- screen reader accessible
- secure external links
- no disabled state
- no custom roles

If something should not navigate, it should not be rendered as Link.

## Token requirements
Use generated CSS variables.

Expected token categories:
- link color tokens
- content/text color tokens
- typography tokens
- spacing tokens for external icon gap
- focus ring tokens/classes

Use actual generated token names from the project.

If a token name differs from the spec, use the current generated token naming and document the difference.

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
- internal/self target link
- external/blank target link
- inline text example
- dark surface example
- visited-state note

## Tests
Use Vitest and React Testing Library.

Test:
- renders children
- renders anchor
- applies href
- appearance variants
- size variants
- forwards native anchor attributes
- supports custom className
- target blank renders external icon
- target blank applies noopener noreferrer
- preserves existing rel values
- external icon is decorative
- no disabled prop behavior
- focus-visible/focus ring integration

## Quality requirements
Before completion verify:
- TypeScript compiles
- tests compile
- Storybook compiles
- exports compile
- token usage is correct
- no hardcoded design values
- no MUI imports
- no Tailwind utilities

## Final output
After implementation provide:
1. Files created
2. Files modified
3. Architecture decisions
4. Accessibility decisions
5. Assumptions made
6. Missing tokens
7. Future improvements
8. Spec compliance confirmation
