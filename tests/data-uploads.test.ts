import { describe, expect, it } from 'vitest';
import type { RosterEntry, SaveResult } from '../src/lib/analytics/settings';
import { readCollection, type Collection } from '../src/lib/collection';
import { classifyUpload } from '../src/lib/licenses';
import { rosterKind } from '../src/pages/data/LicenseCard';
import {
  COLLECTION_FIRST,
  MAX_LICENSE_BYTES,
  collectionStartTime,
  diffRoster,
  importLicenseFiles,
  isCsvFile,
  routeOf,
  routeUploads,
  sortUploads,
  type RosterState,
  type UploadDeps,
} from '../src/pages/data/uploads';
import { END, header, recordLine, seatRecord, sourceLine, textOf, usageReportPart } from './collectionLines';
import { makeCsv } from './helpers';

interface FakeFile {
  name: string;
  type?: string;
  size: number;
  text: string;
}

const file = (name: string, text: string, type?: string): FakeFile => ({ name, type, size: text.length, text });

const seat = (login: string, plan = 'business'): Record<string, unknown> => ({
  created_at: '2025-01-15T09:00:00Z',
  last_activity_at: '2026-03-20T09:00:00Z',
  plan_type: plan,
  assignee: { login, id: 1, type: 'User' },
});

const seatsJson = (...logins: string[]): string => JSON.stringify({ total_seats: logins.length, seats: logins.map((login) => seat(login)) });

const USAGE = makeCsv([
  { date: '2026-03-02', user: 'user-a', gross: 2 },
  { date: '2026-03-03', user: 'user-b', gross: 3 },
]);

const ACTIVITY = [
  '"Report_Time","Login","Last Authenticated At","Last Activity At","Last Surface Used"',
  '"2026-03-31 06:00:00 UTC","user-a","2026-03-30T08:00:00Z","2026-03-29T10:15:00Z","vscode/1.97.1/copilot-chat/0.24.1"',
].join('\n');

const readHead = (upload: FakeFile): Promise<string> => Promise.resolve(upload.text.slice(0, 64 * 1024));
const readText = (upload: FakeFile): Promise<string> => Promise.resolve(upload.text);

/** A made-up GitHub data file with the given seats, started at the given time. */
const githubFile = (name: string, startedAt: string, logins: readonly string[] = [], seatStatus = 'ok'): FakeFile =>
  file(name, textOf([
    header({ startedAt }),
    ...logins.map((login) => recordLine('seat', seatRecord(login, 'octo-org', 'business'))),
    sourceLine('seats', seatStatus, { records: logins.length }),
    END,
  ]));

/** A made-up GitHub data file that also holds the AI usage report of September (and not of August, when it is missing). */
const githubFileWithUsage = (name: string, logins: readonly string[] = []): FakeFile => {
  const lines = USAGE.trimEnd().split('\n');
  return file(name, textOf([
    header({ startedAt: '2026-10-02T08:00:00Z' }),
    ...logins.map((login) => recordLine('seat', seatRecord(login, 'octo-org', 'business'))),
    sourceLine('seats', 'ok', { records: logins.length }),
    usageReportPart('2026-09', 1, 1, lines),
    sourceLine('usage-report', 'ok', { month: '2026-09', records: lines.length - 1 }),
    sourceLine('usage-report', 'failed', { month: '2026-08', records: 0 }),
    END,
  ]));
};

