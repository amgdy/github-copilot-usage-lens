import { t, tp } from '../../i18n/core.ts';
import { fmtInt } from '../utils/format';
import { parseSeatsCsv } from './csv';
import type { ReadStats } from './fields';
import { MAX_SEATS, parseSeatsJson, seatsFromValues, type JsonSeats } from './json';
import { looksTabular, parseLoginList } from './list';
import { latestStamp, mergeSeats } from './merge';
import type { LicenseParse } from './types';

const JSON_NAME = /\.(json|ndjson|jsonl)$/i;
const MIN_LIST_SHARE = 0.5;

function unknown(problems: string[]): LicenseParse {
  return { kind: 'unknown', seats: [], records: 0, skipped: 0, problems };
}

interface Tally {
  records: number;
  total?: number;
  skipped: number;
  stats: ReadStats;
  capped: boolean;
}

/**
 * The notes that every format shares: empty file, partial export, skipped entries, unreadable values, size cap.
 * Each note is one whole sentence group from the dictionary, so word order can differ in another language.
 */
function commonProblems(tally: Tally): string[] {
  const out: string[] = [];
  const max = fmtInt(MAX_SEATS);
  if (tally.records === 0) out.push(t('The file has no seats.'));
  if (tally.total !== undefined && tally.records + tally.skipped < tally.total) {
    out.push(
      t('The file has {n} of {total} seats. Some pages may be missing. Save every page, for example with gh api --paginate.', {
        n: fmtInt(tally.records),
        total: fmtInt(tally.total),
      }),
    );
  }
  if (tally.skipped > 0) {
    out.push(
      tp(tally.skipped, '{n} entry without a username was left out.', '{n} entries without a username were left out.', {
        n: fmtInt(tally.skipped),
      }),
    );
  }
  if (tally.stats.unreadableDates > 0) {
    out.push(
      tp(
        tally.stats.unreadableDates,
        '{n} date could not be read. It was treated as missing.',
        '{n} dates could not be read. They were treated as missing.',
        { n: fmtInt(tally.stats.unreadableDates) },
      ),
    );
  }
  if (tally.stats.unreadablePlans > 0) {
    out.push(
      tp(
        tally.stats.unreadablePlans,
        '{n} plan could not be read. It was left empty.',
        '{n} plans could not be read. They were left empty.',
        { n: fmtInt(tally.stats.unreadablePlans) },
      ),
    );
  }
  if (tally.capped) out.push(t('The file has more than {max} seats. Only the first {max} were read.', { max }));
  return out;
}

function fromJson(body: string): LicenseParse {
  return fromJsonSeats(parseSeatsJson(body));
}

function fromJsonSeats(json: JsonSeats): LicenseParse {
  const problems: string[] = [];
  if (json.errors.length > 0) {
    problems.push(
      t(
        'GitHub returned an error ("{error}") instead of a seat list. Check the organization or enterprise name. Check that the token has the manage_billing:copilot, read:org or read:enterprise scope.',
        { error: json.errors[0] },
      ),
    );
  }
  if (!json.seatShaped && json.records.length === 0) {
    if (json.errors.length === 0) {
      problems.push(
        t(
          'No GitHub Copilot seats were found in this JSON file. Use the output of the GitHub seats API. It has a "seats" list, and each seat has an assignee with a login.',
        ),
      );
    }
    if (json.truncated) problems.push(t('The file ends in the middle of an entry. It may have been cut short.'));
    return unknown(problems);
  }
  if (json.truncated) problems.push(t('The file ends in the middle of an entry. It may have been cut short.'));
  if (json.garbage > 0) {
    problems.push(
      tp(
        json.garbage,
        '{n} piece of the file could not be read as JSON. It was left out.',
        '{n} pieces of the file could not be read as JSON. They were left out.',
        { n: fmtInt(json.garbage) },
      ),
    );
  }
  problems.push(...commonProblems({ records: json.records.length, total: json.total, skipped: json.skipped, stats: json.stats, capped: json.capped }));
  const seats = mergeSeats(json.records);
  return { kind: 'seats-json', seats, records: json.records.length, total: json.total, skipped: json.skipped, problems, exportedAt: latestStamp(seats) };
}

function fromText(body: string): LicenseParse {
  const csv = parseSeatsCsv(body);
  if (csv.header === 'usage') {
    return unknown([t('This file is a usage report, not a license list. Load it with the other usage reports.')]);
  }
  if (csv.header === 'seats') {
    const seats = mergeSeats(csv.records);
    const problems = commonProblems({
      records: csv.records.length,
      skipped: csv.skipped,
      stats: csv.stats,
      capped: csv.capped,
    });
    return {
      kind: csv.activityReport ? 'activity-csv' : 'seats-csv',
      seats,
      records: csv.records.length,
      skipped: csv.skipped,
      problems,
      exportedAt: csv.reportDay ?? latestStamp(seats),
    };
  }
  if (looksTabular(body)) {
    return unknown([t('The table has no username column. Name the column with the GitHub usernames "login" or "username".')]);
  }
  const list = parseLoginList(body);
  const valid = list.seats.length;
  if (valid === 0) {
    return unknown([t('No GitHub usernames were found. A list of usernames has one username per line, or usernames separated by commas.')]);
  }
  if (valid / (valid + list.skipped) < MIN_LIST_SHARE) {
    return unknown([t('Most entries in the file are not GitHub usernames, so it was not read as a list of usernames.')]);
  }
  const problems: string[] = [];
  if (list.skipped > 0) {
    problems.push(
      tp(list.skipped, '{n} entry that is not a GitHub username was left out.', '{n} entries that are not GitHub usernames were left out.', {
        n: fmtInt(list.skipped),
      }),
    );
  }
  if (list.capped) problems.push(t('The list has more than {max} usernames. Only the first {max} were read.', { max: fmtInt(MAX_SEATS) }));
  return { kind: 'login-list', seats: mergeSeats(list.seats), records: valid, skipped: list.skipped, problems };
}

function parseInner(raw: string, fileName: string): LicenseParse {
  const body = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  if (body.trim() === '') return unknown([t('The file is empty.')]);
  const head = body.slice(0, 1024).trimStart();
  if (head.startsWith('{') || head.startsWith('[')) return fromJson(body);
  // A .json file with text in front of the first bracket (a warning line from a script) is still scanned for seats.
  if (JSON_NAME.test(fileName)) {
    const parsed = fromJson(body);
    if (parsed.kind !== 'unknown') return parsed;
  }
  return fromText(body);
}

/**
 * Reads a license export: the REST seats response (one object, a bare array, an array of pages from `gh --slurp`,
 * objects written back to back by `gh --paginate`, or NDJSON), the Activity report CSV, a CSV with a login column,
 * or a plain list of logins. Never throws: input that is none of these comes back as kind "unknown" with notes
 * that say why. Logins are matched later without regard to case, the original spelling is kept for display.
 */
export function parseLicenseFile(text: string, fileName?: string): LicenseParse {
  try {
    return parseInner(typeof text === 'string' ? text : '', fileName ?? '');
  } catch {
    return unknown([t('The file could not be read as a license list.')]);
  }
}

/** Reads a seat list that is already parsed, in the shape of the REST seats response: { total_seats, seats: [...] }. Never throws. */
export function parseLicenseValue(value: unknown): LicenseParse {
  try {
    return fromJsonSeats(seatsFromValues([value]));
  } catch {
    return unknown([t('The file could not be read as a license list.')]);
  }
}
