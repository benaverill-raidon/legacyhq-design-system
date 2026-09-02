# Tabs - Generation Prompt

This is the prompt used to originally generate the Tabs organism. Kept as a historical record;
update the `.md`, `-spec.md`, `-checklist.md`, and `.contract.json` for behavioral changes rather
than this file.

## Task

Build a `Tabs` organism (+ `TabPanel`) for the LegacyHQ design system, matching the Figma `tabs`
component set (`Components v1.0.0`, node `4762:403764`) and its `<tab>` part (node `2140:67951`).

## What it is

An accessible tab bar with two visual types - `line` (underline indicator over a bottom border) and
`contained` (pill tabs) - that manages the selected value (controlled + uncontrolled) and connects
optional panels.

## Requirements

- Tier: organism. Files: `tabs.tsx`, `tab-panel.tsx`, `tabs-context.ts`, `Tabs.stories.tsx`,
  `Tabs.test.tsx`, `tabs.module.css`, `tabs.types.ts`, `tabs.mdx`, `index.ts`.
- CSS Modules + semantic tokens only. No MUI, no Tailwind, no hardcoded colors/typography/spacing.
- `React.forwardRef` on Tabs and TabPanel. A context lets TabPanel read the active value + ids.
- Compose the shared Focus Ring.

### Props

```ts
type TabsType = 'line' | 'contained';
interface TabItem { value: string; label: React.ReactNode; disabled?: boolean; }

interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  type?: TabsType;               // default 'line'
  tabs: TabItem[];
  value?: string;               // controlled
  defaultValue?: string;        // uncontrolled; first enabled by default
  onValueChange?: (value: string) => void;
  showBorder?: boolean;         // default type === 'line'
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children?: React.ReactNode;   // TabPanels
}

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}
```

### Style mapping (from Figma)

- line: selected label `content/selected` + a 3px `content/selected` underline over a
  `border/default` bottom border; unselected `content/subtle` -> `content/default` on hover.
- contained: radius-lg pill; selected `background/selected/default/default` + `border/selected` +
  `content/selected`; unselected transparent -> `content/default` on hover; no bottom border.
- label `heading-xs`; tab padding block `--size-075`, inline `--spacing-sm`.

### Behavior

- role=tablist / role=tab / role=tabpanel with aria-selected, aria-controls, aria-labelledby.
- Controlled + uncontrolled; first enabled tab selected by default.
- Roving tabindex (only the selected tab tabbable); arrow keys (wrap) + Home/End; automatic
  activation; skip disabled tabs; native `disabled`.
- Wire each TabPanel to its tab and show only the selected panel.

## Deliverables

Component files + the full doc set + `tabs.mdx`, an entry under Organisms in `llms.txt`, and
regenerated `registry.json` / `exemplars.json`.
