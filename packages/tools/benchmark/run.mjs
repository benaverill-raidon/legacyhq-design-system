#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { REPO_ROOT } from '../query/index.mjs';
import { TASKS, scoreAnswer } from './score.mjs';
import { describeCall, readTranscript } from './transcript.mjs';

// Runs each benchmark task under each condition in headless Claude Code, then scores the answers.
//
//   node packages/tools/benchmark/run.mjs [--model M] [--repeat N] [--tasks a,b] [--conditions docs,cli,mcp] [--commit REF]
//   node packages/tools/benchmark/run.mjs --report runs/<dir>     (re-score and re-report a finished run)
//
// Every run starts in a fresh, detached worktree of the same commit with this folder removed, so
// the agent can't read the checks. Answers are text only: no condition can edit files. Run it from
// a terminal, not from inside Claude Code (Claude Code won't start a nested session).

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER = 'legacyhq-design-system';
const READ_TOOLS = ['Read', 'Grep', 'Glob'];

/** What each condition may use besides reading files. The prompt is the same in all three. */
export const CONDITIONS = {
  docs: { describe: 'CLAUDE.md, llms.txt, and the repo files; no CLI or MCP', tools: READ_TOOLS, allowed: READ_TOOLS, mcp: false },
  cli: { describe: 'the same, plus Bash limited to the legacyhq CLI (npm run -s ds)', tools: [...READ_TOOLS, 'Bash'], allowed: [...READ_TOOLS, 'Bash(npm run -s ds:*)'], mcp: false },
  mcp: { describe: 'the same, plus the legacyhq-design-system MCP server', tools: READ_TOOLS, allowed: [...READ_TOOLS, `mcp__${SERVER}`], mcp: true },
};

/** The `claude` arguments for one run. */
export function claudeArgs({ prompt, condition, model, maxTurns = 40 }) {
  const c = CONDITIONS[condition];
  return [
    '-p', prompt,
    '--model', model,
    '--output-format', 'stream-json', '--verbose',
    '--permission-mode', 'dontAsk',
    '--setting-sources', 'project',
    '--no-session-persistence',
    '--max-turns', String(maxTurns),
    '--tools', c.tools.join(','),
    '--allowedTools', ...c.allowed,
    '--strict-mcp-config',
    ...(c.mcp ? ['--mcp-config', '.mcp.json'] : []),
  ];
}

const git = (...args) => {
  const result = spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
};

function makeWorktree(commit) {
  const dir = path.join(tmpdir(), `legacyhq-bench-${Date.now()}`);
  git('worktree', 'add', '--detach', dir, commit);
  rmSync(path.join(dir, 'packages/tools/benchmark'), { recursive: true, force: true });
  symlinkSync(path.join(REPO_ROOT, 'node_modules'), path.join(dir, 'node_modules'), 'junction');
  return dir;
}

function runClaude(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, out, err }));
  });
}

