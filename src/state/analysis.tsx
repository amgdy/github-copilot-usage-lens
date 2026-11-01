import { createContext, useContext, useDeferredValue, useMemo, type ReactNode } from 'react';
import { analyze, type Analysis } from '../lib/analytics/analyze';
import type { Filters } from '../lib/analytics/filters';
import { withGitHubBudget } from '../lib/analytics/githubBudget';
import type { Prepared } from '../lib/analytics/prepare';
import { withoutRoster, type Settings } from '../lib/analytics/settings';
import { buildTaxonomy, type Taxonomy } from '../lib/analytics/taxonomy';
import { deriveGitHub, type GitHubData } from '../lib/collection/derive';
import { buildModelTable, type ModelTable } from '../lib/pricing/models';
import type { DataStore } from '../lib/types';
import { useApp, type Dataset } from './store';

export interface AnalysisContextValue {
  dataset: Dataset;
  store: DataStore;
  prep: Prepared;
  models: ModelTable;
  /** The filters the analysis below was computed with (deferred: may lag the live filters while a recompute is pending). */
  filters: Filters;
  /** The settings behind the numbers: without the license list for the sample, and with the GitHub budget when Settings has none. */
  settings: Settings;
  taxonomy: Taxonomy;
  analysis: Analysis;
  /** What the GitHub data file adds. Null when none is loaded, and always for the sample report. */
  github: GitHubData | null;
  /** True while the filters or settings were just changed and the analysis is catching up. */
  pending: boolean;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

/** Computes the analysis for the loaded dataset and the active filters/settings. Render only when a dataset is loaded. */
export function AnalysisProvider({ dataset, children }: { dataset: Dataset; children: ReactNode }) {
  const liveFilters = useApp((state) => state.filters);
  const storedSettings = useApp((state) => state.settings);
  const collection = useApp((state) => state.collection);
  // The sample report is made up, so the saved license list (real people) stays out of it.
  const liveSettings = useMemo(() => (dataset.sample ? withoutRoster(storedSettings) : storedSettings), [dataset.sample, storedSettings]);
  const filters = useDeferredValue(liveFilters);
  const settings = useDeferredValue(liveSettings);
  const { store, prep: prepared } = dataset;
  // The GitHub data file describes real people and budgets, so it is never mixed with the made-up sample either.
  // The sample has made-up GitHub data of its own.
  const shownCollection = dataset.sample ? (dataset.sampleGitHub ?? null) : collection;
  const github = useMemo(() => (shownCollection === null ? null : deriveGitHub(shownCollection, store)), [shownCollection, store]);

  const models = useMemo(() => buildModelTable(store, settings.modelOverrides), [store, settings.modelOverrides]);
  const taxonomy = useMemo(() => buildTaxonomy(settings), [settings]);
  const analysis = useMemo(() => analyze({ store, prep: prepared, models, filters, settings, github }), [store, prepared, models, filters, settings, github]);
  // The same budget the analysis used, so the explanations show it too.
  const shownSettings = useMemo(() => withGitHubBudget(settings, github).settings, [settings, github]);

  const value = useMemo<AnalysisContextValue>(
    () => ({ dataset, store, prep: prepared, models, filters, settings: shownSettings, taxonomy, analysis, github, pending: filters !== liveFilters || settings !== liveSettings }),
    [dataset, store, prepared, models, filters, shownSettings, taxonomy, analysis, github, liveFilters, settings, liveSettings],
  );
  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis(): AnalysisContextValue {
  const contextValue = useContext(AnalysisContext);
  if (!contextValue) throw new Error('useAnalysis must be used inside <AnalysisProvider>');
  return contextValue;
}

/** The settings behind the numbers on screen (without the license list for the sample). Outside a report: the saved settings. */
export function useEffectiveSettings(): Settings {
  const stored = useApp((state) => state.settings);
  return useContext(AnalysisContext)?.settings ?? stored;
}
