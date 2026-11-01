import type { GitHubData } from '../collection/derive';
import { budgetOf, type Settings } from './settings';

/** Where the monthly budget comes from: Settings, the GitHub data file, or nowhere. */
export type BudgetSource = 'settings' | 'github' | null;

/**
 * The settings behind the analysis. When Settings has no monthly budget, the AI credit budget of the GitHub data file
 * fills it in. A budget typed in Settings always wins, because someone chose it on purpose.
 */
export function withGitHubBudget(settings: Settings, github: GitHubData | null | undefined): { settings: Settings; budgetSource: BudgetSource } {
  if (budgetOf(settings) !== null) return { settings, budgetSource: 'settings' };
  const budget = github?.budget;
  if (!budget) return { settings, budgetSource: null };
  return { settings: { ...settings, budgetMonthlyBilled: budget.amount }, budgetSource: 'github' };
}