function fakeDependencies(options: { dataset?: boolean; roster?: RosterEntry[]; loadOk?: boolean } = {}) {
  const calls = { loaded: [] as string[][], saved: [] as RosterState[], errors: [] as string[], collections: [] as Collection[], reports: [] as string[][] };
  let dataset = options.dataset ?? false;
  let roster: RosterState = { roster: options.roster ?? [] };
  const dependencies: UploadDeps<FakeFile> = {
    readHead,
    readText,
    readCollection: (upload) => readCollection(new Blob([upload.text]), upload.name),
    setCollection: (collection) => calls.collections.push(collection),
    loadUsage: (files) => {
      calls.loaded.push(files.map((upload) => upload.name));
      if (options.loadOk !== false) dataset = true;
      return Promise.resolve(options.loadOk !== false);
    },
    loadUsageReports: (collection) => {
      calls.reports.push(collection.usageReports.map((report) => report.name));
      if (options.loadOk !== false) dataset = true;
      return Promise.resolve(options.loadOk !== false);
    },
    hasDataset: () => dataset,
    roster: () => roster,
    saveRoster: (newRoster): SaveResult => {
      calls.saved.push(newRoster);
      roster = newRoster;
      return 'saved';
    },
    setError: (message) => calls.errors.push(message),
    today: '2026-04-01',
  };
  return { d: dependencies, calls };
}

describe('upload routing', () => {
  it('knows a CSV by its name or its type', () => {
    expect(isCsvFile({ name: 'report.CSV', size: 1 })).toBe(true);
    expect(isCsvFile({ name: 'report', type: 'text/csv', size: 1 })).toBe(true);
    expect(isCsvFile({ name: 'seats.json', type: 'application/json', size: 1 })).toBe(false);
  });

  it('sends unknown CSV files to the usage loader and refuses other unknown files', () => {
    expect(routeOf('usage', { name: 'x.txt', size: 1 })).toBe('usage');
    expect(routeOf('license', { name: 'x.json', size: 1 })).toBe('license');
    expect(routeOf('unknown', { name: 'odd.csv', size: 1 })).toBe('usage');
    expect(routeOf('unknown', { name: 'photo.png', size: 1 })).toBe('reject');
  });

  it('sorts usage reports, license lists, GitHub data files and other files', async () => {
    const files = [
      file('usage.csv', USAGE),
      file('seats.json', seatsJson('user-a')),
      file('activity.csv', ACTIVITY),
      githubFile('usage-lens-data.ndjson', '2026-10-02T08:00:00Z', ['user-a']),
      file('config.json', '{"theme":"dark"}'),
    ];
    const sorted = await sortUploads(files, readHead);
    expect(sorted.usage.map((upload) => upload.name)).toEqual(['usage.csv']);
    expect(sorted.license.map((upload) => upload.name)).toEqual(['seats.json', 'activity.csv']);
    expect(sorted.collection.map((upload) => upload.name)).toEqual(['usage-lens-data.ndjson']);
    expect(sorted.reject.map((upload) => upload.name)).toEqual(['config.json']);
  });

  it('knows a GitHub data file by its first line, even when seat records follow', () => {
    const text = githubFile('data.ndjson', '2026-10-02T08:00:00Z', ['user-a']).text;
    expect(classifyUpload(text)).toBe('collection');
    expect(classifyUpload(JSON.stringify({ kind: 'header', format: 'something-else' }))).not.toBe('collection');
  });

  it('reads when the collector started', () => {
    expect(collectionStartTime(githubFile('data.ndjson', '2026-10-02T08:00:00Z').text)).toBe(Date.UTC(2026, 9, 2, 8));
    expect(collectionStartTime('\uFEFF' + JSON.stringify(header({ startedAt: '2026-10-03T00:00:00Z' })))).toBe(Date.UTC(2026, 9, 3));
    expect(collectionStartTime('{"kind":"header"}')).toBeNaN();
    expect(collectionStartTime('not json')).toBeNaN();
  });

  it('sends a CSV that cannot be read to the usage loader', async () => {
    const bad = file('broken.csv', '');
    const sorted = await sortUploads([bad], () => Promise.reject(new Error('no')));
    expect(sorted.usage).toEqual([bad]);
  });
});

