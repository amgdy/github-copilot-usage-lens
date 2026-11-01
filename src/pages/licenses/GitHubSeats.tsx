import { useMemo } from 'react';
import { CalcInfo, Card, DataTable, DocLinks, Kpi, KpiGrid, Section, type Column } from '../../components/ui';
import { t, tp } from '../../i18n';
import type { ActivityOverview, AuditMonth, AuditOverview, MetricsUser, SeatOverview, SeatSummary } from '../../lib/collection';
import { fmtDay, parseIsoDay } from '../../lib/utils/date';
import { fmtInt } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { fromGitHub, monthName, planName, seatManagement } from '../githubText';

const countOrDash = (count: number | null | undefined): string => (count === null || count === undefined ? '–' : fmtInt(count));

const dayText = (day: string): string => (day === '' ? '–' : fmtDay(parseIsoDay(day), true));

function SeatsCard({ seats }: { seats: SeatOverview }) {
  const columns = useMemo<Column<SeatSummary>[]>(
    () => [
      { key: 'org', header: t('Organization'), value: (row) => row.org, render: (row) => <span className="font-medium">{row.org}</span> },
      { key: 'total', header: t('Seats'), align: 'end', value: (row) => row.total, render: (row) => countOrDash(row.total) },
      { key: 'active', header: t('Active'), align: 'end', value: (row) => row.activeThisCycle, render: (row) => countOrDash(row.activeThisCycle) },
      { key: 'inactive', header: t('Inactive'), align: 'end', value: (row) => row.inactiveThisCycle, render: (row) => countOrDash(row.inactiveThisCycle) },
      { key: 'added', header: t('Added'), align: 'end', value: (row) => row.addedThisCycle, render: (row) => countOrDash(row.addedThisCycle) },
      { key: 'ending', header: t('Pending cancellation'), align: 'end', value: (row) => row.pendingCancellation, render: (row) => countOrDash(row.pendingCancellation) },
      { key: 'invited', header: t('Pending invitation'), align: 'end', value: (row) => row.pendingInvitation, render: (row) => countOrDash(row.pendingInvitation), hidden: true },
      { key: 'given', header: t('How seats are given'), value: (row) => seatManagement(row.management) },
      { key: 'plan', header: t('Plan'), value: (row) => planName(row.plan) },
    ],
    [],
  );
  const seatTotal = seats.total ?? seats.seatCount;
  const orgCount = seats.orgs.length;
  return (
    <Card title={t('Seats at GitHub')} calc="github-seats" subtitle={t('GitHub Copilot seats as GitHub counts them in this billing cycle, including code completions.')} footer={<DocLinks topic="seats" title={t('Learn more')} limit={3} compact />}>
      <div className="space-y-4">
        <KpiGrid cols="grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
          <Kpi
            label={t('Seats')}
            calc="github-seats"
            value={fmtInt(seatTotal)}
            sub={seats.total !== null && orgCount > 0 ? tp(orgCount, 'In {n} organization', 'In {n} organizations', { n: fmtInt(orgCount) }) : t('People in the seat list')}
          />
          <Kpi label={t('Active this cycle')} calc="github-seats" value={countOrDash(seats.activeThisCycle)} sub={t('Any GitHub Copilot activity')} />
          <Kpi label={t('Inactive this cycle')} calc="github-seats" value={countOrDash(seats.inactiveThisCycle)} tone={seats.inactiveThisCycle ? 'warn' : undefined} sub={t('No activity at all')} />
          <Kpi label={t('Added this cycle')} calc="github-seats" value={countOrDash(seats.addedThisCycle)} />
          <Kpi label={t('Pending cancellation')} calc="github-seats" value={countOrDash(seats.pendingCancellation)} sub={t('End with this billing cycle')} />
          <Kpi
            label={t('Members without a seat')}
            calc="github-members-without-seat"
            value={countOrDash(seats.membersWithoutSeat)}
            sub={seats.memberCount !== null ? tp(seats.memberCount, 'Of {n} member', 'Of {n} members', { n: fmtInt(seats.memberCount) }) : t('Needs the full member list')}
          />
        </KpiGrid>
        {orgCount > 0 ? <DataTable rows={seats.orgs} columns={columns} rowKey={(row) => row.org} pageSize={10} searchable={orgCount > 10} exportName="github-copilot-seats-by-organization" dense /> : null}
      </div>
    </Card>
  );
}

interface QuietUser {
  login: string;
  user: MetricsUser | undefined;
}

function featuresOf(user: MetricsUser | undefined): string {
  if (!user) return '–';
  const features = [
    user.completionDays > 0 ? t('Code completions') : null,
    user.chatDays > 0 ? t('Chat') : null,
    user.agentDays > 0 ? t('Agent') : null,
    user.cliDays > 0 ? t('GitHub Copilot CLI') : null,
  ].filter((feature): feature is string => feature !== null);
  return features.length > 0 ? features.join(t(', ')) : '–';
}

