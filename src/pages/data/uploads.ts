import { create } from 'zustand';
import { msg, t } from '../../i18n';
import type { RosterEntry, SaveResult } from '../../lib/analytics/settings';
import { CollectionError, collectionLicenseParse, sourceComplete, type Collection } from '../../lib/collection';
import { applyLicenseImport, classifyUpload, loginKey, parseLicenseFile, type LicenseKind, type LicenseParse, type RosterMode, type UploadKind } from '../../lib/licenses';

/** Bytes read from the start of each file to sort it. More than 4 KB of text, so classifyUpload can tell a cut-off file. */
export const SNIFF_BYTES = 64 * 1024;

/** The largest license list accepted. A 20,000-seat list with every detail is about 4.3 MB. */
export const MAX_LICENSE_BYTES = 25 * 1024 * 1024;

/** The parts of a File the routing needs, so tests can pass plain objects. */
export interface UploadFile {
  name: string;
  type?: string;
  size: number;
}

/** Where a picked or dropped file goes. */
export type UploadRoute = 'usage' | 'license' | 'collection' | 'reject';

export const NOT_A_CSV = msg('That does not look like a CSV file. Choose the AI usage report you downloaded from GitHub (.csv).');
export const LICENSE_FIRST = msg('This is a license list. Load your usage report first, then import the list on the Licenses page.');
export const COLLECTION_FIRST = msg('This GitHub data file has no AI usage report. Choose it together with the usage report CSV from GitHub billing.');

const CSV_TYPES = new Set(['text/csv', 'application/vnd.ms-excel']);

export const isCsvFile = (file: UploadFile): boolean => /\.csv$/i.test(file.name) || CSV_TYPES.has(file.type ?? '');

/**
 * Usage reports load as before, license lists go to the license list and GitHub data files of the collector scripts
 * are read next to the report. A CSV that is none of these still goes to the usage loader, so the reader gets its
 * message about missing columns. Any other file is refused.
 */
export function routeOf(kind: UploadKind, file: UploadFile): UploadRoute {
  if (kind === 'usage' || kind === 'license' || kind === 'collection') return kind;
  return isCsvFile(file) ? 'usage' : 'reject';
}

export interface SortedUploads<F extends UploadFile> {
  usage: F[];
  license: F[];
  collection: F[];
  reject: F[];
}

/** Reads the start of every file and sorts the files by route. A file that cannot be read goes to the usage loader when it is a CSV. */
export async function sortUploads<F extends UploadFile>(files: readonly F[], readHead: (file: F) => Promise<string>): Promise<SortedUploads<F>> {
  const out: SortedUploads<F> = { usage: [], license: [], collection: [], reject: [] };
  for (const file of files) {
    let kind: UploadKind = 'unknown';
    try {
      kind = classifyUpload(await readHead(file), file.name);
    } catch {
      kind = 'unknown';
    }
    out[routeOf(kind, file)].push(file);
  }
  return out;
}

/** What one license file gave. */
export interface LicenseFileResult {
  name: string;
  kind: LicenseKind;
  seats: number;
  skipped: number;
  problems: string[];
  /** Larger than MAX_LICENSE_BYTES, so it was not read. */
  tooBig: boolean;
  /** The file could not be read. */
  unreadable: boolean;
}

/** What the GitHub data file of a batch gave. */
export interface CollectionFileResult {
  name: string;
  /** Data lines in the file. */
  records: number;
  /** Seats in the file, added to the license list. */
  seats: number;
  /** The file has its end line, so the script finished. */
  complete: boolean;
  /** Parts of the data that failed or came back only in part. */
  problems: number;
  /** Why the file could not be read. Null when it was read. */
  error: string | null;
  /** Older GitHub data files of the same batch, which were not used. */
  older: string[];
  /** Months of the AI usage report in the file that were loaded as the usage data. Empty when a CSV was used. */
  usageMonths: string[];
  /** Months the script read that have no AI usage report in the file. Only set when usageMonths is not empty. */
  usageMissing: string[];
  /** The file has an AI usage report, but a usage report CSV of the same batch was used instead. */
  usageNotUsed: boolean;
}

