import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { validateAgainstSchema } from './lib/validate-schema.mjs';

const rootDir = process.cwd();
const componentsDir = path.join(rootDir, 'docs/components');
const schemaPath = path.join(rootDir, 'docs/foundations/component-exemplars.schema.json');
const outputPath = path.join(componentsDir, 'exemplars.json');

const TIER_DIRS = ['primitives', 'atoms', 'molecules'];

function toPascalCase(id) {
  return id
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// examples.json files differ in COMPLETENESS, not incompatible field shapes (unlike
// contract.json): `component` and `antiExamples` are sometimes entirely absent, and per-example
// `description`/`props` are inconsistently present. Normalize presence only - never fabricate a
// value for a field that isn't there.
function normalizeExampleEntry(entry, ctx, index) {
  if (!entry || typeof entry !== 'object') throw new Error(`${ctx}: examples[${index}] is not an object`);
  if (!entry.name) throw new Error(`${ctx}: examples[${index}] missing "name"`);
  if (!entry.jsx) throw new Error(`${ctx}: examples[${index}] missing "jsx"`);
  return {
    name: entry.name,
    description: entry.description ?? null,
    jsx: entry.jsx,
    props: entry.props ?? {},
  };
}

function normalizeAntiExampleEntry(entry, ctx, index) {
  if (!entry || typeof entry !== 'object') throw new Error(`${ctx}: antiExamples[${index}] is not an object`);
  if (!entry.name) throw new Error(`${ctx}: antiExamples[${index}] missing "name"`);
  if (!entry.jsx) throw new Error(`${ctx}: antiExamples[${index}] missing "jsx"`);
  return {
    name: entry.name,
    jsx: entry.jsx,
    reason: entry.reason ?? null,
  };
}

// Structural signal only (never a judgment on prose quality): "full" means every example
// documented a props map (even a legitimately empty one, e.g. a no-argument default-usage
// example) AND there's at least one documented anti-pattern; "thin" means neither exists at all;
// "partial" is anything in between. Checked against the RAW example entries (was "props" key
// present in the source file at all?), not the normalized output - a legitimately empty {}
// (Skeleton's <Skeleton /> example) must count as documented, not as a gap.
function computeExemplarCompleteness(rawExamples, antiExamples) {
  const hasAntiExamples = antiExamples.length > 0;
  const allDocumentedProps = rawExamples.length > 0 && rawExamples.every((e) => 'props' in e);
  const anyDocumentedProps = rawExamples.some((e) => 'props' in e);

  if (hasAntiExamples && allDocumentedProps) return 'full';
  if (!hasAntiExamples && !anyDocumentedProps) return 'thin';
  return 'partial';
}

function normalizeComponent({ id, tier, raw, relPath }) {
  const name = raw.component ?? toPascalCase(id);
  const ctx = name;

  if (!Array.isArray(raw.examples)) throw new Error(`${ctx}: "examples" must be an array`);
  const examples = raw.examples.map((entry, i) => normalizeExampleEntry(entry, ctx, i));

  const rawAntiExamples = raw.antiExamples ?? [];
  if (!Array.isArray(rawAntiExamples)) throw new Error(`${ctx}: "antiExamples" must be an array when present`);
  const antiExamples = rawAntiExamples.map((entry, i) => normalizeAntiExampleEntry(entry, ctx, i));

  const exemplarCompleteness = computeExemplarCompleteness(raw.examples, antiExamples);

  return {
    id,
    name,
    tier,
    path: relPath,
    examples,
    antiExamples,
    exemplarCompleteness,
  };
}

async function main() {
  const exemplars = [];
  const counts = { primitive: 0, atom: 0, molecule: 0 };

  for (const tierDir of TIER_DIRS) {
    const tier = tierDir.slice(0, -1);
    const dirents = await readdir(path.join(componentsDir, tierDir), { withFileTypes: true });
    const ids = dirents
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    for (const id of ids) {
      const examplesPath = path.join(componentsDir, tierDir, id, `${id}.examples.json`);
      const raw = JSON.parse(await readFile(examplesPath, 'utf8'));
      const relPath = path.relative(rootDir, examplesPath).split(path.sep).join('/');
      exemplars.push(normalizeComponent({ id, tier, raw, relPath }));
      counts[tier] += 1;
    }
  }

  const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
  validateAgainstSchema(exemplars, schema, '$exemplars');

  await writeFile(outputPath, `${JSON.stringify(exemplars, null, 2)}\n`, 'utf8');

  console.log(
    `Generated exemplars for ${exemplars.length} components ` +
      `(${counts.primitive} primitives, ${counts.atom} atoms, ${counts.molecule} molecules).`,
  );
}

main().catch((error) => {
  console.error('generate-component-exemplars failed:', error.message);
  process.exit(1);
});
