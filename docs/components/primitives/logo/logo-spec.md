# Logo

## Overview

### Purpose
Logo provides a consistent, reusable way to display the LegacyHQ brand mark, wordmark, or full logo across product surfaces.

### Description
Use Logo to render approved brand assets in a controlled way. Logo should support multiple types and sizes while preserving brand proportions, accessibility, and theme compatibility.

### Category
Primitive / Brand Asset

### Design Reference
- Figma Component: Logo
- Figma Properties:
  - `type`: `mark`, `wordmark`, `full`
  - `size`: `xxs`, `xs`, `sm`, `md`, `lg`
- Current exported assets:
  - light folder
  - dark folder

---

## Design Philosophy

Logo is a brand primitive, not a general icon.

Its purpose is to preserve brand consistency and prevent teams from manually placing or modifying logo artwork. The component should make correct usage easy and incorrect usage difficult.

---

## Usage Guidelines

### Use When
- Displaying LegacyHQ brand identity
- Displaying the product logo in navigation
- Showing the brand on authentication screens
- Showing the brand in product documentation
- Linking users back to a home/root product area

### Do Not Use When
- A functional UI icon is needed
- The logo would be cropped or distorted
- The logo would be used as decoration
- The background does not provide enough contrast
- A custom color or effect is requested outside brand rules

---

## Anatomy

```text
Logo
└─ SVG asset
   ├─ mark
   ├─ wordmark
   └─ full
```

### Structure Notes
- Logo renders one approved SVG asset.
- Logo does not render editable text.
- Logo does not render arbitrary icons.
- Logo preserves aspect ratio.
- Logo can be themed through CSS when possible.

---

## Variants

### Type

| Type | Description |
|------|-------------|
| mark | Symbol/icon-only brand mark |
| wordmark | Text-only brand wordmark |
| full | Brand mark and wordmark together |

### Size

| Size | Height |
|------|--------|
| xxs | 16px |
| xs | 24px |
| sm | 32px |
| md | 40px |
| lg | 48px |

### Variant Rules
- Use `full` as the default when horizontal space allows.
- Use `mark` for compact navigation or small placements.
- Use `wordmark` only when the mark is unnecessary or already nearby.
- All sizes are allowed for all types for now.
- Check legibility when using `wordmark` or `full` at `xxs`.

---

## Theming

### Preferred Strategy
Use one SVG per logo type and theme color through CSS variables if the only theme difference is color.

Preferred asset structure:

```txt
packages/ui/src/assets/logos/
├─ logo-mark.svg
├─ logo-wordmark.svg
├─ logo-full.svg
└─ index.ts
```

### Temporary Strategy
If current exports are already separated by theme, support this structure initially:

```txt
packages/ui/src/assets/logos/
├─ light/
│  ├─ logo-mark.svg
│  ├─ logo-wordmark.svg
│  └─ logo-full.svg
├─ dark/
│  ├─ logo-mark.svg
│  ├─ logo-wordmark.svg
│  └─ logo-full.svg
└─ index.ts
```

### Theme Rules
- Prefer CSS variables over duplicate assets when possible.
- Do not recolor logos ad hoc.
- Use approved theme colors only.
- Ensure sufficient contrast in light and dark modes.

---

## Brand Rules

### Clear Space
Maintain minimum clear space around the logo.

Recommended clear space:
- Use the logo mark width as the minimum spacing unit around the logo.
- No text, borders, icons, or UI controls should enter the clear space.

### Do Not
- Do not stretch
- Do not skew
- Do not rotate
- Do not crop
- Do not recolor outside approved theme colors
- Do not add shadows
- Do not add outlines
- Do not add effects
- Do not change proportions
- Do not recreate the wordmark with live text
- Do not place on low-contrast backgrounds

---

## Properties (API)

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| type | `'mark' \| 'wordmark' \| 'full'` | No | `'full'` | Logo artwork type |
| size | `'xxs' \| 'xs' \| 'sm' \| 'md' \| 'lg'` | No | `'md'` | Logo display size |
| title | string | No | undefined | Accessible title when logo communicates identity |
| ariaLabel | string | No | undefined | Accessible label, especially when logo is linked |
| decorative | boolean | No | false | Hides logo from assistive technology when decorative |
| className | string | No | undefined | Optional class name |

