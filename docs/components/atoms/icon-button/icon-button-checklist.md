# Icon Button Component Checklist

## Purpose

Use Icon Button when the action is recognizable from an icon and available space is limited.

## Accessibility

- [ ] Render a native `button`.
- [ ] Default to `type="button"`.
- [ ] Require an accessible name via `aria-label` or `aria-labelledby`.
- [ ] Do not rely on tooltip text as the only accessible name.
- [ ] Forward refs to the native `button`.

## Tooltip behavior

- [ ] When `tooltip` is omitted and `aria-label` is a non-empty string, use `aria-label` as the visible tooltip content.
- [ ] When `tooltip` is provided, use that content without changing the accessible name.
- [ ] When `tooltip={false}`, suppress internal Tooltip rendering.
- [ ] When `aria-labelledby` is used, require explicit `tooltip` or `tooltip={false}`.
- [ ] Avoid nested tooltip behavior when Icon Button is wrapped by external Tooltip.

## Disabled and loading behavior

- [ ] `isDisabled` keeps the button natively disabled.
- [ ] Disabled Icon Button may still show a pointer-triggered tooltip explanation.
- [ ] Disabled tooltip support must not add an extra tab stop.
- [ ] `isLoading` replaces the icon with Spinner.
- [ ] `isLoading` sets `aria-busy="true"` and prevents click interaction.

## Visual and structural requirements

- [ ] Reuse Button-family sizing and radius tokens.
- [ ] Preserve appearance, size, shape, expanded state, className, and focus-ring behavior.
- [ ] Keep square layout dimensions by size.

## Examples to document

- [ ] Default tooltip from `aria-label`
- [ ] Custom tooltip content
- [ ] `tooltip={false}` with external Tooltip composition
- [ ] `aria-labelledby` with explicit tooltip
- [ ] Disabled explanation tooltip
- [ ] Toolbar usage
