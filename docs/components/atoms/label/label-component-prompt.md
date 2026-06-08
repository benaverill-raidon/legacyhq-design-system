# Codex Prompt: Build the Label Component

## Goal

Build a production-ready `Label` component for the internal React component library and design system.

The component must follow the provided `label-component-checklist.md` and `label-component-spec.md`.

## Stack

- React
- TypeScript
- CSS Modules
- Storybook
- Vitest
- React Testing Library
- CSS variables generated from design tokens

Do not use:

- MUI
- Tailwind
- Hardcoded colors
- Hardcoded spacing
- Hardcoded typography values when matching tokens exist

## Folder Location

Create the component under:

```text
packages/ui/src/components/atoms/Label/
```

## Required Files

Create the following files:

```text
packages/ui/src/components/atoms/Label/
├─ Label.tsx
├─ Label.module.css
├─ Label.stories.tsx
├─ Label.test.tsx
├─ Label.types.ts
└─ index.ts
```

If this repository uses a different naming/export convention for existing components, follow the existing convention while preserving the same component API.

## Component API

Implement this API:

```ts
export type LabelSize = 'sm' | 'md';

export type LabelTone =
  | 'default'
  | 'information'
  | 'warning'
  | 'discovery'
  | 'error'
  | 'success'
  | 'law'
  | 'wealth';

export type LabelEmphasis = 'subtle' | 'bold';

export interface LabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  size?: LabelSize;
  tone?: LabelTone;
  emphasis?: LabelEmphasis;
}
```

Default props:

```ts
size = 'md'
tone = 'default'
emphasis = 'subtle'
```

Usage example:

```tsx
<Label tone="success" emphasis="subtle" size="sm">
  Active
</Label>
```

## Implementation Requirements

- Render a `span`.
- Do not render a button or link.
- Do not add keyboard interaction.
- Do not add `tabIndex`.
- Do not add ARIA roles by default.
- Forward standard span attributes.
- Merge consumer `className` with internal CSS Module classes.
- Use `children` for label content.
- Apply uppercase visually through CSS, not by transforming the React value.
- Use semantic CSS variables from generated token files.
- Do not use borders.
- Do not include icons.

## Styling Requirements

Base class should use:

- `display: inline-flex`
- `align-items: center`
- `width: fit-content`
- `white-space: nowrap`
- `border: none`
- `text-transform: uppercase`

Size mapping:

- `sm`
  - typography: `overline-sm`
  - padding-block: `--spacing-025`
  - padding-inline: `--spacing-050`
  - border-radius: `--border-radius-xs`

- `md`
  - typography: `overline-md`
  - padding-block: `--spacing-025`
  - padding-inline: `--spacing-075`
  - border-radius: `--border-radius-xs`

Typography details if `overline-sm` and `overline-md` variables/classes do not exist yet:

- `overline-sm`
  - Public Sans
  - font weight 600
  - font size 12px via token
  - line height 16px via token
  - letter spacing 0.5px via token
  - uppercase

- `overline-md`
  - Public Sans
  - font weight 600
  - font size 14px via token
  - line height 20px via token
  - letter spacing 1px via token
  - uppercase

Before implementation, inspect:

```text
packages/ui/src/tokens/generated/tokens.css
packages/ui/src/tokens/generated/light.css
packages/ui/src/tokens/generated/dark.css
```

Use the actual available variable names. If a semantic variable exists under `content-*`, use it. If the generated theme currently uses `text-*`, use `text-*`. Do not invent unavailable CSS variables unless the token files already define them.

## Tone and Emphasis Mapping

Implement tone/emphasis classes for the matrix below.

Use available semantic CSS variables. Do not substitute raw hex values.

| Tone | Emphasis | Background | Text |
|---|---|---|---|
| default | subtle | background neutral default | content/text subtle |
| default | bold | accent gray bolder default | content/text inverse |
| information | subtle | information subtle/default | information text/content |
| information | bold | information bolder/strong | content/text inverse |
| warning | subtle | warning subtle/default | warning text/content |
| warning | bold | warning bolder/strong | content/text inverse |
| discovery | subtle | discovery subtle/default | discovery text/content |
| discovery | bold | discovery bolder/strong | content/text inverse |
| error | subtle | error subtle/default | error text/content |
| error | bold | error bolder/strong | content/text inverse |
| success | subtle | success subtle/default | success text/content |
| success | bold | success bolder/strong | content/text inverse |
| law | subtle | brand default | content/text default |
| law | bold | brand boldest default | content/text inverse |
| wealth | subtle | accent green subtler default | content/text default |
| wealth | bold | accent green bolder default | content/text inverse |

Preferred explicit token names from Figma, if present:

```css
--color-background-brand-boldest-default
--color-background-accent-green-subtler-default
--color-background-accent-green-bolder-default
--color-background-accent-gray-bolder-default
--color-content-default
--color-content-subtle
--color-content-inverse
```

Current generated files may instead use names like:

```css
--color-background-brand-default
--color-background-neutral-default
--color-background-information-default
--color-text-default
--color-text-subtle
--color-text-inverse
```

Use the real generated variables from the repo. If a required semantic token is missing, leave a clear TODO in the CSS and choose the closest existing semantic token only if it is already in the token file. Never use a raw color.

## Storybook Requirements

Create `Label.stories.tsx` using this atom structure:

```text
Label
├─ Playground
├─ Variants
└─ Examples
```

Stories are documentation pages, not one story per variant.

### Playground

Controls:

- `children`
- `size`
- `tone`
- `emphasis`

### Variants

Show:

- all tones
- subtle and bold emphasis
- sm and md sizes where practical

### Examples

Include examples for:

- status label
- category label
- law label
- wealth label
- multiple labels in a row

## Testing Requirements

Create `Label.test.tsx` using Vitest and React Testing Library.

Tests should verify:

- renders children
- applies default props
- applies size classes
- applies tone classes
- applies emphasis classes
- merges custom `className`
- forwards span attributes
- renders as `span`
- does not render as `button`
- is not focusable by default

## Validation Requirements

After implementation, run the relevant project commands, such as:

```bash
pnpm test Label
pnpm storybook
pnpm lint
pnpm typecheck
```

Use the actual package scripts available in the repository.

## Final Output Expected From Codex

Provide:

- Summary of files created
- Notes on token mappings used
- Any missing token TODOs
- Test results
- Any deviations from the spec and why
