import { useRef, type ChangeEvent } from 'react';
import { FileUp } from 'lucide-react';
import { Callout, ProgressBar, Spinner } from '../../components/ui';
import { msg, t, tp } from '../../i18n';
import { isGzip, monthOfKey, readCollection, readHeadText, type Collection } from '../../lib/collection';
import { classifyUpload, type LicenseKind } from '../../lib/licenses';
import { monthLabel } from '../../lib/utils/date';
import { fmtInt, pluralize } from '../../lib/utils/format';
import { loadFiles, loadSources } from '../../state/loadDataset';
import { navigate } from '../../state/router';
import { useApp } from '../../state/store';
import { listNames } from './text';
import { SNIFF_BYTES, routeUploads, useUploadNotice, type CollectionFileResult, type LicenseFileResult, type UploadNotice, type UploadOutcome } from './uploads';

/**
 * File types the pickers accept: usage reports (CSV), license lists (JSON, CSV or a text list of usernames) and the
 * GitHub data file of the collector scripts (NDJSON, usually gzip).
 */
export const UPLOAD_ACCEPT = '.csv,.json,.ndjson,.gz,.txt,text/csv,application/json,application/gzip,application/x-ndjson,text/plain';

/**
 * The start of a file as text. A gzip file is unpacked only when it is a GitHub data file, because the usage report and
 * license list readers take plain text only.
 */
async function readUploadHead(file: File): Promise<string> {
  if (!(await isGzip(file))) return file.slice(0, SNIFF_BYTES).text();
  const head = await readHeadText(file, SNIFF_BYTES);
  return classifyUpload(head, file.name) === 'collection' ? head : '';
}

/** Makes the AI usage report inside a GitHub data file the loaded data, named after the file. */
const loadUsageReports = (collection: Collection): Promise<boolean> =>
  loadSources(collection.usageReports.map((report) => ({ name: report.name, data: report.data })), { text: collection.fileName }, { keepLoading: true });

/**
 * Sorts the files and sends each one where it belongs: usage reports replace the loaded data, license lists go to the
 * license list in the settings, and a GitHub data file is kept next to the report. Without a usage report in the batch,
 * the AI usage report inside the GitHub data file is loaded. The result is kept for the Data page.
 */
export async function takeUploads(files: File[]): Promise<UploadOutcome> {
  const app = useApp.getState();
  if (app.loading !== null) return { usageLoaded: null, notice: null };
  const isCurrent = () => useApp.getState().dataVersion === app.dataVersion;
  app.setLoading({ label: t('Reading…'), fraction: 0, rows: 0 });
  app.setError(null);
  useUploadNotice.getState().show(null);
  try {
    const outcome = await routeUploads(files, {
      isCurrent,
      readHead: readUploadHead,
      readText: (file) => file.text(),
      readCollection: (file) => readCollection(file, file.name),
      setCollection: (collection) => useApp.getState().setCollection(collection),
      loadUsage: (usageFiles) => loadFiles(usageFiles, { keepLoading: true }),
      loadUsageReports,
      hasDataset: () => useApp.getState().dataset !== null,
      roster: () => {
        const settings = useApp.getState().settings;
        return { roster: settings.roster, rosterAsOf: settings.rosterAsOf };
      },
      saveRoster: (state) => {
        useApp.getState().updateSettings({ roster: state.roster, rosterAsOf: state.rosterAsOf });
        return useApp.getState().settingsSaved;
      },
      setError: (message) => useApp.getState().setError(message),
    });
    if (isCurrent()) useUploadNotice.getState().show(outcome.notice);
    return outcome;
  } finally {
    if (isCurrent()) app.setLoading(null);
  }
}

