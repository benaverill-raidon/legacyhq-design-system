// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getToken } from '../query/index.mjs';
import { CONDITIONS, claudeArgs, scrubPaths } from './run.mjs';
import { TASKS, componentProps, extractCode, parseJsx, rawValues, scoreAnswer, systemComponents } from './score.mjs';
import { describeCall, readTranscript } from './transcript.mjs';

// The scorer is checked against answers written from the repo's own guidance: one right answer per
// task that must pass everything, and wrong ones that must fail the checks they break.

const fence = (lang, code) => `Here you go.\n\n\`\`\`${lang}\n${code}\n\`\`\`\n`;

const RIGHT = {
  'choose-control': fence('tsx', `<RadioGroup
  label="Billing"
  name="billing"
  options={[
    { value: 'hourly', label: 'Hourly' },
    { value: 'flat-fee', label: 'Flat fee' },
    { value: 'contingency', label: 'Contingency' },
  ]}
/>`),
  'find-tokens': fence('css', `.panel {
  background: var(--color-elevation-surface-raised-default);
  border: var(--border-width-sm) solid var(--color-border-default);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  color: var(--color-content-default);
}

.secondary {
  color: var(--color-content-subtle);
}`),
  'implement-pattern': fence('tsx', `export function NewContactForm() {
  const [errors, setErrors] = React.useState([]);
  const summary = React.useRef(null);
  const submit = (event) => {
    event.preventDefault();
    const failed = check();
    setErrors(failed);
    if (failed.length) summary.current?.focus();
  };
  return (
    <Form title="New contact" requiredLegend noValidate onSubmit={submit}>
      {errors.length > 0 ? (
        <SectionMessage ref={summary} tabIndex={-1} tone="error" title="Fix 2 fields" errors={errors.map((e) => ({ label: e.label, message: e.message, targetId: e.id }))} />
      ) : null}
      <Field label="Name" required state={errorFor('name') ? 'error' : 'default'} message={errorFor('name')}>
        <TextField id="name" invalid={Boolean(errorFor('name'))} onChange={(event) => set('name', event.target.value)} />
      </Field>
      <Field label="Email" required state={errorFor('email') ? 'error' : 'default'} message={errorFor('email')}>
        <TextField id="email" type="email" invalid={Boolean(errorFor('email'))} />
      </Field>
      <Checkbox label="Send me updates by email" name="updates" />
      <FormFooter>
        <Button prominence="primary" type="submit" isLoading={saving}>Save</Button>
      </FormFooter>
    </Form>
  );
}`),
};

describe('tasks.json', () => {
  it('gives every check a condition, and names only real components and tokens', () => {
    const system = systemComponents();
    for (const task of TASKS) {
      expect(task.prompt, task.id).toBeTruthy();
      for (const check of task.checks) {
        const conditions = [...(check.require ?? []), ...(check.forbid ?? [])];
        expect(conditions.length, check.id).toBeGreaterThan(0);
        expect(['choice', 'token', 'accessibility'], check.id).toContain(check.kind);
        for (const c of conditions) {
          if (c.element) expect(system.has(c.element), `${check.id}: ${c.element}`).toBe(true);
          for (const [, name] of (c.code ?? '').matchAll(/var\\\(--([a-z0-9-]+[a-z0-9])\\\)/g)) {
            expect(getToken(name).tier, `${check.id}: ${name}`).toBe('semantic');
          }
        }
      }
    }
  });

  it('checks attributes the components really have', () => {
    const components = componentProps();
    for (const task of TASKS) {
      for (const c of task.checks.flatMap((check) => [...(check.require ?? []), ...(check.forbid ?? [])])) {
        for (const attr of Object.keys(c.has ?? {}).filter((a) => !/^(type|disabled|tabIndex|noValidate)$/.test(a))) {
          expect(components.get(c.element).has(attr), `${c.element}.${attr}`).toBe(true);
        }
      }
    }
  });

  it('reads props from the component source', () => {
    const components = componentProps();
    expect(components.get('Switch').has('label')).toBe(true);
    expect(components.get('FormFooter')).toBeDefined();
    expect(components.get('TextField').has('label')).toBe(false);
  });
});

