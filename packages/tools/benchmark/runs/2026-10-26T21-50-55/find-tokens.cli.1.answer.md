Here's the CSS Module. I took every token name from the repo's token data, and none of them are guessed.

```css
.root {
  padding: var(--spacing-lg);
  border: var(--border-width-sm) solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
  background: var(--color-elevation-surface-raised-default);
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

- **Raised surface:** `--color-elevation-surface-raised-default` plus the border gives the raised look. The system uses surface color for depth, and a panel resting on the page casts no shadow. Only floating things (overlays) use `--elevation-shadow-overlay`.
- **16px padding:** `--spacing-lg` resolves to 16px. Padding is spacing, so it doesn't use a `--size-*` token.
- **Border:** `--border-width-sm` sets the thickness and `--color-border-default` the color.
- **Radius:** I chose `--border-radius-lg` (8px, via the `--border-radius-8` primitive). Use `--border-radius-md` instead if you want it tighter. I didn't compare against other containers, so check it against the rest of your page.
- **Body type:** I set it to the `body-md` scale, which is what most molecules use. Swap to `body-lg` or `body-sm` if the panel needs it.
- **Muted text:** `.secondary` uses `--color-content-subtle`, the same token other components use for muted content.

I haven't saved this to a file or run `npm run lint:css`, because you didn't say where the module should live. If you give me the path, I'll add it and run the lint.
