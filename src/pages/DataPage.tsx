import { useMemo } from 'react';
import { StartFreshButton } from '../components/StartFreshButton';
import { CalcInfo, PageHeader } from '../components/ui';
import { t, tp } from '../i18n';
import { fmtInt } from '../lib/utils/format';
import { useAnalysis } from '../state/analysis';
import { datasetLabel } from '../state/store';
import { ContentsCard } from './data/ContentsCard';
import { exportFileName } from './data/csvExport';
import { DownloadButton } from './data/DownloadButton';
import { EnrichmentCard } from './data/EnrichmentCard';
import { scopeIndices } from './data/explorer';
import { FilesCard } from './data/FilesCard';
import { GitHubDataCard } from './data/GitHubDataCard';
import { HelpCard } from './data/HelpCard';
import { KpiRow } from './data/KpiRow';
import { LicenseCard } from './data/LicenseCard';
import { LoadButton, LoadStatus, UploadNoticeCallout } from './data/LoadControl';
import { buildChecks, findGaps } from './data/quality';
import { QualityCard } from './data/QualityCard';
import { RowsExplorer } from './data/RowsExplorer';
import { scanStore } from './data/scan';

export default function DataPage() {
  const { dataset, store, models, analysis, settings } = useAnalysis();
  const scan = useMemo(() => scanStore(store), [store]);
  const gaps = useMemo(() => findGaps(store, scan), [store, scan]);
  const checks = useMemo(() => buildChecks(store, scan, models, gaps), [store, scan, models, gaps]);
  const scope = useMemo(() => scopeIndices(store.n, analysis.mask), [store, analysis.mask]);
  const { start, end } = analysis.range;
  const range = useMemo(() => ({ start, end }), [start, end]);

  return (
    <>
      <PageHeader
        title={t('Data')}
        description={
          <>
            {datasetLabel(dataset)} · {tp(store.n, '{n} row', '{n} rows', { n: fmtInt(store.n) })} <CalcInfo id="data-rows-kept" />
          </>
        }
        actions={
          <>
            <StartFreshButton />
            <LoadButton />
            <DownloadButton store={store} rows={scope} label={t('Download filtered rows (CSV)')} fileName={exportFileName(start, end)} primary />
          </>
        }
      />
      <div className="space-y-4">
        <LoadStatus />
        <UploadNoticeCallout />
        {analysis.mask ? (
          <p className="text-xs text-fg-muted">
            {t('Everything on this page describes all the rows you loaded, except the rows explorer and the download, which follow your filters.')}
          </p>
        ) : null}
        <KpiRow store={store} scan={scan} gaps={gaps} />
        <LicenseCard report={analysis.licenses} roster={settings.roster} />
        <GitHubDataCard />
        <FilesCard key={`files-${dataset.loadedAt}`} files={store.files} />
        <QualityCard checks={checks} />
        <ContentsCard store={store} scan={scan} />
        <RowsExplorer key={`rows-${dataset.loadedAt}`} store={store} scope={scope} range={range} />
        <EnrichmentCard />
        <HelpCard />
      </div>
    </>
  );
}
