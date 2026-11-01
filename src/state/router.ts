import { useSyncExternalStore } from 'react';
import type { PageId as AdvicePageId } from '../lib/analytics/recommendations';
import type { Filters } from '../lib/analytics/filters';
import { useApp } from './store';

/** Every page of the app. Recommendations can point to the pages in AdvicePageId. */
export type PageId = AdvicePageId | 'licenses';

export const PAGE_IDS: PageId[] = [
  'overview',
  'spend',
  'budgets',
  'users',
  'segments',
  'models',
  'efficiency',
  'organization',
  'patterns',
  'recommendations',
  'licenses',
  'data',
  'settings',
  'methodology',
];

function parse(hash: string): PageId {
  const id = hash.replace(/^#\/?/, '').split(/[/?]/)[0] as PageId;
  return PAGE_IDS.includes(id) ? id : 'overview';
}

/** The part of the hash after the page, for pages that open a single item (`#/methodology/auto-discount` gives "auto-discount"). */
function parseArg(hash: string): string {
  const parts = hash.replace(/^#\/?/, '').split('?')[0].split('/');
  return parts.length > 1 ? decodeURIComponent(parts.slice(1).join('/')) : '';
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

/** Current page, derived from the URL hash (`#/users`). */
export function useRoute(): PageId {
  return useSyncExternalStore(subscribe, () => parse(window.location.hash), () => 'overview' as PageId);
}

/** The item a page was opened on, from the URL hash (`#/methodology/auto-discount`). Empty when there is none. */
export function useRouteArg(): string {
  return useSyncExternalStore(subscribe, () => parseArg(window.location.hash), () => '');
}

export function navigate(page: PageId): void {
  const target = `#/${page}`;
  if (window.location.hash !== target) window.location.hash = target;
}

/**
 * Drill-down helper: replace the active filters with `patch` (or merge when `merge` is true) and optionally jump to a page.
 * Chart clicks and "show me these users" buttons use this.
 */
export function drill(patch: Partial<Filters>, options: { page?: PageId; merge?: boolean } = {}): void {
  const { replaceFilters, setFilters } = useApp.getState();
  if (options.merge) setFilters(patch);
  else replaceFilters(patch);
  if (options.page) navigate(options.page);
}
