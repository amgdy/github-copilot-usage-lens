import { CollectionReader } from '../collection/read.ts';
import { COLLECTION_FORMAT, COLLECTION_VERSION, type Collection } from '../collection/types.ts';
import type { DataStore } from '../types.ts';
import { daysInMonth, isoDate, monthIndexOf, monthKey, monthStartDay, parseIsoDay } from '../utils/date.ts';
import { DEMO_SHORTCODE } from './generate.ts';

/**
 * A made-up GitHub data file for the sample report, in the format of the collector scripts. It is built from the
 * sample usage report itself, so the budgets, seats, billing and activity agree with the report: the enterprise
 * `northwind`, its organizations and cost centers, the seats of every sample user plus a few idle seats, AI credit
 * budgets that are partly used, near the limit and used up, billing for each month, activity per user and day, and
 * seat and budget changes. Nothing is read from GitHub or from a file.
 */

export const DEMO_ENTERPRISE = 'northwind';
export const SAMPLE_GITHUB_FILE_NAME = 'sample-github-data.ndjson';

type Line = Record<string, unknown>;

/** Seats that nobody used in the report: two only use code completions, the others are idle. */
const IDLE_LOGINS = ['AmaraOkafor', 'LinneaBerg', 'TomasHerrera', 'YukiSato', 'PriyaRaman', 'OwenGallagher'].map((name) => `${name}_${DEMO_SHORTCODE}`);
const COMPLETION_ONLY = new Set(IDLE_LOGINS.slice(0, 2));
const IDLE_ORGS = ['northwind-platform', 'northwind-apps', 'northwind-data', 'northwind-labs', 'northwind-apps', 'northwind-platform'];

/** The budget for each organization as a share of what it was billed this month: one used up, one near the limit, one with room. */
const ORG_BUDGET_SHARES: Record<string, number> = { 'northwind-labs': 1.04, 'northwind-apps': 0.86, 'northwind-platform': 0.55 };
const CENTER_BUDGET_SHARES: Record<string, number> = { 'Mobile Studio': 0.9, 'Developer Experience': 0.4, 'Applied AI Research': 0.7 };
/** The limit for each user of the enterprise, in USD. */
const USER_LIMIT = 30;
/** Limits for each user of a cost center, in USD: one lower and one higher than the limit for each user. */
const CENTER_USER_LIMITS: Record<string, number> = { 'Mobile Studio': 20, 'Applied AI Research': 60 };
/** The cost center that may use only its own share of the included credits. */
const POOL_CAPPED_CENTER = 'Mobile Studio';

/** A small hash of a text, so the made-up details stay the same on every run. */
function hashOf(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return (hash >>> 0) / 4294967296;
}

/** A round step for a budget of about this amount: 5 under 100, 10 under 1,000, then 100. */
const stepFor = (amount: number): number => (amount < 100 ? 5 : amount < 1000 ? 10 : 100);
const roundUp = (amount: number): number => Math.max(5, Math.ceil(amount / stepFor(amount)) * stepFor(amount));
const roundDown = (amount: number): number => Math.max(5, Math.floor(amount / stepFor(amount)) * stepFor(amount));
const cents = (amount: number): number => Math.round(amount * 100) / 100;

interface SampleUser {
  login: string;
  org: string;
  costCenter: string;
  plan: 'business' | 'enterprise';
  firstDay: number;
  lastDay: number;
  /** Billed in the month of collection, in USD. */
  billedThisMonth: number;
  /** Usage in the month of collection, in USD. Limits for users count this, included credits too. */
  usedThisMonth: number;
  /** Days with usage in the report. */
  days: Set<number>;
  credits: Map<number, number>;
}