/** The result of a batch, shown on the Data page until the reader closes it. */
export interface UploadNotice {
  at: number;
  /** How the first seat list was applied: 'replace' when there was no list yet. Null when no file had seats. */
  mode: RosterMode | null;
  files: LicenseFileResult[];
  /** The GitHub data file of the batch. Null when the batch had none. */
  collection: CollectionFileResult | null;
  /** The whole batch against the list before it. */
  added: number;
  updated: number;
  unchanged: number;
  removed: number;
  /** Seats on the list after the batch. */
  total: number;
  /** How the settings were kept in this browser. Null when the list did not change. */
  saved: SaveResult | null;
  /** Files that are neither a usage report nor a license list. */
  ignored: string[];
}

export interface RosterState {
  roster: RosterEntry[];
  rosterAsOf?: string;
}

/** Compares two lists by login: who is new, who changed, who stayed the same and who is gone. */
export function diffRoster(before: readonly RosterEntry[], after: readonly RosterEntry[]): { added: number; updated: number; unchanged: number; removed: number } {
  const old = new Map(before.map((seat) => [loginKey(seat.user), JSON.stringify(seat)]));
  const now = new Set<string>();
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  for (const seat of after) {
    const key = loginKey(seat.user);
    if (now.has(key)) continue;
    now.add(key);
    const had = old.get(key);
    if (had === undefined) added++;
    else if (had === JSON.stringify(seat)) unchanged++;
    else updated++;
  }
  let removed = 0;
  for (const key of old.keys()) if (!now.has(key)) removed++;
  return { added, updated, unchanged, removed };
}

/** Adds a parsed seat list: it replaces the list when there is none yet and adds to it otherwise. */
function applySeats(state: RosterState, parse: LicenseParse, today?: string): { state: RosterState; step: RosterMode } {
  const step: RosterMode = state.roster.length === 0 ? 'replace' : 'add';
  const imported = applyLicenseImport(parse, state, step, today);
  return { state: { roster: imported.roster, rosterAsOf: imported.rosterAsOf }, step };
}

/**
 * Imports license files one after the other. The first file replaces the list when there is none yet and adds to it
 * otherwise; every later file adds. A file without seats changes nothing.
 */
export async function importLicenseFiles<F extends UploadFile>(
  files: readonly F[],
  current: RosterState,
  readText: (file: F) => Promise<string>,
  today?: string,
): Promise<{ state: RosterState; changed: boolean; mode: RosterMode | null; files: LicenseFileResult[] }> {
  let state: RosterState = { roster: [...current.roster], rosterAsOf: current.rosterAsOf };
  let mode: RosterMode | null = null;
  const results: LicenseFileResult[] = [];
  for (const file of files) {
    const base: LicenseFileResult = { name: file.name, kind: 'unknown', seats: 0, skipped: 0, problems: [], tooBig: false, unreadable: false };
    if (file.size > MAX_LICENSE_BYTES) {
      results.push({ ...base, tooBig: true });
      continue;
    }
    let text: string;
    try {
      text = await readText(file);
    } catch {
      results.push({ ...base, unreadable: true });
      continue;
    }
    const parse = parseLicenseFile(text, file.name);
    results.push({ ...base, kind: parse.kind, seats: parse.seats.length, skipped: parse.skipped, problems: parse.problems });
    if (parse.seats.length === 0) continue;
    const applied = applySeats(state, parse, today);
    mode ??= applied.step;
    state = applied.state;
  }
  return { state, changed: mode !== null, mode, files: results };
}

/** When the collector started, from the header line at the start of a GitHub data file. NaN when it cannot be read. */
export function collectionStartTime(head: string): number {
  const firstLine = head.replace(/^\uFEFF/, '').trimStart().split('\n', 1)[0];
  try {
    const header = JSON.parse(firstLine) as { startedAt?: unknown };
    return typeof header.startedAt === 'string' ? Date.parse(header.startedAt) : Number.NaN;
  } catch {
    return Number.NaN;
  }
}

