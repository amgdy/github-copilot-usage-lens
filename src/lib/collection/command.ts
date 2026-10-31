/** Builds the command that runs a collector script, from the choices an admin makes in the app. */
import { t } from '../../i18n/core';
import { BUILD_INFO } from '../build/buildInfo';
import { APP_REPOSITORY } from '../links';

/** `bash` runs scripts/collect.sh (Mac or Linux), `powershell` runs scripts/collect.ps1 (Windows). */
export type CollectorSystem = 'bash' | 'powershell';
export type CollectorScope = 'enterprise' | 'organization';

export interface CollectorChoices {
  system: CollectorSystem;
  scope: CollectorScope;
  /** The enterprise slug, or the organization names separated by commas or spaces. Empty lets the script ask. */
  name: string;
  /** Months of billing data and audit events, counting this month. */
  months: number;
  dailyMetrics: boolean;
  teams: boolean;
  /** Empty or github.com for GitHub.com. */
  hostname: string;
}

export const COLLECTOR_MONTHS = { min: 1, max: 24, default: 3 } as const;

export const DEFAULT_COLLECTOR_CHOICES: CollectorChoices = {
  system: 'bash',
  scope: 'enterprise',
  name: '',
  months: COLLECTOR_MONTHS.default,
  dailyMetrics: false,
  teams: false,
  hostname: '',
};

// Only these characters reach the command, so a pasted command can never run anything else.
const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const HOST_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?(?::\d{1,5})?$/;
const DEFAULT_HOST = 'github.com';

/** The names typed in the name box, without empty entries and repeats. */
export function collectorNames(text: string): string[] {
  return [...new Set(text.split(/[\s,]+/).filter((name) => name !== ''))];
}

/**
 * What is wrong with the choices, one sentence each. A name or host with a problem is left out of the command, so the
 * command always runs.
 */
export function collectorProblems(choices: CollectorChoices): string[] {
  const names = collectorNames(choices.name);
  const problems: string[] = [];
  const badNames = names.filter((name) => !NAME_PATTERN.test(name));
  if (badNames.length > 0) {
    problems.push(t('Left out: {names}. A name has only letters, digits, dots, dashes and underscores.', { names: badNames.join(t(', ')) }));
  }
  if (choices.scope === 'enterprise' && names.filter((name) => NAME_PATTERN.test(name)).length > 1) {
    problems.push(t('Only the first enterprise is used. Run the script once for each enterprise.'));
  }
  const host = choices.hostname.trim();
  if (host !== '' && !HOST_PATTERN.test(host)) {
    problems.push(t('Left out: the host. Type only the host name, for example octocorp.ghe.com.'));
  }
  return problems;
}

const clampMonths = (months: number): number =>
  Number.isFinite(months) ? Math.min(COLLECTOR_MONTHS.max, Math.max(COLLECTOR_MONTHS.min, Math.round(months))) : COLLECTOR_MONTHS.default;

/** Choices read back from storage, with anything unknown or broken set to its default. */
export function cleanCollectorChoices(value: unknown): CollectorChoices {
  const stored = typeof value === 'object' && value !== null ? (value as Partial<Record<keyof CollectorChoices, unknown>>) : {};
  const defaults = DEFAULT_COLLECTOR_CHOICES;
  return {
    system: stored.system === 'powershell' || stored.system === 'bash' ? stored.system : defaults.system,
    scope: stored.scope === 'organization' || stored.scope === 'enterprise' ? stored.scope : defaults.scope,
    name: typeof stored.name === 'string' ? stored.name.slice(0, 500) : defaults.name,
    months: typeof stored.months === 'number' ? clampMonths(stored.months) : defaults.months,
    dailyMetrics: stored.dailyMetrics === true,
    teams: stored.teams === true,
    hostname: typeof stored.hostname === 'string' ? stored.hostname.slice(0, 255) : defaults.hostname,
  };
}

/** Where the scripts come from: a repository on github.com and a branch or a full commit. */
export interface CollectorScriptSource {
  /** owner/name */
  repository: string;
  ref: string;
}

