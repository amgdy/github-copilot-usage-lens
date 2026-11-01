import { getLocale, t as translate } from '../../i18n/core.ts';
import { BUDGETS_DOCS } from './docs/budgets';
import { CORE_DOCS } from './docs/core';
import { DATA_DOCS } from './docs/data';
import { EFFICIENCY_DOCS } from './docs/efficiency';
import { GITHUB_DOCS } from './docs/github';
import { LICENSES_DOCS } from './docs/licenses';
import { LICENSES_PAGE_DOCS } from './docs/licenses-page';
import { MODELS_DOCS } from './docs/models';
import { ORGANIZATION_DOCS } from './docs/organization';
import { OVERVIEW_DOCS } from './docs/overview';
import { PATTERNS_DOCS } from './docs/patterns';
import { RECOMMENDATIONS_DOCS } from './docs/recommendations';
import { SEGMENTS_DOCS } from './docs/segments';
import { SPEND_DOCS } from './docs/spend';
import { USERS_DOCS } from './docs/users';
import { METRIC_AREAS, type MetricArea, type MetricDoc } from './types';

/** Every explanation, in reading order: by area, then in the order the docs files list them. */
export const METRICS: readonly MetricDoc[] = (() => {
  const all = [
    ...CORE_DOCS,
    ...OVERVIEW_DOCS,
    ...SPEND_DOCS,
    ...BUDGETS_DOCS,
    ...USERS_DOCS,
    ...SEGMENTS_DOCS,
    ...MODELS_DOCS,
    ...EFFICIENCY_DOCS,
    ...LICENSES_DOCS,
    ...LICENSES_PAGE_DOCS,
    ...ORGANIZATION_DOCS,
    ...PATTERNS_DOCS,
    ...RECOMMENDATIONS_DOCS,
    ...DATA_DOCS,
    ...GITHUB_DOCS,
  ];
  const order = new Map<MetricArea, number>(METRIC_AREAS.map((area, index) => [area, index]));
  return all
    .map((doc, index) => ({ doc, i: index }))
    .sort((a, b) => (order.get(a.doc.area) ?? 0) - (order.get(b.doc.area) ?? 0) || a.i - b.i)
    .map((entry) => entry.doc);
})();

const BY_ID = new Map<string, MetricDoc>(METRICS.map((doc) => [doc.id, doc]));

export const metricDoc = (id: string): MetricDoc | undefined => BY_ID.get(id);

export interface MetricGroup {
  area: MetricArea;
  docs: MetricDoc[];
}

/** The docs grouped by area; areas without a doc are left out. */
export function metricsByArea(docs: readonly MetricDoc[] = METRICS): MetricGroup[] {
  const groups: MetricGroup[] = [];
  for (const area of METRIC_AREAS) {
    const inArea = docs.filter((doc) => doc.area === area);
    if (inArea.length) groups.push({ area, docs: inArea });
  }
  return groups;
}

const docTexts = (doc: MetricDoc): string[] => [doc.title, doc.meaning, doc.formula, ...(doc.steps ?? []), ...(doc.notes ?? []), doc.example ?? ''];

/** English text plus the current translation, so a search in either language finds the explanation. */
const textOf = (doc: MetricDoc): string => {
  const englishTexts = docTexts(doc);
  const shown = getLocale() === 'en' ? [] : englishTexts.map((text) => (text ? translate(text) : ''));
  return [doc.id.replace(/-/g, ' '), ...englishTexts, ...(doc.columns ?? []), ...shown].join(' ').toLowerCase();
};

/** Docs that contain every word of the query, in any field. An empty query returns everything. */
export function searchMetrics(query: string, docs: readonly MetricDoc[] = METRICS): MetricDoc[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [...docs];
  return docs.filter((doc) => {
    const searchText = textOf(doc);
    return terms.every((term) => searchText.includes(term));
  });
}
