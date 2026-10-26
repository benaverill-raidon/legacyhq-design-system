Here's the CSS Module. I haven't saved it to a file because you didn't give a location. Every value is an existing token, taken from `popup.module.css` and the Roadmap template.

```css
.panel {
  padding: var(--spacing-lg);
  background: var(--color-elevation-surface-raised-default);
  border: var(--border-width-sm) solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
  color: var(--color-content-default);
}

.secondary {
  color: var(--color-content-subtle);
}
```

- **Raised surface:** a raised surface uses `--color-elevation-surface-raised-default` plus a border and no shadow. Per token-governance, shadows are only for things that float, and this panel rests on the page.
- **Padding:** 16px of padding is `--spacing-lg`, which is what the governance doc's own example uses.
- **Text colors:** the default body color is `--color-content-default`. The muted text uses `--color-content-subtle`, as the Roadmap and Document Generation templates do for their supporting text.
- **Radius:** `--border-radius-lg` matches Popup. If this panel should have tighter corners, swap in a smaller `--border-radius-*` step.
- **Secondary typography:** `.secondary` only changes color. If the supporting text should also be smaller, add the `--typography-body-sm-*` properties. The Roadmap template sets `font-family`, `font-size` and `line-height` from them.

I haven't run `npm run lint:css` on it. All the token names appear in existing CSS Modules that already pass that check.
