import { createServer as createProxyServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createServer as createSecureServer } from 'node:https';
import type { AddressInfo, Socket } from 'node:net';
import { gzipSync } from 'node:zlib';
import { makeCsv } from './helpers';

/**
 * A pretend GitHub for the collector script tests. It is an HTTP proxy: gh and curl connect through it to the
 * made-up host github.test, it ends the TLS connection itself and answers with made-up data. It refuses every other
 * host, so a test can never reach the real GitHub.
 */

export const MOCK_HOST = 'github.test';
/** A download host that the pretend network blocks: the proxy refuses to connect to it, as to every host but MOCK_HOST. */
export const BLOCKED_HOST = 'reports.blocked.test';
export const MOCK_TOKEN = 'made-up-token';
export const MOCK_SCOPES = 'manage_billing:copilot, manage_billing:enterprise, read:audit_log, read:enterprise, read:org';

export interface RecordedRequest {
  method: string;
  path: string;
  query: URLSearchParams;
  authorization: string | undefined;
  apiVersion: string | undefined;
  body: string;
}

/** The API version that gh sends when the script names none. */
export const GH_DEFAULT_API_VERSION = '2022-11-28';

export interface MockSettings {
  /** Answer 400 to any newer API version than gh's default, like a GitHub that does not know it yet. */
  rejectApiVersion: boolean;
  /** The AI usage reports GitHub makes when asked have no usage, so GitHub gives no file for them. */
  emptyReports: boolean;
  /** The links of the 28-day activity reports point to BLOCKED_HOST. */
  blockDownloads: boolean;
}

export interface MockGitHub {
  proxyUrl: string;
  /**
   * The two months of the AI usage reports, oldest first. GitHub keeps a finished report for the older one, made after
   * the month ended. For any other month GitHub makes a report when asked, but only one at a time: it answers 409
   * while it makes another.
   */
  usageMonths: [string, string];
  requests: RecordedRequest[];
  /** Change these between runs. */
  settings: MockSettings;
  /** Forgets the requests and the settings, so the next run starts like the first. */
  reset: () => void;
  /**
   * The first day of the latest 28-day activity report. Daily reports of the organization exist for the five days
   * before it, but the third of them has no data. The team report of the organization has no data on the last day.
   */
  reportFirstDay: string;
  reportLastDay: string;
  close: () => Promise<void>;
}

