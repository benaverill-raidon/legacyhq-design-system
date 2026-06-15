# Logo Checklist

## Component Information

### Name
Logo

### Category
Primitive / Brand Asset

### Related Assets
- Logo mark
- Logo wordmark
- Full logo
- Icons

---

## Purpose

### What problem does this component solve?
Logo provides a consistent, reusable way to display the LegacyHQ brand mark, wordmark, or full logo across product surfaces.

### Why does it need to exist?
The application needs one controlled implementation for brand display so teams do not manually place, resize, recolor, distort, or inconsistently use logo SVG assets.

### What user goal does it support?
- Quickly recognize the product or brand
- Navigate back to a branded home surface when the logo is used as a link
- Understand product context in headers, navigation, authentication pages, and empty states

---

## Usage

### Where will this component be used?
- App header
- Side navigation
- Authentication screens
- Loading or splash screens
- Empty states
- Product documentation

### What are the most common use cases?
- Displaying the full logo in a header
- Displaying the logo mark in compact navigation
- Displaying the wordmark where the mark is already present nearby
- Displaying a smaller logo in constrained UI

### When should this component NOT be used?
- As a decorative background element
- As a repeated pattern
- As an icon replacement for unrelated actions
- In places where the logo would be cropped, stretched, recolored, or visually crowded

---

## Logo Types

### Supported Types
- mark
- wordmark
- full

### Type Guidance
- Use `full` when there is enough horizontal space.
- Use `mark` in compact spaces or where the brand name is already visible.
- Use `wordmark` when the mark is not needed or appears nearby.

---

## Sizes

### Supported Sizes
- xxs = 16px
- xs = 24px
- sm = 32px
- md = 40px
- lg = 48px

### Size Guidance
- All three logo types may be used at 16px for now.
- Confirm legibility before using the wordmark or full logo at very small sizes.
- Prefer mark-only usage in highly constrained spaces.

---

## Theming

### Light and Dark Mode
Logo should support light and dark themes.

Preferred implementation:
- Use SVGs that can be colored through CSS where possible.
- Use CSS variables for theme-based color.
- Avoid maintaining duplicate light and dark SVG files if the only difference is color.

Temporary implementation:
- If current assets are already split into `light` and `dark` folders, Codex may use them initially.
- The preferred future direction is a single SVG per logo type with theme-aware color via CSS.

---

## Brand Rules

### Clear Space
Maintain clear space around the logo.

Recommended minimum clear space:
- Use the logo mark width as the minimum spacing unit around the logo.
- Keep text, borders, icons, and UI controls outside that space.

### Do Not
- Do not stretch
- Do not skew
- Do not rotate
- Do not crop
- Do not recolor outside approved theme colors
- Do not add shadows or effects
- Do not change proportions
- Do not place on low-contrast backgrounds
- Do not recreate the logo with live text

---

## Accessibility

### Does the logo need accessible text?
Yes, when it communicates brand identity or links to home.

### When decorative
If the logo is purely decorative and the brand name already appears nearby, it may be hidden from assistive technology.

### When linked
If the logo links home, provide a clear accessible label such as:
- LegacyHQ home

---

## Dependencies

### What does this depend on?
- SVG logo assets
- CSS variables
- Theme tokens

### What depends on this?
- Header
- Side navigation
- Authentication layout
- Product shell
- Product documentation

---

## Notes
Logo is a controlled brand asset component. It should stay small, predictable, and difficult to misuse.
