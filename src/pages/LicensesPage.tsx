import { useEffect, useRef, useState } from 'react';
import { FeatureIcon } from '../components/icons';
import { SampleListNote } from '../components/layout/SampleNotice';
import { CalcInfo, Callout, Card, EmptyState, PageHeader } from '../components/ui';
import { t, tp } from '../i18n';
import type { LicenseReport } from '../lib/licenses';
import { fmtInt } from '../lib/utils/format';
import { useAnalysis } from '../state/analysis';
import { GitHubSeats } from './licenses/GitHubSeats';
import { LicenseImport } from './licenses/LicenseImport';
import { LicenseLists } from './licenses/LicenseLists';
import { LicenseBreakdowns, LicenseKpis } from './licenses/LicenseSummary';
import { asOfInfo, firstList, scopeOf, type ListId } from './licenses/model';
import { clearNarrowing } from './shared';

function NoLicenses() {
  return (
    <Card>
      <EmptyState
        icon={<FeatureIcon feature="license" size={28} />}
        title={t('Import your license list to see your seats')}
        description={t('The usage report shows who used GitHub Copilot, but not who has a seat. The license list adds what the report cannot show:')}
      />
      <ul className="mx-auto max-w-md list-disc space-y-1 ps-5 pb-6 text-sm text-fg-muted">
        <li>{t('Seats with no usage in this report, checked against last activity, and what they cost each month.')}</li>
        <li>{t('Users with usage in the report but no seat in the list.')}</li>
        <li>{t('A better estimate of the included-credit pool, because each seat on the list adds its credits. It is not the exact pool for past months.')}</li>
        <li>{t('Seat cost per month by plan.')}</li>
      </ul>
    </Card>
  );
}

/** The as-of date, an old export, a list without activity data, and what the filters do here. */
function Notices({ report, narrowed }: { report: LicenseReport; narrowed: boolean }) {
  const asOfDetails = asOfInfo(report);
  const scope = scopeOf(narrowed, report.scoped);
  const clear = (
    <button type="button" className="btn btn-sm" onClick={clearNarrowing}>
      {t('Clear filters')}
    </button>
  );
  return (
    <div className="space-y-3">
      <p className="flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
        {asOfDetails.date
          ? asOfDetails.source === 'roster'
            ? t('Days without activity are counted from {date}, the newest date in the license list.', { date: asOfDetails.date })
            : t('Days without activity are counted from {date}, the date of the license export.', { date: asOfDetails.date })
          : t('The license list has no dates, so days without activity cannot be counted.')}
        <CalcInfo id="license-as-of" />
      </p>
      {asOfDetails.stale && asOfDetails.behind !== null ? (
        <Callout tone="warn" title={t('The license list is old')}>
          {tp(
            asOfDetails.behind,
            'The usage report runs {n} day past the date of the license list. Seats may have changed since then, so import a new list.',
            'The usage report runs {n} days past the date of the license list. Seats may have changed since then, so import a new list.',
            { n: fmtInt(asOfDetails.behind) },
          )}
        </Callout>
      ) : null}
      {report.noActivityDate.length > 0 ? (
        <Callout tone="warn" title={t('Some seats have no recent activity date')}>
          {tp(
            report.noActivityDate.length,
            '{n} seat has no recent activity date. It may be new or its activity may be older than 90 days. It is not counted as a seat to free.',
            '{n} seats have no recent activity date. They may be new or their activity may be older than 90 days. They are not counted as seats to free.',
            { n: fmtInt(report.noActivityDate.length) },
          )}
        </Callout>
      ) : null}
      {!report.hasActivity ? (
        <Callout tone="info" title={t('The license list has no activity data')}>
          {t('The app cannot tell which seats are unused, so activity-based seat savings and status lists are empty. For most admins, import the activity report CSV. Use the seats API when you need plan, start-date or pending-cancellation details.')}
        </Callout>
      ) : null}
      {scope === 'rows' ? (
        <Callout tone="info" title={t('You are looking at a filtered view')} action={clear}>
          {t('Usage, coverage, users with usage but no seat, and quiet seats cover only the selected rows. Seats, plans, seat cost, activity, and the lists of seats to free, fading, pending and new seats still cover the whole license list.')}
        </Callout>
      ) : scope === 'segments' ? (
        <Callout tone="info" title={t('Segment filters do not change this page')} action={clear}>
          {t('The license numbers cover every user in the date range and the row filters. Segment filters, such as spend tier or group, are not used here.')}
        </Callout>
      ) : null}
    </div>
  );
}

function Report({ report, narrowed }: { report: LicenseReport; narrowed: boolean }) {
  const [list, setList] = useState<ListId>(() => firstList(report));
  const listsRef = useRef<HTMLDivElement>(null);
  const open = (id: ListId) => {
    setList(id);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    listsRef.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <div className="space-y-4">
      <Notices report={report} narrowed={narrowed} />
      <LicenseKpis report={report} onOpen={open} />
      <LicenseBreakdowns report={report} />
      <div ref={listsRef} className="scroll-mt-16">
        <LicenseLists report={report} list={list} onList={setList} />
      </div>
    </div>
  );
}

export default function LicensesPage() {
  const { analysis } = useAnalysis();
  const report = analysis.licenses;
  const [folded, setFolded] = useState(report !== null);
  // Once a list is loaded, the steps to get the file fold up and the report shows above the import card.
  useEffect(() => {
    if (report !== null) setFolded(true);
  }, [report]);

  // The import card keeps the same place in the tree, so its result message stays after the first import.
  return (
    <>
      <PageHeader title={t('Licenses')} description={t('Seats from your license list: who uses them, who does not, and seats you can free up')} />
      <div className="space-y-4">
        <SampleListNote />
        {report ? <Report report={report} narrowed={analysis.narrowed} /> : <NoLicenses />}
        <GitHubSeats />
        <Card key="license-import" title={report ? t('Update the license list') : t('Import the license list')} calc="license-import">
          <LicenseImport compact={folded} />
        </Card>
      </div>
    </>
  );
}