describe('diffRoster', () => {
  it('counts added, updated, unchanged and removed logins', () => {
    const before: RosterEntry[] = [{ user: 'a', plan: 'business' }, { user: 'b', plan: 'business' }, { user: 'c' }];
    const after: RosterEntry[] = [{ user: 'A', plan: 'business' }, { user: 'b', plan: 'enterprise' }, { user: 'd' }];
    const diff = diffRoster(before, after);
    expect(diff.added).toBe(1);
    expect(diff.removed).toBe(1);
    expect(diff.added + diff.updated + diff.unchanged).toBe(3);
    expect(diff.updated).toBeGreaterThanOrEqual(1);
  });

  it('counts a repeated login once', () => {
    expect(diffRoster([], [{ user: 'a' }, { user: 'a' }])).toEqual({ added: 1, updated: 0, unchanged: 0, removed: 0 });
  });
});

describe('importLicenseFiles', () => {
  it('replaces an empty list, then adds the later files', async () => {
    const done = await importLicenseFiles([file('one.json', seatsJson('user-a', 'user-b')), file('two.json', seatsJson('user-c'))], { roster: [] }, readText, '2026-04-01');
    expect(done.mode).toBe('replace');
    expect(done.changed).toBe(true);
    expect(done.state.roster.map((rosterEntry) => rosterEntry.user).sort()).toEqual(['user-a', 'user-b', 'user-c']);
    expect(done.files.map((fileResult) => fileResult.seats)).toEqual([2, 1]);
  });

  it('adds to an existing list and skips files that are too big or unreadable', async () => {
    const big: FakeFile = { name: 'big.json', size: MAX_LICENSE_BYTES + 1, text: '' };
    const broken = file('broken.json', seatsJson('user-z'));
    const reader = (upload: FakeFile): Promise<string> => (upload.name === 'broken.json' ? Promise.reject(new Error('no')) : readText(upload));
    const done = await importLicenseFiles([big, broken, file('ok.json', seatsJson('user-b'))], { roster: [{ user: 'user-a' }] }, reader);
    expect(done.mode).toBe('add');
    expect(done.files[0].tooBig).toBe(true);
    expect(done.files[1].unreadable).toBe(true);
    expect(done.state.roster.map((rosterEntry) => rosterEntry.user).sort()).toEqual(['user-a', 'user-b']);
  });
});

describe('routeUploads', () => {
  it('says the file is not a CSV when nothing can be used', async () => {
    const { d: dependencies, calls } = fakeDependencies();
    const out = await routeUploads([file('photo.png', 'binary')], dependencies);
    expect(out).toEqual({ usageLoaded: null, notice: null });
    expect(calls.errors).toHaveLength(1);
    expect(calls.loaded).toHaveLength(0);
  });

  it('asks for the usage report first when only a license list arrives', async () => {
    const { d: dependencies, calls } = fakeDependencies();
    const out = await routeUploads([file('seats.json', seatsJson('user-a'))], dependencies);
    expect(out.usageLoaded).toBeNull();
    expect(out.notice).toBeNull();
    expect(calls.errors).toHaveLength(1);
    expect(calls.saved).toHaveLength(0);
  });

  it('loads the usage report, then imports the license list from the same batch', async () => {
    const { d: dependencies, calls } = fakeDependencies();
    const out = await routeUploads([file('seats.json', seatsJson('user-a', 'user-b')), file('usage.csv', USAGE), file('config.json', '{"theme":"dark"}')], dependencies);
    expect(calls.loaded).toEqual([['usage.csv']]);
    expect(out.usageLoaded).toBe(true);
    expect(out.notice?.mode).toBe('replace');
    expect(out.notice?.added).toBe(2);
    expect(out.notice?.total).toBe(2);
    expect(out.notice?.saved).toBe('saved');
    expect(out.notice?.ignored).toEqual(['config.json']);
    expect(calls.errors).toHaveLength(0);
  });

  it('adds a license list to the one already kept when data is loaded', async () => {
    const { d: dependencies, calls } = fakeDependencies({ dataset: true, roster: [{ user: 'user-a' }] });
    const out = await routeUploads([file('more.json', seatsJson('user-b'))], dependencies);
    expect(out.usageLoaded).toBeNull();
    expect(out.notice?.mode).toBe('add');
    expect(out.notice?.added).toBe(1);
    expect(out.notice?.total).toBe(2);
    expect(calls.saved).toHaveLength(1);
  });

  it('does not import a license list when the usage report fails to load', async () => {
    const { d: dependencies, calls } = fakeDependencies({ loadOk: false });
    const out = await routeUploads([file('usage.csv', USAGE), file('seats.json', seatsJson('user-a'))], dependencies);
    expect(out.usageLoaded).toBe(false);
    expect(out.notice).toBeNull();
    expect(calls.saved).toHaveLength(0);
  });
});

