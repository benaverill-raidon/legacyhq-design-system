Here's the CSS Module, e.g. `matter-summary.module.css`:

```css
/*
 * Matter summary: a raised surface that rests on the page. Raised surfaces keep their border and
 * cast no shadow (shadow is only for things that float).
 */
.root {
  padding: var(--spacing-lg);
  background-color: var(--color-elevation-surface-raised-default);
  border: var(--border-width-sm) solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
  color: var(--color-content-default);
  font-family: var(--typography-body-md-font-family);
  font-size: var(--typography-body-md-font-size);
  font-weight: var(--typography-body-md-font-weight);
  line-height: var(--typography-body-md-line-height);
  letter-spacing: var(--typography-body-md-letter-spacing);
}

.secondary {
  color: var(--color-content-subtle);
}
```

Token choices:
- **Surface:** `--color-elevation-surface-raised-default`. It's the system's depth-by-surface-color token, and it has no shadow, as the elevation rules require.
- **Border:** `--border-width-sm` with `--color-border-default`, the same pairing Key Value Pair uses.
- **Radius:** `--border-radius-lg` (8px). I picked this by judgment. Use `--border-radius-xl` (12px) if you want it softer, but check what sibling cards in your page use.
- **Padding:** `--spacing-lg` is 16px.
- **Text:** `--color-content-default` is the default body color. `.secondary` uses `--color-content-subtle`.
- **Typography:** the `body-md` family, set the same way Key Value Pair sets it. Swap in `body-sm` or `body-lg` if the panel needs a different size.

I didn't run `npm run lint:css` on it. It uses only semantic tokens, so it should pass.
