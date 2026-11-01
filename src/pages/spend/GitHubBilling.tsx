import { useMemo } from 'react';
import { Badge, Card, DataTable, DocLinks, Section, type Column } from '../../components/ui';
import { t, tp } from '../../i18n';
import type { GitHubData, MonthBill } from '../../lib/collection';
import { fmtInt, fmtNum, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { navigate } from '../../state/router';
import { fromGitHub, monthName } from '../githubText';

const usdOrDash = (amount: number | null): string => (amount === null ? '–' : fmtUSD(amount));

/** The whole GitHub Copilot bill of each month: seats plus AI credits billed. */
function BillCard({ github }: { github: GitHubData }) {
  const columns = useMemo<Column<MonthBill>[]>(
    () => [
      {
        key: 'month',
        header: t('Month'),
        value: (row) => row.month,
        render: (row) => (
          <span className="inline-flex flex-wrap items-center gap-2">
            {monthName(row.month)}
            {row.open ? <Badge tone="neutral">{t('Month not over')}</Badge> : null}
          </span>
        ),
      },
      { key: 'seats', header: t('Seats'), align: 'end', value: (row) => row.seats, render: (row) => usdOrDash(row.seats) },
      { key: 'seat-months', header: t('Seat-months'), align: 'end', value: (row) => row.seatMonths, render: (row) => (row.seatMonths === null ? '–' : fmtNum(row.seatMonths, 1)) },
      { key: 'ai-credits', header: t('AI credits billed'), align: 'end', value: (row) => row.aiCredits, render: (row) => usdOrDash(row.aiCredits) },
      { key: 'total', header: t('Total'), align: 'end', value: (row) => row.total, render: (row) => <span className="font-semibold">{usdOrDash(row.total)}</span> },
    ],
    [],
  );
  return (
    <Card
      title={t('Whole GitHub Copilot bill')}
      calc="github-bill"
      subtitle={t('Seats and the AI credits billed on top of them, by month. The usage report shows only the AI credits.')}
      footer={<DocLinks topic="billing" title={t('Learn more')} limit={2} compact />}
    >
      <DataTable rows={github.bills} columns={columns} rowKey={(row) => row.month} defaultSort={{ key: 'month', dir: 'desc' }} exportName="github-copilot-whole-bill" dense />
    </Card>
  );
}

/** A short line that leads to the Budgets page, where the budgets are shown in full. */
function BudgetsPointer({ github }: { github: GitHubData }) {
  const count = github.copilotBudgets.length;
  const atLimit = github.usersAtLimit.length;
  const budgetsFailed = github.problems.some((source) => source.id === 'budgets');
  return (
    <Card title={t('Budgets at GitHub')} calc="github-budgets">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          {count > 0 ? tp(count, '{n} budget for GitHub Copilot.', '{n} budgets for GitHub Copilot.', { n: fmtInt(count) }) : budgetsFailed ? t('The budgets could not be read in full. The Data page says why.') : t('The file has no budget for GitHub Copilot.')}{' '}
          {atLimit > 0 ? tp(atLimit, '{n} user has used up their budget.', '{n} users have used up their budget.', { n: fmtInt(atLimit) }) : null}
        </p>
        <button type="button" className="btn btn-sm" onClick={() => navigate('budgets')}>
          {t('Open the Budgets page')}
        </button>
      </div>
    </Card>
  );
}

/** The bill and budgets from the GitHub data file. Shown only when one is loaded with your own usage report. */
export function GitHubBilling() {
  const { github } = useAnalysis();
  if (github === null) return null;
  const budgetsAsked = github.collection.sources.some((source) => source.id === 'budgets' && source.status !== 'skipped');
  if (github.bills.length === 0 && !budgetsAsked) return null;
  return (
    <Section title={t('Bill and budgets at GitHub')} description={`${fromGitHub(github.collection.header)} ${t('The filters do not change these amounts.')}`}>
      <div className="space-y-4">
        {github.bills.length > 0 ? <BillCard github={github} /> : null}
        {budgetsAsked ? <BudgetsPointer github={github} /> : null}
      </div>
    </Section>
  );
}
