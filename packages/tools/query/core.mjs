import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Shared plumbing for the query library: where the repo is, how files are read, the two kinds of
// error, and the text matching every search uses. Paths resolve from this file, never from
// process.cwd(), so the CLI and MCP server work from any directory.

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/** Reads a repo-relative JSON file. Each call reads the file again, so results follow edits. */
export const readJson = (relPath, root = REPO_ROOT) => JSON.parse(readFileSync(path.join(root, relPath), 'utf8'));

/**
 * The only errors the library throws on purpose. `NOT_FOUND`: nothing has that id or name
 * (`suggestions` lists close matches). `INVALID_INPUT`: an argument is the wrong type or value
 * (`allowed` lists the valid values when there's a fixed set).
 */
export class QueryError extends Error {
  /**
   * @param {'NOT_FOUND' | 'INVALID_INPUT'} code
   * @param {string} message
   * @param {{ suggestions?: string[], allowed?: string[] }} [details]
   */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'QueryError';
    this.code = code;
    if (details.suggestions) this.suggestions = details.suggestions;
    if (details.allowed) this.allowed = details.allowed;
  }
}

/** Lowercase, with everything but letters and digits removed: "Key Value Pair" and "key-value-pair" match. */
export const compact = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

/** A query split into lowercase terms on spaces, hyphens, dots, and slashes. */
export function terms(query) {
  return String(query).toLowerCase().split(/[\s\-_./]+/).filter(Boolean);
}

export function requireQuery(query, what) {
  if (typeof query !== 'string' || !query.trim()) {
    throw new QueryError('INVALID_INPUT', `${what} needs a non-empty search query.`);
  }
  return query.trim();
}

export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 200;

export function checkLimit(limit) {
  if (limit === undefined) return DEFAULT_LIMIT;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new QueryError('INVALID_INPUT', `limit must be a whole number from 1 to ${MAX_LIMIT}.`);
  }
  return limit;
}

/** Checks an optional filter value against its allowed values. */
export function checkFilter(name, value, allowed) {
  if (value === undefined) return;
  if (!allowed.includes(value)) {
    throw new QueryError('INVALID_INPUT', `Unknown ${name} "${value}". Use one of: ${allowed.join(', ')}.`, { allowed });
  }
}

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

/**
 * Up to five candidates closest to what was asked for: those sharing the most query terms first,
 * then the smallest edit distance. Used for "did you mean" on NOT_FOUND.
 */
export function suggest(asked, candidates, count = 5) {
  const wanted = terms(asked);
  const target = compact(asked);
  return candidates
    .map((candidate) => {
      const words = terms(candidate);
      return {
        candidate,
        shared: wanted.filter((term) => words.some((word) => word.startsWith(term))).length,
        distance: distance(target, compact(candidate)),
      };
    })
    .filter(({ shared, distance: d }) => shared > 0 || d <= Math.max(2, Math.floor(target.length / 3)))
    .sort((a, b) => b.shared - a.shared || a.distance - b.distance || a.candidate.localeCompare(b.candidate))
    .slice(0, count)
    .map(({ candidate }) => candidate);
}

/** Sorts scored matches best first, then by key, so equal scores always come back in the same order. */
export function ranked(scored, keyOf, limit) {
  const sorted = scored.sort((a, b) => b.score - a.score || keyOf(a.item).localeCompare(keyOf(b.item)));
  return { total: sorted.length, results: sorted.slice(0, limit).map(({ item }) => item) };
}
