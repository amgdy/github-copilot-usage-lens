/**
 * Official GitHub and Microsoft pages the app points to. Every URL was opened and checked on 2026-10-27.
 * Pages, tips and metric docs refer to links by id, so a moved page is fixed here once.
 */

export type LinkSource = 'GitHub Docs' | 'GitHub Blog' | 'GitHub Changelog' | 'Microsoft Learn' | 'GitHub Resources';

export interface DocLink {
  /** Plain-language title, shown as the link text. */
  label: string;
  url: string;
  source: LinkSource;
}

const DOCS = 'https://docs.github.com/en/enterprise-cloud@latest';

/** The GitHub repository with the source code of this app, as owner/name. */
export const APP_REPOSITORY = 'amgdy/github-copilot-usage-lens';

/** The GitHub repository with the source code of this app. */
export const APP_REPOSITORY_URL = `https://github.com/${APP_REPOSITORY}`;

/** The part of the README that explains the collector scripts. */
export const APP_COLLECTOR_URL = `${APP_REPOSITORY_URL}#collect-more-data-from-github`;

export const LINKS = {
  // Billing and AI credits
  copilotBilling: { label: 'GitHub Copilot billing', url: `${DOCS}/billing/concepts/product-billing/github-copilot-billing`, source: 'GitHub Docs' },
  usageBilling: {
    label: 'Usage-based billing for organizations and enterprises',
    url: `${DOCS}/copilot/concepts/billing-and-usage/organizations-and-enterprises/billing`,
    source: 'GitHub Docs',
  },
  budgets: { label: 'Budgets for usage-based billing', url: `${DOCS}/copilot/concepts/billing-and-usage/organizations-and-enterprises/budgets`, source: 'GitHub Docs' },
  manageSpending: {
    label: "Managing your company's spending on GitHub Copilot",
    url: `${DOCS}/copilot/how-tos/manage-and-track-spending/manage-company-spending`,
    source: 'GitHub Docs',
  },
  setUpBudgets: { label: 'Setting up budgets to control spending', url: `${DOCS}/billing/how-tos/set-up-budgets`, source: 'GitHub Docs' },
  budgetsAlerts: { label: 'Budgets and alerts', url: `${DOCS}/billing/concepts/budgets-and-alerts`, source: 'GitHub Docs' },

  // Models and prices
  pricing: { label: 'Models and pricing for GitHub Copilot', url: `${DOCS}/copilot/reference/copilot-billing/models-and-pricing`, source: 'GitHub Docs' },
  modelComparison: { label: 'AI model comparison', url: `${DOCS}/copilot/reference/ai-models/model-comparison`, source: 'GitHub Docs' },
  supportedModels: { label: 'Supported AI models in GitHub Copilot', url: `${DOCS}/copilot/reference/ai-models/supported-models`, source: 'GitHub Docs' },
  modelsOverview: { label: 'Models in GitHub Copilot', url: `${DOCS}/copilot/concepts/models/overview`, source: 'GitHub Docs' },
  modelChoiceGuide: {
    label: 'A guide to deciding what AI model to use in GitHub Copilot',
    url: 'https://github.blog/ai-and-ml/github-copilot/a-guide-to-deciding-what-ai-model-to-use-in-github-copilot/',
    source: 'GitHub Blog',
  },

  // Auto model selection
  autoSelection: { label: 'About GitHub Copilot auto model selection', url: `${DOCS}/copilot/concepts/models/auto-model-selection`, source: 'GitHub Docs' },
  autoGa: {
    label: 'Auto model selection is generally available in VS Code',
    url: 'https://github.blog/changelog/2025-12-10-auto-model-selection-is-generally-available-in-github-copilot-in-visual-studio-code/',
    source: 'GitHub Changelog',
  },
  autoDefault: {
    label: 'Enterprises can default to auto model selection',
    url: 'https://github.blog/changelog/2026-07-01-enterprises-can-default-to-auto-model-selection/',
    source: 'GitHub Changelog',
  },

  // Seats and licenses
  seatAssignment: { label: 'GitHub Copilot seat assignment', url: `${DOCS}/copilot/reference/copilot-billing/seat-assignment`, source: 'GitHub Docs' },
  grantAccess: {
    label: 'Granting access to GitHub Copilot for members of your organization',
    url: `${DOCS}/copilot/how-tos/administer-copilot/manage-for-organization/manage-access/grant-access`,
    source: 'GitHub Docs',
  },
  remindInactive: {
    label: 'Reminding inactive users to use their GitHub Copilot license',
    url: `${DOCS}/copilot/tutorials/roll-out-at-scale/assign-licenses/remind-inactive-users`,
    source: 'GitHub Docs',
  },
  activityReport: {
    label: 'Downloading a GitHub Copilot activity report',
    url: `${DOCS}/copilot/how-tos/administer-copilot/download-activity-report`,
    source: 'GitHub Docs',
  },
  seatsApi: { label: 'REST API endpoints for GitHub Copilot user management', url: 'https://docs.github.com/en/rest/copilot/copilot-user-management', source: 'GitHub Docs' },

  // Cost centers
  costCenters: { label: 'Cost centers', url: `${DOCS}/billing/concepts/cost-centers`, source: 'GitHub Docs' },
  useCostCenters: { label: 'Using cost centers to allocate costs to business units', url: `${DOCS}/billing/how-tos/products/use-cost-centers`, source: 'GitHub Docs' },

  // Good habits: prompts, context, caching
  promptEngineering: { label: 'Prompt engineering for GitHub Copilot', url: `${DOCS}/copilot/concepts/prompting-and-context/prompt-engineering`, source: 'GitHub Docs' },
  bestPractices: { label: 'Best practices for using GitHub Copilot', url: `${DOCS}/copilot/get-started/best-practices`, source: 'GitHub Docs' },
  customInstructions: { label: 'Custom instructions for GitHub Copilot', url: `${DOCS}/copilot/concepts/prompting-and-context/custom-instructions`, source: 'GitHub Docs' },
  repoInstructions: {
    label: 'Adding repository custom instructions in your IDE',
    url: `${DOCS}/copilot/how-tos/copilot-in-your-ide/customize-copilot/configure-custom-instructions/add-repository-instructions-in-your-ide`,
    source: 'GitHub Docs',
  },
  contextManagement: { label: 'Managing context for GitHub Copilot', url: `${DOCS}/copilot/concepts/prompting-and-context/context-management`, source: 'GitHub Docs' },
  optimizeUsage: {
    label: 'Optimizing your AI usage to maximize efficiency and reduce cost',
    url: 'https://docs.github.com/en/copilot/tutorials/optimize-ai-usage',
    source: 'GitHub Docs',
  },
  tokenBlog: {
    label: 'Getting more from each token',
    url: 'https://github.blog/ai-and-ml/github-copilot/getting-more-from-each-token-how-copilot-improves-context-handling-and-model-routing/',
    source: 'GitHub Blog',
  },
  modelHosting: { label: 'Hosting of models for GitHub Copilot', url: `${DOCS}/copilot/reference/ai-models/model-hosting`, source: 'GitHub Docs' },
  largerContext: {
    label: 'Larger context windows and configurable reasoning levels',
    url: 'https://github.blog/changelog/2026-06-04-larger-context-windows-and-configurable-reasoning-levels-for-github-copilot/',
    source: 'GitHub Changelog',
  },
  extendedCapabilities: {
    label: 'Models with extended capabilities (long context)',
    url: 'https://docs.github.com/en/copilot/reference/ai-models/supported-models#models-with-extended-capabilities',
    source: 'GitHub Docs',
  },

  // Features that use AI credits
  copilotOnGitHub: { label: 'GitHub Copilot on GitHub.com', url: `${DOCS}/copilot/concepts/copilot-surfaces/copilot-on-github`, source: 'GitHub Docs' },
  codeReview: {
    label: 'GitHub Copilot code review',
    url: `${DOCS}/copilot/concepts/agent-capabilities/agent-powered-workflows-and-operations/code-review`,
    source: 'GitHub Docs',
  },
  agentMode: { label: 'Using agent mode in your IDE', url: `${DOCS}/copilot/how-tos/copilot-in-your-ide/use-copilot-agents/use-agent-mode`, source: 'GitHub Docs' },
  cliInstall: { label: 'Installing GitHub Copilot CLI', url: `${DOCS}/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli`, source: 'GitHub Docs' },

  // Admin policies
  policies: { label: 'GitHub Copilot policies for enterprises and organizations', url: `${DOCS}/copilot/concepts/enterprise/policies`, source: 'GitHub Docs' },
  managePolicies: {
    label: 'Managing policies and features for GitHub Copilot in your organization',
    url: `${DOCS}/copilot/how-tos/administer-copilot/manage-for-organization/manage-policies`,
    source: 'GitHub Docs',
  },
  configureModels: {
    label: 'Configuring access to AI models in GitHub Copilot',
    url: `${DOCS}/copilot/how-tos/copilot-on-github/set-up-copilot/configure-access-to-ai-models`,
    source: 'GitHub Docs',
  },
  manageModels: {
    label: 'Managing the availability of models in an organization',
    url: `${DOCS}/copilot/how-tos/administer-copilot/manage-for-organization/manage-default-models`,
    source: 'GitHub Docs',
  },

  // Adoption and training
  usageDashboard: {
    label: 'Viewing the GitHub Copilot usage metrics dashboard',
    url: `${DOCS}/copilot/how-tos/administer-copilot/view-usage-and-adoption`,
    source: 'GitHub Docs',
  },
  rollOut: { label: 'Rolling out GitHub Copilot at scale', url: 'https://docs.github.com/en/copilot/tutorials/roll-out-at-scale', source: 'GitHub Docs' },
  rolloutGuide: { label: 'Rolling out GitHub Copilot: four keys to success', url: 'https://github.com/resources/insights/rolling-out-github-copilot', source: 'GitHub Resources' },
  learnFundamentals1: { label: 'GitHub Copilot Fundamentals, part 1', url: 'https://learn.microsoft.com/en-us/training/paths/copilot/', source: 'Microsoft Learn' },
  learnFundamentals2: { label: 'GitHub Copilot Fundamentals, part 2', url: 'https://learn.microsoft.com/en-us/training/paths/gh-copilot-2/', source: 'Microsoft Learn' },
  learnPrompting: {
    label: 'Introduction to prompt engineering with GitHub Copilot',
    url: 'https://learn.microsoft.com/en-us/training/modules/introduction-prompt-engineering-with-github-copilot/',
    source: 'Microsoft Learn',
  },

  // Other exports and APIs that can add detail
  usageMetricsApi: { label: 'REST API endpoints for GitHub Copilot usage metrics', url: 'https://docs.github.com/en/rest/copilot/copilot-usage-metrics', source: 'GitHub Docs' },
  usageMetricsData: {
    label: 'Data available in GitHub Copilot usage metrics',
    url: 'https://docs.github.com/en/copilot/reference/copilot-usage-metrics/copilot-usage-metrics',
    source: 'GitHub Docs',
  },
  metricsData: { label: 'GitHub Copilot metrics data properties', url: 'https://docs.github.com/en/copilot/reference/metrics-data', source: 'GitHub Docs' },
  billingUsageApi: { label: 'REST API endpoints for billing usage', url: 'https://docs.github.com/en/rest/billing/usage', source: 'GitHub Docs' },
  usageReportsApi: { label: 'REST API endpoints for usage reports', url: `${DOCS}/rest/billing/usage-reports`, source: 'GitHub Docs' },
  costCentersApi: { label: 'REST API endpoints for cost centers', url: 'https://docs.github.com/en/rest/billing/cost-centers', source: 'GitHub Docs' },
  budgetsApi: { label: 'REST API endpoints for budgets', url: 'https://docs.github.com/en/rest/billing/budgets', source: 'GitHub Docs' },
  teamMembersApi: { label: 'REST API endpoints for team members', url: 'https://docs.github.com/en/rest/teams/members', source: 'GitHub Docs' },
  githubCli: { label: 'GitHub CLI quickstart', url: 'https://docs.github.com/en/github-cli/github-cli/quickstart', source: 'GitHub Docs' },
  copilotAllowlist: { label: 'GitHub Copilot allowlist reference', url: 'https://docs.github.com/en/copilot/reference/copilot-allowlist-reference', source: 'GitHub Docs' },
  auditLogs: {
    label: 'Reviewing audit logs for GitHub Copilot',
    url: 'https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/review-audit-logs',
    source: 'GitHub Docs',
  },
} as const satisfies Record<string, DocLink>;