function usersOf(store: DataStore, monthStart: number, collectedDay: number): Map<string, SampleUser> {
  const users = new Map<string, SampleUser>();
  const orgCounts = new Map<string, Map<string, number>>();
  for (let i = 0; i < store.n; i++) {
    if (store.day[i] > collectedDay) continue;
    const login = store.dicts.user.values[store.user[i]];
    if (!login) continue;
    let user = users.get(login);
    if (user === undefined) {
      user = { login, org: '', costCenter: '', plan: 'business', firstDay: store.day[i], lastDay: store.day[i], billedThisMonth: 0, usedThisMonth: 0, days: new Set(), credits: new Map() };
      users.set(login, user);
    }
    const org = store.dicts.org.values[store.org[i]];
    const counts = orgCounts.get(login) ?? new Map<string, number>();
    counts.set(org, (counts.get(org) ?? 0) + 1);
    orgCounts.set(login, counts);
    user.costCenter ||= store.dicts.costCenter.values[store.costCenter[i]];
    if (store.quota[i] >= 3900) user.plan = 'enterprise';
    user.firstDay = Math.min(user.firstDay, store.day[i]);
    user.lastDay = Math.max(user.lastDay, store.day[i]);
    user.days.add(store.day[i]);
    user.credits.set(store.day[i], (user.credits.get(store.day[i]) ?? 0) + store.qty[i]);
    if (store.day[i] >= monthStart) {
      user.billedThisMonth += store.net[i];
      user.usedThisMonth += store.gross[i];
    }
  }
  for (const [login, counts] of orgCounts) users.get(login)!.org = [...counts].sort((a, b) => b[1] - a[1])[0][0];
  return users;
}

/**
 * The day the made-up GitHub data is collected, at the end of the day: two days after the included credits of the
 * second month run out, so the AI credit budgets have billed usage to show. In the other months of the sample the
 * included credits cover all usage. Without billed usage it is the last day of the report.
 */
export function sampleCollectionDay(store: DataStore): string {
  const secondMonth = monthIndexOf(store.minDay) + 1;
  let firstBilled = Infinity;
  for (let i = 0; i < store.n; i++) if (store.net[i] > 0 && monthIndexOf(store.day[i]) === secondMonth) firstBilled = Math.min(firstBilled, store.day[i]);
  if (firstBilled === Infinity) return isoDate(store.maxDay);
  return isoDate(Math.min(firstBilled + 2, monthStartDay(secondMonth + 1) - 1, store.maxDay));
}

