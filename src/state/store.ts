import { create } from 'zustand';
import type { Collection } from '../lib/collection/types';
import type { DataStore } from '../lib/types';
import type { Prepared } from '../lib/analytics/prepare';
import { emptyFilters, type Filters, type ListFilterKey } from '../lib/analytics/filters';
import { mergeSettings, saveSettings, DEFAULT_SETTINGS, type SaveResult, type Settings } from '../lib/analytics/settings';
import { loadStoredSettings } from '../pages/settings/settings-io';
import { t, type Vars } from '../i18n/core';

export type ThemeMode = 'light' | 'dark' | 'system';

/** The color set, like GitHub's own appearance choices: the default GitHub colors, high contrast, or colorblind friendly. */
export type ColorPalette = 'default' | 'contrast' | 'colorblind';

export interface Dataset {
  store: DataStore;
  prep: Prepared;
  /** Human-readable description of what was loaded (the file names). Show it with datasetLabel(). */
  label: string;
  /** When set, `label` is English text with {placeholders} and is translated when shown. */
  labelVars?: Vars;
  loadedAt: number;
  /** True for the made-up sample report. The app then says so on every page. */
  sample?: boolean;
  /** The made-up GitHub data of the sample report. A GitHub data file you load is never used with the sample. */
  sampleGitHub?: Collection;
}

/** The dataset name in the current language. File names are shown as they are. */
export function datasetLabel(dataset: Pick<Dataset, 'label' | 'labelVars'>): string {
  return dataset.labelVars ? t(dataset.label, dataset.labelVars) : dataset.label;
}

export interface LoadingState {
  label: string;
  fraction: number;
  rows: number;
}

const THEME_KEY = 'ghcu.theme';
const PALETTE_KEY = 'ghcu.palette';
const SHOW_CALC_KEY = 'ghcu.showCalc';

function loadShowCalc(): boolean {
  try {
    return localStorage.getItem(SHOW_CALC_KEY) === '1';
  } catch {
    return false;
  }
}

function loadTheme(): ThemeMode {
  const requested = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('theme') : null;
  if (requested === 'light' || requested === 'dark') return requested;
  try {
    const storedTheme = localStorage.getItem(THEME_KEY);
    return storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system' ? storedTheme : 'system';
  } catch {
    return 'system';
  }
}

function loadPalette(): ColorPalette {
  try {
    const storedPalette = localStorage.getItem(PALETTE_KEY);
    return storedPalette === 'contrast' || storedPalette === 'colorblind' ? storedPalette : 'default';
  } catch {
    return 'default';
  }
}

export function applyPalette(palette: ColorPalette): void {
  if (palette === 'default') delete document.documentElement.dataset.palette;
  else document.documentElement.dataset.palette = palette;
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') return mode;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(mode: ThemeMode): void {
  const resolved = resolveTheme(mode);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.dataset.theme = resolved;
}

interface AppState {
  dataset: Dataset | null;
  setDataset: (dataset: Dataset | null) => void;
  /**
   * Closes everything loaded in this tab (the usage report or the sample, and the GitHub data file) with its filters,
   * errors and open panels, so the start page shows. Saved settings stay.
   */
  closeData: () => void;
  /**
   * The GitHub data file of the collector scripts (budgets, seats, billing). Kept in memory only, and kept when another
   * usage report is loaded. Never used with the sample report.
   */
  collection: Collection | null;
  setCollection: (collection: Collection | null) => void;
  /** True while the landing page is shown on top of an already loaded dataset ("Load other data"). */
  pickingData: boolean;
  setPickingData: (picking: boolean) => void;
  loading: LoadingState | null;
  setLoading: (loading: LoadingState | null) => void;
  error: string | null;
  setError: (error: string | null) => void;