/** Replaces the worktree and home folder paths in a transcript, so none is committed. */
export function scrubPaths(text, { worktree, home }) {
  let out = text;
  for (const [from, to] of [[worktree, '<worktree>'], [home, '~']]) {
    // As written, JSON-escaped, with forward slashes, as Git Bash writes it (/c/Users/...), and as
    // Claude Code's project folder slug.
    const slashed = from.replace(/\\/g, '/');
    const gitBash = slashed.replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`);
    for (const form of [from, from.replace(/\\/g, '\\\\'), slashed, gitBash, from.replace(/[^A-Za-z0-9]/g, '-')]) out = out.split(form).join(to);
  }
  return out;
}

const DS_CALL =new RegExp(`^mcp__${SERVER}__|^Bash$`);

function summarize(run) {
  const t = run.transcript;
  const dsCalls = t.toolCalls.filter((c) => DS_CALL.test(c.name) && (c.name !== 'Bash' || /npm run -s ds/.test(c.input?.command ?? '')));
  return {
    task: run.task,
    condition: run.condition,
    n: run.n,
    passed: run.score.passed,
    total: run.score.total,
    failed: run.score.checks.filter((c) => !c.pass).map((c) => c.id),
    accessibilityMisses: run.score.accessibilityMisses,
    offSystemCount: run.score.offSystemCount,
    offSystem: run.score.offSystem,
    toolCalls: t.toolCalls.length,
    designSystemCalls: dsCalls.length,
    filesRead: t.toolCalls.filter((c) => c.name === 'Read').length,
    deniedCalls: t.toolCalls.filter((c) => c.isError).length,
    turns: t.turns,
    durationMs: t.durationMs,
    costUsd: t.costUsd,
    runError: t.isError ? t.subtype : null,
  };
}

const tableRow = (r) => ({ task: r.task, condition: r.condition, n: r.n, checks: `${r.passed}/${r.total}`, offSystem: r.offSystemCount, toolCalls: r.toolCalls, designSystem: r.designSystemCalls, filesRead: r.filesRead, costUsd: r.costUsd });

const cell = (s) => String(s).replace(/\|/g, '\\|');

/** Scores every transcript in a run folder and writes results.json and results.md. */
export function report(dir) {
  const meta = JSON.parse(readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  const runs = readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort().map((file) => {
    const [task, condition, n] = file.replace(/\.jsonl$/, '').split('.');
    const transcript = readTranscript(readFileSync(path.join(dir, file), 'utf8'));
    return { task, condition, n: Number(n), transcript, score: scoreAnswer(task, transcript.answer) };
  });
  const rows = runs.map(summarize);
  writeFileSync(path.join(dir, 'results.json'), `${JSON.stringify({ meta, runs: rows }, null, 2)}\n`);

  const lines = [
    `# Benchmark run ${path.basename(dir)}`,
    '',
    `Commit \`${meta.commit}\`, model \`${meta.model}\`, Claude Code ${meta.claudeVersion}, ${meta.date}.`,
    '',
    '| Task | Condition | # | Checks | Failed | Off-system | Tool calls (design system) | Files read | Turns | Cost (USD) | Time (s) |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.task} | ${r.condition} | ${r.n} | ${r.passed}/${r.total} | ${cell(r.failed.join(', ') || '-')} | ${cell(Object.entries(r.offSystem).filter(([, v]) => v.length).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ') || '-')} | ${r.toolCalls} (${r.designSystemCalls}) | ${r.filesRead} | ${r.turns ?? '-'} | ${r.costUsd?.toFixed(3) ?? '-'} | ${r.durationMs ? (r.durationMs / 1000).toFixed(0) : '-'} |`),
    '',
    '## Tool calls',
    '',
    ...runs.flatMap((run) => [`### ${run.task} / ${run.condition} / ${run.n}`, '', ...(run.transcript.toolCalls.length ? run.transcript.toolCalls.map((c, i) => `${i + 1}. \`${cell(describeCall(c)).slice(0, 160)}\`${c.isError ? ' (error or denied)' : ''}`) : ['None.']), '']),
  ];
  writeFileSync(path.join(dir, 'results.md'), `${lines.join('\n')}\n`);
  for (const run of runs) writeFileSync(path.join(dir, `${run.task}.${run.condition}.${run.n}.answer.md`), `${run.transcript.answer}\n`);
  return rows;
}

async function main() {
  const { values } = parseArgs({
    options: {
      model: { type: 'string', default: 'claude-sonnet-5-5' },
      repeat: { type: 'string', default: '1' },
      tasks: { type: 'string' },
      conditions: { type: 'string', default: 'docs,cli,mcp' },
      commit: { type: 'string', default: 'HEAD' },
      report: { type: 'string' },
    },
  });
  if (values.report) {
    console.table(report(path.resolve(values.report)).map(tableRow));
    return;
  }

  const tasks = values.tasks ? values.tasks.split(',') : TASKS.map((t) => t.id);
  const conditions = values.conditions.split(',');
  for (const c of conditions) if (!CONDITIONS[c]) throw new Error(`Unknown condition "${c}".`);
  const commit = git('rev-parse', values.commit);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dir = path.join(HERE, 'runs', stamp);
  mkdirSync(dir, { recursive: true });
  const version = spawnSync('claude', ['--version'], { encoding: 'utf8' }).stdout.trim();
  writeFileSync(path.join(dir, 'meta.json'), `${JSON.stringify({
    commit, model: values.model, claudeVersion: version, date: new Date().toISOString(), repeat: Number(values.repeat),
    conditions: Object.fromEntries(conditions.map((c) => [c, { ...CONDITIONS[c], args: claudeArgs({ prompt: '<prompt>', condition: c, model: values.model }) }])),
    prompts: Object.fromEntries(TASKS.filter((t) => tasks.includes(t.id)).map((t) => [t.id, t.prompt])),
  }, null, 2)}\n`);

  for (let n = 1; n <= Number(values.repeat); n += 1) {
    for (const taskId of tasks) {
      for (const condition of conditions) {
        const task = TASKS.find((t) => t.id === taskId);
        const worktree = makeWorktree(commit);
        try {
          process.stderr.write(`${taskId} / ${condition} / ${n} ... `);
          const { code, out, err } = await runClaude(claudeArgs({ prompt: task.prompt, condition, model: values.model }), worktree);
          const paths = { worktree, home: homedir() };
          writeFileSync(path.join(dir, `${taskId}.${condition}.${n}.jsonl`), scrubPaths(out, paths));
          if (err.trim()) writeFileSync(path.join(dir, `${taskId}.${condition}.${n}.stderr.txt`), scrubPaths(err, paths));
          process.stderr.write(`exit ${code}\n`);
        } finally {
          // Unlink node_modules first, so removing the worktree can't reach the repo's own through it.
          unlinkSync(path.join(worktree, 'node_modules'));
          git('worktree', 'remove', '--force', worktree);
          if (existsSync(worktree)) rmSync(worktree, { recursive: true, force: true });
        }
      }
    }
  }
  console.table(report(dir).map(tableRow));
  process.stderr.write(`Results: ${path.relative(REPO_ROOT, dir)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