/** Writes the lines of a made-up GitHub data file for a sample usage report, as collected on the ISO day `collectedOn`. */
export function sampleGitHubLines(store: DataStore, collectedOn: string): string[] {
  const collectedDay = parseIsoDay(collectedOn);
  const monthIndex = monthIndexOf(collectedDay);
  const monthStart = monthStartDay(monthIndex);
  const month = monthKey(monthIndex);
  const firstMonth = monthIndexOf(store.minDay);
  const months: string[] = [];
  for (let index = firstMonth; index <= monthIndex; index++) months.push(monthKey(index));
  const users = usersOf(store, monthStart, collectedDay);
  const enterprise = { scope: 'enterprise', target: DEMO_ENTERPRISE };
  const lines: Line[] = [];
  const record = (kind: string, value: Line, extra: Line = {}) => lines.push({ kind, ...enterprise, record: value, ...extra });
  const source = (id: string, records: number, extra: Line = {}) =>
    lines.push({ kind: 'source', id, ...enterprise, status: 'ok', records, http: 200, message: '', endpoint: `/enterprises/${DEMO_ENTERPRISE}`, ...extra });

  const organizations = [...new Set([...users.values()].map((user) => user.org))].filter(Boolean).sort();
  for (const login of organizations) record('organization', { login });
  source('organizations', organizations.length);

  // Seats: every user of the report, and a few seats nobody used.
  const seatDay = (day: number) => `${isoDate(day)}T09:00:00Z`;
  let seatCount = 0;
  for (const user of users.values()) {
    record('seat', {
      assignee: { login: user.login, type: 'User' },
      organization: { login: user.org },
      assigning_team: null,
      plan_type: user.plan,
      created_at: seatDay(Math.min(user.firstDay, store.minDay - 30)),
      last_activity_at: seatDay(user.lastDay),
      last_activity_editor: hashOf(user.login) < 0.7 ? 'vscode/1.104.0' : 'JetBrains-IU/252',
    });
    seatCount++;
  }
  IDLE_LOGINS.forEach((login, index) => {
    record('seat', {
      assignee: { login, type: 'User' },
      organization: { login: IDLE_ORGS[index] },
      assigning_team: null,
      plan_type: 'business',
      created_at: seatDay(store.minDay - 60 + index),
      last_activity_at: COMPLETION_ONLY.has(login) ? seatDay(collectedDay - 2) : null,
      last_activity_editor: COMPLETION_ONLY.has(login) ? 'vscode/1.104.0' : null,
    });
    seatCount++;
  });
  record('seat-total', { total_seats: seatCount });
  source('seats', seatCount);

  const seatsByOrg = new Map<string, { total: number; active: number }>();
  const activeSince = collectedDay - 30;
  for (const user of users.values()) {
    const entry = seatsByOrg.get(user.org) ?? { total: 0, active: 0 };
    entry.total++;
    if (user.lastDay >= activeSince) entry.active++;
    seatsByOrg.set(user.org, entry);
  }
  IDLE_LOGINS.forEach((login, index) => {
    const entry = seatsByOrg.get(IDLE_ORGS[index]) ?? { total: 0, active: 0 };
    entry.total++;
    if (COMPLETION_ONLY.has(login)) entry.active++;
    seatsByOrg.set(IDLE_ORGS[index], entry);
  });
  for (const org of organizations) {
    const entry = seatsByOrg.get(org) ?? { total: 0, active: 0 };
    lines.push({
      kind: 'seat-summary',
      scope: 'organization',
      target: org,
      record: {
        seat_breakdown: { total: entry.total, added_this_cycle: Math.round(entry.total * 0.05), pending_cancellation: 0, pending_invitation: 0, active_this_cycle: entry.active, inactive_this_cycle: entry.total - entry.active },
        seat_management_setting: org === 'northwind-labs' ? 'assign_all' : 'assign_selected',
        plan_type: 'business',
        ide_chat: 'enabled',
        platform_chat: 'enabled',
        cli: 'enabled',
      },
    });
  }
  source('seat-summary', organizations.length);

  const members = [...users.keys(), ...IDLE_LOGINS, `ChidiNwosu_${DEMO_SHORTCODE}`, `SofiaLindqvist_${DEMO_SHORTCODE}`];
  for (const login of members) record('member', { login });
  source('members', members.length);

  // Budgets for AI credits, set against what each scope was billed this month.
  const billedBy = (key: (user: SampleUser) => string) => {
    const totals = new Map<string, number>();
    for (const user of users.values()) totals.set(key(user), (totals.get(key(user)) ?? 0) + user.billedThisMonth);
    return totals;
  };
  const elapsed = collectedDay - monthStart + 1;
  const monthDays = daysInMonth(monthIndex);
  const totalBilled = [...users.values()].reduce((total, user) => total + user.billedThisMonth, 0);
  const budgetIds: string[] = [];
  const budget = (id: string, scope: string, entity: string, amount: number, consumed: number, stopsUsage: boolean, extra: Line = {}) => {
    budgetIds.push(id);
    record('budget', {
      id,
      budget_type: 'SkuPricing',
      budget_product_sku: 'ai_credits',
      budget_scope: scope,
      budget_entity_name: entity,
      budget_amount: amount,
      consumed_amount: cents(consumed),
      prevent_further_usage: stopsUsage,
      budget_alerting: { will_alert: true, alert_recipients: ['billing-admins'] },
      ...extra,
    });
  };
  budget('sample-enterprise', 'enterprise', DEMO_ENTERPRISE, roundUp(totalBilled * 2.2), totalBilled, false);
  const orgBilled = billedBy((user) => user.org);
  for (const [org, share] of Object.entries(ORG_BUDGET_SHARES)) {
    const billed = orgBilled.get(org) ?? 0;
    const amount = share >= 1 ? roundDown(billed / share) : roundUp(billed / share);
    budget(`sample-org-${org}`, 'organization', org, amount, share >= 1 ? Math.max(billed, amount) : billed, true);
  }
  const centerBilled = billedBy((user) => user.costCenter);
  for (const [center, share] of Object.entries(CENTER_BUDGET_SHARES)) budget(`sample-center-${center}`, 'cost_center', center, roundUp((centerBilled.get(center) ?? 0) / share), centerBilled.get(center) ?? 0, false);
  // A budget for GitHub Copilot as a whole, which also counts seat charges.
  const seatCharges = [...users.values()].reduce((total, user) => total + (user.plan === 'enterprise' ? 39 : 19), IDLE_LOGINS.length * 19);
  record('budget', {
    id: 'sample-copilot',
    budget_type: 'ProductPricing',
    budget_product_sku: 'copilot',
    budget_scope: 'enterprise',
    budget_entity_name: DEMO_ENTERPRISE,
    budget_amount: roundUp((seatCharges + totalBilled) * 1.6),
    consumed_amount: cents(seatCharges * Math.min(1, elapsed / monthDays) + totalBilled),
    prevent_further_usage: false,
    budget_alerting: { will_alert: true, alert_recipients: ['billing-admins'] },
  });
  budgetIds.push('sample-copilot');
  // Limits for users count all usage, included credits too: a limit for each user, limits for each user of two
  // cost centers, and budgets of their own for the two heaviest users. The most specific limit replaces the others.
  const ranked = [...users.values()].sort((a, b) => b.usedThisMonth - a.usedThisMonth || a.login.localeCompare(b.login));
  const heaviest = ranked.slice(0, 2);
  for (const [index, user] of heaviest.entries()) {
    const amount = index === 0 ? roundDown(user.usedThisMonth) : roundUp(user.usedThisMonth / 0.82);
    budget(`sample-user-${user.login}`, 'user', user.login, amount, index === 0 ? Math.max(amount, user.usedThisMonth) : user.usedThisMonth, true, { user: user.login });
  }
  const centerLimitId = (center: string) => `sample-center-users-${center}`;
  for (const [center, limit] of Object.entries(CENTER_USER_LIMITS)) budget(centerLimitId(center), 'multi_user_cost_center', center, limit, 0, true, { consumed_amount: null });
  budget('sample-each-user', 'multi_user_customer', DEMO_ENTERPRISE, USER_LIMIT, 0, true, { consumed_amount: null });
  for (const user of ranked) {
    if (user.lastDay < monthStart) continue;
    const ownBudget = heaviest.includes(user) ? `sample-user-${user.login}` : null;
    const centerLimit = CENTER_USER_LIMITS[user.costCenter];
    if (centerLimit !== undefined) {
      record(
        'budget-user',
        { user: user.login, consumed_amount: cents(Math.min(centerLimit, user.usedThisMonth)), target_amount: centerLimit, override_budget_id: ownBudget },
        { parent: centerLimitId(user.costCenter) },
      );
    }
    record(
      'budget-user',
      {
        user: user.login,
        consumed_amount: cents(Math.min(USER_LIMIT, user.usedThisMonth)),
        target_amount: USER_LIMIT,
        override_budget_id: ownBudget ?? (centerLimit !== undefined ? centerLimitId(user.costCenter) : null),
      },
      { parent: 'sample-each-user' },
    );
  }
  source('budgets', budgetIds.length);

  // Cost centers and the users in them.
  const centers = new Map<string, string[]>();
  for (const user of users.values()) if (user.costCenter) centers.set(user.costCenter, [...(centers.get(user.costCenter) ?? []), user.login]);
  for (const [center, logins] of [...centers].sort((a, b) => a[0].localeCompare(b[0]))) {
    record('cost-center', {
      id: `sample-cc-${center.toLowerCase().replaceAll(' ', '-')}`,
      name: center,
      state: 'active',
      ai_credit_pool_enabled: center === POOL_CAPPED_CENTER,
      resources: logins.map((login) => ({ type: 'User', name: login })),
    });
  }
  source('cost-centers', centers.size);

  // Billing for each month: the AI credits of the report and the seat charges.
  for (const billingMonth of months) {
    const index = months.indexOf(billingMonth) + firstMonth;
    let gross = 0;
    let discount = 0;
    let net = 0;
    let quantity = 0;
    for (let i = 0; i < store.n; i++) {
      if (monthIndexOf(store.day[i]) !== index || store.day[i] > collectedDay) continue;
      gross += store.gross[i];
      discount += store.discount[i];
      net += store.net[i];
      quantity += store.qty[i];
    }
    record('ai-credit-usage', { product: 'copilot', sku: 'copilot_ai_credits', unitType: 'credits', pricePerUnit: 0.01, grossQuantity: quantity, grossAmount: gross, discountAmount: discount, netAmount: net }, { month: billingMonth });
    source('ai-credit-usage', 1, { month: billingMonth });
    const seatsIn = (plan: SampleUser['plan']) => [...users.values()].filter((user) => user.plan === plan && monthIndexOf(user.firstDay) <= index).length + (plan === 'business' ? IDLE_LOGINS.length : 0);
    for (const plan of ['business', 'enterprise'] as const) {
      const seatMonths = seatsIn(plan);
      const price = plan === 'enterprise' ? 39 : 19;
      const amount = seatMonths * price * (billingMonth === month ? Math.min(1, elapsed / monthDays) : 1);
      record(
        'usage-summary',
        { product: 'copilot', sku: `copilot_${plan}`, unitType: 'user-months', grossQuantity: seatMonths, grossAmount: amount, discountAmount: 0, netAmount: amount },
        { month: billingMonth },
      );
    }
    source('usage-summary', 2, { month: billingMonth });
  }

  // Activity per user and day for the last 28 days, with code completions the usage report does not have.
  const windowStart = collectedDay - 28;
  let metricLines = 0;
  for (const user of users.values()) {
    for (const day of [...user.days].sort((a, b) => a - b)) {
      if (day < windowStart) continue;
      const usesAgent = hashOf(`${user.login}${day}`) < 0.35;
      record('user-metrics', {
        user_login: user.login,
        day: isoDate(day),
        used_chat: true,
        used_agent: usesAgent,
        used_cli: hashOf(`${day}${user.login}`) < 0.12,
        totals_by_feature: [{ feature: 'code_completion', code_generation_activity_count: 20 + Math.round(hashOf(user.login + String(day)) * 80) }],
        ai_credits_used: Math.round(user.credits.get(day) ?? 0),
      });
      metricLines++;
    }
  }
  for (const login of COMPLETION_ONLY) {
    for (let day = windowStart; day < collectedDay; day++) {
      if (new Date(day * 86400000).getUTCDay() % 6 === 0) continue;
      record('user-metrics', { user_login: login, day: isoDate(day), used_chat: false, totals_by_feature: [{ feature: 'code_completion', code_generation_activity_count: 15 + (day % 20) }] });
      metricLines++;
    }
  }
  source('user-metrics', metricLines);

  // Seat and budget changes from the audit log.
  const auditDay = (day: number) => `${isoDate(day)}T10:30:00Z`;
  const admin = `MarcusWebb_${DEMO_SHORTCODE}`;
  const events: Line[] = [];
  for (const user of users.values()) if (user.firstDay > store.minDay + 7) events.push({ action: 'copilot.cfb_seat_assignment_created', '@timestamp': auditDay(user.firstDay - 1), user: admin, org: user.org });
  events.push({ action: 'copilot.cfb_seat_cancelled', '@timestamp': auditDay(store.minDay + 20), user: admin, org: 'northwind-apps' });
  events.push({ action: 'copilot.cfb_seat_cancelled', '@timestamp': auditDay(store.minDay + 41), user: admin, org: 'northwind-data' });
  events.push({ action: 'business.budget_created', '@timestamp': auditDay(store.minDay + 2), user: admin });
  events.push({ action: 'business.budget_updated', '@timestamp': auditDay(Math.max(monthStart, collectedDay - 12)), user: admin, org: 'northwind-labs' });
  events.push({ action: 'business.budget_updated', '@timestamp': auditDay(Math.max(monthStart, collectedDay - 4)), user: admin, org: 'northwind-apps' });
  events.push({ action: 'business.budget_created', '@timestamp': auditDay(Math.max(monthStart, collectedDay - 3)), user: admin });
  for (const event of events) record('audit-event', event);
  source('audit-log', events.length);

  const startedAt = `${collectedOn}T22:00:00Z`;
  const headerLine: Line = {
    kind: 'header',
    format: COLLECTION_FORMAT,
    version: COLLECTION_VERSION,
    collector: 'sample',
    collectorVersion: '1.0.0',
    host: 'github.com',
    scope: 'enterprise',
    enterprise: DEMO_ENTERPRISE,
    organizations,
    months,
    startedAt,
  };
  const endLine: Line = { kind: 'end', finishedAt: `${collectedOn}T22:04:00Z`, records: lines.filter((line) => line.kind !== 'source').length };
  return [headerLine, ...lines, endLine].map((line) => JSON.stringify(line));
}

/** The made-up GitHub data file of a sample usage report, read as the app reads a real one. */
export function sampleCollection(store: DataStore, collectedOn = sampleCollectionDay(store)): Collection {
  const reader = new CollectionReader();
  for (const line of sampleGitHubLines(store, collectedOn)) reader.push(line);
  return reader.finish(SAMPLE_GITHUB_FILE_NAME);
}
