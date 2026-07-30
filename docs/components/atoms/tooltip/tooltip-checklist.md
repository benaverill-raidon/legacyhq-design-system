# Tooltip Component Checklist

## Purpose

Use Tooltip for short, supplemental clarification near an existing control or piece of content.

## Accessibility

- [ ] Render non-interactive content only.
- [ ] Use `role="tooltip"`.
- [ ] Open on pointer hover.
- [ ] Open on keyboard focus.
- [ ] Close on pointer leave.
- [ ] Close on blur.
- [ ] Close on Escape.
- [ ] Preserve existing child event handlers.
- [ ] Skip internal behavior when a consumer handler calls `event.preventDefault()`.
- [ ] Preserve existing `aria-describedby` values.
- [ ] Add the tooltip id to `aria-describedby` only while visible.
- [ ] Do not create an extra tab stop.

## Content rules

- [ ] Do not render or attach behavior when `content` is absent.
- [ ] Do not use Tooltip as the only accessible name for icon-only controls.
- [ ] Keep tooltip content supplemental rather than essential.
- [ ] Do not place interactive elements inside Tooltip.

## Disabled control support

- [ ] Support pointer-triggered tooltip explanations for disabled native controls.
- [ ] Keep the control natively disabled.
- [ ] Keep the wrapper non-focusable.
- [ ] Preserve inline layout, dimensions, and alignment.

## Positioning

- [ ] Support preferred `top`, `right`, `bottom`, and `left` placement.
- [ ] Shift or fall back when the preferred placement would overflow.
- [ ] Recalculate on viewport, scroll, trigger, and tooltip geometry changes.
- [ ] Avoid clipping inside overflow containers.

## Token usage

- [ ] Use semantic tokens for color, typography, spacing, and radius.
- [ ] Keep Figma's tooltip-specific z-index and max widths private to the component.

## Validated Figma Details

- Background (`color-background-neutral-bold-default`), content color (`color-content-inverse`),
  corner radius (`border-radius-sm`, 4px), vertical padding (`spacing-xxs`, 2px), truncated max
  width (420px), and wrapped max width (240px) all matched the existing implementation exactly.
- Fixed a real bug: horizontal padding was `--spacing-sm` (8px); Figma's own tooltip-primitive frame
  measures 6px left/right padding at every content length. Fixed to `--measurement-6`, since 6px
  doesn't land on the named 4/8/12/16px spacing scale.
- No arrow/caret element exists in Figma's tooltip - it's a plain rounded rectangle, matching the
  implementation. A "keycap" layer appears in every Figma variant's node tree but renders invisible
  in every captured screenshot - an authoring artifact, not a real anatomy piece to replicate.
- Figma has no `size` or interactive-`state` variant axis at all (only `truncate` and
  `showTooltip`) - there's no static States/Sizes page to build here; the only "state" is
  shown/hidden, already demonstrated live by hovering/focusing the Playground trigger.

## Examples to document

- [ ] Icon-only controls
- [ ] Toggle icon controls
- [ ] Disabled-control explanations
- [ ] Truncated content
- [ ] Supplemental clarification that is not essential

## Storybook Requirements

Create the library's unified structure, minus Sizes/States (no such axes exist for this component -
see Validated Figma Details):

```txt
Tooltip / Docs (.mdx)
Tooltip / Playground
Tooltip / Variants
Tooltip / Content
Tooltip / EdgeCases
```

- **Variants** - `placement` crossed with `truncate`, plus `disabled`.
- **Content** - icon-only actions, toggle icon buttons, disabled-control explanations, a text button
  trigger.
- **EdgeCases** - placement fallback near a viewport edge (verify the resolved `data-placement`
  differs from the requested one), keyboard-focus trigger, dark surface.
