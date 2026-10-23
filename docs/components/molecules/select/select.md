# Select

Select's usage guidance is its Storybook Docs page (Components / Forms / Select), written in
[`select.mdx`](../../../../packages/ui/src/components/molecules/select/select.mdx): when to use it,
anatomy, variants, behavior, do and don't, accessibility, API, and design tokens. The tokens there
are generated from the code, so they can't drift. Its props are listed by hand: Storybook's docgen
can't read a union of props types, so there's no generated API table (a known limitation).

For implementation detail, see [`select-spec.md`](select-spec.md); for the machine-readable contract,
[`select.contract.json`](select.contract.json).
