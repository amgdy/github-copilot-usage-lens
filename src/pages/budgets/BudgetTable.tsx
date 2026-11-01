import { useMemo } from 'react';
import { Badge, Card, DataTable, DocLinks, ProgressBar, type Column } from '../../components/ui';
import { t, tp } from '../../i18n';
import type { GitHubBudget, GitHubData } from '../../lib/collection';
import { fmtInt, fmtPct, fmtUSD } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { budgetName } from '../githubText';
import { shareTone } from './levels';

const usdOrDash = (amount: number | null): string => (amount === null ? '–' : fmtUSD(amount));

function BudgetShare({ budget }: { budget: GitHubBudget }) {
  if (budget.consumed === null || budget.amount <= 0) return <span className="text-fg-subtle">–</span>;
  const share = budget.consumed / budget.amount;
  return (
    <div className="flex min-w-28 items-center gap-2">
      <ProgressBar value={share} tone={shareTone(share)} height={6} className="flex-1" label={t('Share of the budget used')} />
      <span className="num w-12 text-end text-xs">{fmtPct(share, 0)}</span>
    </div>
  );
}

/** Every GitHub Copilot budget set at GitHub, with how much of it was used. */
export function BudgetTable({ github }: { github: GitHubData }) {
  const { analysis } = useAnalysis();
  const inUse = analysis.budgetSource === 'github' ? github.budget?.id : undefined;
  const columns = useMemo<Column<GitHubBudget>[]>(
    () => [
      {
        key: 'budget',
        header: t('Budget'),
        value: (budget) => budgetName(budget),
        render: (budget) => (
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-medium">{budgetName(budget)}</span>
            {budget.id === inUse ? <Badge tone="accent">{t('Used as the monthly budget')}</Badge> : null}
          </span>
        ),
      },
      { key: 'covers', header: t('Covers'), value: (budget) => (budget.aiCredits ? t('AI credits') : t('All of GitHub Copilot')) },
      { key: 'amount', header: t('Budget'), align: 'end', value: (budget) => budget.amount, render: (budget) => <span className="font-semibold text-fg">{fmtUSD(budget.amount)}</span> },
      { key: 'used', header: t('Used'), align: 'end', value: (budget) => budget.consumed, render: (budget) => usdOrDash(budget.consumed) },
      {
        key: 'share',
        header: t('Share used'),
        value: (budget) => (budget.consumed === null || budget.amount <= 0 ? null : budget.consumed / budget.amount),
        render: (budget) => <BudgetShare budget={budget} />,
      },
      {
        key: 'when-used-up',
        header: t('When used up'),
        value: (budget) => (budget.stopsUsage ? t('Stops usage') : t('Alerts only')),
        render: (budget) => <Badge tone={budget.stopsUsage ? 'info' : 'neutral'}>{budget.stopsUsage ? t('Stops usage') : t('Alerts only')}</Badge>,
      },
      { key: 'alerts', header: t('Alerts'), value: (budget) => (budget.willAlert ? t('On') : t('Off')) },
    ],
    [inUse],
  );

  const budgetsAsked = github.collection.sources.some((source) => source.id === 'budgets' && source.status !== 'skipped');
  const budgetsFailed = github.problems.some((source) => source.id === 'budgets');

  return (
    <Card
      title={t('Budgets at GitHub')}
      calc="github-budgets"
      subtitle={t('The budgets for GitHub Copilot and how much of each was used on the day the data was collected.')}
      footer={<DocLinks topic="budgets" title={t('Learn more')} limit={3} compact />}
    >
      <div className="space-y-3">
        {github.copilotBudgets.length > 0 ? (
          <DataTable
            rows={github.copilotBudgets}
            columns={columns}
            rowKey={(budget) => budget.id}
            pageSize={10}
            searchable={github.copilotBudgets.length > 10}
            exportName="github-copilot-budgets"
            dense
          />
        ) : (
          <p className="text-sm text-fg-muted">
            {budgetsFailed ? t('The budgets could not be read in full. The Data page says why.') : budgetsAsked ? t('The file has no budget for GitHub Copilot.') : t('The script did not read the budgets.')}
          </p>
        )}
        {github.otherBudgets > 0 ? (
          <p className="text-xs text-fg-subtle">
            {tp(github.otherBudgets, '{n} budget for other products is not shown.', '{n} budgets for other products are not shown.', { n: fmtInt(github.otherBudgets) })}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
