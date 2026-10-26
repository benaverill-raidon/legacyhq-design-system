# CLI and MCP benchmark (MCP-02)

Does giving a coding agent the `legacyhq` CLI or the MCP server help it use the design system
correctly, compared with the docs alone? This folder holds the tasks, the runner, the scorer, and
the recorded runs. The findings are in [REPORT.md](REPORT.md).

## Method

Three tasks, each sent unchanged to headless Claude Code (`claude -p`) under three conditions, on
the same commit, with the same model.

| Condition | Tools |
|---|---|
| `docs` | Read, Grep, Glob. The agent has `CLAUDE.md` (loaded as project memory), `llms.txt`, and the repo. |
| `cli` | The same, plus Bash allowed only for `npm run -s ds` (the CLI). Any other command is denied. |
| `mcp` | The same as `docs`, plus the `legacyhq-design-system` MCP server from `.mcp.json`. |

Every condition can read the repo: the question is what the CLI or MCP adds to reading it, not
whether an agent can work blind. No condition can edit files, so answers are text. Each run:

- starts in a fresh detached worktree of the commit, with this folder deleted, so the agent can't
  read the checks or the expected answers;
- loads only project settings (`--setting-sources project`) and no MCP server except the
  condition's (`--strict-mcp-config`), runs with `--permission-mode dontAsk` (anything not
  allowed is denied, not asked), and is capped at 40 turns;
- records the full stream-json transcript, with the worktree and home folder paths replaced.

### Tasks

[tasks.json](tasks.json) holds the prompts and checks. Each check names the repo source that makes
it the right answer.

| Task | Asks for | Right answer, per the repo |
|---|---|---|
| `choose-control` | The component for picking how a matter is billed (hourly, flat fee, contingency), with JSX | RadioGroup with a label, not a Select (Patterns / Forms and Validation) |
| `find-tokens` | A CSS Module for a raised panel: border, corners, 16px padding, body and muted text | `color-elevation-surface-raised-default`, `border-width-*`, `color-border-*`, `border-radius-*`, `spacing-lg`, `color-content-default` and `-subtle`; no shadow (token-governance.json) |
| `implement-pattern` | A "New contact" form with two required fields and a choice saved with the form | Form, Field and TextField, Checkbox not Switch, `requiredLegend`, `noValidate`, field errors, a Section Message summary that takes focus, a submit Button that isn't disabled (Forms and Validation) |

### Scoring

[score.mjs](score.mjs) scores the code in each answer (its fenced blocks). Task checks are
regular expressions or JSX element checks, parsed with TypeScript's parser. Every answer also gets
the general checks, judged against the repo:

- **Invented components:** JSX names no component exports.
- **Invented props:** attributes a component's source doesn't declare (common HTML attributes,
  `aria-*`, `data-*`, and event handlers are allowed). Read from the component folder's source,
  because the registry's prop lists are incomplete.
- **Unknown tokens and primitive tokens:** each `var(--x)` looked up through the query library.
- **Raw values:** hex and `rgb()`/`hsl()` colors and `px`/`rem`/`em` lengths in the code.

Checks have a kind: `choice` (right component or approach), `token`, or `accessibility`. The
results table counts tool calls, design system calls (CLI or MCP), files read, turns, cost, and
time from the transcript.

### Limits

- One prompt, one answer: a headless run has no human in the loop, so there are no corrections to
  count. A wrong answer is a mistake a person would have had to catch.
- Few tasks and few runs: differences of a check or two are within run-to-run variation. Repeat
  with `--repeat` before reading much into them.
- The checks are what the repo documents. An answer can be reasonable and still fail one, and
  regular expressions can miss an equivalent spelling. Every answer is saved, so a failed check
  can be read against it.
- The CLI and MCP serve components, examples, tokens, rules, and icons. Neither serves the pattern
  pages or a component's "when to use" prose, so `implement-pattern` and part of `choose-control`
  depend on reading docs in every condition.
- `CLAUDE.md` mentions the CLI and MCP in every condition; in `docs` they just aren't available.

## Running it

From a terminal where `claude` is signed in (not from inside Claude Code, which won't start a
nested session), at the repo root:

```bash
node packages/tools/benchmark/run.mjs --model claude-sonnet-5-5
```

Options: `--repeat N` (default 1), `--tasks a,b`, `--conditions docs,cli,mcp`, `--commit REF`
(default `HEAD`). Each run's files go to `runs/<timestamp>/`:

- `meta.json`: commit, model, Claude Code version, date, the prompts, and each condition's exact
  `claude` arguments;
- `<task>.<condition>.<n>.jsonl`: the transcript, and `.answer.md`: the final answer;
- `results.json` and `results.md`: the scores, and every tool call in order.

To re-score a finished run after changing the checks:

```bash
node packages/tools/benchmark/run.mjs --report packages/tools/benchmark/runs/<timestamp>
```

`benchmark.test.mjs` runs with `npm test`. It checks the scorer against a right answer and wrong
answers for each task, that every component and token the checks name is real, and that the
conditions differ only in the tool they add. It never runs Claude.
