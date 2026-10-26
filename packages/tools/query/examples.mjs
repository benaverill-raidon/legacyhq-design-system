import { QueryError, readJson } from './core.mjs';
import { getComponent } from './components.mjs';

// Usage examples and anti-examples, read from docs/components/exemplars.json (generated from each
// component's examples.json by generate:exemplars) and returned exactly as written there.

const EXEMPLARS = 'docs/components/exemplars.json';
const KINDS = ['all', 'example', 'anti'];

/**
 * A component's examples and anti-examples, by id or name.
 * @param {string} idOrName
 * @param {{ kind?: 'all' | 'example' | 'anti' }} [options]
 */
export function getExamples(idOrName, { kind = 'all' } = {}) {
  if (!KINDS.includes(kind)) {
    throw new QueryError('INVALID_INPUT', `Unknown kind "${kind}". Use one of: ${KINDS.join(', ')}.`, { allowed: KINDS });
  }
  const { id } = getComponent(idOrName);
  const entry = readJson(EXEMPLARS).find((e) => e.id === id);
  // generate:registry and generate:exemplars read the same folders, so this means a stale file.
  if (!entry) throw new QueryError('NOT_FOUND', `${id} has no exemplars entry; run npm run generate:exemplars.`);
  return {
    id: entry.id,
    name: entry.name,
    source: entry.path,
    ...(kind !== 'anti' && { examples: entry.examples }),
    ...(kind !== 'example' && { antiExamples: entry.antiExamples }),
  };
}
