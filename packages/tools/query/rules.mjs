import { QueryError, compact, readJson, requireQuery, suggest } from './core.mjs';

// The system's rules, read from the governance files: each section of token-governance.json (motion,
// dimensions, elevation, icons, ...) and each rule in component-api-governance.json (disabled-prop,
// ...). A topic is the section key or rule id in kebab case. The API file's own overview, decision
// framework, and defaults are prefixed "api-" so they don't collide with the token file's.

const TOKEN_FILE = 'docs/foundations/token-governance.json';
const API_FILE = 'docs/foundations/component-api-governance.json';
// File metadata, not rules.
const METADATA = new Set(['id', 'designSystem', 'artifact', 'version', 'status', 'owner', 'lastReviewed', 'appliesTo']);

const kebab = (key) => key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function loadTopics() {
  const topics = [];
  const tokenGovernance = readJson(TOKEN_FILE);
  for (const [key, content] of Object.entries(tokenGovernance)) {
    if (METADATA.has(key)) continue;
    const summary = typeof content === 'string' ? content : typeof content?.description === 'string' ? content.description : null;
    topics.push({ topic: kebab(key), summary, source: TOKEN_FILE, key, content });
  }
  const apiGovernance = readJson(API_FILE);
  for (const rule of apiGovernance.rules) {
    topics.push({ topic: rule.id, summary: rule.name, source: API_FILE, key: `rules[id=${rule.id}]`, content: rule });
  }
  for (const [key, content] of Object.entries(apiGovernance)) {
    if (METADATA.has(key) || key === 'rules') continue;
    const summary = typeof content === 'string' ? content : null;
    topics.push({ topic: `api-${kebab(key)}`, summary, source: API_FILE, key, content });
  }
  return topics;
}

/** Every rule topic, with a one-line summary where the file has one. */
export function listRuleTopics() {
  return loadTopics().map(({ topic, summary, source }) => ({ topic, summary, source }));
}

/** One topic's rules, exactly as the governance file states them. Accepts kebab or camel case. */
export function getRules(topic) {
  const asked = requireQuery(topic, 'getRules');
  const topics = loadTopics();
  const found = topics.find((t) => compact(t.topic) === compact(asked));
  if (!found) {
    throw new QueryError('NOT_FOUND', `No rule topic "${asked}".`, { suggestions: suggest(asked, topics.map((t) => t.topic)) });
  }
  return found;
}
