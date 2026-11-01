import { ExternalLink } from 'lucide-react';
import { useMemo } from 'react';
import { Badge, CalcInfo, Callout, Card, DataTable, DocLinks, type Column } from '../../components/ui';
import { t, tp } from '../../i18n';
import type { Collection, CollectionSource, GitHubData, MonthCheck } from '../../lib/collection';
import { APP_COLLECTOR_URL } from '../../lib/links';
import { fmtInt, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { useApp } from '../../state/store';
import { collectedDay, monthCheckStatus, monthName, scopeText, sourceName, sourceStatus } from '../githubText';
import { CollectorCommand } from './CollectorCommand';

/** How to make a GitHub data file with the collector scripts. */
export function HowToCollect() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted">
        {t(
          'The collector script reads budgets, seats, members, billing, activity and seat changes from GitHub and saves them in one file. For an enterprise it adds the AI usage report too. Load that file here to make the numbers more exact and to get more findings.',
        )}
      </p>
      <CollectorCommand />
      <p className="text-xs text-fg-subtle">{t('The file holds GitHub logins and activity, so keep it safe and delete it when you are done.')}</p>
      <a href={APP_COLLECTOR_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
        {t('How to run the collector script')}
        <ExternalLink size={12} aria-hidden />
      </a>
    </div>
  );
}

