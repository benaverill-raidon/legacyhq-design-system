import { checkFilter, checkLimit, ranked, readJson, terms } from './core.mjs';

// Icon names, read from the icon metadata generate:icons maintains. Never hardcode an icon name:
// they change as the icon set is reconciled with Figma.

const ICONS = 'packages/ui/src/assets/icons/metadata/icons.json';

const record = (icon) => ({ ...icon, source: ICONS });

/** The icon categories, from the metadata. */
export function iconCategories() {
  return [...new Set(readJson(ICONS).map((icon) => icon.category))].sort();
}

/**
 * Icons matching every term of the query by name, label, or keyword, best match first. With no
 * query, every icon (optionally in one category), by name.
 * @param {string} [query]
 * @param {{ category?: string, limit?: number }} [options]
 */
export function searchIcons(query = '', { category, limit } = {}) {
  const max = checkLimit(limit);
  checkFilter('category', category, iconCategories());
  const wanted = terms(query);
  const scored = [];
  for (const icon of readJson(ICONS)) {
    if (category && icon.category !== category) continue;
    const nameWords = terms(icon.name);
    const otherWords = [...terms(icon.label), ...icon.keywords.flatMap(terms), ...terms(icon.category)];
    const scores = wanted.map((term) => {
      if (nameWords.includes(term)) return 10;
      if (nameWords.some((word) => word.startsWith(term))) return 6;
      if (otherWords.includes(term)) return 4;
      return otherWords.some((word) => word.startsWith(term)) ? 2 : 0;
    });
    if (scores.includes(0)) continue;
    scored.push({ item: record(icon), score: scores.reduce((sum, s) => sum + s, 0) });
  }
  return ranked(scored, (item) => item.name, max);
}
