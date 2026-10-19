// Component status: the checkable part of the `componentStatus` block in
// docs/foundations/component-registry-governance.json, which defines the statuses and the evidence
// each one needs. Used by generate-component-registry.mjs (which records each component's evidence
// in registry.json) and by component-status.test.ts (which fails if an authored status claims more
// than the evidence supports).
import governance from '../../docs/foundations/component-registry-governance.json' with { type: 'json' };

/** The statuses, from least to most ready, then `deprecated` (which is about replacement). */
export const STATUSES = governance.componentStatus.values.map(({ value }) => value);

/** Each piece of evidence, and the lowest status that needs it. */
export const CRITERIA = governance.componentStatus.criteria;

const RANK = { draft: 0, beta: 1, stable: 2 };

/** The evidence, as booleans, from what the registry and the source tree say about a component. */
export function evidenceOf({ docsPage, tests, figmaSource, contentCompleteness, exemplarCompleteness, knownIssues = [] }) {
  return {
    docsPage: Boolean(docsPage),
    tests: Boolean(tests),
    figma: figmaSource != null,
    contract: contentCompleteness === 'full',
    examples: exemplarCompleteness === 'full',
    noKnownIssues: knownIssues.length === 0,
  };
}

/** The criteria a status needs that the evidence doesn't meet. */
export function unmetFor(status, evidence) {
  const rank = RANK[status] ?? 0;
  return CRITERIA.filter(({ id, needs }) => RANK[needs] <= rank && !evidence[id]).map(({ id }) => id);
}

/** The most a component's evidence supports: `stable`, `beta`, or `draft`. */
export function highestSupported(evidence) {
  if (unmetFor('stable', evidence).length === 0) return 'stable';
  if (unmetFor('beta', evidence).length === 0) return 'beta';
  return 'draft';
}
