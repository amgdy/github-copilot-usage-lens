import type { Tone } from '../../components/ui';
import { t } from '../../i18n';
import type { Filters } from '../../lib/analytics/filters';
import { HALF_SHARE, NEAR_SHARE, type BudgetLevel, type GitHubBudget, type UserLimitKind } from '../../lib/collection';
import { fmtPct } from '../../lib/utils/format';
import type { DataStore } from '../../lib/types';
import { drill } from '../../state/router';
import { budgetName } from '../githubText';

const LEVEL_TONES: Record<BudgetLevel, Tone> = { low: 'good', half: 'neutral', near: 'warn', 'used-up': 'bad' };

export function levelLabel(level: BudgetLevel): string {
  if (level === 'low') return t('Under {high}', { high: fmtPct(HALF_SHARE, 0) });
  if (level === 'half') return t('{low} to {high}', { low: fmtPct(HALF_SHARE, 0), high: fmtPct(NEAR_SHARE, 0) });
  if (level === 'near') return t('{low} to {high}', { low: fmtPct(NEAR_SHARE, 0), high: fmtPct(1, 0) });
  return t('Used up');
}
export const levelTone = (level: BudgetLevel): Tone => LEVEL_TONES[level];

/** The name of a kind of limit for users, from the most specific to the most general. */
export function limitKindLabel(kind: UserLimitKind): string {
  if (kind === 'own') return t('Own budget');
  if (kind === 'cost-center') return t('Cost center limit');
  return t('Limit for each user');
}

/** The name of a budget, marked when it covers all of GitHub Copilot and not only AI credits, so two budgets of one scope can be told apart. */
export const budgetLabel = (budget: GitHubBudget): string => (budget.aiCredits ? budgetName(budget) : t('{budget}, all of GitHub Copilot', { budget: budgetName(budget) }));

/** The tone of a share of a budget: used up, near the limit (80% or more), or with room. */
export function shareTone(share: number): Tone {
  if (share >= 1) return 'bad';
  if (share >= NEAR_SHARE) return 'warn';
  return 'good';
}

/** Report names that match the given GitHub names, without regard to upper and lower case. */
export function reportNames(names: readonly string[], reportValues: readonly string[]): string[] {
  const byLowerCase = new Map(reportValues.map((value) => [value.toLowerCase(), value]));
  return names.map((name) => byLowerCase.get(name.toLowerCase())).filter((name): name is string => name !== undefined);
}

/** Report names of the repositories a budget for a repository covers: "octo-org/app" or "app". */
function reportRepos(entity: string, reportValues: readonly string[]): string[] {
  const wanted = entity.toLowerCase();
  const name = wanted.includes('/') ? wanted.slice(wanted.indexOf('/') + 1) : wanted;
  return reportValues.filter((value) => value.toLowerCase() === wanted || value.toLowerCase() === name);
}

/** Opens the Organization page filtered to an organization, cost center or repository. Null when the report has no rows for it. */
export function scopeDrill(scope: GitHubBudget['scope'], entity: string, store: DataStore): (() => void) | null {
  const open = (patch: Partial<Filters>) => () => drill(patch, { page: 'organization' });
  if (scope === 'organization') {
    const orgs = reportNames([entity], store.dicts.org.values);
    return orgs.length > 0 ? open({ orgs }) : null;
  }
  if (scope === 'cost_center') {
    const costCenters = reportNames([entity], store.dicts.costCenter.values);
    return costCenters.length > 0 ? open({ costCenters }) : null;
  }
  if (scope === 'repository') {
    const repos = reportRepos(entity, store.dicts.repo.values);
    return repos.length > 0 ? open({ repos }) : null;
  }
  return null;
}

/** Opens the Organization page filtered to what a budget covers. Null when the budget has no matching rows in the report. */
export const budgetDrill = (budget: GitHubBudget, store: DataStore): (() => void) | null => scopeDrill(budget.scope, budget.entity, store);