export type LinkId = keyof typeof LINKS;

/** Reading lists per topic, most useful page first. */
export const TOPIC_LINKS = {
  billing: ['usageBilling', 'copilotBilling', 'manageSpending'],
  budgets: ['budgets', 'setUpBudgets', 'budgetsAlerts', 'manageSpending'],
  pricing: ['pricing', 'modelComparison', 'supportedModels'],
  modelChoice: ['modelComparison', 'modelChoiceGuide', 'modelsOverview', 'manageModels'],
  auto: ['autoSelection', 'autoDefault', 'modelComparison'],
  seats: ['seatAssignment', 'remindInactive', 'grantAccess', 'activityReport', 'seatsApi'],
  costCenters: ['useCostCenters', 'costCenters', 'costCentersApi'],
  habits: ['optimizeUsage', 'promptEngineering', 'bestPractices', 'learnPrompting'],
  context: ['contextManagement', 'optimizeUsage', 'extendedCapabilities', 'largerContext'],
  caching: ['optimizeUsage', 'tokenBlog', 'modelHosting'],
  instructions: ['customInstructions', 'repoInstructions'],
  agents: ['agentMode', 'copilotOnGitHub', 'codeReview', 'cliInstall', 'usageBilling'],
  policies: ['policies', 'managePolicies', 'configureModels', 'manageModels'],
  adoption: ['rollOut', 'usageDashboard', 'rolloutGuide', 'learnFundamentals1', 'learnFundamentals2'],
  enrichment: ['seatsApi', 'activityReport', 'usageMetricsApi', 'usageMetricsData', 'billingUsageApi', 'usageReportsApi', 'costCentersApi', 'teamMembersApi', 'budgetsApi', 'auditLogs'],
  collector: ['githubCli', 'usageReportsApi', 'billingUsageApi', 'budgetsApi', 'seatsApi'],
} as const satisfies Record<string, readonly LinkId[]>;

export type LinkTopic = keyof typeof TOPIC_LINKS;

export function linksFor(topic: LinkTopic): DocLink[] {
  return TOPIC_LINKS[topic].map((id) => LINKS[id]);
}