describe('routeUploads with a GitHub data file', () => {
  it('asks for the usage report first when only a GitHub data file arrives', async () => {
    const { d: dependencies, calls } = fakeDependencies();
    const out = await routeUploads([githubFile('usage-lens-data.ndjson', '2026-10-02T08:00:00Z', ['user-a'])], dependencies);
    expect(out).toEqual({ usageLoaded: null, notice: null });
    expect(calls.errors).toEqual([COLLECTION_FIRST]);
    expect(calls.collections).toHaveLength(0);
    expect(calls.saved).toHaveLength(0);
  });

  it('keeps the GitHub data and puts its seats in the license list before the license files', async () => {
    const { d: dependencies, calls } = fakeDependencies();
    const out = await routeUploads(
      [file('usage.csv', USAGE), file('more.json', seatsJson('user-c')), githubFile('usage-lens-data.ndjson', '2026-10-02T08:00:00Z', ['user-a', 'user-b'])],
      dependencies,
    );
    expect(out.usageLoaded).toBe(true);
    expect(calls.collections).toHaveLength(1);
    expect(out.notice?.mode).toBe('replace');
    expect(out.notice?.collection).toMatchObject({ name: 'usage-lens-data.ndjson', seats: 2, complete: true, problems: 0, error: null, older: [] });
    expect(out.notice?.files.map((fileResult) => [fileResult.name, fileResult.seats])).toEqual([
      ['usage-lens-data.ndjson', 2],
      ['more.json', 1],
    ]);
    expect(calls.saved.at(-1)?.roster.map((rosterEntry) => rosterEntry.user).sort()).toEqual(['user-a', 'user-b', 'user-c']);
  });

  it('uses only the newest of several GitHub data files', async () => {
    const { d: dependencies, calls } = fakeDependencies({ dataset: true });
    const out = await routeUploads(
      [
        githubFile('old.ndjson', '2026-09-01T08:00:00Z', ['user-old']),
        githubFile('new.ndjson', '2026-10-02T08:00:00Z', ['user-new']),
        githubFile('middle.ndjson', '2026-09-15T08:00:00Z', ['user-middle']),
      ],
      dependencies,
    );
    expect(out.notice?.collection?.name).toBe('new.ndjson');
    expect(out.notice?.collection?.older).toEqual(['old.ndjson', 'middle.ndjson']);
    expect(calls.collections).toHaveLength(1);
    expect(calls.saved.at(-1)?.roster.map((rosterEntry) => rosterEntry.user)).toEqual(['user-new']);
  });

  it('adds a seat list that came back only in part and says it may be short', async () => {
    const { d: dependencies, calls } = fakeDependencies({ dataset: true, roster: [{ user: 'user-a' }] });
    const out = await routeUploads([githubFile('usage-lens-data.ndjson', '2026-10-02T08:00:00Z', ['user-b'], 'partial')], dependencies);
    expect(out.notice?.mode).toBe('add');
    expect(out.notice?.collection?.problems).toBe(1);
    expect(out.notice?.files[0].problems).toContain('Some organizations did not give their seat list, so the list may be short.');
    expect(calls.saved.at(-1)?.roster.map((rosterEntry) => rosterEntry.user).sort()).toEqual(['user-a', 'user-b']);
  });

  it('keeps the GitHub data without changing the license list when it has no seats', async () => {
    const { d: dependencies, calls } = fakeDependencies({ dataset: true, roster: [{ user: 'user-a' }] });
    const out = await routeUploads([githubFile('usage-lens-data.ndjson', '2026-10-02T08:00:00Z')], dependencies);
    expect(calls.collections).toHaveLength(1);
    expect(out.notice?.mode).toBeNull();
    expect(out.notice?.collection?.seats).toBe(0);
    expect(calls.saved).toHaveLength(0);
  });

  it('loads the usage data from the AI usage report in the GitHub data file when no CSV is chosen', async () => {
    const { d: dependencies, calls } = fakeDependencies();
    const out = await routeUploads([githubFileWithUsage('usage-lens-data.ndjson.gz', ['user-a'])], dependencies);
    expect(out.usageLoaded).toBe(true);
    expect(calls.loaded).toHaveLength(0);
    expect(calls.reports).toEqual([['ai-usage-report-2026-09.csv']]);
    expect(calls.errors).toHaveLength(0);
    expect(calls.collections).toHaveLength(1);
    expect(out.notice?.collection).toMatchObject({ usageMonths: ['2026-09'], usageMissing: ['2026-08'], usageNotUsed: false });
    expect(calls.saved.at(-1)?.roster.map((rosterEntry) => rosterEntry.user)).toEqual(['user-a']);
  });

  it('uses a usage report CSV of the same batch instead of the one in the GitHub data file', async () => {
    const { d: dependencies, calls } = fakeDependencies();
    const out = await routeUploads([githubFileWithUsage('usage-lens-data.ndjson'), file('usage.csv', USAGE)], dependencies);
    expect(calls.loaded).toEqual([['usage.csv']]);
    expect(calls.reports).toHaveLength(0);
    expect(out.notice?.collection).toMatchObject({ usageMonths: [], usageMissing: [], usageNotUsed: true });
  });

  it('keeps nothing from the GitHub data file when its AI usage report fails to load', async () => {
    const { d: dependencies, calls } = fakeDependencies({ loadOk: false });
    const out = await routeUploads([githubFileWithUsage('usage-lens-data.ndjson', ['user-a'])], dependencies);
    expect(out).toEqual({ usageLoaded: false, notice: null });
    expect(calls.reports).toHaveLength(1);
    expect(calls.collections).toHaveLength(0);
    expect(calls.saved).toHaveLength(0);
    // The loader shows its own error.
    expect(calls.errors).toHaveLength(0);
  });

  it('says why a GitHub data file could not be read when no data is loaded', async () => {
    const { d: dependencies, calls } = fakeDependencies();
    const out = await routeUploads([file('usage-lens-data.ndjson', textOf([header({ version: 99 }), END]))], dependencies);
    expect(out).toEqual({ usageLoaded: null, notice: null });
    expect(calls.reports).toHaveLength(0);
    expect(calls.errors).toHaveLength(1);
    expect(calls.errors[0]).toMatch(/newer version/);
  });

  it('says why a GitHub data file could not be used', async () => {
    const { d: dependencies, calls } = fakeDependencies({ dataset: true });
    const newer = file('usage-lens-data.ndjson', textOf([header({ version: 99 }), END]));
    const out = await routeUploads([newer], dependencies);
    expect(calls.collections).toHaveLength(0);
    expect(out.notice?.collection?.error).toMatch(/newer version/);
    expect(out.notice?.mode).toBeNull();
  });
});

describe('rosterKind', () => {
  it('names where the license list came from', () => {
    expect(rosterKind([])).toBeNull();
    expect(rosterKind([{ user: 'a' }])).toBe('list');
    expect(rosterKind([{ user: 'a', source: 'activity' }])).toBe('activity');
    expect(rosterKind([{ user: 'a', source: 'activity' }, { user: 'b', source: 'api' }])).toBe('api');
  });
});