interface Reply {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

const API = `https://${MOCK_HOST}/api/v3`;
const DOWNLOADS = `https://${MOCK_HOST}/downloads`;

const json = (body: unknown, headers: Record<string, string> = {}): Reply => ({ status: 200, body, headers });
const failure = (status: number, message: string): Reply => ({
  status,
  body: { message, documentation_url: 'https://docs.github.com/rest', status: String(status) },
});
const nextLink = (url: string): Record<string, string> => ({ link: `<${url}>; rel="next"` });
/** What GitHub sends for a usage metrics report on a day without data: an empty JSON text, not a report. */
const emptyText: Reply = { status: 200, body: '""', headers: { 'content-type': 'application/json; charset=utf-8' } };

function seat(login: string, organization: string, planType: string, team: string | null = null) {
  return {
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-05T10:00:00Z',
    pending_cancellation_date: login === 'SaraLind_nwind' ? '2026-12-01' : null,
    last_activity_at: '2026-10-20T09:00:00Z',
    last_activity_editor: 'vscode/1.105.0/copilot-chat/0.32.0',
    last_authenticated_at: '2026-10-21T08:00:00Z',
    plan_type: planType,
    assignee: {
      login,
      id: 1000,
      type: 'User',
      name: 'Private Person Name',
      email: `${login}@private.example.test`,
      avatar_url: `https://avatars.private.example.test/${login}`,
    },
    organization: { login: organization, id: 2000, description: 'Private organization text' },
    assigning_team: team ? { slug: team, name: 'Platform', id: 3000, description: 'Private team text' } : null,
  };
}

const ENTERPRISE_SEATS = [
  seat('KofiIto_nwind', 'octo-org', 'enterprise', 'platform'),
  seat('MeiChen_nwind', 'octo-org', 'business'),
  seat('SaraLind_nwind', 'octo-labs', 'business'),
];

const member = (login: string) => ({ login, id: 1, type: 'User', avatar_url: `https://avatars.private.example.test/${login}` });

const BUDGETS = [
  {
    id: 'budget-1', budget_scope: 'enterprise', budget_entity_name: 'octocorp', budget_amount: 500,
    prevent_further_usage: true, budget_product_sku: 'ai_credits', budget_type: 'SkuPricing', consumed_amount: 312.5,
    budget_alerting: { will_alert: true, alert_recipients: ['recipient@private.example.test', 'lens-admin'] },
  },
  {
    id: 'budget-2', budget_scope: 'multi_user_customer', budget_entity_name: 'octocorp', budget_amount: 20,
    prevent_further_usage: true, budget_product_sku: 'ai_credits', budget_type: 'SkuPricing', consumed_amount: 41,
    budget_alerting: { will_alert: false, alert_recipients: [] },
  },
  {
    id: 'budget-3', budget_scope: 'organization', budget_entity_name: 'octo-labs', budget_amount: 100,
    prevent_further_usage: false, budget_product_sku: 'ai_credits', budget_type: 'SkuPricing', consumed_amount: 120,
    budget_alerting: { will_alert: true, alert_recipients: ['recipient@private.example.test'] },
  },
];

function billingItems(kind: string, query: URLSearchParams) {
  const month = `${query.get('year')}-${String(query.get('month')).padStart(2, '0')}`;
  const actions = { product: 'Actions', sku: 'actions_linux', unitType: 'minutes', pricePerUnit: 0.008, grossQuantity: 1000, grossAmount: 8, discountQuantity: 0, discountAmount: 0, netQuantity: 1000, netAmount: 8 };
  if (kind === 'ai_credit/usage') {
    return [{ product: 'Copilot', sku: 'Copilot AI Credits', model: 'GPT-5', unitType: 'credits', pricePerUnit: 0.01, grossQuantity: 12000, grossAmount: 120, discountQuantity: 9000, discountAmount: 90, netQuantity: 3000, netAmount: 30 }];
  }
  if (kind === 'usage/summary') {
    return [{ product: 'Copilot', sku: 'Copilot Business', unitType: 'UserMonths', pricePerUnit: 19, grossQuantity: 2, grossAmount: 38, discountQuantity: 0, discountAmount: 0, netQuantity: 2, netAmount: 38 }, actions];
  }
  return [
    { date: `${month}-01`, product: 'Copilot', sku: 'Copilot Business', quantity: 2, unitType: 'UserMonths', pricePerUnit: 19, grossAmount: 38, discountAmount: 0, netAmount: 38, organizationName: 'octo-org', repositoryName: '' },
    { ...actions, date: `${month}-01`, organizationName: 'octo-org', repositoryName: 'octo-org/app' },
  ];
}

function userDay(login: string, day: string) {
  return {
    day, user_id: login.length, user_login: login, ai_credits_used: 140, code_generation_activity_count: 12,
    code_acceptance_activity_count: 7, loc_added_sum: 40, loc_deleted_sum: 3, used_agent: true, used_chat: true, used_cli: false,
    totals_by_ide: [{ ide: 'vscode', code_generation_activity_count: 12 }],
    totals_by_feature: [{ feature: 'code_completion', code_generation_activity_count: 9 }],
  };
}

/** The AI usage report files. The first has Windows line ends and a cost center name with every character to escape. */
function usageReportFiles(olderMonth: string, newerMonth: string): Record<string, string | Buffer> {
  const older = makeCsv([
    { date: `${olderMonth}-03`, user: 'KofiIto_nwind', gross: 1.25, costCenter: 'Team "North", \\ desk\tA' },
    { date: `${olderMonth}-04`, user: 'MeiChen_nwind', gross: 0.5, model: 'Auto: GPT-5.6 Terra' },
  ]);
  const newer = makeCsv(
    Array.from({ length: 1500 }, (_unused, index) => ({ date: `${newerMonth}-01`, user: `Person${index}_nwind`, gross: (index + 1) / 100 })),
    { bom: false },
  );
  return {
    'ai-usage-old-1.csv': older.replace(/\n/g, '\r\n'),
    'ai-usage-old-2.csv.gz': gzipSync(makeCsv([{ date: `${olderMonth}-05`, user: 'SaraLind_nwind', gross: 2 }], { bom: false })),
    'ai-usage-new.csv': newer,
  };
}

interface UsageReportOptions {
  type?: string;
  links?: string[];
  /** When GitHub made the report. The first day of the report when not given. */
  madeAt?: string;
}

function usageReport(id: string, start: string, end: string, status: string, options: UsageReportOptions = {}) {
  const { type = 'ai_credit', links = [], madeAt = `${start}T08:00:00Z` } = options;
  return {
    id, report_type: type, start_date: `${start}T00:00:00Z`, end_date: `${end}T00:00:00Z`, status, created_at: madeAt,
    actor: { login: 'lens-admin', name: 'Private Admin Name' }, download_urls: links.map((link) => `${DOWNLOADS}/${link}`),
  };
}

const ndjson = (lines: unknown[]): string => lines.map((line) => JSON.stringify(line)).join('\r\n') + '\r\n';

function auditEvent(action: string, user: string, extra: Record<string, unknown> = {}) {
  return {
    '@timestamp': 1792000000000, action, actor: 'lens-admin', user, org: 'octo-labs', business: 'octocorp',
    created_at: 1792000000000, _document_id: 'private-document-id', actor_location: { country_code: 'ZZ' },
    user_agent: 'private user agent', ...extra,
  };
}

export async function startMockGitHub(certificate: string, privateKey: string): Promise<MockGitHub> {
  const requests: RecordedRequest[] = [];
  const settings: MockSettings = { rejectApiVersion: false, emptyReports: false, blockDownloads: false };
  const counts = new Map<string, number>();
  const today = Temporal.Now.plainDateISO('UTC');
  const reportLastDay = today.subtract({ days: 1 }).toString();
  const reportFirstDay = today.subtract({ days: 28 }).toString();
  const oldestDailyDay = today.subtract({ days: 33 }).toString();
  const emptyDailyDay = today.subtract({ days: 31 }).toString();
  const newerMonth = today.toPlainYearMonth();
  const olderMonth = newerMonth.subtract({ months: 1 });
  const usageMonths: [string, string] = [olderMonth.toString(), newerMonth.toString()];
  const olderStart = olderMonth.toPlainDate({ day: 1 }).toString();
  const olderEnd = olderMonth.toPlainDate({ day: olderMonth.daysInMonth }).toString();
  const newerStart = newerMonth.toPlainDate({ day: 1 }).toString();
  const yesterday = today.subtract({ days: 1 }).toString();
  const usageFiles = usageReportFiles(usageMonths[0], usageMonths[1]);
  const reportsPath = '/enterprises/octocorp/settings/billing/reports';
  // The reports the script asked for, by id. GitHub is still making one until the script has looked at it once.
  const madeReports = new Map<string, { start: string; end: string; link: string }>();
  const stillMaking = () => [...madeReports.keys()].some((id) => (counts.get(`/api/v3${reportsPath}/${id}`) ?? 0) < 2);
  // Only report-old fits. The others are still being made, of another type, failed, too old or for two months, or
  // GitHub made them before their last day ended, so they miss usage: report-old-early on the last day of the older
  // month, and report-today today, when this month is not over.
  const usageReports = [
    usageReport('report-old-processing', olderStart, olderEnd, 'processing'),
    usageReport('report-old-early', olderStart, olderEnd, 'completed', { links: ['ai-usage-early.csv'], madeAt: `${olderEnd}T23:54:09Z` }),
    usageReport('report-old', olderStart, olderEnd, 'completed', {
      links: ['signed/ai-usage-old-1.csv', 'ai-usage-old-2.csv.gz'], madeAt: `${newerStart}T00:30:00Z`,
    }),
    usageReport('report-detailed', newerStart, today.toString(), 'completed', { type: 'detailed' }),
    usageReport('report-failed', newerStart, today.toString(), 'failed'),
    usageReport('report-yesterday', newerStart, yesterday, 'completed'),
    usageReport('report-today', newerStart, today.toString(), 'completed', { links: ['ai-usage-today.csv'], madeAt: `${today}T00:13:51Z` }),
    usageReport('report-wide', olderStart, newerStart, 'completed'),
  ];
  const oldReport = usageReports[2];

  const report = (link: string, extra: Record<string, unknown> = {}): Reply => {
    const downloads = settings.blockDownloads ? `https://${BLOCKED_HOST}/downloads` : DOWNLOADS;
    return json({ download_links: [`${downloads}/${link}`], report_start_day: reportFirstDay, report_end_day: reportLastDay, ...extra });
  };

  function answer(request: RecordedRequest): Reply {
    const path = request.path;
    const query = request.query;
    const seen = (counts.get(path) ?? 0) + 1;
    counts.set(path, seen);
    if (settings.rejectApiVersion && request.apiVersion && request.apiVersion !== GH_DEFAULT_API_VERSION) {
      return failure(400, 'Unsupported API version');
    }

    if (path.startsWith('/downloads/')) {
      const file = path.slice('/downloads/'.length);
      // Report links can point to storage that redirects. The scripts must follow it, but only to https.
      if (file.startsWith('signed/')) return { status: 302, headers: { location: `/downloads/${file.slice('signed/'.length)}` } };
      if (file === 'users-28-day.ndjson.gz') {
        const lines = ['KofiIto_nwind', 'MeiChen_nwind'].flatMap((login) => [userDay(login, reportFirstDay), userDay(login, reportLastDay)]);
        return { status: 200, body: gzipSync(ndjson(lines)), headers: { 'content-type': 'application/octet-stream' } };
      }
      if (file === 'aggregate-28-day.json') {
        const aggregate = { report_start_day: reportFirstDay, report_end_day: reportLastDay, daily_active_users: 2, day_totals: [{ day: reportLastDay, daily_active_users: 2 }] };
        return { status: 200, body: JSON.stringify(aggregate, null, 2) };
      }
      if (file === 'user-teams.ndjson') {
        return { status: 200, body: ndjson([{ user_id: 13, user_login: 'KofiIto_nwind', day: reportLastDay, team_id: 1, slug: 'platform' }, { user_id: 13, user_login: 'MeiChen_nwind', day: reportLastDay, team_id: 1, slug: 'platform' }]) };
      }
      const usageFile = usageFiles[file];
      if (usageFile !== undefined) return { status: 200, body: usageFile, headers: { 'content-type': 'text/csv' } };
      const madeFile = /^ai-usage-(\d{4}-\d{2})\.csv$/.exec(file);
      if (madeFile) return { status: 200, body: makeCsv([{ date: `${madeFile[1]}-02`, user: 'KofiIto_nwind', gross: 0.75 }]), headers: { 'content-type': 'text/csv' } };
      const daily = /^users-1-day-(\d{4}-\d{2}-\d{2})\.ndjson$/.exec(file);
      if (daily) return { status: 200, body: ndjson([userDay('MeiChen_nwind', daily[1])]) };
      return failure(404, 'Not Found');
    }

    if (path === '/api/graphql') {
      const payload = JSON.parse(request.body) as { query: string; variables?: Record<string, unknown> };
      if (payload.query.includes('viewer')) {
        return json({ data: { viewer: { admin: { nodes: [{ slug: 'octocorp' }] }, billing: { nodes: [] } } } });
      }
      if (payload.variables?.slug !== 'octocorp') {
        return json({ data: { enterprise: null }, errors: [{ type: 'NOT_FOUND', message: 'Could not resolve to an Enterprise.' }] });
      }
      if (payload.query.includes('organizations(')) {
        const second = payload.variables?.endCursor === 'cursor-1';
        const nodes = second ? [{ login: 'octo-labs', name: 'Octo Labs' }] : [{ login: 'octo-org', name: 'Octo Org' }];
        return json({ data: { enterprise: { organizations: { pageInfo: { hasNextPage: !second, endCursor: second ? null : 'cursor-1' }, nodes } } } });
      }
      if (payload.query.includes('members(')) {
        const nodes = [
          { __typename: 'EnterpriseUserAccount', login: 'KofiIto_nwind', user: { login: 'KofiIto_nwind' } },
          { __typename: 'User', login: 'MeiChen_nwind' },
          { __typename: 'EnterpriseUserAccount', login: 'NoSeat_nwind', user: null },
        ];
        return json({ data: { enterprise: { members: { pageInfo: { hasNextPage: false, endCursor: null }, nodes } } } });
      }
      return json({ errors: [{ message: 'Unknown query' }] });
    }

    if (!path.startsWith('/api/v3/')) return failure(404, 'Not Found');
    const route = path.slice('/api/v3'.length);
    const page = Number(query.get('page') ?? '1');

    if (route === reportsPath) {
      if (request.method === 'POST') {
        if (stillMaking()) return failure(409, 'A usage report export is already in progress');
        const asked = JSON.parse(request.body) as { start_date: string; end_date: string };
        const month = asked.start_date.slice(0, 7);
        const id = asked.start_date === newerStart ? 'report-new' : `report-${month}`;
        const link = id === 'report-new' ? 'ai-usage-new.csv' : `ai-usage-${month}.csv`;
        madeReports.set(id, { start: asked.start_date, end: asked.end_date, link });
        return { status: 202, body: usageReport(id, asked.start_date, asked.end_date, 'processing') };
      }
      return json({ usage_report_exports: usageReports });
    }
    if (route === `${reportsPath}/report-old`) return json(oldReport);
    const madeId = route.startsWith(`${reportsPath}/`) ? route.slice(reportsPath.length + 1) : '';
    const made = madeReports.get(madeId);
    if (made) {
      // GitHub is still making it the first time the script looks.
      return seen === 1
        ? json(usageReport(madeId, made.start, made.end, 'processing'))
        : json(usageReport(madeId, made.start, made.end, 'completed', { links: settings.emptyReports ? [] : [made.link] }));
    }

    switch (route) {
      case '/user':
        return json({ login: 'lens-admin', id: 1, name: 'Private Admin Name' }, { 'x-oauth-scopes': MOCK_SCOPES });
      case '/user/memberships/orgs':
        return json([{ state: 'active', role: 'admin', organization: { login: 'octo-org' } }, { state: 'active', role: 'member', organization: { login: 'octo-labs' } }]);
      case '/enterprises/octocorp/copilot/billing/seats':
        return page === 1
          ? json({ total_seats: 3, seats: ENTERPRISE_SEATS.slice(0, 2) }, nextLink(`${API}${route}?per_page=100&page=2`))
          : json({ total_seats: 3, seats: ENTERPRISE_SEATS.slice(2) });
      case '/orgs/octo-org/copilot/billing/seats':
        return json({ total_seats: 2, seats: ENTERPRISE_SEATS.slice(0, 2) });
      case '/orgs/octo-org/copilot/billing':
        return json({
          seat_breakdown: { total: 2, added_this_cycle: 1, pending_cancellation: 0, pending_invitation: 0, active_this_cycle: 2, inactive_this_cycle: 0 },
          seat_management_setting: 'assign_selected', ide_chat: 'enabled', platform_chat: 'enabled', cli: 'disabled',
          public_code_suggestions: 'block', plan_type: 'business',
        });
      case '/orgs/octo-labs/copilot/billing':
        return failure(403, 'Must be an organization owner');
      case '/orgs/octo-org/members':
        return page === 1
          ? json([member('KofiIto_nwind'), member('MeiChen_nwind')], nextLink(`${API}${route}?per_page=100&page=2`))
          : json([member('NoSeat_nwind')]);
      case '/enterprises/octocorp/settings/billing/budgets':
        return page === 1
          ? json({ budgets: BUDGETS.slice(0, 2), has_next_page: true, total_count: 3 })
          : json({ budgets: BUDGETS.slice(2), has_next_page: false, total_count: 3 });
      case '/enterprises/octocorp/settings/billing/budgets/budget-2/user-states':
        return json({
          user_states: [
            { user: 'KofiIto_nwind', consumed_amount: 19.5, target_amount: 20, override_budget_id: null },
            { user: 'MeiChen_nwind', consumed_amount: 4, target_amount: 20, override_budget_id: null },
          ],
          has_next_page: false,
          total_count: 2,
        });
      case '/organizations/octo-org/settings/billing/budgets':
        return failure(404, 'Not Found');
      case '/enterprises/octocorp/settings/billing/cost-centers':
        return json({
          costCenters: [{
            id: 'cost-center-1', name: 'Platform', state: 'active', azure_subscription: 'private-subscription-id',
            ai_credit_pool_enabled: true, ai_credit_pool_state: { target_amount: 39, current_amount: 12 },
            resources: [{ type: 'User', name: 'KofiIto_nwind' }, { type: 'Org', name: 'octo-org' }],
          }],
        });
      case '/enterprises/octocorp/settings/billing/usage/summary':
        // The first request fails once, so the test sees the script try again.
        return seen === 1 ? failure(502, 'Server Error') : json({ usageItems: billingItems('usage/summary', query) });
      case '/organizations/octo-org/settings/billing/usage':
        return failure(403, 'Resource not accessible by personal access token');
      case '/enterprises/octocorp/copilot/metrics/reports/users-28-day/latest':
      case '/orgs/octo-org/copilot/metrics/reports/users-28-day/latest':
        return report('signed/users-28-day.ndjson.gz');
      case '/enterprises/octocorp/copilot/metrics/reports/enterprise-28-day/latest':
        return report('aggregate-28-day.json');
      case '/orgs/octo-org/copilot/metrics/reports/organization-28-day/latest':
        return { status: 204 };
      case '/orgs/octo-org/copilot/metrics/reports/user-teams-1-day':
        if (query.get('day') === reportLastDay) return emptyText;
        return json({ download_links: [`${DOWNLOADS}/user-teams.ndjson`], report_day: query.get('day') });
      case '/enterprises/octocorp/copilot/metrics/reports/user-teams-1-day':
        return json({ download_links: [`${DOWNLOADS}/user-teams.ndjson`], report_day: query.get('day') });
      case '/orgs/octo-org/copilot/metrics/reports/users-1-day': {
        const day = query.get('day') ?? '';
        if (day === emptyDailyDay) return emptyText;
        return day >= oldestDailyDay ? json({ download_links: [`${DOWNLOADS}/users-1-day-${day}.ndjson`], report_day: day }) : failure(404, 'Not Found');
      }
      case '/orgs/octo-org/copilot/metrics/reports/organization-1-day':
        return failure(404, 'Not Found');
      case '/enterprises/octocorp/audit-log':
      case '/orgs/octo-org/audit-log': {
        const phrase = query.get('phrase') ?? '';
        if (phrase.startsWith('action:billing')) return json([auditEvent('billing.budget_update', 'lens-admin', { data: { target_amount: 500 } })]);
        if (query.get('after') === 'cursor-2') return json([auditEvent('copilot.cfb_seat_cancelled', 'SaraLind_nwind')]);
        return json(
          [
            auditEvent('copilot.cfb_seat_assignment_created', 'SaraLind_nwind', { data: { seat_assignment: 'team', team: 'octo-labs/devs' } }),
            auditEvent('copilot.plan_changed', 'lens-admin', { plan: 'enterprise', old_plan: 'business' }),
          ],
          nextLink(`${API}${route}?phrase=${encodeURIComponent(phrase)}&per_page=100&after=cursor-2`),
        );
      }
      case '/enterprises/octocorp/teams':
        return json([{ id: 1, slug: 'ent:platform', name: 'Platform', description: 'Private team text' }]);
      case '/enterprises/octocorp/teams/ent:platform/memberships':
        return json([member('KofiIto_nwind')]);
      case '/orgs/octo-org/teams':
        return json([{ id: 2, slug: 'devs', name: 'Devs' }]);
      case '/orgs/octo-org/teams/devs/members':
        return json([member('MeiChen_nwind')]);
      case '/orgs/octo-labs/teams':
        return failure(403, 'Must be an organization member');
    }
    const billing = /^\/(?:enterprises\/octocorp|organizations\/octo-org)\/settings\/billing\/(ai_credit\/usage|usage\/summary|usage)$/.exec(route);
    if (billing) return json({ usageItems: billingItems(billing[1], query) });
    return failure(404, 'Not Found');
  }

  const secureServer = createSecureServer({ cert: certificate, key: privateKey }, (request: IncomingMessage, response: ServerResponse) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => {
      const url = new URL(request.url ?? '/', `https://${MOCK_HOST}`);
      const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
      const recorded: RecordedRequest = {
        method: request.method ?? 'GET',
        path: decodeURIComponent(url.pathname),
        query: url.searchParams,
        authorization: single(request.headers.authorization),
        apiVersion: single(request.headers['x-github-api-version']),
        body: Buffer.concat(chunks).toString('utf8'),
      };
      requests.push(recorded);
      const reply = answer(recorded);
      const headers: Record<string, string> = { ...reply.headers };
      let payload: string | Buffer = '';
      if (Buffer.isBuffer(reply.body) || typeof reply.body === 'string') payload = reply.body;
      else if (reply.body !== undefined) {
        payload = JSON.stringify(reply.body);
        headers['content-type'] = 'application/json; charset=utf-8';
      }
      response.writeHead(reply.status, headers);
      response.end(payload);
    });
  });

  const proxy = createProxyServer((_request, response) => {
    response.writeHead(400);
    response.end('This test proxy only tunnels HTTPS to github.test.');
  });
  proxy.on('connect', (request: IncomingMessage, clientSocket: Socket, head: Buffer) => {
    const [hostName] = (request.url ?? '').split(':');
    if (hostName !== MOCK_HOST) {
      clientSocket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
      return;
    }
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    if (head.length > 0) clientSocket.unshift(head);
    secureServer.emit('connection', clientSocket);
  });
  await new Promise<void>((resolve) => proxy.listen(0, '127.0.0.1', resolve));
  const { port } = proxy.address() as AddressInfo;

  return {
    proxyUrl: `http://127.0.0.1:${port}`,
    usageMonths,
    requests,
    settings,
    reset: () => {
      requests.length = 0;
      counts.clear();
      madeReports.clear();
      settings.rejectApiVersion = false;
      settings.emptyReports = false;
      settings.blockDownloads = false;
    },
    reportFirstDay,
    reportLastDay,
    close: () =>
      new Promise<void>((resolve) => {
        secureServer.closeAllConnections();
        proxy.closeAllConnections();
        proxy.close(() => resolve());
      }),
  };
}
