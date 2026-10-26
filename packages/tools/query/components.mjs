import { QueryError, checkFilter, checkLimit, compact, ranked, readJson, requireQuery, suggest, terms } from './core.mjs';

// Components, read from docs/components/registry.json (generated from the contracts by
// generate:registry). The allowed category, tier, and status values come from the registry's schema.

const REGISTRY = 'docs/components/registry.json';
const SCHEMA = 'docs/foundations/component-registry.schema.json';

const registry = () => readJson(REGISTRY);

/** The allowed values for each filter, from the registry schema. */
export function componentFilterValues() {
  const { properties } = readJson(SCHEMA).items;
  return { category: properties.category.enum, tier: properties.tier.enum, status: properties.status.enum };
}

function checkFilters(filters = {}) {
  const allowed = componentFilterValues();
  for (const key of ['category', 'tier', 'status']) checkFilter(key, filters[key], allowed[key]);
}

const matchesFilters = (entry, { category, tier, status } = {}) =>
  (!category || entry.category === category) && (!tier || entry.tier === tier) && (!status || entry.status === status);

/** The short form used in lists and search results. */
const summary = (entry) => ({
  id: entry.id,
  name: entry.name,
  tier: entry.tier,
  category: entry.category,
  status: entry.status,
  knownIssues: entry.knownIssues.length,
  source: entry.path,
});

/**
 * Every component, optionally filtered, in registry order (tier, then id).
 * @param {{ category?: string, tier?: string, status?: string }} [filters]
 */
export function listComponents(filters = {}) {
  checkFilters(filters);
  return registry().filter((entry) => matchesFilters(entry, filters)).map(summary);
}

/**
 * One component's full registry entry, by id ("key-value-pair") or name ("Key Value Pair"), ignoring
 * case and punctuation. A sub-component's name (RadioGroup) finds the component that documents it.
 */
export function getComponent(idOrName) {
  const asked = requireQuery(idOrName, 'getComponent');
  const key = compact(asked);
  const entries = registry();
  const entry = entries.find((e) => compact(e.id) === key || compact(e.name) === key)
    ?? entries.find((e) => e.subComponents.some((sub) => compact(sub.name) === key));
  if (!entry) {
    const suggestions = suggest(asked, entries.map((e) => e.id));
    throw new QueryError('NOT_FOUND', `No component "${asked}".`, { suggestions });
  }
  return { ...entry, source: entry.path };
}

// How much each kind of match counts. Every query term has to match somewhere for a component to
// be a result; a closer match (the name itself) outranks a passing one (a prop or anatomy part).
function scoreTerm(term, entry) {
  const nameWords = [...terms(entry.id), ...terms(entry.name)];
  if (nameWords.includes(term)) return 10;
  if (nameWords.some((word) => word.startsWith(term))) return 6;
  if ([...terms(entry.category), entry.tier].some((word) => word.startsWith(term))) return 5;
  if (Object.keys(entry.props).some((prop) => compact(prop).includes(term))) return 3;
  const variants = Object.entries(entry.variants).flatMap(([axis, values]) => [axis, ...values]);
  if (variants.some((value) => compact(value) === term)) return 2;
  const parts = [...entry.anatomy.map((part) => part.name), ...entry.relatedComponents.map(String)];
  if (parts.some((part) => terms(part).includes(term))) return 1;
  return 0;
}

/**
 * Components matching every term of the query, best match first, optionally filtered.
 * @param {string} query
 * @param {{ category?: string, tier?: string, status?: string, limit?: number }} [options]
 */
export function searchComponents(query, { limit, ...filters } = {}) {
  const asked = requireQuery(query, 'searchComponents');
  const max = checkLimit(limit);
  checkFilters(filters);
  const wanted = terms(asked);
  const scored = [];
  for (const entry of registry()) {
    if (!matchesFilters(entry, filters)) continue;
    const scores = wanted.map((term) => scoreTerm(term, entry));
    if (scores.includes(0)) continue;
    const exact = compact(entry.id) === compact(asked) || compact(entry.name) === compact(asked) ? 100 : 0;
    scored.push({ item: summary(entry), score: exact + scores.reduce((sum, s) => sum + s, 0) });
  }
  return ranked(scored, (item) => item.id, max);
}