/** Picks usage reports or a license list. Usage reports replace the loaded data; a license list is added to the license list. */
export function LoadButton() {
  const input = useRef<HTMLInputElement>(null);
  const busy = useApp((state) => state.loading !== null);

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (picked.length) void takeUploads(picked);
  };

  return (
    <>
      <input ref={input} type="file" multiple accept={UPLOAD_ACCEPT} className="hidden" onChange={onPick} aria-label={t('Choose files to load')} />
      <button
        type="button"
        className="btn"
        disabled={busy}
        onClick={() => input.current?.click()}
        title={t(
          'A usage report replaces the loaded data. Select every report you want in one go: they are joined, and a row that repeats a row from an earlier file is dropped. A GitHub Copilot license list is added to your license list. A GitHub data file from the collector script adds budgets, seats and billing.',
        )}
      >
        <FileUp size={14} /> {t('Load other files')}
      </button>
    </>
  );
}

/** Progress and errors of a load started from this page. The shell only shows them while no data is loaded. */
export function LoadStatus() {
  const loading = useApp((state) => state.loading);
  const error = useApp((state) => state.error);

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        <Callout tone="info" title={t('Loading files')}>
          <div className="flex items-center gap-3">
            <Spinner />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="truncate text-sm">{loading.label}</div>
              <ProgressBar value={loading.fraction} />
              <div className="num text-xs text-fg-muted">{loading.rows > 0 ? t('{n} rows read', { n: fmtInt(loading.rows) }) : t('Starting…')}</div>
            </div>
          </div>
        </Callout>
      </div>
    );
  }

  if (error) {
    return (
      <Callout
        tone="bad"
        title={t('The files could not be loaded')}
        action={
          <button type="button" className="btn btn-sm" onClick={() => useApp.getState().setError(null)}>
            {t('Close')}
          </button>
        }
      >
        {error} {t('The data that was already loaded is unchanged.')}
      </Callout>
    );
  }

  return null;
}

const KIND_LABEL: Record<LicenseKind, string> = {
  'seats-json': msg('Seat list from the GitHub API (JSON)'),
  'activity-csv': msg('Activity report (CSV)'),
  'seats-csv': msg('Seat list (CSV)'),
  'login-list': msg('List of usernames'),
  unknown: msg('Not a license list'),
};

export const licenseKindLabel = (kind: LicenseKind): string => t(KIND_LABEL[kind]);

function fileLine(file: LicenseFileResult): string {
  if (file.tooBig) return t('{name} is larger than 25 MB, so it was not read. A license list is much smaller. Check that this is the right file.', { name: file.name });
  if (file.unreadable) return t('{name} could not be read.', { name: file.name });
  if (file.seats === 0) return t('{name}: no seats found.', { name: file.name });
  return t('{name}: {kind}, {seats}.', { name: file.name, kind: licenseKindLabel(file.kind), seats: pluralize(file.seats, 'seat') });
}

const monthNames = (months: readonly string[]): string => listNames(months.map((month) => monthLabel(monthOfKey(month))), 24);

/** What the GitHub data file of the batch gave, one sentence per line. */
function collectionLines(collection: CollectionFileResult): string[] {
  if (collection.error !== null) return [t('{name}: {problem}', { name: collection.name, problem: collection.error })];
  const lines = [t('{name}: GitHub data file, {records}.', { name: collection.name, records: pluralize(collection.records, 'record') })];
  if (collection.usageMonths.length > 0) {
    lines.push(t('The usage data comes from the AI usage report in this file: {months}.', { months: monthNames(collection.usageMonths) }));
  }
  if (collection.usageEmpty.length > 0) {
    lines.push(t('The AI usage report for {months} has no usage.', { months: monthNames(collection.usageEmpty) }));
  }
  if (collection.usageOpenEmpty !== null) {
    lines.push(t('The AI usage report for {month} has no usage yet. Run the script again later to add new usage.', { month: monthNames([collection.usageOpenEmpty]) }));
  }
  if (collection.usageWaiting.length > 0) {
    lines.push(t('GitHub had not made the AI usage report for {months} yet. Run the script again in a few minutes to add it.', { months: monthNames(collection.usageWaiting) }));
  }
  if (collection.usageMissing.length > 0) {
    lines.push(t('GitHub did not give the AI usage report for {months}. The Data page says why.', { months: monthNames(collection.usageMissing) }));
  }
  if (collection.usageNotUsed) lines.push(t('The AI usage report in this file was not used, because you chose a usage report CSV too.'));
  if (!collection.complete) lines.push(t('The file ends early, so some data may be missing. Run the script again and wait until it says the file is saved.'));
  if (collection.problems > 0) {
    lines.push(
      tp(collection.problems, '{n} part of the data failed or came back only in part. The Data page lists it.', '{n} parts of the data failed or came back only in part. The Data page lists them.', {
        n: fmtInt(collection.problems),
      }),
    );
  }
  if (collection.older.length > 0) lines.push(t('Only the newest GitHub data file is used. Not used: {names}.', { names: listNames(collection.older) }));
  return lines;
}