Recommended TypeScript:

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

---

## Accessibility

### Default
If the logo communicates brand identity, provide accessible text.

Example:

```tsx
<Logo title="LegacyHQ" />
```

### Linked Logo
If the logo links home, the link should have an accessible label.

Example:

```tsx
<a href="/" aria-label="LegacyHQ home">
  <Logo decorative />
</a>
```

### Decorative Logo
If the logo is purely decorative and the brand/product name is already present nearby:

```tsx
<Logo decorative />
```

### ARIA Rules
- Do not add unnecessary roles.
- Use `aria-hidden="true"` when decorative.
- Prefer accessible labeling on the parent link when the logo is clickable.

---

## Design Tokens

### Size
Size may be implemented as component-specific CSS classes:

```css
.logo[data-size='xxs'] { height: 16px; }
.logo[data-size='xs'] { height: 24px; }
.logo[data-size='sm'] { height: 32px; }
.logo[data-size='md'] { height: 40px; }
.logo[data-size='lg'] { height: 48px; }
```

### Color
If SVGs support CSS coloring, use theme-aware CSS variables.

Suggested tokens:
- `--color-content-default`
- `--color-content-inverse`
- `--color-content-brand`

Final color token usage depends on SVG implementation.

### Spacing
Clear space is a brand usage rule, not internal component padding.

---

## Behaviors

### Default
Logo renders the selected type at the selected size.

### Theme
Logo adapts to light/dark mode through CSS variables or theme-specific assets.

### Interaction
Logo itself is non-interactive.

If used as a link, the parent link handles interaction and accessibility.

---

## Responsive Behavior

### Mobile
Prefer `mark` in constrained navigation.

### Tablet
Use `mark` or `full` depending on available space.

### Desktop
Use `full` where brand recognition and space allow.

---

## Dependencies

### Uses
- SVG logo assets
- CSS Modules
- CSS variables

### Used By
- Header
- Side navigation
- App shell
- Authentication layout
- Empty states
- Product documentation

---

## Engineering Notes

### Implementation Requirements
- Use React and TypeScript.
- Use CSS Modules.
- Preserve SVG aspect ratio.
- Do not hardcode colors if SVGs can be themed.
- Do not distort SVGs.
- Do not import MUI.
- Do not import Tailwind.
- Keep implementation small and predictable.

### Asset Requirements
- Use SVGs.
- Optimize SVGs if needed.
- Prefer `currentColor` or CSS-variable-friendly SVGs where possible.
- If SVGs are imported as React components, ensure the build setup supports SVG imports.
- If SVGs are imported as URLs, render them with `img` and provide correct accessible text.

### Recommended Implementation Direction
Use a single SVG per logo type when possible:

```txt
logo-mark.svg
logo-wordmark.svg
logo-full.svg
```

If current light/dark assets differ only by color, update the SVGs to support CSS theming instead of maintaining duplicate files.

---

## Storybook Structure

Use:

```txt
Logo
├─ Playground
├─ Variants
└─ Examples
```

### Playground
Controls:
- type
- size
- decorative

### Variants
Show all type and size combinations.

### Examples
Show realistic placements:
- Header usage
- Compact navigation usage
- Light surface
- Dark surface

---

## QA Checklist

### Visual
- [ ] Mark renders correctly
- [ ] Wordmark renders correctly
- [ ] Full logo renders correctly
- [ ] All sizes render correctly
- [ ] Aspect ratio is preserved
- [ ] Light mode works
- [ ] Dark mode works
- [ ] No distortion
- [ ] No cropping

### Functional
- [ ] `type` prop works
- [ ] `size` prop works
- [ ] `className` applies correctly
- [ ] Decorative mode works
- [ ] Linked usage works when wrapped in anchor

### Accessibility
- [ ] Title or label is available when needed
- [ ] Decorative logo is hidden from assistive technology
- [ ] Linked logo has accessible label
- [ ] No unnecessary roles are added

---

## Future Enhancements
- Additional brand lockups
- Product-specific logos
- Animated loading logo
- Automated SVG optimization
- Tokenized logo color strategy
