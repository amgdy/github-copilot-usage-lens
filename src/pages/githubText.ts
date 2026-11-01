import type { Tone } from '../components/ui';
import { msg, t } from '../i18n';
import { monthOfKey, type CollectionHeader, type GitHubBudget, type MonthCheckStatus, type SourceStatus } from '../lib/collection';
import { fmtDay, monthLabel, parseIsoDay } from '../lib/utils/date';

/** Shared words of the cards that show the GitHub data file of the collector scripts. */

/** The day the GitHub data was collected, with the year. */
export const collectedDay = (header: CollectionHeader): string => fmtDay(parseIsoDay(header.day), true);

/** "Sep 2026" for a YYYY-MM month of the GitHub data file. */
export const monthName = (month: string): string => monthLabel(monthOfKey(month));

/** Says where the numbers of a card come from. */
export const fromGitHub = (header: CollectionHeader): string => t('From the GitHub data file collected on {day}.', { day: collectedDay(header) });

/** What the file covers: the enterprise or the organizations. */
export function scopeText(header: CollectionHeader, organizations: readonly string[]): string {
  if (header.scope === 'enterprise') return t('Enterprise {name}', { name: header.enterprise ?? '' });
  const names = header.organizations.length > 0 ? header.organizations : organizations;
  return names.length === 1 ? t('Organization {name}', { name: names[0] }) : t('Organizations {names}', { names: names.join(t(', ')) });
}

const SOURCE_NAMES: Record<string, string> = {
  organizations: msg('Organizations in the enterprise'),
  seats: msg('GitHub Copilot seats'),
  'seat-summary': msg('Seat totals and policies'),
  members: msg('Members'),
  teams: msg('Members of each team'),
  budgets: msg('Budgets'),
  'cost-centers': msg('Cost centers'),
  'ai-credit-usage': msg('AI credits billed'),
  'usage-report': msg('AI usage report'),
  'usage-summary': msg('Billing summary'),
  'billing-usage': msg('Daily charges'),
  'user-metrics': msg('Activity per user'),
  'scope-metrics': msg('Activity totals'),
  'user-teams': msg('Teams of each user'),
  'audit-log': msg('Audit log'),
};

/** The name of a part of the data, as the collector scripts list it. */
export const sourceName = (id: string): string => (id in SOURCE_NAMES ? t(SOURCE_NAMES[id]) : id);

const SOURCE_STATUS: Record<SourceStatus, { label: string; tone: Tone }> = {
  ok: { label: msg('Complete'), tone: 'good' },
  partial: { label: msg('In part'), tone: 'warn' },
  failed: { label: msg('Failed'), tone: 'bad' },
  skipped: { label: msg('Skipped'), tone: 'neutral' },
};

export const sourceStatus = (status: SourceStatus): { label: string; tone: Tone } => ({ label: t(SOURCE_STATUS[status].label), tone: SOURCE_STATUS[status].tone });

const MONTH_CHECK: Record<MonthCheckStatus, { label: string; tone: Tone }> = {
  match: { label: msg('Same'), tone: 'good' },
  higher: { label: msg('Report has more'), tone: 'warn' },
  lower: { label: msg('Report has less'), tone: 'bad' },
  partial: { label: msg('Part of the month'), tone: 'neutral' },
  open: { label: msg('Month not over'), tone: 'neutral' },
  outside: { label: msg('Not in the report'), tone: 'neutral' },
  missing: { label: msg('No GitHub billing'), tone: 'neutral' },
};

export const monthCheckStatus = (status: MonthCheckStatus): { label: string; tone: Tone } => ({ label: t(MONTH_CHECK[status].label), tone: MONTH_CHECK[status].tone });

const BUDGET_SCOPES: Record<string, string> = {
  enterprise: msg('Enterprise'),
  organization: msg('Organization'),
  cost_center: msg('Cost center'),
  repository: msg('Repository'),
  multi_user_customer: msg('Each user'),
  multi_user_cost_center: msg('Each user in a cost center'),
  user: msg('One user'),
};

/** Who a budget is for: "Organization: octo-org", or the scope alone. */
export function budgetName(budget: GitHubBudget): string {
  const scope = budget.scope in BUDGET_SCOPES ? t(BUDGET_SCOPES[budget.scope]) : budget.scope;
  const entity = budget.user ?? budget.entity;
  return entity === '' ? scope : t('{scope}: {name}', { scope, name: entity });
}

const SEAT_MANAGEMENT: Record<string, string> = {
  assign_all: msg('All members'),
  assign_selected: msg('Selected members or teams'),
  disabled: msg('Turned off'),
  unconfigured: msg('Not set up'),
};

/** How an organization gives seats. */
export const seatManagement = (management: string | null): string => (management === null ? '–' : management in SEAT_MANAGEMENT ? t(SEAT_MANAGEMENT[management]) : management);

const PLANS: Record<string, string> = { business: msg('Business'), enterprise: msg('Enterprise') };

export const planName = (plan: string | null): string => (plan === null ? '–' : plan.toLowerCase() in PLANS ? t(PLANS[plan.toLowerCase()]) : plan);
