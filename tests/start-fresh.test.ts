import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Collection } from '../src/lib/collection/types';
import { useUploadNotice, type UploadNotice } from '../src/pages/data/uploads';
import { closingLines, startFresh } from '../src/state/startFresh';
import { useApp, type Dataset } from '../src/state/store';

const report = { label: 'usage-october.csv', loadedAt: 1 } as unknown as Dataset;
const sample = { label: 'Sample report', loadedAt: 1, sample: true } as unknown as Dataset;
const githubFile = { fileName: 'usage-lens-data-octocorp.ndjson.gz' } as unknown as Collection;

function stubBrowser(entries: Record<string, string>) {
  const storage = new Map(Object.entries(entries));
  vi.stubGlobal('localStorage', {
    get length() {
      return storage.size;
    },
    key: (index: number) => [...storage.keys()][index] ?? null,
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  });
  const location = { hash: '#/budgets', pathname: '/usage-lens/', search: '?theme=dark', replace: vi.fn() };
  const history = { replaceState: vi.fn() };
  vi.stubGlobal('window', { location, history });
  return { storage, location, history };
}

/** A tab with a report, a GitHub data file, filters, an open user and the question open. */
function openEverything() {
  const app = useApp.getState();
  app.setDataset(report);
  app.setCollection(githubFile);
  app.toggleWeekday(1);
  app.selectUser(3);
  app.setError('Something went wrong');
  app.setFilterDrawerOpen(true);
  app.setStartFreshOpen(true);
  useUploadNotice.getState().show({ at: 1 } as unknown as UploadNotice);
}

beforeEach(() => useApp.getState().closeData());
afterEach(() => vi.unstubAllGlobals());

describe('start fresh', () => {
  it('lists what is closed, so nobody loses a report by surprise', () => {
    expect(closingLines(report, githubFile)).toEqual(['Usage report: usage-october.csv', 'GitHub data file: usage-lens-data-octocorp.ndjson.gz']);
    expect(closingLines(sample, null)).toEqual(['The sample report']);
    expect(closingLines(null, null)).toEqual([]);
  });

  it('closes the report, the GitHub data file, the filters and open panels, and keeps the settings', () => {
    openEverything();
    const settings = useApp.getState().settings;
    useApp.getState().closeData();
    const state = useApp.getState();
    expect(state.dataset).toBeNull();
    expect(state.collection).toBeNull();
    expect(state.filters.weekdays).toEqual([]);
    expect(state.selectedUser).toBeNull();
    expect(state.error).toBeNull();
    expect(state.filterDrawerOpen).toBe(false);
    expect(state.startFreshOpen).toBe(false);
    expect(state.settings).toBe(settings);
  });

  it('goes back to the start page without the page in the address and keeps what is saved', () => {
    const { storage, location, history } = stubBrowser({ 'ghcu.settings.v1': '{}', 'ghcu.theme': 'dark' });
    openEverything();
    startFresh(false);
    expect(useApp.getState().dataset).toBeNull();
    expect(useApp.getState().collection).toBeNull();
    expect(useUploadNotice.getState().notice).toBeNull();
    expect(history.replaceState).toHaveBeenCalledWith(null, '', '/usage-lens/?theme=dark');
    expect(location.replace).not.toHaveBeenCalled();
    expect([...storage.keys()]).toEqual(['ghcu.settings.v1', 'ghcu.theme']);
  });

  it('can also delete every saved setting, and then opens the app again from the start', () => {
    const { storage, location } = stubBrowser({ 'ghcu.settings.v1': '{}', 'ghcu.theme': 'dark', 'other.app': '1' });
    openEverything();
    startFresh(true);
    expect([...storage.keys()]).toEqual(['other.app']);
    expect(location.replace).toHaveBeenCalledWith('/usage-lens/');
  });
});