function noticeTitle(notice: UploadNotice): string {
  const collection = notice.collection;
  if (collection !== null) return collection.error === null ? t('GitHub data loaded') : t('The GitHub data file was not loaded');
  if (notice.mode !== null) return t('License list updated');
  return notice.files.length > 0 ? t('The license list did not change') : t('Some files were not loaded');
}

function noticeTone(notice: UploadNotice): 'good' | 'warn' | 'bad' | 'info' {
  const collection = notice.collection;
  if (collection?.error) return 'bad';
  const collectionOk = collection === null || (collection.complete && collection.problems === 0 && collection.usageWaiting.length === 0 && collection.usageMissing.length === 0);
  if (notice.mode !== null) return notice.saved === 'saved' && collectionOk ? 'good' : 'warn';
  if (collection !== null) return collectionOk && notice.files.length === 0 ? 'good' : 'warn';
  return notice.files.length > 0 ? 'warn' : 'info';
}

/** The result of the last batch of files: what each license file gave, how the list changed, and how it was kept. */
export function UploadNoticeCallout() {
  const notice = useUploadNotice((state) => state.notice);
  return notice ? <NoticeBody notice={notice} /> : null;
}

function NoticeBody({ notice }: { notice: UploadNotice }) {
  const changed = notice.mode !== null;
  const close = () => useUploadNotice.getState().show(null);

  return (
    <div role="status" aria-live="polite">
      <Callout
        tone={noticeTone(notice)}
        title={noticeTitle(notice)}
        action={
          <div className="flex flex-wrap gap-1.5">
            {changed ? (
              <button type="button" className="btn btn-sm" onClick={() => navigate('licenses')}>
                {t('Open the Licenses page')}
              </button>
            ) : null}
            <button type="button" className="btn btn-sm" onClick={close}>
              {t('Close')}
            </button>
          </div>
        }
      >
        <ul className="space-y-0.5">
          {notice.collection !== null ? collectionLines(notice.collection).map((line) => <li key={line}>{line}</li>) : null}
          {notice.files.map((file) => (
            <li key={file.name}>
              {fileLine(file)}
              {file.skipped > 0 ? ` ${tp(file.skipped, '{n} entry without a usable username was left out.', '{n} entries without a usable username were left out.', { n: fmtInt(file.skipped) })}` : ''}
              {file.problems.length > 0 ? ` ${file.problems.join(' ')}` : ''}
            </li>
          ))}
          {changed ? (
            <li>
              {notice.mode === 'replace' ? t('There was no license list yet, so this became your list.') : t('Added to the license list you had.')}{' '}
              {t('{added} added, {updated} updated, {unchanged} unchanged, {removed} removed. The list now has {total}.', {
                added: fmtInt(notice.added),
                updated: fmtInt(notice.updated),
                unchanged: fmtInt(notice.unchanged),
                removed: fmtInt(notice.removed),
                total: pluralize(notice.total, 'seat'),
              })}
            </li>
          ) : null}
          {notice.saved === 'slim' ? (
            <li className="font-medium">
              {t('The list is too big to keep in full in this browser. It was kept with usernames and plans only. Load the file again on your next visit to see activity dates.')}
            </li>
          ) : null}
          {notice.saved === 'failed' ? (
            <li className="font-medium">{t('This browser could not keep the list, so it is gone when you close the tab. Load the file again on your next visit.')}</li>
          ) : null}
          {notice.ignored.length > 0 ? <li>{t('Not loaded: {names}. They are not a usage report or a license list.', { names: listNames(notice.ignored) })}</li> : null}
        </ul>
      </Callout>
    </div>
  );
}
