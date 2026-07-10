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
- [ ] Use component tokens for tooltip-specific z-index and max widths.

## Examples to document

- [ ] Icon-only controls
- [ ] Toggle icon controls
- [ ] Disabled-control explanations
- [ ] Truncated content
- [ ] Supplemental clarification that is not essential