describe('scoring', () => {
  it.each(Object.keys(RIGHT))('passes the right answer to %s, with nothing off-system', (task) => {
    const score = scoreAnswer(task, RIGHT[task]);
    expect(score.checks.filter((c) => !c.pass).map((c) => c.id)).toEqual([]);
    expect(score.offSystem).toEqual({ inventedComponents: [], inventedProps: [], unknownTokens: [], primitiveTokens: [], tokensNotInCss: [], rawValues: [] });
  });

  it('fails a Select for three billing options', () => {
    const score = scoreAnswer('choose-control', fence('tsx', '<Select label="Billing" options={[{ value: "hourly", label: "Hourly" }, { value: "flat", label: "Flat fee" }, { value: "contingency", label: "Contingency" }]} />'));
    expect(score.checks.filter((c) => !c.pass).map((c) => c.id)).toEqual(['uses-radio-group', 'not-select-or-switch', 'group-label']);
    expect(score.accessibilityMisses).toEqual(['group-label']);
  });

  it('flags invented tokens, primitives, raw values, and a shadow on a raised surface', () => {
    const score = scoreAnswer('find-tokens', fence('css', `.panel {
  background: var(--color-background-raised);
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  padding: var(--measurement-16);
  color: var(--color-text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}`));
    expect(score.offSystem.unknownTokens).toEqual(['color-background-raised', 'color-text-primary']);
    expect(score.offSystem.primitiveTokens).toEqual(['measurement-16']);
    expect(score.offSystem.rawValues).toEqual(expect.arrayContaining(['#d0d0d0', 'rgba(', '1px', '8px', '2px']));
    expect(score.checks.find((c) => c.id === 'no-shadow').pass).toBe(false);
    expect(score.passed).toBe(0);
  });

  it('flags a Switch in a form, invented components and props, and missing error handling', () => {
    const score = scoreAnswer('implement-pattern', fence('tsx', `<Form onSubmit={submit}>
  <TextField label="Name" required />
  <Switch label="Send me updates by email" />
  <ErrorSummary errors={errors} />
  <Button appearance="primary" type="submit" disabled={saving}>Save</Button>
</Form>`));
    const failed = score.checks.filter((c) => !c.pass).map((c) => c.id);
    expect(failed).toEqual(expect.arrayContaining(['checkbox-not-switch', 'required', 'no-validate', 'field-errors', 'error-summary', 'submit-button']));
    expect(score.offSystem.inventedComponents).toEqual(['ErrorSummary']);
    // TextField has no label: Field labels it.
    expect(score.offSystem.inventedProps).toEqual(['TextField.label', 'Button.appearance']);
  });

  it('passes nothing for an empty answer', () => {
    expect(scoreAnswer('choose-control', '').passed).toBe(0);
  });

  it('reads fenced code, and the whole answer when there is none', () => {
    expect(extractCode('a\n```css\n.x {}\n```\nb\n```tsx\n<A />\n```')).toBe('.x {}\n\n<A />\n');
    expect(extractCode('<A />')).toBe('<A />');
  });

  it('parses JSX attributes, and skips components the answer declares itself', () => {
    const { elements, declared } = parseJsx('function Panel() { return <Field label="x" required state={err ? "error" : "default"} onChange={(e) => go(e)} />; }');
    expect(elements[0]).toEqual({ name: 'Field', attrs: { label: 'x', required: true, state: 'err ? "error" : "default"', onChange: '(e) => go(e)' } });
    expect(declared.has('Panel')).toBe(true);
    expect(scoreAnswer('choose-control', 'const Panel = () => null;\n<Panel /><Billing />').offSystem.inventedComponents).toEqual(['Billing']);
  });

  it('ignores zero, values inside var(), and comments', () => {
    expect(rawValues('.a { margin: 0; padding: var(--spacing-lg); /* 16px */ width: calc(100% - var(--size-200)); }')).toEqual([]);
  });
});

describe('transcripts', () => {
  const lines = [
    { type: 'system', subtype: 'init', model: 'claude-sonnet-5-5', tools: ['Read'], mcp_servers: [{ name: 'legacyhq-design-system', status: 'connected' }] },
    { type: 'assistant', message: { content: [{ type: 'tool_use', id: 't1', name: 'mcp__legacyhq-design-system__search_components', input: { query: 'radio' } }] } },
    { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: 'ok' }] } },
    { type: 'assistant', message: { content: [{ type: 'tool_use', id: 't2', name: 'Bash', input: { command: 'rm -rf x' } }] } },
    { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't2', is_error: true, content: 'denied' }] } },
    { type: 'result', subtype: 'success', result: 'Use RadioGroup.', num_turns: 3, duration_ms: 1200, total_cost_usd: 0.01, is_error: false },
  ].map((e) => JSON.stringify(e)).join('\n');

  it('reads the answer, the tool calls in order, and the cost', () => {
    const t = readTranscript(lines);
    expect(t).toMatchObject({ model: 'claude-sonnet-5-5', answer: 'Use RadioGroup.', turns: 3, durationMs: 1200, costUsd: 0.01, isError: false });
    expect(t.toolCalls.map((c) => [describeCall(c), c.isError])).toEqual([['search_components radio', false], ['Bash rm -rf x', true]]);
  });

  it('marks a run with no result as failed', () => {
    expect(readTranscript('')).toMatchObject({ answer: '', isError: true, subtype: 'no-result' });
  });
});

describe('saving', () => {
  it('scrubs the worktree and home paths in every form a transcript writes them', () => {
    const paths = { worktree: 'C:\\Users\\me\\Temp\\bench-1', home: 'C:\\Users\\me' };
    const text = JSON.stringify({ cwd: paths.worktree, file: 'C:/Users/me/Temp/bench-1/CLAUDE.md', other: 'C:\\Users\\me\\.claude\\x' });
    expect(scrubPaths(text, paths)).toBe(JSON.stringify({ cwd: '<worktree>', file: '<worktree>/CLAUDE.md', other: '~\\.claude\\x' }));
    expect(scrubPaths('projects\\C--Users-me-Desktop-repo\\memory', paths)).toBe('projects\\~-Desktop-repo\\memory');
    expect(scrubPaths('cd /c/Users/me/Temp/bench-1/packages && cd /c/Users/me/x', paths)).toBe('cd <worktree>/packages && cd ~/x');
  });
});

describe('conditions', () => {
  it('differ only in the design system tool they add', () => {
    const args = Object.fromEntries(Object.keys(CONDITIONS).map((c) => [c, claudeArgs({ prompt: 'P', condition: c, model: 'm' })]));
    for (const list of Object.values(args)) {
      expect(list.slice(0, 4)).toEqual(['-p', 'P', '--model', 'm']);
      expect(list).toContain('--strict-mcp-config');
      expect(list).not.toContain('Edit');
    }
    expect(args.docs.join(' ')).not.toMatch(/Bash| --mcp-config|mcp__/);
    expect(args.cli).toContain('Bash(npm run -s ds:*)');
    expect(args.cli.join(' ')).not.toMatch(/ --mcp-config|mcp__/);
    expect(args.mcp).toEqual(expect.arrayContaining(['--mcp-config', '.mcp.json', 'mcp__legacyhq-design-system']));
    expect(args.mcp.join(' ')).not.toMatch(/Bash/);
  });
});