/** The GitHub data file the collector made last. A file whose start time cannot be read counts as the oldest. */
async function newestCollection<F extends UploadFile>(files: readonly F[], readHead: (file: F) => Promise<string>): Promise<F> {
  let newest = files[0];
  let newestTime = Number.NEGATIVE_INFINITY;
  for (const file of files) {
    let time = Number.NaN;
    try {
      time = collectionStartTime(await readHead(file));
    } catch {
      time = Number.NaN;
    }
    if (!Number.isNaN(time) && time > newestTime) {
      newest = file;
      newestTime = time;
    }
  }
  return newest;
}

export interface UploadDeps<F extends UploadFile> {
  /** The first SNIFF_BYTES of the file as text (unpacked when the file is gzip). */
  readHead: (file: F) => Promise<string>;
  readText: (file: F) => Promise<string>;
  /** Reads a GitHub data file of the collector scripts. Throws a CollectionError when the file cannot be used. */
  readCollection: (file: F) => Promise<Collection>;
  /** Keeps the GitHub data next to the loaded report (in memory only). */
  setCollection: (collection: Collection) => void;
  /** Replaces the loaded data with the usage files. Resolves true on success and shows its own errors. */
  loadUsage: (files: F[]) => Promise<boolean>;
  /** Replaces the loaded data with the AI usage report in a GitHub data file. Like loadUsage. */
  loadUsageReports: (collection: Collection) => Promise<boolean>;
  hasDataset: () => boolean;
  roster: () => RosterState;
  /** Stores the new list in the settings and says how it was kept. */
  saveRoster: (state: RosterState) => SaveResult;
  setError: (message: string) => void;
  today?: string;
}

export interface UploadOutcome {
  /** True when the usage files loaded, false when they failed, null when the batch had none. */
  usageLoaded: boolean | null;
  /** Set when the batch had license files or a GitHub data file that were read (even without seats). */
  notice: UploadNotice | null;
}

interface ReadCollectionFile {
  result: CollectionFileResult;
  /** Null when the file could not be read; result.error says why. */
  collection: Collection | null;
}

/** Reads the newest GitHub data file of the batch. */
async function readNewestCollection<F extends UploadFile>(files: readonly F[], dependencies: UploadDeps<F>): Promise<ReadCollectionFile> {
  const chosen = await newestCollection(files, dependencies.readHead);
  const older = files.filter((file) => file !== chosen).map((file) => file.name);
  const result: CollectionFileResult = {
    name: chosen.name, records: 0, seats: 0, complete: false, problems: 0, error: null, older, usageMonths: [], usageMissing: [], usageNotUsed: false,
  };
  try {
    return { result, collection: await dependencies.readCollection(chosen) };
  } catch (error) {
    result.error = error instanceof CollectionError ? error.message : t('{name} could not be read.', { name: chosen.name });
    return { result, collection: null };
  }
}

/**
 * Keeps the GitHub data file that was read. Its seats are returned for the license list. `usageFromFile` is true when
 * its AI usage report became the loaded usage data.
 */
function takeCollection<F extends UploadFile>(read: ReadCollectionFile, dependencies: UploadDeps<F>, usageFromFile: boolean): { result: CollectionFileResult; seats: LicenseParse | null } {
  const { result, collection } = read;
  if (collection === null) return { result, seats: null };
  dependencies.setCollection(collection);
  const seats = collection.seats.length > 0 ? collectionLicenseParse(collection) : null;
  result.records = collection.records;
  result.seats = seats?.seats.length ?? 0;
  result.complete = collection.complete;
  result.problems = collection.sources.filter((source) => source.status === 'failed' || source.status === 'partial').length;
  const reportMonths = [...new Set(collection.usageReports.map((report) => report.month))];
  if (usageFromFile) {
    result.usageMonths = reportMonths;
    result.usageMissing = collection.header.months.filter((month) => !reportMonths.includes(month));
  } else {
    result.usageNotUsed = reportMonths.length > 0;
  }
  // A seat list that came back only in part is still added, like a license file; it never removes seats.
  if (seats !== null && !sourceComplete(collection.sources, 'seats')) seats.problems.push(t('Some organizations did not give their seat list, so the list may be short.'));
  return { result, seats };
}

