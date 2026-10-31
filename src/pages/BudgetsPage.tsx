import { HandCoins } from 'lucide-react';
import { useMemo } from 'react';
import { Callout, Card, DocLinks, EmptyState, PageHeader, Section } from '../components/ui';
import { t } from '../i18n';
import { budgetMap, budgetOverview } from '../lib/collection';
import { useAnalysis } from '../state/analysis';
import { navigate } from '../state/router';
import { BudgetChangesCard } from './budgets/BudgetChangesCard';
import { BudgetKpis } from './budgets/BudgetKpis';
import { BudgetLevelsChart } from './budgets/BudgetLevelsChart';
import { BudgetPaceCard } from './budgets/BudgetPaceCard';
import { BudgetTable } from './budgets/BudgetTable';
import { BudgetUsersCard } from './budgets/BudgetUsersCard';
import { UnbudgetedCard } from './budgets/UnbudgetedCard';
import { LimitMapCard } from './budgets/limitMap/LimitMapCard';
import { HowToCollect } from './data/GitHubDataCard';
import { fromGitHub, monthName } from './githubText';

const INTRO = 'The budgets for GitHub Copilot that are set at GitHub: how full each one is, which run out this month, and which users are stopped.';

function NoBudgetData() {
  return (
    <Card footer={<DocLinks topic="budgets" title={t('Learn more')} limit={3} compact />}>
      <EmptyState
        icon={<HandCoins size={28} aria-hidden />}
        title={t('Load a GitHub data file to see your budgets')}
        description={t('The usage report does not hold budgets. The collector script reads them from GitHub.')}
      />
      <div className="mx-auto max-w-2xl space-y-4 pb-6">
        <HowToCollect />
        <button type="button" className="btn btn-sm" onClick={() => navigate('data')}>
          {t('Go to the Data page')}
        </button>
      </div>
    </Card>
  );
}

export default function BudgetsPage() {
  const { github, store } = useAnalysis();
  const overview = useMemo(() => (github ? budgetOverview(github.collection, store) : null), [github, store]);
  const budgetsAsked = github?.collection.sources.some((source) => source.id === 'budgets' && source.status !== 'skipped') ?? false;
  const map = useMemo(() => (github && overview && overview.total > 0 ? budgetMap(github.collection, store) : null), [github, overview, store]);

  if (github === null || overview === null || !budgetsAsked) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('Budgets')} description={t(INTRO)} />
        <NoBudgetData />
      </div>
    );
  }

  const source = `${fromGitHub(github.collection.header)} ${t('The filters do not change these amounts.')}`;
  return (
    <div className="space-y-6">
      <PageHeader title={t('Budgets')} description={`${t(INTRO)} ${t('Month: {month}.', { month: monthName(overview.month) })}`} />
      <p className="text-xs text-fg-muted">{source}</p>
      {overview.total === 0 ? (
        <Callout tone="warn" title={t('No budget for GitHub Copilot')}>
          {t('Nothing limits the amount billed on top of seats. Set a budget at GitHub to get alerts or to stop usage at a set amount.')}
        </Callout>
      ) : null}
      <BudgetKpis overview={overview} github={github} store={store} />
      {map !== null ? (
        <Section title={t('Limits')} description={t('Where each limit sits, from the whole enterprise down to each user.')}>
          <LimitMapCard collection={github.collection} map={map} store={store} />
        </Section>
      ) : null}
      <Section title={t('Budget levels')} description={t('How much of each budget is used, and how fast it fills up this month.')}>
        <div className="grid gap-4 xl:grid-cols-2">
          <BudgetLevelsChart overview={overview} store={store} />
          <BudgetPaceCard overview={overview} collection={github.collection} store={store} />
        </div>
      </Section>
      {overview.users.length > 0 ? (
        <Section title={t('Users')}>
          <BudgetUsersCard overview={overview} collection={github.collection} store={store} />
        </Section>
      ) : null}
      <Section title={t('Gaps and changes')}>
        <div className="grid gap-4 xl:grid-cols-2">
          <UnbudgetedCard overview={overview} store={store} />
          <BudgetChangesCard changes={overview.changes} />
        </div>
      </Section>
      <Section title={t('All budgets')}>
        <BudgetTable github={github} />
      </Section>
    </div>
  );
}