function ActivityCard({ activity, metricsUsers }: { activity: ActivityOverview; metricsUsers: readonly MetricsUser[] }) {
  const quietUsers = useMemo<QuietUser[] | null>(() => {
    if (activity.withoutUsage === null) return null;
    const byLogin = new Map(metricsUsers.map((user) => [user.login.toLowerCase(), user]));
    return activity.withoutUsage.map((login) => ({ login, user: byLogin.get(login.toLowerCase()) }));
  }, [activity.withoutUsage, metricsUsers]);
  const columns = useMemo<Column<QuietUser>[]>(
    () => [
      { key: 'login', header: t('User'), value: (row) => row.login, render: (row) => <span className="font-medium">{row.login}</span> },
      { key: 'days', header: t('Days with activity'), align: 'end', value: (row) => row.user?.days ?? null, render: (row) => countOrDash(row.user?.days) },
      { key: 'last', header: t('Last day with activity'), value: (row) => row.user?.lastDay ?? null, render: (row) => (row.user ? dayText(row.user.lastDay) : '–') },
      { key: 'features', header: t('Features used'), value: (row) => featuresOf(row.user) },
    ],
    [],
  );
  const period = t('{from} to {to}', { from: dayText(activity.firstDay), to: dayText(activity.lastDay) });
  return (
    <Card title={t('Activity at GitHub')} calc="github-activity" subtitle={`${t('From the GitHub Copilot usage metrics, which include code completions.')} ${period}`}>
      <div className="space-y-4">
        <KpiGrid cols="grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
          <Kpi label={t('Active users')} calc="github-activity" value={fmtInt(activity.activeUsers)} sub={tp(activity.dayCount, '{n} day', '{n} days', { n: fmtInt(activity.dayCount) })} />
          <Kpi label={t('Code completions')} calc="github-activity" value={fmtInt(activity.completionUsers)} sub={t('Users')} />
          <Kpi label={t('Chat')} calc="github-activity" value={fmtInt(activity.chatUsers)} sub={t('Users')} />
          <Kpi label={t('Agent')} calc="github-activity" value={fmtInt(activity.agentUsers)} sub={t('Users')} />
          <Kpi label={t('GitHub Copilot CLI')} calc="github-activity" value={fmtInt(activity.cliUsers)} sub={t('Users')} />
          <Kpi
            label={t('Active with no usage in the report')}
            calc="github-activity-no-usage"
            value={quietUsers === null ? '–' : fmtInt(quietUsers.length)}
            sub={quietUsers === null ? t('No days in common with the report') : t('Do not treat as idle')}
          />
        </KpiGrid>
        {quietUsers !== null && quietUsers.length > 0 ? (
          <>
            <p className="text-sm text-fg-muted">
              {t('These people used GitHub Copilot on days the usage report covers, but have no row in it. They use their seat, often for code completions only, which cost no AI credits.')}
            </p>
            <DataTable rows={quietUsers} columns={columns} rowKey={(row) => row.login} pageSize={10} searchable exportName="github-copilot-active-with-no-usage" dense />
          </>
        ) : null}
      </div>
    </Card>
  );
}

function ChangeFact({ label, count }: { label: string; count: number }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="num mt-0.5 text-lg font-semibold leading-tight">{fmtInt(count)}</dd>
    </div>
  );
}

function SeatChangesCard({ audit }: { audit: AuditOverview }) {
  const columns = useMemo<Column<AuditMonth>[]>(
    () => [
      { key: 'month', header: t('Month'), value: (row) => row.month, render: (row) => monthName(row.month) },
      { key: 'added', header: t('Seats added'), align: 'end', value: (row) => row.added, render: (row) => fmtInt(row.added) },
      { key: 'removed', header: t('Seats removed'), align: 'end', value: (row) => row.removed, render: (row) => fmtInt(row.removed) },
      {
        key: 'change',
        header: t('Change'),
        align: 'end',
        value: (row) => row.added - row.removed,
        render: (row) => {
          const change = row.added - row.removed;
          return change > 0 ? `+${fmtInt(change)}` : change < 0 ? `−${fmtInt(-change)}` : fmtInt(0);
        },
      },
    ],
    [],
  );
  return (
    <Card title={t('Seat changes')} calc="github-seat-changes" subtitle={t('From the audit log: seats added and removed, and changes to plans, budgets and policies.')} footer={<DocLinks ids={['auditLogs']} compact />}>
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
          <ChangeFact label={t('Seats added')} count={audit.seatsAdded} />
          <ChangeFact label={t('Seats removed')} count={audit.seatsRemoved} />
          <ChangeFact label={t('Plan changes')} count={audit.planChanges} />
          <ChangeFact label={t('Budget changes')} count={audit.budgetChanges} />
          <ChangeFact label={t('Policy changes')} count={audit.policyChanges} />
          <ChangeFact label={t('Other changes')} count={audit.other} />
        </dl>
        {audit.months.length > 0 ? (
          <DataTable rows={audit.months} columns={columns} rowKey={(row) => row.month} defaultSort={{ key: 'month', dir: 'desc' }} exportName="github-copilot-seat-changes" dense />
        ) : (
          <p className="text-sm text-fg-muted">{t('The audit log has no seat changes in these months.')}</p>
        )}
      </div>
    </Card>
  );
}

/** Seats, activity and seat changes from the GitHub data file. Shown only when one is loaded with your own usage report. */
export function GitHubSeats() {
  const { github } = useAnalysis();
  if (github === null) return null;
  const { seats, activity, audit } = github;
  if (seats === null && activity === null && audit === null) return null;
  return (
    <Section
      title={
        <>
          {t('Seats and activity at GitHub')}
          <CalcInfo id="github-file" className="ms-1" />
        </>
      }
      description={fromGitHub(github.collection.header)}
    >
      <div className="space-y-4">
        {seats ? <SeatsCard seats={seats} /> : null}
        {activity ? <ActivityCard activity={activity} metricsUsers={github.collection.metrics?.users ?? []} /> : null}
        {audit ? <SeatChangesCard audit={audit} /> : null}
      </div>
    </Section>
  );
}
