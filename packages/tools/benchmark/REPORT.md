# MCP-02 report: docs vs. CLI vs. MCP

**Run:** [`runs/2026-10-26T21-50-55`](runs/2026-10-26T21-50-55/results.md), 2026-10-26. Commit
`83c257a`, model `claude-sonnet-5-5`, Claude Code 2.1.311, headless (`claude -p`). Three tasks,
three conditions, one run each: nine runs. The method is in [README.md](README.md).

## Summary

- **Every run got every check right: 20 of 20 in each condition.** On these tasks, with this
  model, the repo's docs alone were enough, and neither the CLI nor the MCP server changed the
  answers. Nothing off-system appeared in any answer: no invented components, props, or tokens, no
  primitive tokens, no raw values.
- **The checks can't separate the conditions at this size.** With everything passing, the run
  shows that all three setups can get these tasks right, not which is more reliable. That needs
  harder tasks or many more runs.
- **What differed was the path to the answer.** The CLI condition used the fewest turns and tool
  calls and cost least; MCP used the most and cost most; docs sat between. With one run per cell
  these are observations, not measured effects.
- **The MCP runs show where the tools fall short:** 6 of 25 MCP searches came back empty, because
  search requires every word to match and because the agent searched for token names `CLAUDE.md`
  itself suggests but the system doesn't have.

## Results

| Task | Condition | Checks | Tool calls (design system) | Files read | Turns | Cost (USD) | Time (s) |
|---|---|---|---|---|---|---|---|
| choose-control | docs | 4/4 | 5 (0) | 2 | 6 | 0.089 | 10 |
| choose-control | cli | 4/4 | 1 (1) | 0 | 2 | 0.090 | 8 |
| choose-control | mcp | 4/4 | 6 (6) | 0 | 7 | 0.123 | 9 |
| find-tokens | docs | 7/7 | 6 (0) | 0 | 7 | 0.098 | 15 |
| find-tokens | cli | 7/7 | 5 (5) | 0 | 6 | 0.094 | 26 |
| find-tokens | mcp | 7/7 | 13 (11) | 1 | 14 | 0.177 | 14 |
| implement-pattern | docs | 9/9 | 15 (0) | 5 | 16 | 0.274 | 51 |
| implement-pattern | cli | 9/9 | 8 (1) | 1 | 9 | 0.236 | 42 |
| implement-pattern | mcp | 9/9 | 21 (13) | 3 | 22 | 0.329 | 44 |

Totals by condition:

| Condition | Checks | Tool calls | Turns | Cost (USD) | Time (s) |
|---|---|---|---|---|---|
| docs | 20/20 | 26 | 29 | 0.460 | 76 |
| cli | 20/20 | 14 | 17 | 0.421 | 75 |
| mcp | 20/20 | 40 | 43 | 0.629 | 67 |

Every tool call, in order, is in [results.md](runs/2026-10-26T21-50-55/results.md); every answer is
saved beside its transcript. No answer needed a correction: headless runs have no human in the
loop, so a wrong answer would have counted as a mistake, and there were none.

## What happened

### Choosing a control

All three answered RadioGroup with a label and the three options; the docs and MCP answers also
said why not a Select.
The docs run found it by globbing for radio files and reading `radio-group.tsx`. The CLI run used
one command: a search that returned nothing, chained with `examples radio-group`, which did. The
MCP run tried `search_components "radio group choose one option"` and `"segmented control select"`
(both empty), then `"radio"`, then read Radio's component and examples.

### Finding tokens

All three wrote the same CSS: `color-elevation-surface-raised-default`, `border-width-sm` and
`color-border-default`, a `border-radius-*`, `spacing-lg`, `color-content-default` and `-subtle`,
and no shadow, saying a raised surface casts none.

`CLAUDE.md` gives `color.text.primary` and `color.background.brand` as examples of semantic
tokens. Neither exists: text colors are `color-content-*`. Both the docs and MCP runs went looking
for `color-text-*` first. The docs run's first grep included `--color-text-(primary|secondary|...)`;
the MCP run searched `color-text`, `text primary`, and `text secondary`, all empty, and a search
for `text` returned typography tokens (`typography-body-*-text-transform`). Both recovered by
reading component CSS, and the MCP run then confirmed the two content tokens with `get_token`. This
is most of the MCP run's 13 calls.

### Implementing the pattern

All three built Form with `requiredLegend` and `noValidate`, Field and TextField with each field's
error and `invalid`, a Checkbox (not a Switch), a Section Message summary that takes focus, and a
submit Button that isn't disabled. All three got there by reading the Forms and Validation
pattern page and its `SubmitAndValidate` story: neither tool serves pattern pages, so the tools
could only help with the components. The MCP run fetched each component's details and examples
(Form, TextField, Checkbox, Switch, Field, Section Message) and then read the pattern files
anyway. All three tried to write the form to a file, which every condition denies by design, and
then gave it in the answer.

## What it shows, and what it doesn't

- **The docs are strong.** With `CLAUDE.md`, `llms.txt`, and readable source, this model found the
  documented answer every time without the tools. That's a result about the repo, and it's why the
  checks didn't separate the conditions.
- **The tools didn't make the answers more correct here.** There was no room to: the baseline
  already passed everything.
- **MCP was not cheaper or shorter.** It made the most calls. Part of that is the model's
  thoroughness (it looked up both Checkbox and Switch, and their examples), and part is search
  returning nothing for natural-language or wrongly named queries.
- **The CLI condition wasn't CLI-only.** Claude Code allows read-only shell commands on its own,
  so the CLI agent also ran `cat`, `ls`, and `grep` through Bash, chained with CLI calls. Nothing
  could write, but that condition effectively had shell reading as well, and its low call count
  partly reflects chaining several commands into one call.
- **One run per cell.** Cost, turns, and calls vary between runs of the same prompt. None of the
  differences above should be read as an effect until repeated (`--repeat`).
- **Shared context.** Every run loaded the project's `CLAUDE.md` and the user's auto-memory for
  this repo (the same in all three conditions). The memory holds notes about this initiative, not
  answers, but a clean rerun should turn it off.

## What to change

Each of these comes from something a run did, not from the scores:

1. **Fix the token examples in `CLAUDE.md`.** `color.background.brand` and `color.text.primary`
   don't exist; use real names (`color-background-brand-primary-bold-default`,
   `color-content-default`). Two of the three token runs followed them first.
2. **Make search forgiving.** Rank by how many words match instead of requiring all of them, and
   when nothing matches, return close names (as `get_*` already does). Six empty MCP searches
   would have returned something.
3. **Make `text` find text colors.** Searching `text` should surface `color-content-*`; a synonym
   from "text" to "content" in token search would have saved the MCP run most of its detour.
4. **Serve the guidance the tools leave out.** The pattern pages and each component's "when to
   use" are what the tasks needed most, and only reading files gets them. A `get_pattern` tool, or
   a summary line per component in the registry, would let the tools answer "which component" by
   intent rather than by name.
5. **Before the next benchmark:** add harder tasks where the docs alone mislead (for example,
   where the nearest-looking component is wrong and only a Docs page says so); deny shell reads in
   the CLI condition; turn off auto-memory; and run each cell several times.

## Reproducing it

```bash
node packages/tools/benchmark/run.mjs --model claude-sonnet-5-5 --commit 83c257a
```

Results will differ run to run. `--report runs/<timestamp>` re-scores a run after the checks
change.
