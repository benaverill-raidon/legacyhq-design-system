// @ts-expect-error This project does not include Node built-in type declarations for Vitest-only file reads.
import { readdirSync, readFileSync } from 'node:fs';
import { loadCsf } from 'storybook/internal/csf-tools';
import { describe, expect, it } from 'vitest';
import { codeParts, STATUS_VALUES, statusCounts, statusEntries, statusLabel, statusRows } from './status-data';

const COMPONENTS = 'packages/ui/src/components';
const titles = new Set(
  readdirSync(COMPONENTS, { recursive: true, encoding: 'utf8' })
    .map((file: string) => file.replace(/\\/g, '/'))
    .filter((file: string) => file.endsWith('.stories.tsx'))
    .map((file: string) => loadCsf(readFileSync(`${COMPONENTS}/${file}`, 'utf8'), { fileName: file, makeTitle: (title) => title }).parse().meta.title),
);

describe('status data', () => {
  it('names the statuses from the governance file', () => {
    expect(STATUS_VALUES.map(({ value }) => value)).toEqual(['draft', 'beta', 'stable', 'deprecated']);
    expect(statusLabel('beta')).toBe('Beta');
  });

  it('counts every component once, leaving out statuses nobody has', () => {
    const counts = statusCounts(statusEntries);
    expect(counts.reduce((total, { count }) => total + count, 0)).toBe(statusEntries.length);
    expect(counts.every(({ count }) => count > 0)).toBe(true);
  });

  it("lists every component, least ready first, each linked to its Docs page", () => {
    const rows = statusRows(statusEntries);
    expect(rows).toHaveLength(statusEntries.length);
    const order = STATUS_VALUES.map(({ value }) => value);
    expect(rows.map(({ status }) => order.indexOf(status))).toEqual([...rows.map(({ status }) => order.indexOf(status))].sort((a, b) => a - b));
    expect(rows.filter(({ title }) => !titles.has(title)).map(({ title }) => title)).toEqual([]);
  });

  it('says what Stable still needs, leaving known issues to their own list', () => {
    const row = statusRows(statusEntries).find(({ id }) => id === 'table');
    expect(row?.status).toBe('beta');
    expect(row?.missing).not.toContain('No known issues');
    expect(row?.issues.length).toBeGreaterThan(0);
  });

  it('sets code in a known issue as code', () => {
    expect(codeParts('Takes `tone`, not `appearance`.')).toEqual([
      { part: 'Takes ', code: false },
      { part: 'tone', code: true },
      { part: ', not ', code: false },
      { part: 'appearance', code: true },
      { part: '.', code: false },
    ]);
  });
});