const SCRIPT_PATHS: Record<CollectorSystem, string> = { bash: 'scripts/collect.sh', powershell: 'scripts/collect.ps1' };
const REPOSITORY_PATTERN = /^[\w.-]+\/[\w.-]+$/;
const REF_PATTERN = /^(?:main|[0-9a-f]{40})$/;

/**
 * The scripts of the commit this app was built from, so the script always writes the file this app reads. A build made
 * on a computer has no commit and uses the main branch.
 */
export function collectorScriptSource(build: { repository?: string; commit?: string }): CollectorScriptSource {
  if (build.repository && REPOSITORY_PATTERN.test(build.repository) && build.commit && REF_PATTERN.test(build.commit)) {
    return { repository: build.repository, ref: build.commit };
  }
  return { repository: APP_REPOSITORY, ref: 'main' };
}

export const COLLECTOR_SCRIPT_SOURCE: CollectorScriptSource = collectorScriptSource(BUILD_INFO);

/** The script as plain text, which the command downloads and runs. */
export const collectorScriptUrl = (system: CollectorSystem, source: CollectorScriptSource = COLLECTOR_SCRIPT_SOURCE): string =>
  `https://raw.githubusercontent.com/${source.repository}/${source.ref}/${SCRIPT_PATHS[system]}`;

/** The script on GitHub, to read it before running it. */
export const collectorScriptPageUrl = (system: CollectorSystem, source: CollectorScriptSource = COLLECTOR_SCRIPT_SOURCE): string =>
  `https://github.com/${source.repository}/blob/${source.ref}/${SCRIPT_PATHS[system]}`;

/** A ZIP file of the repository, with both scripts in its scripts folder. */
export const collectorZipUrl = (source: CollectorScriptSource = COLLECTOR_SCRIPT_SOURCE): string => `https://github.com/${source.repository}/archive/${source.ref}.zip`;

/**
 * The options for the choices, in the same order for both scripts. Names and hosts that cannot be used are left out;
 * with no name, the script asks for it. There is no --yes, so the script shows its plan and asks before it starts.
 */
export function collectorArguments(choices: CollectorChoices): string[] {
  const powershell = choices.system === 'powershell';
  const option = (bashName: string, powershellName: string) => (powershell ? powershellName : bashName);
  const parts: string[] = [];
  const names = collectorNames(choices.name).filter((name) => NAME_PATTERN.test(name));
  if (names.length > 0) {
    if (choices.scope === 'enterprise') parts.push(option('--enterprise', '-Enterprise'), names[0]);
    else parts.push(option('--org', '-Org'), names.join(','));
  }
  const months = clampMonths(choices.months);
  if (months !== COLLECTOR_MONTHS.default) parts.push(option('--months', '-Months'), String(months));
  if (choices.dailyMetrics) parts.push(option('--daily-metrics', '-DailyMetrics'));
  if (choices.teams) parts.push(option('--teams', '-Teams'));
  const host = choices.hostname.trim().toLowerCase();
  if (host !== '' && host !== DEFAULT_HOST && HOST_PATTERN.test(host)) parts.push(option('--hostname', '-Hostname'), host);
  return parts;
}

/**
 * The command that gets the script from GitHub and runs it, so nothing has to be downloaded first. Bash reads the
 * script from curl, and the script takes its answers from the terminal. PowerShell runs the script in a new
 * powershell process, so the script can end without closing the window.
 */
export function collectorCommand(choices: CollectorChoices, source: CollectorScriptSource = COLLECTOR_SCRIPT_SOURCE): string {
  const options = collectorArguments(choices);
  const url = collectorScriptUrl(choices.system, source);
  if (choices.system === 'powershell') {
    return `powershell -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm ${url})))${options.map((part) => ` ${part}`).join('')}"`;
  }
  return options.length > 0 ? `curl -fsSL ${url} | bash -s -- ${options.join(' ')}` : `curl -fsSL ${url} | bash`;
}

/** The command for a downloaded copy of the scripts, run in the folder that holds the scripts folder. */
export function collectorCopyCommand(choices: CollectorChoices): string {
  const start = choices.system === 'powershell' ? 'powershell -ExecutionPolicy Bypass -File scripts\\collect.ps1' : 'bash scripts/collect.sh';
  return [start, ...collectorArguments(choices)].join(' ');
}
