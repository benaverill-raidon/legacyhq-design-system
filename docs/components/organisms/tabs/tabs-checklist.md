# Tabs - Completion Checklist

## Component name

Tabs (+ TabPanel)

## Description

An accessible tab bar with two types (line / contained) that manages selection (controlled +
uncontrolled) and wires optional TabPanel children.

## Status

Stable.

## Component category

Organism.

## Design decisions

- [ ] Two `type`s: `line` (3px underline over a bottom border) and `contained` (radius-lg pills inside
      a raised, radius-xl, bordered, `spacing-xs`-padded segmented container).
- [ ] Data-driven `tabs` array (matching the repo's Menu style); panels via optional `TabPanel`
      children with ARIA wired automatically.
- [ ] Controlled (`value`/`onValueChange`) + uncontrolled (`defaultValue`, first enabled by default).
- [ ] Label `heading-xs`; unselected `content/subtle` -> `content/default` on hover; selected
      `content/selected`.
- [ ] `showBorder` defaults on for both (the bottom line for `line`, the container border for `contained`).
- [ ] Roving tabindex; arrow keys (wrap) + Home/End; automatic activation; skip disabled tabs.
- [ ] Disabled via native `disabled`; focus via shared Focus Ring.

## Figma properties

```txt
tabs container: type (line | contained), showBorder (bool)
<tab> part: type (line | contained), state (default | hover | focus), isSelected (false | true)
```

## Code props

```ts
type TabsType = 'line' | 'contained';
interface TabItem { value: string; label: React.ReactNode; disabled?: boolean; }

interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  type?: TabsType;
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  showBorder?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children?: React.ReactNode;
}

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}
```

## Defaults

```txt
type: line
defaultValue: first enabled tab
showBorder: true
```

## Tokens

- [ ] tab padding block `--size-075`, inline `--spacing-sm`; root gap `--spacing-lg`.
- [ ] tab list border `--border-width-sm` / `--color-border-default`.
- [ ] line indicator `--border-width-lg` / `--color-content-selected`.
- [ ] contained tab radius `--border-radius-lg`; selected fill `--color-background-selected-default-default`
      + border `--color-border-selected`.
- [ ] contained container: radius `--border-radius-xl`, padding `--spacing-xs`, background
      `--color-elevation-surface-raised-default`, border `--color-border-default`.
- [ ] label `heading-xs`; per-state content colors (subtle / default / selected / disabled).

## Accessibility

- [ ] tablist labelled; tab/tabpanel ARIA; roving tabindex.
- [ ] arrow keys (wrap), Home, End; skip disabled.
- [ ] shared Focus Ring; native `disabled`.

## Examples to document

- [ ] Line tabs (uncontrolled)
- [ ] Contained tabs
- [ ] Controlled
- [ ] With a disabled tab
- [ ] No bottom border

## Tests

- [ ] Labelled tablist; default/defaultValue selection.
- [ ] Click selects + shows panel; ARIA wiring; roving tabindex.
- [ ] Arrow/Home/End nav skipping disabled; disabled not selectable.
- [ ] Controlled selection.
- [ ] Type on root; CSS contract (line indicator, contained fill).
- [ ] Uses MUI: no. Uses Tailwind: no.
