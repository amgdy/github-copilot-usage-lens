/** The `format` of the header line that scripts/collect.sh and scripts/collect.ps1 write. */
export const COLLECTION_FORMAT = 'github-copilot-usage-lens-data';

/** The file version this app reads. */
export const COLLECTION_VERSION = 1;

export type CollectionScope = 'enterprise' | 'organization';

export type SourceStatus = 'ok' | 'partial' | 'failed' | 'skipped';

/**
 * What the scripts say about a finished AI usage report without a file. GitHub makes no file when the report has no
 * usage, for example when the month has just started. The source line says ok with 0 records.
 */
export const EMPTY_REPORT_MESSAGE = 'GitHub made the report, but it has no usage for these days.';

/** What scripts before EMPTY_REPORT_MESSAGE said about the same report. They called it failed. */
export const OLD_EMPTY_REPORT_MESSAGE = 'GitHub gave no file for this report.';

/** How the scripts' messages start when GitHub had not made the AI usage report of a month in time. */
export const REPORT_WAITING_MESSAGES = ['GitHub is still making the report.', 'GitHub makes one report at a time'] as const;

/** The first line of the file: who collected what, and when. */
export interface CollectionHeader {
  /** The script that wrote the file, for example "collect.sh". */
  collector: string;
  collectorVersion: string;
  /** The GitHub host, for example "github.com". */
  host: string;
  scope: CollectionScope;
  enterprise: string | null;
  /** The organizations named on the command line (an enterprise file lists them in its organization records). */
  organizations: string[];
  /** The billing months that were asked for, as YYYY-MM. */
  months: string[];
  /** When the script started (ISO time) and that day (YYYY-MM-DD, UTC). */
  startedAt: string;
  day: string;
}

/**
 * What one source gave: one line per source and target (and month for billing). When a source sent several requests
 * for the same target, such as the users of each budget, they are joined into one line.
 */
export interface CollectionSource {
  id: string;
  scope: string;
  target: string;
  month?: string;
  status: SourceStatus;
  records: number;
  /** The HTTP status of the last request, when the script knew it. */
  http: number | null;
  message: string;
}

/** A GitHub budget. Amounts are in USD. */
export interface GitHubBudget {
  id: string;
  /** enterprise, organization, repository, cost_center, multi_user_customer, multi_user_cost_center or user. */
  scope: string;
  /** The enterprise, organization, repository or cost center the budget is for. */
  entity: string;
  /** The user of a budget for one user. */
  user?: string;
  amount: number;
  /** What was spent against it, when GitHub returned it. */
  consumed: number | null;
  /** True when usage stops once the budget is used up; false when GitHub only sends alerts. Budgets for users always stop usage. */
  stopsUsage: boolean;
  willAlert: boolean;
  /** SkuPricing or ProductPricing. */
  type: string;
  /** The product or SKU the budget covers, as GitHub names it (for example "ai_credits" or "copilot"). */
  sku: string;
  /** The budget covers AI credits (or the older premium requests), so it limits the billed amount of the usage report. */
  aiCredits: boolean;
  /** The budget is about GitHub Copilot: AI credits or the whole product. */
  copilot: boolean;
  expiresAt?: string;
}

/** One user's spending against a budget for many users. */
export interface BudgetUserState {
  budgetId: string;
  login: string;
  consumed: number;
  /** The amount for this user. */
  limit: number;
}

/** A cost center at GitHub and what is assigned to it. */
export interface CostCenter {
  id: string;
  name: string;
  /** Users assigned to the cost center by login. */
  users: string[];
  organizations: string[];
  /** Enterprise teams, by the name GitHub gave. */
  teams: string[];
  repositories: string[];
  /** The cost center may use only its own share of the included credits (included usage controls). */
  poolCapped: boolean;
}

/** Billing amounts of one month (USD). */
export interface BillingAmounts {
  gross: number;
  discount: number;
  net: number;
  /** AI credits, or seat-months for seat charges. */
  quantity: number;
}

/** Billing amounts of one month for one billing target (the enterprise or an organization). */
export interface BillingMonth extends BillingAmounts {
  /** YYYY-MM */
  month: string;
  target: string;
}

/** The seat summary of one organization, from GitHub's GitHub Copilot billing settings. Null means GitHub did not say. */
export interface SeatSummary {
  org: string;
  total: number | null;
  addedThisCycle: number | null;
  pendingCancellation: number | null;
  pendingInvitation: number | null;
  activeThisCycle: number | null;
  inactiveThisCycle: number | null;
  /** How seats are given: assign_all, assign_selected, disabled or unconfigured. */
  management: string | null;
  plan: string | null;
  ideChat: string | null;
  platformChat: string | null;
  cli: string | null;
}

/** One user in the usage metrics: days with activity and what they used. */
export interface MetricsUser {
  login: string;
  /** Days with any activity. */
  days: number;
  /** YYYY-MM-DD: the first and the last day with activity. */
  firstDay: string;
  lastDay: string;
  credits: number;
  completionDays: number;
  chatDays: number;
  agentDays: number;
  cliDays: number;
}

export interface MetricsSummary {
  /** YYYY-MM-DD */
  firstDay: string;
  lastDay: string;
  /** Days that have at least one user line. */
  dayCount: number;
  users: MetricsUser[];
}

export type AuditKind = 'seat-added' | 'seat-removed' | 'plan' | 'budget' | 'policy' | 'other';

export interface AuditEvent {
  action: string;
  kind: AuditKind;
  /** YYYY-MM-DD, when the event had a readable time. */
  day?: string;
  user?: string;
  org?: string;
}

/** One CSV file of the AI usage report that the collector script saved, put back together. */
export interface UsageReportFile {
  month: string;
  /** A name for the list of loaded files, such as ai-usage-report-2026-10.csv. */
  name: string;
  data: Blob;
  /** Lines of the file, the line with the column names included. */
  lines: number;
}

/** Everything the app keeps from a file of the collector scripts. It stays in memory only. */
export interface Collection {
  fileName: string;
  header: CollectionHeader;
  /** The file has the end line, so the script finished writing it. */
  complete: boolean;
  sources: CollectionSource[];
  /** Record lines that were read. */
  records: number;
  /** Lines that could not be read (broken JSON, too long, unknown shape). */
  skippedLines: number;
  organizations: string[];
  /** Seat records as the collector wrote them, for the license list. */
  seats: unknown[];
  /** total_seats as GitHub reported it, one value per scope and target. */
  seatTotals: { target: string; total: number }[];
  seatSummaries: SeatSummary[];
  /** Members of the enterprise or the organizations, in lower case. */
  members: string[];
  /** Team names by team slug. */
  teams: Record<string, string>;
  /** Team slugs by login in lower case, from team members and the user-teams report. */
  userTeams: Record<string, string[]>;
  budgets: GitHubBudget[];
  budgetUsers: BudgetUserState[];
  /** Active cost centers. Deleted ones are left out. */
  costCenters: CostCenter[];
  /** The AI credit usage report of GitHub billing, added up by month and target. */
  aiCredits: BillingMonth[];
  /** The AI credit lines of the billing usage summary, used when the AI credit report is missing. */
  summaryCredits: BillingMonth[];
  /** Seat charges (seat-months) from the billing usage summary, by month and target. */
  seatCharges: BillingMonth[];
  metrics: MetricsSummary | null;
  audit: AuditEvent[];
  /**
   * The AI usage report files of the months the script saved in full, oldest month first. A month with a missing or
   * damaged part is left out, so the app never shows a month with only some of its usage.
   */
  usageReports: UsageReportFile[];
  /** True when one of the lists above reached its size limit. */
  capped: boolean;
}
