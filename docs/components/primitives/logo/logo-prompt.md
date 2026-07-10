# Generate Logo Component

Use `logo-spec.md` as the source of truth.

## Goal

Generate a production-ready Logo component for our internal React component library.

Logo is a primitive brand asset component used to display the LegacyHQ mark, wordmark, or full logo consistently across the product.

---

## Inputs

Use these inputs:
- `logo-checklist.md` for product/design context
- `logo-spec.md` as the source of truth
- This prompt as implementation instruction
- Figma screenshot as visual reference
- Exported SVG logo assets
- Generated token CSS files:
  - `packages/ui/src/tokens/generated/tokens.css`
  - `packages/ui/src/tokens/generated/light.css`
  - `packages/ui/src/tokens/generated/dark.css`

If anything conflicts, follow `logo-spec.md`.

---

## Framework

- React
- TypeScript
- CSS Modules
- CSS Variables
- SVG assets

---

## Expected Asset Location

Preferred future structure:

```txt
packages/ui/src/assets/logos/
Ã¢â€Å“Ã¢â€â‚¬ logo-mark.svg
Ã¢â€Å“Ã¢â€â‚¬ logo-wordmark.svg
Ã¢â€Å“Ã¢â€â‚¬ logo-full.svg
Ã¢â€â€Ã¢â€â‚¬ index.ts
```

If the current exported assets are still split by theme, support this structure initially:

```txt
packages/ui/src/assets/logos/
Ã¢â€Å“Ã¢â€â‚¬ light/
Ã¢â€â€š  Ã¢â€Å“Ã¢â€â‚¬ logo-mark.svg
Ã¢â€â€š  Ã¢â€Å“Ã¢â€â‚¬ logo-wordmark.svg
Ã¢â€â€š  Ã¢â€â€Ã¢â€â‚¬ logo-full.svg
Ã¢â€Å“Ã¢â€â‚¬ dark/
Ã¢â€â€š  Ã¢â€Å“Ã¢â€â‚¬ logo-mark.svg
Ã¢â€â€š  Ã¢â€Å“Ã¢â€â‚¬ logo-wordmark.svg
Ã¢â€â€š  Ã¢â€â€Ã¢â€â‚¬ logo-full.svg
Ã¢â€â€Ã¢â€â‚¬ index.ts
```

Important:
If light and dark SVGs only differ by color, prefer converting to CSS-themeable SVGs using `currentColor` or CSS variables.

---

## Expected Component Location

Create:

```txt
packages/ui/src/components/primitives/logo/
Ã¢â€Å“Ã¢â€â‚¬ logo.tsx
Ã¢â€Å“Ã¢â€â‚¬ logo.types.ts
Ã¢â€Å“Ã¢â€â‚¬ logo.module.css
Ã¢â€Å“Ã¢â€â‚¬ Logo.test.tsx
Ã¢â€Å“Ã¢â€â‚¬ Logo.stories.tsx
Ã¢â€â€Ã¢â€â‚¬ index.ts
```

---

## Component API

```ts
export type LogoType = 'mark' | 'wordmark' | 'full';
export type LogoSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

export interface LogoProps {
  type?: LogoType;
  size?: LogoSize;
  title?: string;
  ariaLabel?: string;
  decorative?: boolean;
  className?: string;
}
```

Defaults:

```ts
type = 'full'
size = 'md'
decorative = false
```

---

## Size Requirements

Use CSS sizing.

Do not create separate React components for each size.

Map sizes as:

```txt
xxs = 16px
xs = 24px
sm = 32px
md = 40px
lg = 48px
```

All three logo types may use all five sizes for now.

Preserve aspect ratio.

---

## Brand Usage Rules

Implement the component in a way that prevents misuse.

Rules:
- Do not stretch.
- Do not crop.
- Do not rotate.
- Do not recolor outside approved theme colors.
- Do not add effects.
- Do not recreate the wordmark with live text.
- Do not place on low-contrast backgrounds.

Document these in Storybook.

---

## Accessibility Rules

Logo is non-interactive by default.

If logo communicates brand identity:
- expose accessible text through `title` or `ariaLabel`

If decorative:
- use `aria-hidden="true"`

If logo is wrapped in a link:
- parent link should receive the accessible label
- Logo may be decorative inside the link

Examples:

```tsx
<Logo title="LegacyHQ" />

<a href="/" aria-label="LegacyHQ home">
  <Logo decorative />
</a>
```

---

## Storybook Requirements

Create:

```txt
Logo
Ã¢â€Å“Ã¢â€â‚¬ Playground
Ã¢â€Å“Ã¢â€â‚¬ Variants
Ã¢â€â€Ã¢â€â‚¬ Examples
```

### Playground
Controls:
- type
- size
- decorative

### Variants
Show:
- mark
- wordmark
- full
- all sizes

### Examples
Show:
- Header usage
- Compact navigation usage
- Light surface
- Dark surface

Do not create one story for every size/type combination unless needed.

---

## Test Requirements

Create tests for:
- renders default logo
- renders mark
- renders wordmark
- renders full
- applies size
- applies className
- supports title
- supports ariaLabel
- supports decorative mode

---

## Styling Requirements

Use CSS Modules.

Use CSS variables where color can be controlled.

Do not use:
- MUI
- Tailwind
- hardcoded colors when CSS variables can be used
- inline style sizing unless necessary

---

## Validation

Before finishing:
- Verify all files exist.
- Verify TypeScript compiles.
- Verify Storybook compiles.
- Verify tests compile.
- Verify SVGs render.
- Verify aspect ratio is preserved.
- Verify accessibility behavior.
- Verify light and dark theme behavior.
- List any SVG or token issues found.
