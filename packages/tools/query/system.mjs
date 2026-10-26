import { readJson, REPO_ROOT } from './core.mjs';
import { checkFreshness } from './freshness.mjs';
import { loadTokens } from './tokens.mjs';

// A quick health check of the data the library reads, for `legacyhq doctor` and the MCP server's
// check_system. It never writes and never runs other commands. It isn't npm run validate, which
// also typechecks, lints, and runs every test and stays the full check (CI runs it).

const REGISTRY = 'docs/components/registry.json';
const EXEMPLARS = 'docs/components/exemplars.json';

const pass = (id, message) => ({ id, ok: true, message });
const fail = (id, message, fix, file) => ({ id, ok: false, message, fix, ...(file && { file }) });

function parses(file, root) {
  try {
    readJson(file, root);
    return pass(`parse:${file}`, `${file} reads as JSON.`);
  } catch (error) {
    return fail(`parse:${file}`, `${file} can't be read: ${error.message}`, 'Regenerate it with npm run generate:exemplars, then npm run generate:registry.', file);
  }
}

function idsMatch(root) {
  const registry = new Set(readJson(REGISTRY, root).map((entry) => entry.id));
  const exemplars = new Set(readJson(EXEMPLARS, root).map((entry) => entry.id));
  const onlyRegistry = [...registry].filter((id) => !exemplars.has(id));
  const onlyExemplars = [...exemplars].filter((id) => !registry.has(id));
  if (!onlyRegistry.length && !onlyExemplars.length) return pass('ids', `registry.json and exemplars.json list the same ${registry.size} components.`);
  const parts = [
    onlyRegistry.length && `only in registry.json: ${onlyRegistry.join(', ')}`,
    onlyExemplars.length && `only in exemplars.json: ${onlyExemplars.join(', ')}`,
  ].filter(Boolean);
  return fail('ids', `The generated files disagree on components (${parts.join('; ')}).`, 'Run npm run generate:exemplars, then npm run generate:registry.');
}

function tokensValid(root) {
  try {
    const count = loadTokens({ root }).size;
    return pass('tokens', `The token sources validate (${count} CSS names).`);
  } catch (error) {
    return fail('tokens', `The token sources don't validate: ${error.message}`, 'Fix the token source named in the message, then run npm run tokens:check.', 'packages/ui/src/tokens/src');
  }
}

/**
 * Runs every check and reports each one. `ok` is true only when all pass.
 * @param {{ root?: string }} [options] repository root (tests pass a temporary copy)
 * @returns {Promise<{ ok: boolean, checks: Array<{ id: string, ok: boolean, message: string, fix?: string, file?: string }> }>}
 */
export async function checkSystem({ root = REPO_ROOT } = {}) {
  const checks = [parses(REGISTRY, root), parses(EXEMPLARS, root)];
  if (checks.every((check) => check.ok)) {
    checks.push(idsMatch(root));
    try {
      for (const result of await checkFreshness({ root })) {
        checks.push(result.fresh
          ? pass(`fresh:${result.file}`, `${result.file} matches its sources.`)
          : fail(`fresh:${result.file}`, `${result.file} is out of date (${result.changed.join(', ')}).`, `Run ${result.command}.`, result.file));
      }
    } catch (error) {
      // A generator rejecting a source file (a contract missing its status, say).
      checks.push(fail('fresh', `The generated files can't be rebuilt: ${error.message}`, 'Fix the source file named in the message, then regenerate.'));
    }
  }
  checks.push(tokensValid(root));
  return { ok: checks.every((check) => check.ok), checks };
}
