import { Badge, Card, DocLinks } from '../../components/ui';
import { msg, t } from '../../i18n';
import type { LinkId } from '../../lib/links';

interface Source {
  title: string;
  /** What the source adds, in one plain sentence. */
  detail: string;
  /** How to get it, in one plain sentence. */
  action: string;
  priority?: 'recommended' | 'advanced' | 'script';
  used: boolean;
  links: LinkId[];
}

// Ordered by how much each source adds to this report.
const SOURCES: Source[] = [
  {
    title: msg('GitHub Copilot activity report'),
    detail: msg('For most admins, this is the easiest seat list to get. It shows last activity, sign-in date and last feature or editor, but not plan or seat start date.'),
    action: msg('For an organization, open Settings, GitHub Copilot, Access, Get usage report, then Get activity report. For an enterprise, open Billing and licensing, Licensing, then Get activity report. Check the scope and seat count before acting.'),
    priority: 'recommended',
    used: true,
    links: ['activityReport'],
  },
  {
    title: msg('GitHub data file from the collector script'),
    detail: msg('Budgets, seats, members, the whole bill, activity with code completions and seat changes, in one file. It makes the pool, budget and seat findings more exact and adds more recommendations.'),
    action: msg('Run the collector script with the command from the GitHub data file card, then load its file.'),
    priority: 'script',
    used: true,
    links: ['budgetsApi', 'billingUsageApi', 'usageMetricsApi', 'auditLogs'],
  },
  {
    title: msg('Seat list from the GitHub REST API'),
    detail: msg('Advanced option for plan, seat start and pending-cancellation details, or repeatable exports. Its activity dates still have the same 90-day limit.'),
    action: msg('Save every page as JSON with the GitHub CLI, then load it with the usage report.'),
    priority: 'advanced',
    used: true,
    links: ['seatsApi'],
  },
  {
    title: msg('Budgets API'),
    detail: msg('The budgets set for AI credits and how much of each is spent.'),
    action: msg('Read from the GitHub data file. The Budgets page lists each budget, and the AI credit budget becomes the monthly budget when Settings has none.'),
    used: true,
    links: ['budgetsApi'],
  },
  {
    title: msg('Billing usage API'),
    detail: msg('What GitHub billed each month, seats included.'),
    action: msg('Read from the GitHub data file. Usage and pool shows the whole bill, and the Data page checks the usage report against it.'),
    used: true,
    links: ['billingUsageApi'],
  },
  {
    title: msg('Usage metrics API'),
    detail: msg('Daily use by editor, language and feature. Useful to see how people work with GitHub Copilot, not what it costs.'),
    action: msg('Read from the GitHub data file. Licenses shows who is active, including people who use only code completions.'),
    used: true,
    links: ['usageMetricsApi', 'usageMetricsData'],
  },
  {
    title: msg('Audit log'),
    detail: msg('When seats were added or removed, and when plans, budgets and policies changed.'),
    action: msg('Read from the GitHub data file. Licenses shows the seats added and removed each month.'),
    used: true,
    links: ['auditLogs'],
  },
  {
    title: msg('Team members API'),
    detail: msg('Which team each user is in. Useful to compare usage by team.'),
    action: msg('Read from the GitHub data file when the script runs with --teams. The Organization page then groups usage by team.'),
    used: true,
    links: ['teamMembersApi'],
  },
  {
    title: msg('Cost centers API'),
    detail: msg('All cost centers and their members, including people with no usage yet.'),
    action: msg('Read from the GitHub data file. The Budgets page uses their user, team and organization assignments to find the applicable limits and shows their included credit pool controls.'),
    used: true,
    links: ['costCentersApi'],
  },
];

/** Other GitHub data that adds to the usage report, and whether the app reads it. */
export function EnrichmentCard() {
  return (
    <Card title={t('What else you can add')} subtitle={t('Other GitHub data that adds to the usage report, from the most useful.')}>
      <ol className="space-y-3">
        {SOURCES.map((source) => (
          <li key={source.title} className="rounded-lg border border-border px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-fg">{t(source.title)}</span>
              {source.priority === 'recommended' ? <Badge tone="good">{t('Recommended for most admins')}</Badge> : null}
              {source.priority === 'advanced' ? <Badge>{t('Advanced')}</Badge> : null}
              {source.priority === 'script' ? <Badge>{t('Needs the GitHub CLI')}</Badge> : null}
              {source.used ? <Badge tone="good">{t('Read by this app')}</Badge> : <Badge>{t('Not read yet')}</Badge>}
            </div>
            <p className="mt-1 text-xs text-fg-muted">{t(source.detail)}</p>
            <p className="mt-0.5 text-xs text-fg-muted">{t(source.action)}</p>
            <DocLinks ids={source.links} compact className="mt-1.5" />
          </li>
        ))}
      </ol>
    </Card>
  );
}
