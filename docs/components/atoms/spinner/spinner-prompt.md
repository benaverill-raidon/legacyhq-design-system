# Codex Implementation Prompt: Spinner

Please generate the Spinner primitive using the attached files and screenshots.

## Inputs

You have access to:

- spinner-checklist.md
- spinner-spec.md
- spinner-prompt.md
- Figma screenshots
- tokens.css
- light.css
- dark.css

Priority order:

1. spinner-spec.md
2. spinner-prompt.md
3. Figma screenshots
4. spinner-checklist.md

If anything conflicts, follow the highest-priority source.

---

## Goal

Create a production-ready Spinner primitive for the internal React component library.

A Spinner is a compact animated loading indicator used when content or actions are in an indeterminate loading state.

The implementation should be simple, accessible, maintainable, theme-aware, and token-driven.

---

## Architecture Requirements

Implement a React component only.

The component should be lightweight and should not introduce interaction or behavior beyond visual loading indication.

Example:

```tsx
<Spinner />
<Spinner size="sm" />
<Spinner label="Loading clients" />
```

The component should render as a non-interactive inline element, preferably a `span` containing an inline SVG.

---

## Folder Structure

Create:

```txt
packages/ui/src/components/atoms/spinner/
├── spinner.tsx
├── spinner.types.ts
├── spinner.module.css
├── spinner.test.tsx
├── spinner.stories.tsx
└── index.ts
```

---

## API Requirements

Support the following props:

```ts
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  label?: string;
}
```

Default props:

```ts
size = 'lg'
```

`label` is optional. When omitted, the spinner is decorative. When provided, the spinner exposes an accessible loading status.

---

## Variant Requirements

Supported size variants:

- `sm` = 12px
- `md` = 16px
- `lg` = 24px
- `xl` = 48px

Default: `lg`

---

## Token Requirements

Use CSS variables only.

Color:

```css
color: var(--color-border-bold);
```

The SVG path should use:

```css
stroke: currentColor;
```

Recommended component-level tokens:

```css
--component-spinner-size-sm: 12px;
--component-spinner-size-md: 16px;
--component-spinner-size-lg: 24px;
--component-spinner-size-xl: 48px;

--component-spinner-border-width-sm: var(--border-width-1);
--component-spinner-border-width-md: var(--border-width-1-half);
--component-spinner-border-width-lg: var(--border-width-2);
--component-spinner-border-width-xl: var(--border-width-3);
```

These are component modifier tokens. Do not add these values to the global semantic border-width scale.

Spinner stroke width mapping:

- sm: `--component-spinner-border-width-sm`
- md: `--component-spinner-border-width-md`
- lg: `--component-spinner-border-width-lg`
- xl: `--component-spinner-border-width-xl`

Spinner stroke color:

- `--color-border-bold`

If a required token does not exist in `tokens.css`, `light.css`, or `dark.css`, document it in the final output.

Do not use:

- hardcoded colors
- MUI tokens
- Tailwind utilities
- external animation libraries

---

## Styling Requirements

The Spinner should:

- render inline-flex
- align itself center
- fit its own visual size
- use tokenized width and height
- use tokenized stroke width
- use `--color-border-bold` for color
- use SVG with `stroke: currentColor`
- use no border
- use no shadow
- not shift layout
- work in light mode
- work in dark mode

The SVG should:

- use a partial circular arc
- render the arc as 90 degrees, visually equal to 25% of the full circle
- use flat stroke caps
- animate with continuous rotation
- use an Atlassian-style `860ms` continuous rotation
- use easing that slows the rotation near the top/cycle boundary
- use `focusable="false"`
- use `aria-hidden="true"`

---

## Motion Requirements

Use CSS keyframes for the spinning animation.

Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  /* stop or significantly reduce animation */
}
```

Recommended reduced-motion behavior: stop continuous rotation while preserving the visible arc.

---

## Accessibility Requirements

Spinner is decorative by default.

Default behavior:

- root has `aria-hidden="true"`
- no ARIA role
- no ARIA label
- not focusable
- no keyboard behavior

When `label` is provided:

- root has `role="status"`
- root has `aria-live="polite"`
- root does not have `aria-hidden="true"`
- visually hidden label text is rendered
- SVG remains `aria-hidden="true"` and `focusable="false"`

The consuming component remains responsible for broader loading-state behavior, disabled states, and layout.

---

## Storybook Requirements

Create documentation-style stories.

Use primitive story structure:

```txt
Spinner
├─ Playground
└─ Examples
```

Create stories for:

- Playground
- Sizes
- Standalone accessible loading state
- Inline loading with text
- Button loading example
- Card or panel loading example
- Dark surface example

Stories should demonstrate real usage patterns.

---

## Test Requirements

Create tests using Vitest and React Testing Library.

Test:

- renders without crashing
- default size is `lg`
- supports `sm`, `md`, `lg`, and `xl`
- accepts custom `className`
- forwards native span attributes
- is decorative by default
- does not expose `role="status"` by default
- exposes `role="status"` when `label` is provided
- renders visually hidden label text when `label` is provided
- SVG is hidden from assistive technologies
- SVG is not focusable

---

## Quality Requirements

Before finishing:

- verify all files compile
- verify TypeScript types compile
- verify Storybook compiles
- verify tests compile
- verify token usage
- verify no hardcoded colors
- verify no MUI dependencies
- verify no Tailwind dependencies
- verify component exports correctly from `index.ts`

---

## Final Output

After generating the files:

1. Explain architecture decisions.
2. List any assumptions made.
3. List any missing tokens.
4. List any future improvements.
5. Confirm compliance with the spec.