/**
 * Sends each file where it belongs. Usage reports replace the loaded data. Without a usage report in the batch, the AI
 * usage report inside the newest GitHub data file replaces it, so that one file is enough. License lists and GitHub
 * data files are taken once usage data is loaded, from this batch or before. Alone with no usage data they get the
 * LICENSE_FIRST or COLLECTION_FIRST message. Of several GitHub data files, the newest is used. Its seats go to the
 * license list first, then the license files are added.
 */
export async function routeUploads<F extends UploadFile>(files: readonly F[], dependencies: UploadDeps<F>): Promise<UploadOutcome> {
  const sorted = await sortUploads(files, dependencies.readHead);
  const ignored = sorted.reject.map((file) => file.name);
  const extras = sorted.license.length + sorted.collection.length;

  if (sorted.usage.length === 0 && extras === 0) {
    dependencies.setError(t(NOT_A_CSV));
    return { usageLoaded: null, notice: null };
  }

  let usageLoaded: boolean | null = null;
  let read: ReadCollectionFile | null = null;
  if (sorted.usage.length > 0) usageLoaded = await dependencies.loadUsage(sorted.usage);
  else if (sorted.collection.length > 0) {
    read = await readNewestCollection(sorted.collection, dependencies);
    if (read.collection !== null && read.collection.usageReports.length > 0) usageLoaded = await dependencies.loadUsageReports(read.collection);
  }
  const usageFromFile = read !== null && usageLoaded === true;

  if (extras === 0 || !dependencies.hasDataset()) {
    if (extras > 0 && usageLoaded === null) {
      const readError = read?.result.error ?? null;
      dependencies.setError(readError ?? t(sorted.collection.length > 0 ? COLLECTION_FIRST : LICENSE_FIRST));
    }
    const notice = ignored.length > 0 && usageLoaded ? emptyNotice(ignored, dependencies.roster().roster.length) : null;
    return { usageLoaded, notice };
  }

  const before = dependencies.roster();
  let state: RosterState = before;
  let mode: RosterMode | null = null;
  let collection: CollectionFileResult | null = null;
  const fileResults: LicenseFileResult[] = [];
  if (sorted.collection.length > 0) {
    const taken = takeCollection(read ?? (await readNewestCollection(sorted.collection, dependencies)), dependencies, usageFromFile);
    collection = taken.result;
    if (taken.seats !== null) {
      const applied = applySeats(state, taken.seats, dependencies.today);
      mode = applied.step;
      state = applied.state;
      fileResults.push({ name: collection.name, kind: 'seats-json', seats: taken.seats.seats.length, skipped: taken.seats.skipped, problems: taken.seats.problems, tooBig: false, unreadable: false });
    }
  }
  const done = await importLicenseFiles(sorted.license, state, dependencies.readText, dependencies.today);
  mode ??= done.mode;
  fileResults.push(...done.files);
  const saved = mode !== null ? dependencies.saveRoster(done.state) : null;
  const diff = diffRoster(before.roster, done.state.roster);
  return {
    usageLoaded,
    notice: { at: Date.now(), mode, files: fileResults, collection, ...diff, total: done.state.roster.length, saved, ignored },
  };
}

function emptyNotice(ignored: string[], total: number): UploadNotice {
  return { at: Date.now(), mode: null, files: [], collection: null, added: 0, updated: 0, unchanged: total, removed: 0, total, saved: null, ignored };
}

/** The last batch result, so the Data page can show it after a drop on the start page. */
export const useUploadNotice = create<{ notice: UploadNotice | null; show: (notice: UploadNotice | null) => void }>((set) => ({
  notice: null,
  show: (notice) => set({ notice }),
}));
