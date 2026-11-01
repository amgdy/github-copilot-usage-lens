import { useState } from 'react';
import { Armchair, BookOpen, Download, FileText, Lightbulb, Printer, SlidersHorizontal } from 'lucide-react';
import { NoRows } from '../components/NoRows';
import { PageHeader } from '../components/ui';
import { msg, t } from '../i18n';
import { DEFAULT_LEVERS, type LeverParams } from '../lib/analytics/levers';
import { userActionRows } from '../lib/analytics/tips';
import { buildSummaryMarkdown } from '../lib/export/summary';
import { fmtDay, isoDate } from '../lib/utils/date';
import { downloadCsv, downloadText } from '../lib/utils/download';
import { fmtInt, pluralize } from '../lib/utils/format';
import { useAnalysis } from '../state/analysis';
import { chipText, describeFilters } from '../state/filterChips';
import { printReport } from '../state/print';
import { CopyButton } from './recommendations/CopyButton';
import { PlaybookTab } from './recommendations/PlaybookTab';
import { RecommendationsTab } from './recommendations/RecommendationsTab';
import { SeatsTab } from './recommendations/SeatsTab';
import { SimulatorTab } from './recommendations/SimulatorTab';
import { panelId, TabBar, tabId, type TabItem } from './recommendations/TabBar';
import { DEFAULT_REC_FILTERS, type RecFilters } from './recommendations/recFilters';
import { DEFAULT_SEAT_FLAGS, type SeatFlags } from './recommendations/scenario';
import { PriceSource } from './models/parts';

type TabKey = 'recommendations' | 'simulator' | 'seats' | 'playbook';

const PREFIX = 'recs';
const DESCRIPTION = msg('What to do, in what order, and what it is worth.');
const ICON = 15;

/** Recommendations, a what-if simulator, seat clean-up lists and the habit playbook. Filters and simulator inputs survive a tab change. */
export default function RecommendationsPage() {
  const { analysis, settings, taxonomy, dataset, store, filters } = useAnalysis();
  const [tab, setTab] = useState<TabKey>('recommendations');
  const [recFilters, setRecFilters] = useState<RecFilters>(DEFAULT_REC_FILTERS);
  const [levers, setLevers] = useState<LeverParams>(DEFAULT_LEVERS);
  const [seatFlags, setSeatFlags] = useState<SeatFlags>(DEFAULT_SEAT_FLAGS);
  const { range, agg: aggregates, seats, users } = analysis;

  if (aggregates.totals.rows === 0) {
    return (
      <>
        <PageHeader title={t('Recommendations')} description={t(DESCRIPTION)} />
        <NoRows />
      </>
    );
  }

  const stamp = `${isoDate(range.start)}_${isoDate(range.end)}`;
  const summary = () => buildSummaryMarkdown({ analysis, settings, taxonomy, label: dataset.label, filters: describeFilters(filters, store, taxonomy).map(chipText) });
  const downloadSummary = () => downloadText(`github-copilot-usage-summary_${stamp}.md`, summary(), 'text/markdown;charset=utf-8');
  const downloadActions = () => {
    const table = userActionRows(users, settings);
    downloadCsv(`github-copilot-user-actions_${stamp}`, table.headers, table.rows);
  };

  // Seat lists are empty on a filtered view, so a count there would mislead. The count is of seats to act on, not of all
  // seats, so it says "to review" to keep it from being read as the seat total.
  const seatsToReview = analysis.narrowed ? undefined : seats.idle.length + seats.downgrade.length + seats.unused.length;
  const tabs: TabItem<TabKey>[] = [
    { id: 'recommendations', label: t('Recommendations'), icon: <Lightbulb size={ICON} aria-hidden />, badge: fmtInt(analysis.recs.length) },
    { id: 'simulator', label: t('What-if simulator'), icon: <SlidersHorizontal size={ICON} aria-hidden /> },
    {
      id: 'seats',
      label: t('Seats'),
      icon: <Armchair size={ICON} aria-hidden />,
      badge: seatsToReview === undefined ? undefined : t('{n} to review', { n: seatsToReview }),
      badgeHint: t('Seats in the lists on this tab: idle seats, Enterprise seats that fit Business and roster seats that never appear.'),
    },
    { id: 'playbook', label: t('Playbook'), icon: <BookOpen size={ICON} aria-hidden /> },
  ];
  const active = tabs.find((tabItem) => tabItem.id === tab) ?? tabs[0];

  return (
    <>
      <PageHeader
        title={t('Recommendations')}
        description={`${t(DESCRIPTION)} ${t('{from} to {to}', { from: fmtDay(range.start, true), to: fmtDay(range.end, true) })} · ${pluralize(range.length, 'day')} · ${pluralize(aggregates.totals.users, 'user')}`}
        actions={
          <div className="contents print:hidden">
            <CopyButton label={t('Copy summary')} getText={summary} />
            <button type="button" className="btn" onClick={downloadSummary} title={t('Headline, key figures, segments and recommendations as Markdown')}>
              <FileText size={14} aria-hidden /> {t('Download summary (.md)')}
            </button>
            <button
              type="button"
              className="btn"
              onClick={downloadActions}
              disabled={users.profiles.length === 0}
              title={t('One row per user with the segment, usage and the suggested next step')}
            >
              <Download size={14} aria-hidden /> {t('Download action list (CSV)')}
            </button>
            <button type="button" className="btn" onClick={printReport} title={t('Print this page or save it as a PDF')}>
              <Printer size={14} aria-hidden /> {t('Print')}
            </button>
          </div>
        }
      />

      <PriceSource settings className="-mt-2 mb-4" />
      <TabBar tabs={tabs} value={tab} onChange={setTab} idPrefix={PREFIX} label={t('Recommendations sections')} />

      <div role="tabpanel" id={panelId(PREFIX)} aria-labelledby={tabId(PREFIX, active.id)}>
        <h2 className="mb-3 hidden text-base font-semibold print:block">{active.label}</h2>
        {active.id === 'recommendations' ? <RecommendationsTab filters={recFilters} onChange={setRecFilters} /> : null}
        {active.id === 'simulator' ? <SimulatorTab levers={levers} onLevers={setLevers} seatFlags={seatFlags} onSeatFlags={setSeatFlags} /> : null}
        {active.id === 'seats' ? <SeatsTab /> : null}
        {active.id === 'playbook' ? <PlaybookTab /> : null}
      </div>
    </>
  );
}