function Fact({ label, value, calc }: { label: string; value: string; calc?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-fg-muted">
        {label}
        {calc ? <CalcInfo id={calc} className="ms-1" /> : null}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

function monthsText(months: readonly string[]): string {
  if (months.length === 0) return '–';
  const first = monthName(months[0]);
  const last = monthName(months[months.length - 1]);
  return months.length === 1 ? first : t('{from} to {to}', { from: first, to: last });
}

function targetText(source: CollectionSource): string {
  const month = source.month ? monthName(source.month) : '';
  if (source.target === '') return month;
  return month === '' ? source.target : t('{target}, {month}', { target: source.target, month });
}

function SourcesTable({ sources }: { sources: CollectionSource[] }) {
  const columns = useMemo<Column<CollectionSource>[]>(
    () => [
      { key: 'part', header: t('Part of the data'), value: (source) => sourceName(source.id), render: (source) => <span className="font-medium">{sourceName(source.id)}</span> },
      { key: 'target', header: t('For'), value: (source) => targetText(source) },
      {
        key: 'status',
        header: t('Result'),
        value: (source) => sourceStatus(source.status).label,
        render: (source) => {
          const status = sourceStatus(source.status);
          return <Badge tone={status.tone}>{status.label}</Badge>;
        },
      },
      { key: 'records', header: t('Records'), align: 'end', value: (source) => source.records, render: (source) => fmtInt(source.records) },
      {
        key: 'message',
        header: t('What GitHub or the script said'),
        value: (source) => source.message,
        render: (source) => <span className="text-xs text-fg-muted">{source.message || '–'}</span>,
      },
    ],
    [],
  );
  return (
    <DataTable
      rows={sources}
      columns={columns}
      rowKey={(source) => `${source.id}|${source.scope}|${source.target}|${source.month ?? ''}`}
      pageSize={10}
      searchable
      searchPlaceholder={t('Search parts…')}
      exportName="github-copilot-usage-lens-data-parts"
      dense
    />
  );
}

function FileDetails({ collection, problems, sample = false }: { collection: Collection; problems: number; sample?: boolean }) {
  const { header, sources } = collection;
  const asked = sources.filter((source) => source.status !== 'skipped').length;
  const complete = sources.filter((source) => source.status === 'ok').length;
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <Fact label={t('Covers')} value={scopeText(header, collection.organizations)} />
        <Fact label={t('Collected on')} value={collectedDay(header)} />
        <Fact label={t('Billing months')} value={monthsText(header.months)} />
        <Fact label={t('Parts complete')} value={t('{n} of {total}', { n: fmtInt(complete), total: fmtInt(asked) })} calc="github-file" />
      </dl>
      {!collection.complete ? (
        <Callout tone="warn" title={t('The file ends early')}>
          {t('Some data may be missing. Run the script again and wait until it says the file is saved.')}
        </Callout>
      ) : null}
      {problems > 0 ? (
        <Callout tone="warn" title={tp(problems, '{n} part did not come back in full', '{n} parts did not come back in full', { n: fmtInt(problems) })}>
          {t('Their numbers are left out or may be short. The table says what GitHub or the script said. Often the account needs more access, or a feature is off.')}
        </Callout>
      ) : null}
      {collection.capped ? (
        <Callout tone="info" title={t('Some lists are cut short')}>
          {t('The file has more members, seats or events than this app keeps, so some lists are not complete.')}
        </Callout>
      ) : null}
      {collection.skippedLines > 0 ? (
        <p className="text-xs text-fg-subtle">
          {tp(collection.skippedLines, '{n} line of the file could not be read and was left out.', '{n} lines of the file could not be read and were left out.', { n: fmtInt(collection.skippedLines) })}
        </p>
      ) : null}
      <SourcesTable sources={sources} />
      <p className="text-xs text-fg-subtle">
        {sample
          ? t('It is kept in this browser tab only and is never added to your license list.')
          : `${t('The script {name} {version} made this file on {host}.', { name: header.collector, version: header.collectorVersion, host: header.host })} ${t('It is kept in this browser tab only. Its seats were added to your license list.')}`}
      </p>
    </div>
  );
}

/** The GitHub data file: what it covers, which parts came back, and a way to remove it. */
export function GitHubDataCard() {
  const { dataset, github } = useAnalysis();
  const collection = useApp((state) => state.collection);
  const setCollection = useApp((state) => state.setCollection);
  const title = t('GitHub data file');

  const remove =
    collection === null ? undefined : (
      <button type="button" className="btn btn-sm" onClick={() => setCollection(null)}>
        {t('Remove the GitHub data')}
      </button>
    );

  if (dataset.sample) {
    return (
      <>
        <Card title={title} calc="github-file" subtitle={github?.collection.fileName} actions={remove}>
          <div className="space-y-4">
            <Callout tone="info" title={t('The sample has made-up GitHub data')}>
              {t('It shows what a GitHub data file adds: budgets, seats, billing and activity. It was made in this browser from the sample report. It is collected on the day the included credits of the second month ran out, so the budgets have billed usage to show.')}
              {collection !== null ? ` ${t('Your own GitHub data file is not used with the sample. It is used when you open your own usage report.')}` : null}
            </Callout>
            {github !== null ? <FileDetails collection={github.collection} problems={github.problems.length} sample /> : null}
          </div>
        </Card>
        {github !== null ? <MonthCheckCard github={github} /> : null}
      </>
    );
  }

  if (collection === null || github === null) {
    return (
      <Card title={title} calc="github-file" subtitle={t('No GitHub data file is loaded.')}>
        <HowToCollect />
      </Card>
    );
  }

  return (
    <>
      <Card title={title} calc="github-file" subtitle={collection.fileName} actions={remove}>
        <FileDetails collection={collection} problems={github.problems.length} />
      </Card>
      <MonthCheckCard github={github} />
    </>
  );
}

const amountOrDash = (amount: number | undefined): string => (amount === undefined ? '–' : fmtUSD(amount));

/** Each billing month of the GitHub data file set against the loaded usage report. */
function MonthCheckCard({ github }: { github: GitHubData }) {
  const columns = useMemo<Column<MonthCheck>[]>(
    () => [
      { key: 'month', header: t('Month'), value: (row) => row.month, render: (row) => monthName(row.month) },
      { key: 'report-usage', header: t('Usage in the report'), align: 'end', calc: 'usage', value: (row) => row.report.gross, render: (row) => fmtUSD(row.report.gross) },
      { key: 'github-usage', header: t('Usage at GitHub'), align: 'end', value: (row) => row.github?.gross ?? null, render: (row) => amountOrDash(row.github?.gross) },
      { key: 'report-billed', header: t('Billed in the report'), align: 'end', calc: 'billed', value: (row) => row.report.net, render: (row) => fmtUSD(row.report.net) },
      { key: 'github-billed', header: t('Billed at GitHub'), align: 'end', value: (row) => row.github?.net ?? null, render: (row) => amountOrDash(row.github?.net) },
      {
        key: 'result',
        header: t('Result'),
        value: (row) => monthCheckStatus(row.status).label,
        render: (row) => {
          const status = monthCheckStatus(row.status);
          return <Badge tone={status.tone}>{status.label}</Badge>;
        },
      },
    ],
    [],
  );
  const checkedOrgs = github.checkedOrgs;
  return (
    <Card
      title={t('Usage report and GitHub billing')}
      calc="github-month-check"
      subtitle={t('Whether each month of the usage report has the same amounts as GitHub billing. It uses every report row in the scope of the GitHub data file, not your filters.')}
      footer={<DocLinks topic="billing" title={t('Learn more')} limit={2} compact />}
    >
      <div className="space-y-3">
        {checkedOrgs.length > 0 ? (
          <p className="text-xs text-fg-muted">{t('Only the report rows of {orgs} are compared, the organizations in the GitHub data file.', { orgs: checkedOrgs.join(t(', ')) })}</p>
        ) : null}
        <DataTable rows={github.months} columns={columns} rowKey={(row) => row.month} exportName="github-copilot-report-and-github-billing" dense emptyText={t('The file has no billing months.')} />
      </div>
    </Card>
  );
}
