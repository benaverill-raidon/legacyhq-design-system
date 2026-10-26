import { readFileSync } from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from './core.mjs';
import { buildExemplars, serializeExemplars } from '../../../scripts/generate-component-exemplars.mjs';
import { buildRegistry, serializeRegistry } from '../../../scripts/generate-component-registry.mjs';

// Whether the checked-in generated files match their sources: rebuilds them in memory with the
// generators' own build functions and compares. Never writes. The registry is rebuilt from the
// rebuilt exemplars, as running generate:exemplars then generate:registry would.

function compare(file, command, built, serialized, root) {
  const onDisk = readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
  if (onDisk === serialized) return { file, fresh: true, command, changed: [] };
  // Which components differ, so the result says what changed, not only that something did.
  const current = new Map(JSON.parse(onDisk).map((entry) => [entry.id, JSON.stringify(entry)]));
  const ids = new Set([...current.keys(), ...built.map((entry) => entry.id)]);
  const rebuilt = new Map(built.map((entry) => [entry.id, JSON.stringify(entry)]));
  const changed = [...ids].filter((id) => current.get(id) !== rebuilt.get(id)).sort();
  return { file, fresh: false, command, changed };
}

/**
 * @param {{ root?: string }} [options] repository root (tests pass a temporary copy)
 * @returns {Promise<Array<{ file: string, fresh: boolean, command: string, changed: string[] }>>}
 */
export async function checkFreshness({ root = REPO_ROOT } = {}) {
  const exemplars = await buildExemplars(root);
  const registry = await buildRegistry(root, { exemplars });
  return [
    compare('docs/components/exemplars.json', 'npm run generate:exemplars', exemplars, serializeExemplars(exemplars), root),
    compare('docs/components/registry.json', 'npm run generate:registry', registry, serializeRegistry(registry), root),
  ];
}
