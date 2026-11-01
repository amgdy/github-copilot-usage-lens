import { useMemo } from 'react';
import { FeatureIcon } from '../../components/icons';
import { Card, DataTable, DocLinks, InfoTip, type Column } from '../../components/ui';
import { seatPlanLabel } from '../../components/user/license';
import { t, tp } from '../../i18n';
import type { SeatCandidate } from '../../lib/analytics/seats';
import { fmtInt, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { navigate } from '../../state/router';

function neverUsedColumns(): Column<SeatCandidate>[] {
  return [
    {
      key: 'user',
      header: t('User'),
      value: (seat) => seat.name,
      render: (seat) => <span className="font-medium">{seat.name}</span>,
    },
    { key: 'plan', header: t('Plan'), value: (seat) => seatPlanLabel(seat.plan) },
    {
      key: 'value',
      strong: true,
      header: t('License cost per month'),
      calc: 'seat-unused',
      value: (seat) => seat.value,
      render: (seat) => fmtUSD(seat.value, 2),
      align: 'right',
      total: (rows) => fmtUSD(rows.reduce((sum, seat) => sum + seat.value, 0), 2),
    },
  ];
}

const OpenLicenses = ({ label }: { label: string }) => (
  <button type="button" className="btn btn-sm" onClick={() => navigate('licenses')}>
    <FeatureIcon feature="license" size={14} />
    {label}
  </button>
);

export function NeverUsedCard() {
  const { analysis, settings } = useAnalysis();
  const columns = useMemo(() => neverUsedColumns(), []);
  if (analysis.narrowed) return null;

  const unused = analysis.seats.unused;
  const rosterSize = settings.roster.length;

  if (rosterSize === 0) {
    return (
      <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-fg-muted">
        <span>{t('Import the license list on the Licenses page to see licenses that never show up in this report.')}</span>
        <OpenLicenses label={t('Add a license list')} />
      </div>
    );
  }

  if (unused.length === 0) {
    return (
      <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-fg-muted">
        <span>{t('No license can be marked unused from the available data. Check the Licenses page for seats without a recent activity date.')}</span>
        <OpenLicenses label={t('Open the Licenses page')} />
      </div>
    );
  }

  return (
    <Card
      title={t('Licenses never used')}
      calc="seat-unused"
      subtitle={tp(
        unused.length,
        '{n} license in the license list never appears in this file, about {amount} a month in license fees.',
        '{n} licenses in the license list never appear in this file, about {amount} a month in license fees.',
        { n: fmtInt(unused.length), amount: fmtUSD(analysis.seats.unusedValue, 0) },
      )}
      actions={
        <>
          <InfoTip>
            {t('Business licenses are counted at $19 a month and Enterprise licenses at $39. A license without a plan is priced like the most common plan in the file.')}
          </InfoTip>
          <OpenLicenses label={t('Open the Licenses page')} />
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-fg-muted">
          {t(
            'These licenses cost money but show no AI-credit usage. Code completions are not in this export, so check with the person before you remove a license.',
          )}
        </p>
        <DataTable
          rows={unused}
          columns={columns}
          rowKey={(seat) => seat.name}
          defaultSort={{ key: 'user', dir: 'asc' }}
          pageSize={10}
          searchable
          searchPlaceholder={t('Search licenses…')}
          exportName="github-copilot-licenses-never-used"
          dense
          fixedColumns
        />
        <DocLinks ids={['remindInactive', 'seatAssignment']} title={t('Learn more')} compact />
      </div>
    </Card>
  );
}
