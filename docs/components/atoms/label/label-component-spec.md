# Label Component Spec

## Component Overview

`Label` is a compact, non-interactive visual indicator used to communicate status, category, or classification. It is optimized for quick recognition in dense interfaces such as tables, cards, lists, and metadata rows.

The component is inspired by lozenge-style status indicators but uses the CounselPro design system name `Label`.

## Component Classification

- Component name: `Label`
- Component layer: Atom
- Interactivity: Non-interactive
- Default element: `span`
- Content: Text-only

## Anatomy

```text
Label
└── Text
```

The component does not include:

- Icons
- Borders
- Buttons
- Links
- Remove controls
- Dropdown affordances

## Variants

### Size

| Size | Usage | Typography | Padding |
|---|---|---|---|
| `sm` | Dense metadata, tables, compact cards | `overline-sm` | block `spacing-025`, inline `spacing-050` |
| `md` | Default label size, cards, page sections | `overline-md` | block `spacing-025`, inline `spacing-075` |

### Tone

| Tone | Purpose |
|---|---|
| `default` | Neutral/default classification |
| `information` | Informational status or category |
| `warning` | Warning or attention state |
| `discovery` | Discovery, exploratory, or purple-coded category |
| `error` | Error, danger, failed, or destructive status |
| `success` | Success, complete, active, or positive status |
| `law` | Law-specific product/category label |
| `wealth` | Wealth-specific product/category label |

### Emphasis

| Emphasis | Purpose |
|---|---|
| `subtle` | Lower visual weight, softer background |
| `bold` | Higher visual weight, strong filled background |

## States

Label is non-interactive and does not support hover, pressed, selected, loading, focus, or disabled states.

If future requirements introduce interaction, create an explicit interactive component or wrapper rather than adding hidden button-like behavior to this component.

## Props / API

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

### Defaults

```ts
size = 'md'
tone = 'default'
emphasis = 'subtle'
```

### Example

```tsx
<Label tone="success" emphasis="subtle" size="sm">
  Active
</Label>
```

## Design Tokens

### Base Layout Tokens

| Property | Token |
|---|---|
| `sm` padding-block | `--spacing-025` |
| `sm` padding-inline | `--spacing-050` |
| `md` padding-block | `--spacing-025` |
| `md` padding-inline | `--spacing-075` |
| Border radius | `--border-radius-xs` |

### Typography Tokens

| Size | Token |
|---|---|
| `sm` | `overline-sm` |
| `md` | `overline-md` |

Overline typography should apply:

- Public Sans
- Font weight 600
- Uppercase transform
- `sm`: 12px font size, 16px line height, 0.5 letter spacing
- `md`: 14px font size, 20px line height, 1px letter spacing

If generated typography tokens do not expose `overline-sm` and `overline-md` directly, implement local classes using the corresponding semantic or primitive typography variables. Do not hardcode raw values unless the token pipeline does not yet expose the needed variables.

## Tone Token Mapping

Use semantic CSS variables where available. Do not use raw hex values.

| Tone | Emphasis | Background token | Text token |
|---|---|---|---|
| `default` | `subtle` | `--color-background-neutral-default` | `--color-text-subtle` or `--color-content-subtle` |
| `default` | `bold` | `--color-background-accent-gray-bolder-default` | `--color-text-inverse` or `--color-content-inverse` |
| `information` | `subtle` | `--color-background-information-default` | `--color-text-information` |
| `information` | `bold` | information bolder/background strong semantic token | `--color-text-inverse` or `--color-content-inverse` |
| `warning` | `subtle` | `--color-background-warning-default` | `--color-text-warning` |
| `warning` | `bold` | warning bolder/background strong semantic token | `--color-text-inverse` or `--color-content-inverse` |
| `discovery` | `subtle` | `--color-background-discovery-default` | `--color-text-discovery` |
| `discovery` | `bold` | discovery bolder/background strong semantic token | `--color-text-inverse` or `--color-content-inverse` |
| `error` | `subtle` | `--color-background-error-default` | `--color-text-error` |
| `error` | `bold` | error bolder/background strong semantic token | `--color-text-inverse` or `--color-content-inverse` |
| `success` | `subtle` | `--color-background-success-default` | `--color-text-success` |
| `success` | `bold` | success bolder/background strong semantic token | `--color-text-inverse` or `--color-content-inverse` |
| `law` | `subtle` | `--color-background-brand-default` | `--color-text-default` or `--color-content-default` |
| `law` | `bold` | `--color-background-brand-boldest-default` | `--color-text-inverse` or `--color-content-inverse` |
| `wealth` | `subtle` | `--color-background-accent-green-subtler-default` | `--color-text-default` or `--color-content-default` |
| `wealth` | `bold` | `--color-background-accent-green-bolder-default` | `--color-text-inverse` or `--color-content-inverse` |

Important implementation note: the current generated theme may use `--color-text-*` naming while newer Figma tokens may use `content-*` naming. Codex should inspect `tokens.css`, `light.css`, and `dark.css` and use the actual available CSS variables. If a listed semantic token does not exist yet, add a clear TODO comment rather than substituting raw color values.

## Styling Requirements

- Use CSS Modules.
- Use CSS variables for all design values.
- Do not use MUI.
- Do not use Tailwind.
- Do not hardcode colors.
- Do not hardcode spacing.
- Do not hardcode typography values when tokens exist.
- Do not render borders.
- Use `display: inline-flex`.
- Use `align-items: center`.
- Use `width: fit-content` or equivalent inline behavior.
- Use `white-space: nowrap`.
- Let consumers control placement and wrapping context.

## Behavior

- Render children as text/content inside the label.
- Apply uppercase transform visually through CSS.
- Preserve the original `children` value in React output.
- Forward valid span HTML attributes.
- Merge external `className` with internal classes.
- Do not add `tabIndex`.
- Do not add click behavior.

## Accessibility

- No ARIA role required.
- No keyboard interaction required.
- Must not be focusable unless consumer intentionally adds custom behavior outside this component.
- Visible label text should communicate the label meaning.
- Do not rely on color alone for critical meaning.
- Ensure text/background contrast is acceptable in light and dark themes.

## Storybook Requirements

Use atom story structure:

```text
Label
├─ Playground
├─ Variants
└─ Examples
```

Stories should be documentation pages, not one story per variant.

### Playground

Include controls for:

- `children`
- `size`
- `tone`
- `emphasis`

### Variants

Show a matrix of:

- All tones
- Both emphasis values
- Both sizes if layout allows

### Examples

Show realistic usage examples:

- Status in a table row
- Category metadata in a card
- Law and wealth labels
- Multiple labels in a compact row

## Testing Requirements

Use Vitest and React Testing Library.

Test that:

- Component renders children.
- Default props are applied.
- Size classes apply correctly.
- Tone classes apply correctly.
- Emphasis classes apply correctly.
- Custom `className` is merged.
- Standard span attributes are forwarded.
- Component does not render as a button.
- Component is not focusable by default.

## QA Checklist

- Label renders correctly in light theme.
- Label renders correctly in dark theme.
- All tones are visually distinct enough for quick scanning.
- Subtle and bold emphasis are clearly differentiated.
- Text remains readable at `sm` and `md` sizes.
- Long text does not break the component layout unexpectedly.
- Component aligns correctly inside table cells, cards, and inline metadata rows.
- No raw hex values are used.
- No Tailwind or MUI dependencies are introduced.
- Storybook controls work correctly.
- Tests pass.