  filters: Filters;
  /** Merge a partial filter set into the current filters. */
  setFilters: (patch: Partial<Filters>) => void;
  /** Reset all filters, then apply `patch`. Used for drill-downs from charts. */
  replaceFilters: (patch?: Partial<Filters>) => void;
  /** Add the value to a string-list filter when absent, remove it when present. */
  toggleFilterValue: (key: ListFilterKey, value: string) => void;
  toggleWeekday: (weekday: number) => void;
  resetFilters: () => void;

  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
  /**
   * How the last settings change was kept in this browser: 'saved' in full, 'slim' (a very large license list was
   * kept with usernames and plans only) or 'failed' (the browser storage refused it; the change lasts for this visit).
   */
  settingsSaved: SaveResult;

  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;

  /** Prints the formula of every number under it, in addition to the calculator icon. */
  showCalc: boolean;
  setShowCalc: (on: boolean) => void;

  selectedUser: number | null;
  selectUser: (id: number | null) => void;
  filterDrawerOpen: boolean;
  setFilterDrawerOpen: (open: boolean) => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  /** The "Start fresh" question is open. One dialog in the app shell serves every button that asks it. */
  startFreshOpen: boolean;
  setStartFreshOpen: (open: boolean) => void;
}

export const useApp = create<AppState>((set, get) => ({
  dataset: null,
  setDataset: (dataset) => set({ dataset, pickingData: false, filters: emptyFilters(), selectedUser: null, error: null }),
  closeData: () =>
    set({
      dataset: null,
      collection: null,
      pickingData: false,
      loading: null,
      error: null,
      filters: emptyFilters(),
      selectedUser: null,
      filterDrawerOpen: false,
      navOpen: false,
      startFreshOpen: false,
    }),
  collection: null,
  setCollection: (collection) => set({ collection }),
  pickingData: false,
  setPickingData: (pickingData) => set({ pickingData }),
  loading: null,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),

  filters: emptyFilters(),
  setFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
  replaceFilters: (patch) => set({ filters: { ...emptyFilters(), ...patch } }),
  toggleFilterValue: (key, value) =>
    set((state) => {
      const currentValues = state.filters[key];
      const next = currentValues.includes(value) ? currentValues.filter((otherValue) => otherValue !== value) : [...currentValues, value];
      return { filters: { ...state.filters, [key]: next } };
    }),
  toggleWeekday: (weekday) =>
    set((state) => {
      const currentWeekdays = state.filters.weekdays;
      return { filters: { ...state.filters, weekdays: currentWeekdays.includes(weekday) ? currentWeekdays.filter((otherWeekday) => otherWeekday !== weekday) : [...currentWeekdays, weekday].sort((a, b) => a - b) } };
    }),
  resetFilters: () => set({ filters: emptyFilters() }),

  settings: loadStoredSettings(),
  updateSettings: (patch) => {
    const settings = mergeSettings({ ...get().settings, ...patch });
    set({ settings, settingsSaved: saveSettings(settings) });
  },
  resetSettings: () => {
    const settings = structuredClone(DEFAULT_SETTINGS);
    set({ settings, settingsSaved: saveSettings(settings) });
  },
  settingsSaved: 'saved',

  theme: loadTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* the choice then lasts for this session only */
    }
    applyTheme(theme);
    set({ theme });
  },

  palette: loadPalette(),
  setPalette: (palette) => {
    try {
      localStorage.setItem(PALETTE_KEY, palette);
    } catch {
      /* the choice then lasts for this session only */
    }
    applyPalette(palette);
    set({ palette });
  },

  showCalc: loadShowCalc(),
  setShowCalc: (showCalc) => {
    try {
      localStorage.setItem(SHOW_CALC_KEY, showCalc ? '1' : '0');
    } catch {
      /* the choice then lasts for this session only */
    }
    set({ showCalc });
  },

  selectedUser: null,
  selectUser: (selectedUser) => set({ selectedUser }),
  filterDrawerOpen: false,
  setFilterDrawerOpen: (filterDrawerOpen) => set({ filterDrawerOpen }),
  navOpen: false,
  setNavOpen: (navOpen) => set({ navOpen }),
  startFreshOpen: false,
  setStartFreshOpen: (startFreshOpen) => set({ startFreshOpen }),
}));
