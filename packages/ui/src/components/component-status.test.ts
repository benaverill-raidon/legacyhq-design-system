// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// A plain ES module, shared with scripts/generate-component-registry.mjs.
import { CRITERIA, evidenceOf, highestSupported, STATUSES, unmetFor } from '../../../../scripts/lib/component-status.mjs';

// Keeps component status honest. Each status is authored in contract.json; this test recomputes the
// evidence from the source tree and fails if a status claims more than the evidence supports, or if
// registry.json (which the Docs pages read) has gone stale. What the statuses mean and the evidence
// each needs: componentStatus in docs/foundations/component-registry-governance.json.

type Issue = { kind: string; summary: string };
type Entry = {
  id: string;
  status: string;
  knownIssues: Issue[];
  replacedBy: string | null;
  figmaSource: unknown;
  contentCompleteness: string;
  statusCheck: { supported: string; unmet: string[]; evidence: Record<string, boolean> };
};

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const last = (parts: string[]) => parts[parts.length - 1];
const CODE = 'packages/ui/src/components';

const registry: Entry[] = readJson('docs/components/registry.json');
const exemplars = new Map<string, string>(readJson('docs/components/exemplars.json').map((entry: { id: string; exemplarCompleteness: string }) => [entry.id, entry.exemplarCompleteness]));
const contracts = new Map<string, Record<string, unknown>>(
  readdirSync('docs/components', { recursive: true, encoding: 'utf8' })
    .map((file: string) => file.replace(/\\/g, '/'))
    .filter((file: string) => file.endsWith('.contract.json'))
    .map((file: string) => [file.split('/').slice(-2)[0], readJson(`docs/components/${file}`)]),
);

// The same scan the generator does: a Docs page beside the code, and tests in the same folder.
const codeFiles: string[] = readdirSync(CODE, { recursive: true, encoding: 'utf8' }).map((file: string) => file.replace(/\\/g, '/'));
const dirOf = (file: string) => file.split('/').slice(0, -1).join('/');
const code = new Map<string, { docsPage: boolean; tests: boolean }>();
for (const file of codeFiles.filter((name) => name.endsWith('.mdx'))) {
  const mdx: string = readFileSync(`${CODE}/${file}`, 'utf8');
  const base = last(file.split('/')).replace(/\.mdx$/, '');
  const id = mdx.match(/<ComponentHeader\s+id="([a-z-]+)"/)?.[1] ?? (base === last(dirOf(file).split('/')) ? base : undefined);
  if (!id || code.has(id)) continue;
  code.set(id, { docsPage: true, tests: codeFiles.some((name) => dirOf(name) === dirOf(file) && /\.test\.tsx?$/.test(name)) });
}

const evidence = (entry: Entry) =>
  evidenceOf({
    ...code.get(entry.id),
    figmaSource: entry.figmaSource,
    contentCompleteness: entry.contentCompleteness,
    exemplarCompleteness: exemplars.get(entry.id),
    knownIssues: contracts.get(entry.id)?.knownIssues ?? [],
  });

describe('status helpers', () => {
  it('needs everything for Stable, and only the Beta evidence for Beta', () => {
    const all = Object.fromEntries(CRITERIA.map(({ id }: { id: string }) => [id, true]));
    expect(highestSupported(all)).toBe('stable');
    expect(highestSupported({ ...all, noKnownIssues: false })).toBe('beta');
    expect(unmetFor('stable', { ...all, examples: false, noKnownIssues: false })).toEqual(['examples', 'noKnownIssues']);
    expect(highestSupported({ ...all, tests: false })).toBe('draft');
    expect(unmetFor('draft', { ...all, tests: false })).toEqual([]);
  });
});

describe('component status', () => {
  it('reads every component', () => {
    expect(registry.length).toBe(contracts.size);
    expect(code.size).toBeGreaterThanOrEqual(registry.length);
  });

  it('gives every contract a status from the vocabulary, and known issues of a known kind', () => {
    const invalid = [...contracts].flatMap(([id, contract]) => {
      const issues = (contract.knownIssues ?? []) as Issue[];
      return [
        ...(STATUSES.includes(contract.status as string) ? [] : [`${id}: status ${JSON.stringify(contract.status)}`]),
        ...issues.filter(({ kind, summary }) => !['bug', 'gap', 'decision'].includes(kind) || !summary).map((issue) => `${id}: ${JSON.stringify(issue)}`),
      ];
    });
    expect(invalid).toEqual([]);
  });

  it('never claims more than the evidence supports', () => {
    const rank: Record<string, number> = { draft: 0, beta: 1, stable: 2 };
    const over = registry
      .filter((entry) => entry.status !== 'deprecated')
      .map((entry) => ({ entry, supported: highestSupported(evidence(entry)) }))
      .filter(({ entry, supported }) => rank[entry.status] > rank[supported])
      .map(({ entry, supported }) => `${entry.id}: ${entry.status}, evidence supports ${supported} (missing ${unmetFor(entry.status, evidence(entry)).join(', ')})`);
    expect(over).toEqual([]);
  });

  it('names a successor that exists for every deprecated component', () => {
    const ids = new Set(registry.map(({ id }) => id));
    const missing = registry.filter((entry) => entry.status === 'deprecated' && !(entry.replacedBy && ids.has(entry.replacedBy))).map(({ id }) => id);
    expect(missing).toEqual([]);
  });

  it('keeps registry.json current with the contracts and the source tree (run npm run generate:registry)', () => {
    const stale = registry.flatMap((entry) => {
      const contract = contracts.get(entry.id) ?? {};
      const ev = evidence(entry);
      const expected = { supported: highestSupported(ev), unmet: unmetFor('stable', ev), evidence: ev };
      return [
        ...(entry.status === contract.status ? [] : [`${entry.id}: status`]),
        ...(JSON.stringify(entry.knownIssues) === JSON.stringify(contract.knownIssues ?? []) ? [] : [`${entry.id}: knownIssues`]),
        ...(JSON.stringify(entry.statusCheck) === JSON.stringify(expected) ? [] : [`${entry.id}: statusCheck`]),
      ];
    });
    expect(stale).toEqual([]);
  });
});
