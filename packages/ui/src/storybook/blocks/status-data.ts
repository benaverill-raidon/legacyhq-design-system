import governance from '../../../../../docs/foundations/component-registry-governance.json';
import registry from '../../../../../docs/components/registry.json';
import { headerFacts } from './component-page-data';
import type { RegistryEntry } from './component-page-data';
import { displayNameOf, docsTitleOf } from './pattern-page-data';

// Pure data for component status: the vocabulary and criteria (componentStatus in
// component-registry-governance.json) and each component's status, known issues, and evidence
// (registry.json, generated from the contracts and checked by component-status.test.ts). Shared by
// the Docs page header, Introduction / Status, and the Overview.

export type KnownIssue = { kind: 'bug' | 'gap' | 'decision'; summary: string };

export type StatusEntry = RegistryEntry & {
  status: string;
  knownIssues: KnownIssue[];
  statusCheck: { supported: string; unmet: string[]; evidence: Record<string, boolean> };
};

const { values, criteria } = governance.componentStatus;

export const STATUS_VALUES: Array<{ value: string; label: string; meaning: string }> = values;
export const STATUS_CRITERIA: Array<{ id: string; needs: string; label: string; checkedBy: string }> = criteria;

export const statusEntries = registry as unknown as StatusEntry[];

/** `beta` -> `Beta`. */
export const statusLabel = (status: string) => STATUS_VALUES.find(({ value }) => value === status)?.label ?? status;

/** How a known issue's kind reads in a list. */
export const ISSUE_KINDS: Record<KnownIssue['kind'], string> = { bug: 'Bug', gap: 'Gap', decision: 'Decision' };

/** How many components have each status, in the vocabulary's order, leaving out the empty ones. */
export const statusCounts = (entries: StatusEntry[]) =>
  STATUS_VALUES.map(({ value, label }) => ({ value, label, count: entries.filter(({ status }) => status === value).length })).filter(({ count }) => count > 0);

/** One row per component for the Status page: by status (least ready first), then by name. */
export function statusRows(entries: StatusEntry[]) {
  const order = STATUS_VALUES.map(({ value }) => value);
  return entries
    .map((entry) => ({
      id: entry.id,
      name: displayNameOf(entry.name),
      title: docsTitleOf(entry),
      group: headerFacts(entry)[0],
      status: entry.status,
      // What Stable still needs, in the criteria's words. Known issues are listed on their own.
      missing: entry.statusCheck.unmet.filter((id) => id !== 'noKnownIssues').map((id) => STATUS_CRITERIA.find((criterion) => criterion.id === id)?.label ?? id),
      issues: entry.knownIssues,
    }))
    .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || a.name.localeCompare(b.name));
}

/** A known issue's summary split on backticks, so `code` can be set as code. Odd parts are code. */
export const codeParts = (text: string) => text.split('`').map((part, index) => ({ part, code: index % 2 === 1 }));
