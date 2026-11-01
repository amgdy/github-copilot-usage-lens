import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as collectionReader from '../src/lib/collection';
import { buildStore } from '../src/lib/csv/ingest';
import * as ingestClient from '../src/lib/csv/ingestClient';
import { takeUploads } from '../src/pages/data/LoadControl';
import { useUploadNotice } from '../src/pages/data/uploads';
import { loadSources } from '../src/state/loadDataset';
import { startFresh } from '../src/state/startFresh';
import { useApp } from '../src/state/store';
import { END, header, readLines, recordLine, seatRecord, sourceLine, textOf, usageReportPart } from './collectionLines';
import { makeCsv } from './helpers';

const usageText = makeCsv([{ date: '2026-09-02', user: 'usage-user', gross: 2 }]);
const collectionLines = [
  header(),
  recordLine('seat', seatRecord('new-seat', 'octo-org', 'business')),
  sourceLine('seats', 'ok'),
  END,
];
const collectionFile = () => new File([textOf(collectionLines)], 'data.ndjson');
const usageFile = () => new File([usageText], 'usage.csv');

beforeEach(() => {
  useApp.getState().closeData();
  useApp.getState().resetSettings();
  useUploadNotice.getState().show(null);
  vi.stubGlobal('window', {
    location: { hash: '', pathname: '/', search: '', replace: vi.fn() },
    history: { replaceState: vi.fn() },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  useApp.getState().closeData();
});

async function openReport() {
  expect(await loadSources([{ name: 'existing.csv', data: usageText }])).toBe(true);
}

function deferCollection() {
  const pending = Promise.withResolvers<collectionReader.Collection>();
  const started = Promise.withResolvers<void>();
  vi.spyOn(collectionReader, 'readCollection').mockImplementation(() => {
    started.resolve();
    return pending.promise;
  });
  return { pending, started };
}

function expectClosed() {
  const app = useApp.getState();
  expect(app.dataset).toBeNull();
  expect(app.collection).toBeNull();
  expect(app.loading).toBeNull();
  expect(app.error).toBeNull();
  expect(app.settings.roster).toEqual([]);
  expect(useUploadNotice.getState().notice).toBeNull();
}

describe('upload batch lifetime', () => {
  it('is busy from the first asynchronous file check and rejects overlapping batches', async () => {
    const pending = Promise.withResolvers<boolean>();
    vi.spyOn(collectionReader, 'isGzip').mockReturnValue(pending.promise);
    const loading = takeUploads([usageFile()]);
    expect(useApp.getState().loading).not.toBeNull();
    expect(await takeUploads([collectionFile()])).toEqual({ usageLoaded: null, notice: null });
    pending.resolve(false);
    expect((await loading).usageLoaded).toBe(true);
    expect(useApp.getState().loading).toBeNull();
  });

  it.each([false, true])('stays busy through a collection read after CSV loading: %s', async (withCsv) => {
    await openReport();
    const { pending, started } = deferCollection();
    const loadingStates: boolean[] = [];
    const unsubscribe = useApp.subscribe((state) => loadingStates.push(state.loading !== null));
    const loading = takeUploads(withCsv ? [usageFile(), collectionFile()] : [collectionFile()]);
    await started.promise;
    expect(useApp.getState().loading).not.toBeNull();
    expect(loadingStates).not.toContain(false);
    pending.resolve(readLines(collectionLines));
    await loading;
    unsubscribe();
    expect(useApp.getState().loading).toBeNull();
    expect(useApp.getState().collection).not.toBeNull();
    expect(useApp.getState().settings.roster.map((seat) => seat.user)).toEqual(['new-seat']);
  });

  it.each([false, true])('does not restore a delayed collection or seats after Start fresh, even with new data: %s', async (deleteSaved) => {
    await openReport();
    const { pending, started } = deferCollection();
    const loading = takeUploads([usageFile(), collectionFile()]);
    await started.promise;
    startFresh(deleteSaved);
    expectClosed();
    await openReport();
    const newDataset = useApp.getState().dataset;
    pending.resolve(readLines(collectionLines));
    expect(await loading).toEqual({ usageLoaded: null, notice: null });
    expect(useApp.getState().dataset).toBe(newDataset);
    expect(useApp.getState().collection).toBeNull();
    expect(useApp.getState().settings.roster).toEqual([]);
    expect(useUploadNotice.getState().notice).toBeNull();
  });

  it('does not start embedded usage loading after a cancelled collection read', async () => {
    const { pending, started } = deferCollection();
    const loading = takeUploads([collectionFile()]);
    await started.promise;
    startFresh(false);
    pending.resolve(readLines([
      ...collectionLines.slice(0, -1),
      usageReportPart('2026-09', 1, 1, usageText.trimEnd().split('\n')),
      sourceLine('usage-report', 'ok', { month: '2026-09' }),
      END,
    ]));
    await loading;
    expectClosed();
  });

  it('does not save a delayed license list after Start fresh', async () => {
    await openReport();
    const pending = Promise.withResolvers<string>();
    const started = Promise.withResolvers<void>();
    const licenseFile = new File(['new-seat\n'], 'users.txt');
    vi.spyOn(licenseFile, 'text').mockImplementation(() => {
      started.resolve();
      return pending.promise;
    });
    const loading = takeUploads([licenseFile]);
    await started.promise;
    startFresh(false);
    pending.resolve('new-seat\n');
    await loading;
    expectClosed();
  });

  it('does not restore stale CSV progress, errors or data, or clear a newer batch', async () => {
    const pending = Promise.withResolvers<Awaited<ReturnType<typeof buildStore>>>();
    const started = Promise.withResolvers<void>();
    let reportProgress: ingestClient.IngestOptions['onProgress'];
    vi.spyOn(ingestClient, 'ingestSources').mockImplementation((_sources, options) => {
      reportProgress = options?.onProgress;
      started.resolve();
      return pending.promise;
    });
    const loading = takeUploads([usageFile()]);
    await started.promise;
    startFresh(false);
    const newer = Promise.withResolvers<boolean>();
    vi.spyOn(collectionReader, 'isGzip').mockReturnValue(newer.promise);
    const newerLoading = takeUploads([usageFile()]);
    const newProgress = useApp.getState().loading;
    reportProgress?.({ file: 'old.csv', fileCount: 1, fileIndex: 0, fraction: 1, rows: 1 });
    expect(useApp.getState().loading).toBe(newProgress);
    pending.resolve(await buildStore([{ name: 'old.csv', data: usageText }]));
    await loading;
    expect(useApp.getState().loading).toBe(newProgress);
    expect(useApp.getState().dataset).toBeNull();
    expect(useApp.getState().error).toBeNull();
    startFresh(false);
    newer.resolve(false);
    await newerLoading;
    expectClosed();
  });

  it('does not show a delayed CSV failure after Start fresh', async () => {
    const pending = Promise.withResolvers<Awaited<ReturnType<typeof buildStore>>>();
    const started = Promise.withResolvers<void>();
    vi.spyOn(ingestClient, 'ingestSources').mockImplementation(() => {
      started.resolve();
      return pending.promise;
    });
    const loading = takeUploads([usageFile()]);
    await started.promise;
    startFresh(false);
    pending.reject(new Error('late failure'));
    await loading;
    expectClosed();
  });
});
