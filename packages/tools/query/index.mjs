// The LegacyHQ design system query library: read-only lookups over the data the repo already
// generates, shared by the CLI and the MCP server. Nothing here writes, prints, or uses the network.
// Errors it means to throw are QueryErrors (NOT_FOUND or INVALID_INPUT); see core.mjs.

export { QueryError, REPO_ROOT } from './core.mjs';
export { componentFilterValues, getComponent, listComponents, searchComponents } from './components.mjs';
export { getExamples } from './examples.mjs';
export { getToken, searchTokens, tokenFilterValues } from './tokens.mjs';
export { getRules, listRuleTopics } from './rules.mjs';
export { iconCategories, searchIcons } from './icons.mjs';
export { checkFreshness } from './freshness.mjs';
