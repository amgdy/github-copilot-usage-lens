import { spawn, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_COLLECTOR_CHOICES, collectionLicenseParse, collectorAddresses, pickBudget, readCollection, usageReportState } from '../src/lib/collection';
import { EMPTY_REPORT_MESSAGE, REPORT_WAITING_MESSAGES } from '../src/lib/collection/types';
import { storedText } from './collectionLines';
import { BLOCKED_HOST, GH_DEFAULT_API_VERSION, MOCK_HOST, MOCK_TOKEN, startMockGitHub, type MockGitHub, type RecordedRequest } from './collectorMock';

/*
 * Runs the collector scripts with the real GitHub CLI and curl against a pretend GitHub (tests/collectorMock.ts).
 * On Linux and macOS with gh, curl, openssl and bash installed; otherwise the tests are skipped. On macOS they use the
 * bash 3.2 that comes with it, the oldest bash collect.sh must work with. The PowerShell script is compared with the
 * bash script when pwsh is installed.
 */

const ROOT = join(import.meta.dirname, '..');
const BASH_SCRIPT = join(ROOT, 'scripts', 'collect.sh');
const POWERSHELL_SCRIPT = join(ROOT, 'scripts', 'collect.ps1');
const RUN_TIMEOUT = 240_000;
const ON_MAC = process.platform === 'darwin';
const BASH = ON_MAC ? '/bin/bash' : 'bash';

const toolWorks = (command: string, args: string[]) => spawnSync(command, args, { stdio: 'ignore', timeout: 20_000 }).status === 0;

const CAN_RUN =
  (process.platform === 'linux' || ON_MAC) &&
  toolWorks('gh', ['--version']) &&
  toolWorks('curl', ['--version']) &&
  toolWorks(BASH, ['--version']) &&
  toolWorks('openssl', ['version']);
const POWERSHELL_WORKS = toolWorks('pwsh', ['-NoLogo', '-NoProfile', '-Command', 'exit 0']);
const HAS_POWERSHELL = CAN_RUN && POWERSHELL_WORKS;
// --list-sources sends no request, so it runs wherever bash runs.
const HAS_BASH = process.platform !== 'win32' && toolWorks(BASH, ['--version']);
// script of macOS has no --version.
const HAS_SCRIPT = CAN_RUN && (ON_MAC ? existsSync('/usr/bin/script') : toolWorks('script', ['--version']));
// .NET on macOS trusts only the certificates in the keychain, not SSL_CERT_FILE, so it cannot reach the pretend GitHub.
const DOTNET_TRUSTS_TEST_CERTIFICATE = process.platform === 'linux';

/**
 * A command that runs the command line in a new terminal, as when a person runs it in a terminal window. script of
 * macOS cannot read the terminal settings of the socket Node gives a child as its input, so a pipe from cat feeds it.
 */
function inTerminal(commandLine: string): string[] {
  if (ON_MAC) return [BASH, '-c', 'script -q /dev/null /bin/sh -c "$1" < <(cat 2>/dev/null)', 'terminal', commandLine];
  return ['script', '-qec', commandLine, '/dev/null'];
}

/** A question of the scripts, such as "Start? [Y/n] ". */
const QUESTION = /\[(?:Y\/n|y\/N)\]/;

interface BundleLine {
  kind: string;
  [key: string]: unknown;
}

interface RecordLine extends BundleLine {
  scope: string;
  target: string;
  month?: string;
  parent?: string;
  record: Record<string, unknown>;
}

interface SourceLine extends BundleLine {
  id: string;
  scope: string;
  target: string;
  month?: string;
  status: 'ok' | 'partial' | 'failed' | 'skipped';
  records: number;
  http: number;
  message: string;
  endpoint: string;
}

interface Bundle {
  text: string;
  header: BundleLine;
  records: RecordLine[];
  sources: SourceLine[];
  end: BundleLine;
}

interface RunResult {
  code: number | null;
  output: string;
  errors: string;
}

function readBundle(file: string): Bundle {
  const bytes = readFileSync(file);
  const text = bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes).toString('utf8') : bytes.toString('utf8');
  expect(text.endsWith('\n')).toBe(true);
  expect(text).not.toContain('\r');
  const lines = text.trimEnd().split('\n').map((line) => JSON.parse(line) as BundleLine);
  return {
    text,
    header: lines[0],
    records: lines.filter((line) => !['header', 'source', 'end'].includes(line.kind)) as RecordLine[],
    sources: lines.filter((line) => line.kind === 'source') as SourceLine[],
    end: lines[lines.length - 1],
  };
}

function countByKind(records: RecordLine[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const line of records) counts[line.kind] = (counts[line.kind] ?? 0) + 1;
  return counts;
}

/** Sorts object keys at every level, so two lines with the same data give the same text. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical((value as Record<string, unknown>)[key])]));
  }
  return value;
}

const comparable = (bundle: Bundle) => ({
  records: bundle.records.map((line) => JSON.stringify(canonical(line))),
  sources: bundle.sources.map((line) => JSON.stringify(canonical(line))),
  end: bundle.end.records,
});

const today = Temporal.Now.plainDateISO('UTC');
const dayBefore = (days: number) => today.subtract({ days }).toString();
/** The month keys the scripts choose for --months, oldest first. */
const monthKeys = (count: number) =>
  Array.from({ length: count }, (_unused, index) => today.toPlainYearMonth().subtract({ months: count - 1 - index }).toString());

/** The bash options as PowerShell parameters: --daily-metrics becomes -DailyMetrics. */
const POWERSHELL_NAMES: Record<string, string> = {
  '--enterprise': '-Enterprise', '--org': '-Org', '--months': '-Months', '--daily-metrics': '-DailyMetrics', '--teams': '-Teams',
  '--plain': '-Plain', '--yes': '-Yes', '--hostname': '-Hostname', '--output': '-Output', '--only': '-Only', '--skip': '-Skip',
};
const powershellArgs = (args: readonly string[]) => args.map((arg) => POWERSHELL_NAMES[arg] ?? arg);

const USAGE_REPORTS_PATH = '/api/v3/enterprises/octocorp/settings/billing/reports';
const apiRequests = (requests: RecordedRequest[]) => requests.filter((request) => request.path.startsWith('/api/'));
const requestsTo = (requests: RecordedRequest[], ending: string) => requests.filter((request) => request.path.endsWith(ending));
const sourcesOf = (bundle: Bundle, id: string) => bundle.sources.filter((line) => line.id === id);
const requestLines = (requests: RecordedRequest[]) => requests.map((request) => `${request.method} ${request.path}?${request.query}`);

/** An argument for a PowerShell command line. Options and plain names stay as typed, so octo-org,octo-labs is a list. */
const powershellArgument = (value: string) => (/^[\w.,-]+$/.test(value) ? value : `'${value.replaceAll("'", "''")}'`);

/**
 * How a script is started. `bash-piped` reads the script from its input, as curl ... | bash does. `bash-terminal` does
 * the same in a pretend terminal, so the script asks its questions. `powershell-block` runs the script text as a script
 * block, as the command from the app does after irm downloads it.
 */
type RunMode = 'bash' | 'bash-piped' | 'bash-terminal' | 'powershell' | 'powershell-block' | 'powershell-terminal';

/** The full path of a program on PATH, so a test can run a script with only some programs. */
function findProgram(name: string): string {
  for (const pathFolder of (process.env.PATH ?? '').split(delimiter)) {
    if (pathFolder && existsSync(join(pathFolder, name))) return join(pathFolder, name);
  }
  throw new Error(`${name} is not installed.`);
}

/** What curl on Windows says when the network blocks the servers that tell if a certificate was revoked. */
const REVOCATION_ERROR =
  'curl: (35) schannel: next InitializeSecurityContext failed: CRYPT_E_NO_REVOCATION_CHECK (0x80092012) - The revocation function was unable to check revocation for the certificate.';

/** The scripts' notes about the network, the same in both. */
const NETWORK_MESSAGES = {
  unreachable: 'This computer could not reach these addresses, so some data is missing:',
  allow: 'Ask your network team to allow HTTPS (port 443) to them, then run this script again.',
  revocation: 'Windows could not check if the certificates of these addresses were revoked, because the network blocks the',
  retried: 'The script tried again without this check. To keep the check, ask your network team to allow those servers.',
  addresses: 'Every address the script uses: https://github.com/amgdy/github-copilot-usage-lens#network-access',
  loginHint: ', ask your network team to allow HTTPS (port 443) to it.',
  download: 'Could not download the report file from ',
  proxy: 'The network proxy refused the connection (HTTP ',
};

/** The scripts' network check before they ask anything, the same in both. */
const CHECK_MESSAGES = {
  heading: 'Checking the network',
  notChecked: 'not checked: GitHub picks the full name when it sends a file',
  answersWithoutRevocation: 'answers, without the revocation check',
  noAnswer: 'no answer: ',
  revocation: 'Windows could not check if the certificates were revoked, because the network blocks the servers that answer',
  oneBlocked: '1 address did not answer, so the data that needs it may be missing.',
  goOn: 'Go on anyway?',
  stopped: 'Stopped. Nothing was saved.',
};

/** The lines of the network check: its heading and the indented lines after it. */
function networkCheck(output: string): string[] {
  const lines = output.replace(/\r/g, '').split('\n');
  const start = lines.findIndex((line) => line.startsWith(CHECK_MESSAGES.heading));
  if (start < 0) return [];
  const block = [lines[start]];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith('  ')) break;
    block.push(line);
  }
  return block;
}

/** How the network check shows one address and its result. */
const checkLine = (address: string, result: string) => `  ${address.padEnd(37)} ${result}`;

describe.skipIf(!CAN_RUN)('data collector scripts against a pretend GitHub', () => {
  let folder = '';
  let certificateFile = '';
  let mock: MockGitHub;

  beforeAll(async () => {
    folder = mkdtempSync(join(tmpdir(), 'usage-lens-collector-'));
    certificateFile = join(folder, 'certificate.pem');
    const keyFile = join(folder, 'key.pem');
    const made = spawnSync(
      'openssl',
      ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyFile, '-out', certificateFile, '-days', '2',
        '-subj', `/CN=${MOCK_HOST}`, '-addext', `subjectAltName=DNS:${MOCK_HOST}`],
      { stdio: 'ignore' },
    );
    expect(made.status).toBe(0);
    mock = await startMockGitHub(readFileSync(certificateFile, 'utf8'), readFileSync(keyFile, 'utf8'));
    mkdirSync(join(folder, 'home'));
    mkdirSync(join(folder, 'temp'));
  });

  afterAll(async () => {
    await mock?.close();
    if (folder) rmSync(folder, { recursive: true, force: true });
  });

  beforeEach(() => mock.reset());

  /** Only what the scripts need: no real token, no real proxy settings, and every request goes to the pretend GitHub. */
  function environment(): NodeJS.ProcessEnv {
    return {
      PATH: process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin',
      HOME: join(folder, 'home'),
      TMPDIR: join(folder, 'temp'),
      GH_CONFIG_DIR: join(folder, 'home', 'gh-config'),
      GH_ENTERPRISE_TOKEN: MOCK_TOKEN,
      HTTPS_PROXY: mock.proxyUrl,
      https_proxy: mock.proxyUrl,
      SSL_CERT_FILE: certificateFile,
      CURL_CA_BUNDLE: certificateFile,
      NO_COLOR: '1',
      GH_NO_UPDATE_NOTIFIER: '1',
      GH_PROMPT_DISABLED: '1',
      POWERSHELL_TELEMETRY_OPTOUT: '1',
      POWERSHELL_UPDATECHECK: 'Off',
      USAGE_LENS_RETRY_SECONDS: '0',
      USAGE_LENS_REPORT_POLL_SECONDS: '0',
    };
  }

  function run(mode: RunMode, args: string[], changes: NodeJS.ProcessEnv = {}, typed?: string): Promise<RunResult> {
    const powershell = ['pwsh', '-NoLogo', '-NoProfile', '-NonInteractive'];
    const startWith: Record<RunMode, { command: string[]; input?: Buffer | string }> = {
      bash: { command: [BASH, BASH_SCRIPT, ...args] },
      'bash-piped': { command: [BASH, '-s', '--', ...args], input: readFileSync(BASH_SCRIPT) },
      'bash-terminal': { command: inTerminal(`cat '${BASH_SCRIPT}' | ${BASH} -s -- ${args.join(' ')}`), input: typed ?? '' },
      powershell: { command: [...powershell, '-File', POWERSHELL_SCRIPT, ...args] },
      'powershell-block': {
        command: [...powershell, '-Command', `& ([scriptblock]::Create((Get-Content -Raw -LiteralPath '${POWERSHELL_SCRIPT}'))) ${args.map(powershellArgument).join(' ')}`],
      },
      'powershell-terminal': {
        command: inTerminal(`pwsh -NoLogo -NoProfile -File '${POWERSHELL_SCRIPT}' ${args.join(' ')}`),
        input: typed ?? '',
      },
    };
    const [command, ...commandArgs] = startWith[mode].command;
    const input = startWith[mode].input;
    // In a terminal the answers are typed when the script asks, as a person does. script of macOS loses what is typed
    // before the program reads the terminal.
    const terminal = mode === 'bash-terminal' || mode === 'powershell-terminal';
    return new Promise((resolve, reject) => {
      const child = spawn(command, commandArgs, { cwd: folder, env: { ...environment(), ...changes }, stdio: ['pipe', 'pipe', 'pipe'] });
      // A script that stops early, for example on a wrong option, closes its input before it has all been sent.
      child.stdin.on('error', () => undefined);
      if (!terminal) child.stdin.end(input ?? '');
      let output = '';
      let errors = '';
      child.stdout.on('data', (chunk: Buffer) => {
        output += chunk.toString('utf8');
        if (terminal && child.stdin.writable && QUESTION.test(output)) child.stdin.end(input ?? '');
      });
      child.stderr.on('data', (chunk: Buffer) => (errors += chunk.toString('utf8')));
      child.on('error', reject);
      child.on('exit', () => child.stdin.end());
      child.on('close', (code) => resolve({ code, output, errors }));
    });
  }

  const enterpriseArgs = (file: string) => ['--enterprise', 'octocorp', '--months', '2', '--teams', '--plain', '--yes', '--hostname', MOCK_HOST, '--output', file];
  const organizationArgs = (file: string) => ['--org', 'octo-org', '--months', '3', '--daily-metrics', '--yes', '--hostname', MOCK_HOST, '--output', file];
  const reportQueueArgs = (file: string) => ['--enterprise', 'octocorp', '--months', '3', '--only', 'usage-report', '--plain', '--yes', '--hostname', MOCK_HOST, '--output', file];
  const networkArgs = (file: string) => ['--org', 'octo-org', '--only', 'seat-summary,user-metrics', '--months', '1', '--plain', '--yes', '--hostname', MOCK_HOST, '--output', file];
  /** A proxy address where nothing listens, like a network that lets nothing through. */
  const CLOSED_PROXY = 'http://127.0.0.1:1';

  /**
   * Puts a pretend curl first on PATH. Like curl on Windows when the network blocks the servers that tell if a
   * certificate was revoked, it fails unless it is told to go on without that check. An old curl does not know that
   * option at all.
   */
  function revocationCurl(oldCurl: boolean): NodeJS.ProcessEnv {
    const programs = join(folder, oldCurl ? 'programs-old-curl' : 'programs-revocation-curl');
    mkdirSync(programs, { recursive: true });
    const script = [
      '#!/usr/bin/env bash',
      'arguments=()',
      'best_effort=no',
      'for argument in "$@"; do',
      '  if [ "$argument" = --ssl-revoke-best-effort ]; then best_effort=yes; else arguments+=("$argument"); fi',
      'done',
      `if [ "$best_effort" = no ]; then echo '${REVOCATION_ERROR}' >&2; exit 35; fi`,
      oldCurl ? `echo 'curl: option --ssl-revoke-best-effort: is unknown' >&2; exit 2` : '',
      `exec '${findProgram('curl')}' "\${arguments[@]}"`,
    ].join('\n');
    writeFileSync(join(programs, 'curl'), `${script}\n`);
    chmodSync(join(programs, 'curl'), 0o755);
    return { PATH: `${programs}${delimiter}${process.env.PATH ?? ''}` };
  }

  /**
   * Puts a pretend curl first on PATH that gets an answer only from the given addresses, like a network that blocks
   * the rest. It sends nothing, so it suits only runs that stop before they read from GitHub.
   */
  function probeCurl(answering: string[]): NodeJS.ProcessEnv {
    const programs = join(folder, `programs-probe-${answering.length}`);
    mkdirSync(programs, { recursive: true });
    const script = [
      '#!/usr/bin/env bash',
      'for argument in "$@"; do address="$argument"; done',
      'case "$address" in',
      ...answering.map((host) => `  https://${host}/) echo 000; exit 0 ;;`),
      "  *) echo 'curl: (7) Failed to connect to the server' >&2; echo 000; exit 7 ;;",
      'esac',
    ].join('\n');
    writeFileSync(join(programs, 'curl'), `${script}\n`);
    chmodSync(join(programs, 'curl'), 0o755);
    return { PATH: `${programs}${delimiter}${process.env.PATH ?? ''}` };
  }

  /** A folder with gh and pwsh but no curl, to use as PATH. */
  function programsWithoutCurl(): string {
    const programs = join(folder, 'programs-without-curl');
    mkdirSync(programs, { recursive: true });
    for (const name of ['gh', 'pwsh']) {
      if (!existsSync(join(programs, name))) symlinkSync(findProgram(name), join(programs, name));
    }
    return programs;
  }

  function expectSafeRequests(requests: RecordedRequest[], apiVersion: string | undefined) {
    expect(requests.length).toBeGreaterThan(0);
    for (const request of apiRequests(requests)) {
      expect(request.authorization, request.path).toContain(MOCK_TOKEN);
      expect(request.apiVersion, request.path).toBe(apiVersion);
      expect(['GET', 'POST'], request.path).toContain(request.method);
      // The only change a script may ask for: GitHub makes an AI usage report.
      if (request.method === 'POST') expect(['/api/graphql', USAGE_REPORTS_PATH]).toContain(request.path);
    }
    for (const request of requests.filter((item) => item.path.startsWith('/downloads/'))) {
      expect(request.authorization, request.path).toBeUndefined();
    }
  }

  function expectPrivateFieldsLeftOut(bundle: Bundle) {
    expect(bundle.text).not.toMatch(/private/i);
    for (const field of ['avatar_url', 'email', 'actor_location', 'user_agent', '_document_id', 'azure_subscription', 'alert_recipients']) {
      expect(bundle.text).not.toContain(`"${field}"`);
    }
  }

  /** The scripts work in a temporary folder and must remove it when they stop. */
  const leftoverWork = () => readdirSync(join(folder, 'temp')).filter((name) => name.startsWith('usage-lens.'));

  it('checks the options before it sends any request', async () => {
    for (const [args, message] of [
      [['--org', 'bad/name', '--yes'], 'is not valid'],
      [['--org', 'octo-org', '--months', '25', '--yes'], '--months needs a number'],
      [['--org', 'octo-org', '--only', 'nothing', '--yes'], 'Unknown source: nothing'],
      [['--yes'], 'Choose what to read'],
      [['--hostname', 'https://bad host', '--org', 'octo-org', '--yes'], 'is not valid'],
    ] as const) {
      const result = await run('bash', [...args]);
      expect(result.code, args.join(' ')).toBe(1);
      expect(result.errors, args.join(' ')).toContain(message);
    }
    expect((await run('bash', ['--version'])).output).toMatch(/^collect\.sh \d+\.\d+\.\d+/);
    expect((await run('bash', ['--list-sources'])).output).toContain('audit-log');
    expect((await run('bash', ['--list-sources'])).output).toContain('usage-report');
    expect((await run('bash', ['--help'])).output).toContain('--enterprise SLUG');
    expect(mock.requests).toHaveLength(0);
  });

  it('reads an enterprise and keeps only the fields the app needs', async () => {
    const file = join(folder, 'enterprise.ndjson');
    const result = await run('bash', enterpriseArgs(file));
    expect(result.errors).toBe('');
    expect(result.code, result.output).toBe(0);
    // Output that does not go to a terminal has no moving step line.
    expect(result.output).not.toContain('\r');

    const bundle = readBundle(file);
    expect(bundle.header).toMatchObject({
      kind: 'header', format: 'github-copilot-usage-lens-data', version: 1, collector: 'collect.sh', host: MOCK_HOST,
      scope: 'enterprise', enterprise: 'octocorp', organizations: [], months: monthKeys(2), dailyMetrics: false,
      teams: true, apiVersion: '2026-03-10',
    });
    expect(bundle.header.sources).toContain('teams');
    expect(bundle.end).toMatchObject({ kind: 'end', records: bundle.records.length });
    expect(countByKind(bundle.records)).toEqual({
      organization: 2, seat: 3, 'seat-total': 1, member: 3, budget: 3, 'budget-user': 2, 'cost-center': 1,
      'ai-credit-usage': 2, 'usage-summary': 2, 'billing-usage': 2, 'user-metrics': 4, 'scope-metrics': 1,
      'user-teams': 2, 'audit-event': 4, team: 2, 'team-member': 2, 'seat-summary': 1, 'usage-report': 4,
    });
    expectPrivateFieldsLeftOut(bundle);

    const seat = bundle.records.find((line) => line.kind === 'seat' && (line.record.assignee as { login: string }).login === 'KofiIto_nwind');
    expect(seat).toMatchObject({
      scope: 'enterprise', target: 'octocorp',
      record: { assignee: { login: 'KofiIto_nwind', type: 'User' }, organization: { login: 'octo-org' }, assigning_team: { slug: 'platform', name: 'Platform' }, plan_type: 'enterprise' },
    });
    expect(bundle.records.find((line) => line.kind === 'seat-total')?.record).toEqual({ total_seats: 3 });
    expect(bundle.records.filter((line) => line.kind === 'member').map((line) => line.record.login)).toEqual(['KofiIto_nwind', 'MeiChen_nwind', 'NoSeat_nwind']);
    expect(bundle.records.find((line) => line.record.id === 'budget-1')?.record).toMatchObject({
      budget_amount: 500, consumed_amount: 312.5, budget_alerting: { will_alert: true, recipients: 2 },
    });
    expect(bundle.records.filter((line) => line.kind === 'budget-user').map((line) => [line.parent, line.record.user])).toEqual([
      ['budget-2', 'KofiIto_nwind'], ['budget-2', 'MeiChen_nwind'],
    ]);
    for (const kind of ['ai-credit-usage', 'usage-summary', 'billing-usage']) {
      const lines = bundle.records.filter((line) => line.kind === kind);
      expect(lines.map((line) => line.month), kind).toEqual(monthKeys(2));
      expect(lines.every((line) => line.record.product === 'Copilot'), kind).toBe(true);
    }
    const aggregate = bundle.records.find((line) => line.kind === 'scope-metrics');
    expect(aggregate?.record).toMatchObject({ report_start_day: mock.reportFirstDay, daily_active_users: 2 });
    expect(bundle.records.filter((line) => line.kind === 'team-member').map((line) => [line.scope, line.target, line.parent])).toEqual([
      ['enterprise', 'octocorp', 'ent:platform'], ['organization', 'octo-org', 'devs'],
    ]);
    const audit = bundle.records.filter((line) => line.kind === 'audit-event').map((line) => line.record);
    expect(audit.map((event) => event.action)).toEqual([
      'copilot.cfb_seat_assignment_created', 'copilot.plan_changed', 'copilot.cfb_seat_cancelled', 'billing.budget_update',
    ]);
    expect(audit[0]).toMatchObject({ seat_assignment: 'team', team: 'octo-labs/devs', user: 'SaraLind_nwind' });
    expect(audit[1]).toMatchObject({ plan: 'enterprise', old_plan: 'business' });
    expect(audit[3]).toMatchObject({ target_amount: 500 });

    // The billing summary failed once with 502 and worked when tried again.
    expect(requestsTo(mock.requests, '/settings/billing/usage/summary')).toHaveLength(3);
    expect(sourcesOf(bundle, 'usage-summary').map((line) => line.status)).toEqual(['ok', 'ok']);
    expect(sourcesOf(bundle, 'seat-summary').map((line) => [line.target, line.status, line.http])).toEqual([
      ['octo-org', 'ok', 200], ['octo-labs', 'failed', 403],
    ]);
    expect(sourcesOf(bundle, 'teams').filter((line) => line.status === 'failed').map((line) => line.target)).toEqual(['octo-labs']);
    expect(bundle.sources.filter((line) => line.status === 'skipped')).toEqual([]);

    const windowStart = `${monthKeys(2)[0]}-01`;
    const auditRequests = requestsTo(mock.requests, '/enterprises/octocorp/audit-log');
    expect(auditRequests.map((request) => [request.query.get('phrase'), request.query.get('after')])).toEqual([
      [`action:copilot created:>=${windowStart}`, null],
      [`action:copilot created:>=${windowStart}`, 'cursor-2'],
      [`action:billing created:>=${windowStart}`, null],
    ]);
    expectSafeRequests(mock.requests, '2026-03-10');
    expect(result.output).toContain('Saved:');
    expect(result.output).toMatch(/seat-summary\s+partly/);
    expect(requestsTo(mock.requests, '/downloads/signed/users-28-day.ndjson.gz')).toHaveLength(1);
    expect(requestsTo(mock.requests, '/downloads/users-28-day.ndjson.gz')).toHaveLength(1);
    expect(leftoverWork()).toEqual([]);

    // The finished report of the older month is used again, and GitHub makes one for this month.
    const [olderMonth, newerMonth] = mock.usageMonths;
    const created = mock.requests.filter((request) => request.method === 'POST' && request.path === USAGE_REPORTS_PATH);
    expect(created.map((request) => JSON.parse(request.body))).toEqual([
      { report_type: 'ai_credit', start_date: `${newerMonth}-01`, end_date: today.toString() },
    ]);
    expect(requestsTo(mock.requests, '/settings/billing/reports/report-old')).toHaveLength(1);
    expect(requestsTo(mock.requests, '/settings/billing/reports/report-new')).toHaveLength(2);
    // Reports GitHub made before their last day ended miss usage, so they are not used.
    expect(requestLines(mock.requests).filter((line) => /report-old-early|report-today|ai-usage-early|ai-usage-today/.test(line))).toEqual([]);
    expect(sourcesOf(bundle, 'usage-report').map((line) => [line.month, line.status, line.records])).toEqual([
      [olderMonth, 'ok', 3], [newerMonth, 'ok', 1500],
    ]);
    expect(bundle.records.filter((line) => line.kind === 'usage-report').map((line) => [line.month, line.record.file, line.record.part])).toEqual([
      [olderMonth, 1, 1], [olderMonth, 2, 1], [newerMonth, 1, 1], [newerMonth, 1, 2],
    ]);
    expect(result.output).toContain('It has your AI usage report too, so you need no other file.');

    // The app reads the file the script wrote.
    const collection = await readCollection(new Blob([readFileSync(file)]), 'enterprise.ndjson');
    expect(collection).toMatchObject({ complete: true, skippedLines: 0, records: bundle.records.length, capped: false });
    expect(collection.header).toMatchObject({ scope: 'enterprise', enterprise: 'octocorp', months: monthKeys(2) });
    expect(collection.budgets.map((budget) => [budget.id, budget.scope, budget.aiCredits, budget.stopsUsage, budget.willAlert])).toEqual([
      ['budget-1', 'enterprise', true, true, true], ['budget-2', 'multi_user_customer', true, true, false], ['budget-3', 'organization', true, false, true],
    ]);
    expect(pickBudget(collection)?.id).toBe('budget-1');
    expect(collection.budgetUsers.map((state) => [state.budgetId, state.login, state.consumed, state.limit])).toEqual([
      ['budget-2', 'KofiIto_nwind', 19.5, 20], ['budget-2', 'MeiChen_nwind', 4, 20],
    ]);
    expect(collection.aiCredits).toEqual(monthKeys(2).map((month) => ({ month, target: 'octocorp', gross: 120, discount: 90, net: 30, quantity: 12000 })));
    expect(collection.seatCharges).toEqual(monthKeys(2).map((month) => ({ month, target: 'octocorp', gross: 38, discount: 0, net: 38, quantity: 2 })));
    expect(collection.seatSummaries.map((summary) => [summary.org, summary.total, summary.management])).toEqual([['octo-org', 2, 'assign_selected']]);
    expect(collection.members).toEqual(['kofiito_nwind', 'meichen_nwind', 'noseat_nwind']);
    expect(collection.metrics?.users.map((user) => [user.login, user.days, user.chatDays, user.completionDays])).toEqual([
      ['KofiIto_nwind', 2, 2, 2], ['MeiChen_nwind', 2, 2, 2],
    ]);
    expect(collection.audit.map((event) => event.kind)).toEqual(['seat-added', 'plan', 'seat-removed', 'budget']);
    const seats = collectionLicenseParse(collection).seats;
    expect(seats.map((entry) => [entry.login, entry.plan, entry.orgs])).toEqual([
      ['KofiIto_nwind', 'Enterprise', ['octo-org']], ['MeiChen_nwind', 'Business', ['octo-org']], ['SaraLind_nwind', 'Business', ['octo-labs']],
    ]);
    expect(seats[0].teams).toEqual(['platform']);
    expect(seats[1].teams.length).toBeGreaterThan(0);

    // The AI usage report comes back as the CSV files GitHub made, byte for byte apart from line ends.
    expect(collection.usageReports.map((report) => [report.month, report.name, report.lines])).toEqual([
      [olderMonth, `ai-usage-report-${olderMonth}-1.csv`, 3],
      [olderMonth, `ai-usage-report-${olderMonth}-2.csv`, 2],
      [newerMonth, `ai-usage-report-${newerMonth}.csv`, 1501],
    ]);
    const olderText = await storedText(collection.usageReports[0].data);
    expect(olderText.startsWith('\uFEFF"date"')).toBe(true);
    expect(olderText).not.toContain('\r');
    expect(olderText).toContain('"Team ""North"", \\ desk\tA"');
    const newerText = await storedText(collection.usageReports[2].data);
    expect(newerText.split('\n')).toHaveLength(1502);
    expect(newerText).toContain('"Person1499_nwind"');
  }, RUN_TIMEOUT);

  it('says which AI usage reports GitHub has not made yet', async () => {
    const file = join(folder, 'usage-report.ndjson');
    const result = await run('bash', ['--enterprise', 'octocorp', '--months', '2', '--only', 'usage-report', '--plain', '--yes', '--hostname', MOCK_HOST, '--output', file], {
      USAGE_LENS_REPORT_WAIT_SECONDS: '0',
    });
    expect(result.errors).toBe('');
    expect(result.code, result.output).toBe(0);
    const bundle = readBundle(file);
    const [olderMonth, newerMonth] = mock.usageMonths;
    expect(sourcesOf(bundle, 'usage-report').map((line) => [line.month, line.status, line.records])).toEqual([
      [olderMonth, 'ok', 3], [newerMonth, 'failed', 0],
    ]);
    expect(sourcesOf(bundle, 'usage-report')[1].message).toContain('GitHub is still making the report.');
    expect(result.output).toContain('It has the AI usage report of 1 of 2 months.');
    const collection = await readCollection(new Blob([readFileSync(file)]), 'usage-report.ndjson');
    expect(collection.usageReports.map((report) => report.month)).toEqual([olderMonth, olderMonth]);

    // Without the report the script sends no change to GitHub.
    mock.reset();
    const skipped = await run('bash', ['--enterprise', 'octocorp', '--months', '2', '--skip', 'usage-report', '--plain', '--yes', '--hostname', MOCK_HOST, '--output', join(folder, 'no-report.ndjson')]);
    expect(skipped.code, skipped.output).toBe(0);
    expect(mock.requests.filter((request) => request.path.includes('/settings/billing/reports'))).toEqual([]);
  }, RUN_TIMEOUT);

  it('reads a finished AI usage report without usage as a month with no usage', async () => {
    const results = [];
    for (const mode of HAS_POWERSHELL ? (['bash', 'powershell'] as const) : (['bash'] as const)) {
      mock.reset();
      mock.settings.emptyReports = true;
      const file = join(folder, `empty-report-${mode}.ndjson`);
      const args = ['--enterprise', 'octocorp', '--months', '2', '--only', 'usage-report', '--plain', '--yes', '--hostname', MOCK_HOST, '--output', file];
      const result = await run(mode, mode === 'bash' ? args : powershellArgs(args));
      expect(result.errors, mode).toBe('');
      expect(result.code, result.output).toBe(0);
      expect(result.output, mode).toContain('It has your AI usage report too, so you need no other file.');
      results.push(readBundle(file));
    }
    const [bundle, powershellBundle] = results;
    if (powershellBundle) expect(comparable(powershellBundle)).toEqual(comparable(bundle));

    const [olderMonth, newerMonth] = mock.usageMonths;
    expect(sourcesOf(bundle, 'usage-report').map((line) => [line.month, line.status, line.records, line.http, line.message])).toEqual([
      [olderMonth, 'ok', 3, 200, ''], [newerMonth, 'ok', 0, 200, EMPTY_REPORT_MESSAGE],
    ]);
    const collection = await readCollection(new Blob([bundle.text]), 'empty-report.ndjson');
    expect(collection.usageReports.map((report) => report.month)).toEqual([olderMonth, olderMonth]);
    expect(usageReportState(collection.sources, newerMonth)).toBe('complete');
    expect(leftoverWork()).toEqual([]);
  }, RUN_TIMEOUT * 2);

  it('asks for one AI usage report at a time, as GitHub makes only one at a time', async () => {
    const file = join(folder, 'report-queue.ndjson');
    const result = await run('bash', reportQueueArgs(file));
    expect(result.errors).toBe('');
    expect(result.code, result.output).toBe(0);
    const [olderMonth, newerMonth] = mock.usageMonths;
    const oldestMonth = Temporal.PlainYearMonth.from(olderMonth).subtract({ months: 1 });
    const oldestEnd = oldestMonth.toPlainDate({ day: oldestMonth.daysInMonth }).toString();

    // GitHub is busy with the oldest month, so the script asks for this month only when that report is ready.
    const created = mock.requests.filter((request) => request.method === 'POST' && request.path === USAGE_REPORTS_PATH);
    expect(created.map((request) => JSON.parse(request.body).start_date)).toEqual([`${oldestMonth}-01`, `${newerMonth}-01`, `${newerMonth}-01`]);
    expect(JSON.parse(created[0].body)).toEqual({ report_type: 'ai_credit', start_date: `${oldestMonth}-01`, end_date: oldestEnd });
    expect(result.output).toContain('1 found, 1 asked for, 1 to ask for later (GitHub makes one at a time)');

    const bundle = readBundle(file);
    expect(sourcesOf(bundle, 'usage-report').map((line) => [line.month, line.status]).sort()).toEqual([
      [oldestMonth.toString(), 'ok'], [olderMonth, 'ok'], [newerMonth, 'ok'],
    ]);
    expect(result.output).toContain('It has your AI usage report too, so you need no other file.');
    const collection = await readCollection(new Blob([readFileSync(file)]), 'report-queue.ndjson');
    expect(new Set(collection.usageReports.map((report) => report.month))).toEqual(new Set([oldestMonth.toString(), olderMonth, newerMonth]));
    expect(leftoverWork()).toEqual([]);
  }, RUN_TIMEOUT);

  it('reads an organization with the activity of every day', async () => {
    const file = join(folder, 'organization.ndjson.gz');
    const result = await run('bash', organizationArgs(file));
    expect(result.errors).toBe('');
    expect(result.code, result.output).toBe(0);
    expect(readFileSync(file).subarray(0, 2)).toEqual(Buffer.from([0x1f, 0x8b]));

    const bundle = readBundle(file);
    expect(bundle.header).toMatchObject({
      scope: 'organization', enterprise: null, organizations: ['octo-org'], months: monthKeys(3), dailyMetrics: true, teams: false,
    });
    expect(bundle.header.sources).not.toContain('teams');
    expect(countByKind(bundle.records)).toEqual({
      'seat-summary': 1, seat: 2, 'seat-total': 1, member: 3, 'ai-credit-usage': 3, 'usage-summary': 3,
      'user-metrics': 8, 'user-teams': 2, 'audit-event': 4,
    });
    expect(bundle.end).toMatchObject({ records: 27 });
    expectPrivateFieldsLeftOut(bundle);

    expect(bundle.sources.filter((line) => line.status === 'skipped' && !line.endpoint).map((line) => [line.id, line.message])).toEqual([
      ['usage-report', 'Only for enterprises.'],
      ['organizations', 'Only for enterprises.'],
      ['teams', 'Not selected. Add --teams to read team members.'],
      ['cost-centers', 'Only for enterprises.'],
    ]);
    expect(sourcesOf(bundle, 'budgets').map((line) => [line.status, line.http])).toEqual([['failed', 404]]);
    // Daily charges need access the token does not have, so the script stops after the first month.
    expect(sourcesOf(bundle, 'billing-usage').map((line) => [line.status, line.http])).toEqual([['failed', 403]]);
    expect(requestsTo(mock.requests, '/organizations/octo-org/settings/billing/usage')).toHaveLength(1);

    // Daily reports go from new to old and stop after three days in a row without a report. A day without data
    // (GitHub sends an empty text) is passed over and does not count as a failure.
    const dailyDays = requestsTo(mock.requests, '/copilot/metrics/reports/users-1-day').map((request) => request.query.get('day'));
    expect(dailyDays).toEqual([29, 30, 31, 32, 33, 34, 35, 36].map(dayBefore));
    expect(sourcesOf(bundle, 'user-metrics').map((line) => line.status)).toEqual(['ok', 'ok', 'ok', 'skipped', 'ok', 'ok', 'skipped', 'skipped', 'skipped']);
    expect(sourcesOf(bundle, 'user-metrics')[3]).toMatchObject({ http: 200, message: 'No report for this day.' });
    expect(sourcesOf(bundle, 'user-metrics')[8]).toMatchObject({ http: 404, message: 'No report for this day.' });
    expect(bundle.sources.filter((line) => line.status === 'failed').map((line) => line.id)).toEqual(['budgets', 'billing-usage']);
    // The 28-day totals came back empty (204), so the daily totals start yesterday.
    const totalDays = requestsTo(mock.requests, '/copilot/metrics/reports/organization-1-day').map((request) => request.query.get('day'));
    expect(totalDays).toEqual([1, 2, 3].map(dayBefore));
    expect(sourcesOf(bundle, 'scope-metrics')[0]).toMatchObject({ status: 'ok', records: 0 });
    // The team report of the last day has no data, so the script takes the day before.
    expect(requestsTo(mock.requests, '/user-teams-1-day').map((request) => request.query.get('day'))).toEqual([mock.reportLastDay, dayBefore(2)]);
    expect(sourcesOf(bundle, 'user-teams').map((line) => line.status)).toEqual(['skipped', 'ok']);
    const days = bundle.records.filter((line) => line.kind === 'user-metrics').map((line) => line.record.day);
    expect(new Set(days)).toEqual(new Set([mock.reportFirstDay, mock.reportLastDay, ...[29, 30, 32, 33].map(dayBefore)]));

    expectSafeRequests(mock.requests, '2026-03-10');
    expect(result.output).toMatch(/user-metrics\s+ok\s+8/);
    expect(result.output).toMatch(/user-teams\s+ok\s+2/);
    expect(result.output).toMatch(/billing-usage\s+failed/);
  }, RUN_TIMEOUT);

  it('saves no file when nothing can be read', async () => {
    const outputFolder = join(folder, 'nothing');
    mkdirSync(outputFolder);
    const result = await run('bash', ['--org', 'octo-labs', '--only', 'seat-summary', '--yes', '--hostname', MOCK_HOST, '--output', outputFolder]);
    expect(result.code).toBe(1);
    expect(result.output).toContain('No data could be read, so no file was saved.');
    expect(readdirSync(outputFolder)).toEqual([]);
    expect(leftoverWork()).toEqual([]);
  }, RUN_TIMEOUT);

  it('leaves out the API version when GitHub does not know it', async () => {
    mock.settings.rejectApiVersion = true;
    const file = join(folder, 'no-version.ndjson');
    const result = await run('bash', ['--org', 'octo-org', '--only', 'seat-summary', '--plain', '--yes', '--hostname', MOCK_HOST, '--output', file]);
    expect(result.code, result.output + result.errors).toBe(0);
    expect(readBundle(file).header.apiVersion).toBeNull();
    const [first, ...rest] = apiRequests(mock.requests);
    expect(first).toMatchObject({ path: '/api/v3/user', apiVersion: '2026-03-10' });
    expect(rest.length).toBeGreaterThan(0);
    expect(rest.every((request) => request.apiVersion === GH_DEFAULT_API_VERSION)).toBe(true);
  }, RUN_TIMEOUT);

  it('lists the download addresses that the network blocks', async () => {
    mock.settings.blockDownloads = true;
    const file = join(folder, 'blocked-download.ndjson');
    const result = await run('bash', networkArgs(file));
    expect(result.code, result.output + result.errors).toBe(0);
    const failed = sourcesOf(readBundle(file), 'user-metrics').filter((line) => line.status === 'failed');
    expect(failed).toHaveLength(1);
    expect(failed[0].message).toBe(`${NETWORK_MESSAGES.download}${BLOCKED_HOST}: ${NETWORK_MESSAGES.proxy}403).`);
    expect(sourcesOf(readBundle(file), 'seat-summary').every((line) => line.status === 'ok')).toBe(true);
    expect(result.output).toContain(`\nNetwork\n  ${NETWORK_MESSAGES.unreachable}\n    ${BLOCKED_HOST}\n  ${NETWORK_MESSAGES.allow}\n`);
    expect(result.output).toContain(NETWORK_MESSAGES.addresses);
    expect(result.output).not.toContain(NETWORK_MESSAGES.revocation);
    expect(leftoverWork()).toEqual([]);
  }, RUN_TIMEOUT);

  it('downloads without the revocation check when the network blocks it, and says so', async () => {
    const file = join(folder, 'revocation.ndjson');
    const result = await run('bash', networkArgs(file), revocationCurl(false));
    expect(result.code, result.output + result.errors).toBe(0);
    const bundle = readBundle(file);
    expect(sourcesOf(bundle, 'user-metrics').map((line) => line.status)).toEqual(['ok']);
    expect(bundle.records.filter((line) => line.kind === 'user-metrics')).toHaveLength(4);
    expect(result.output).toContain(`  ${NETWORK_MESSAGES.revocation}\n  servers that answer this (CRL and OCSP):\n    ${MOCK_HOST}\n  ${NETWORK_MESSAGES.retried}\n`);
    expect(result.output).not.toContain(NETWORK_MESSAGES.unreachable);
    expect(networkCheck(result.output)).toEqual([
      `${CHECK_MESSAGES.heading} (HTTPS, port 443)`,
      checkLine(MOCK_HOST, CHECK_MESSAGES.answersWithoutRevocation),
      `  ${CHECK_MESSAGES.revocation}`,
      '  this (CRL and OCSP). The script goes on without this check.',
    ]);
  }, RUN_TIMEOUT);

  it('checks the network before it asks anything, with one request that has no token', async () => {
    const file = join(folder, 'network-check.ndjson');
    const result = await run('bash', networkArgs(file));
    expect(result.code, result.output + result.errors).toBe(0);
    expect(networkCheck(result.output)).toEqual([`${CHECK_MESSAGES.heading} (HTTPS, port 443)`, checkLine(MOCK_HOST, 'answers')]);
    const checks = mock.requests.filter((request) => request.path === '/');
    expect(checks).toHaveLength(1);
    expect(mock.requests[0]).toBe(checks[0]);
    expect(checks[0].method).toBe('GET');
    expect(checks[0].authorization).toBeUndefined();
  }, RUN_TIMEOUT);

  it('names the GitHub address it cannot reach', async () => {
    const result = await run('bash', ['--org', 'octo-org', '--only', 'seat-summary', '--yes', '--hostname', MOCK_HOST], { HTTPS_PROXY: CLOSED_PROXY, https_proxy: CLOSED_PROXY });
    expect(result.code).toBe(1);
    expect(networkCheck(result.output)[1]).toMatch(new RegExp(`^ {2}${MOCK_HOST.replace('.', '\\.')} +${CHECK_MESSAGES.noAnswer}\\S`));
    expect(networkCheck(result.output)).toContain(`  ${CHECK_MESSAGES.oneBlocked}`);
    expect(result.errors).toContain(`Could not reach ${MOCK_HOST}: `);
    expect(result.errors).toContain(`If your network blocks ${MOCK_HOST}${NETWORK_MESSAGES.loginHint}`);
    expect(mock.requests).toHaveLength(0);
    expect(leftoverWork()).toEqual([]);
  }, RUN_TIMEOUT);

  it('runs the same when piped into bash, as the command from the app does', async () => {
    const fileRun = join(folder, 'bash-from-file.ndjson');
    const pipedRun = join(folder, 'bash-from-pipe.ndjson');
    expect((await run('bash', enterpriseArgs(fileRun))).code).toBe(0);
    const fileRequests = requestLines(mock.requests);
    mock.reset();
    const result = await run('bash-piped', enterpriseArgs(pipedRun));
    expect(result.errors).toBe('');
    expect(result.code, result.output).toBe(0);
    expect(requestLines(mock.requests)).toEqual(fileRequests);
    expect(comparable(readBundle(pipedRun))).toEqual(comparable(readBundle(fileRun)));
    expect(leftoverWork()).toEqual([]);

    const failed = await run('bash-piped', ['--org', 'bad/name', '--yes']);
    expect(failed.code).toBe(1);
    expect(failed.errors).toContain('is not valid');
  }, RUN_TIMEOUT);

  it.skipIf(!HAS_SCRIPT)('asks in the terminal when piped into bash, and runs nothing typed after it ends', async () => {
    const file = join(folder, 'bash-terminal.ndjson');
    const marker = join(folder, 'typed-after-the-end');
    // y answers "Start?". The next line is typed while the script runs; bash must not run it when the script ends.
    const result = await run('bash-terminal', ['--org', 'octo-org', '--only', 'seat-summary', '--months', '3', '--plain', '--hostname', MOCK_HOST, '--output', file], { TERM: 'xterm' }, `y\ntouch '${marker}'\n`);
    expect(result.code, result.output).toBe(0);
    expect(result.output).toContain('Ready to read');
    expect(result.output.indexOf(CHECK_MESSAGES.heading)).toBeGreaterThan(-1);
    expect(result.output.indexOf(CHECK_MESSAGES.heading)).toBeLessThan(result.output.indexOf('Ready to read'));
    expect(result.output).toContain('Network:  HTTPS (port 443)');
    expect(networkAddresses(result.output)).toEqual([MOCK_HOST]);
    expect(result.output).toContain('Start?');
    // In a terminal the step line moves while the step works, and the helper that moves it stops without a word.
    expect(result.output).toMatch(/\r {2}Seat totals and policies +[|/\\-]/);
    expect(result.output).toMatch(/Seat totals and policies +1 item/);
    expect(result.output).not.toContain('Terminated');
    expect(readBundle(file).header).toMatchObject({ scope: 'organization', organizations: ['octo-org'] });
    expect(existsSync(marker)).toBe(false);
    expect(leftoverWork()).toEqual([]);
  }, RUN_TIMEOUT);

  it.skipIf(!HAS_SCRIPT)('asks to go on when an address does not answer, but not when the GitHub API does not', async () => {
    const reportAddresses = ['copilot-reports.github.com', 'mbproduction.blob.core.windows.net'];
    const stopped = await run('bash-terminal', ['--enterprise', 'octocorp'], { ...probeCurl(['api.github.com']), TERM: 'xterm' }, 'n\n');
    expect(stopped.code, stopped.output).toBe(0);
    const check = networkCheck(stopped.output);
    expect(check).toContain(checkLine('api.github.com', 'answers'));
    for (const address of reportAddresses) expect(check).toContain(checkLine(address, `${CHECK_MESSAGES.noAnswer}curl: (7) Failed to connect to the server`));
    expect(check).toContain(checkLine('copilot-reports-*.b01.azurefd.net', CHECK_MESSAGES.notChecked));
    expect(check).toContain('  2 addresses did not answer, so the data that needs them may be missing.');
    expect(check).toContain(`  ${NETWORK_MESSAGES.addresses}`);
    expect(stopped.output).toContain(CHECK_MESSAGES.goOn);
    expect(stopped.output).toContain(CHECK_MESSAGES.stopped);
    expect(mock.requests).toHaveLength(0);

    const failed = await run('bash-terminal', ['--enterprise', 'octocorp'], { ...probeCurl([]), TERM: 'xterm' }, 'y\n');
    expect(failed.code, failed.output).toBe(1);
    expect(networkCheck(failed.output)).toContain('  3 addresses did not answer, so the data that needs them may be missing.');
    expect(failed.output).not.toContain(CHECK_MESSAGES.goOn);
    expect(leftoverWork()).toEqual([]);
  }, RUN_TIMEOUT);

  describe.skipIf(!HAS_POWERSHELL)('PowerShell', () => {
    it('writes the same data as bash', async () => {
      for (const [name, args] of [
        ['enterprise', enterpriseArgs],
        ['organization', organizationArgs],
        ['report queue', reportQueueArgs],
      ] as const) {
        const bashFile = join(folder, `bash-${name}.ndjson.gz`);
        const powershellFile = join(folder, `powershell-${name}.ndjson.gz`);
        const bashArgs = args(bashFile);
        expect(bashArgs.every((arg) => !arg.startsWith('--') || arg in POWERSHELL_NAMES)).toBe(true);
        mock.reset();
        const bashResult = await run('bash', bashArgs);
        expect(bashResult.code, bashResult.output).toBe(0);
        const bashRequests = requestLines(mock.requests);
        mock.reset();
        const powershellResult = await run('powershell', powershellArgs(args(powershellFile)));
        expect(powershellResult.errors, name).toBe('');
        expect(powershellResult.code, powershellResult.output).toBe(0);
        const powershellRequests = requestLines(mock.requests);
        expect(powershellRequests, name).toEqual(bashRequests);
        expectSafeRequests(mock.requests, '2026-03-10');
        expect(networkCheck(powershellResult.output), name).toEqual([`${CHECK_MESSAGES.heading} (HTTPS, port 443)`, checkLine(MOCK_HOST, 'answers')]);
        expect(networkCheck(bashResult.output), name).toEqual(networkCheck(powershellResult.output));

        const bashBundle = readBundle(bashFile);
        const powershellBundle = readBundle(powershellFile);
        expect(comparable(powershellBundle), name).toEqual(comparable(bashBundle));
        const { collector: powershellCollector, startedAt: _powershellStart, ...powershellHeader } = powershellBundle.header;
        const { collector: bashCollector, startedAt: _bashStart, ...bashHeader } = bashBundle.header;
        expect([bashCollector, powershellCollector]).toEqual(['collect.sh', 'collect.ps1']);
        expect(powershellHeader, name).toEqual(bashHeader);
        expect(leftoverWork(), name).toEqual([]);
      }
    }, RUN_TIMEOUT * 3);

    it('runs the same as a script block, as the command from the app does', async () => {
      const fileRun = join(folder, 'powershell-from-file.ndjson');
      const blockRun = join(folder, 'powershell-from-block.ndjson');
      expect((await run('powershell', powershellArgs(organizationArgs(fileRun)))).code).toBe(0);
      const fileRequests = requestLines(mock.requests);
      mock.reset();
      const result = await run('powershell-block', powershellArgs(organizationArgs(blockRun)));
      expect(result.errors).toBe('');
      expect(result.code, result.output).toBe(0);
      expect(requestLines(mock.requests)).toEqual(fileRequests);
      expect(comparable(readBundle(blockRun))).toEqual(comparable(readBundle(fileRun)));
      expect(leftoverWork()).toEqual([]);

      const listFile = join(folder, 'powershell-block-list.ndjson');
      const listed = await run('powershell-block', ['-Org', 'octo-org,octo-labs', '-Only', 'seat-summary', '-Plain', '-Yes', '-Hostname', MOCK_HOST, '-Output', listFile]);
      expect(listed.code, listed.output + listed.errors).toBe(0);
      expect(readBundle(listFile).header).toMatchObject({ organizations: ['octo-org', 'octo-labs'] });

      const failed = await run('powershell-block', ['-Org', 'bad/name', '-Yes']);
      expect(failed.code).toBe(1);
      expect(failed.errors).toContain('is not valid');
    }, RUN_TIMEOUT);

    it.skipIf(!DOTNET_TRUSTS_TEST_CERTIFICATE)('downloads the report files without curl', async () => {
      const bashFile = join(folder, 'bash-download.ndjson.gz');
      const powershellFile = join(folder, 'powershell-download.ndjson.gz');
      mock.reset();
      expect((await run('bash', organizationArgs(bashFile))).code).toBe(0);
      mock.reset();
      const result = await run('powershell', powershellArgs(organizationArgs(powershellFile)), { PATH: programsWithoutCurl() });
      expect(result.errors).toBe('');
      expect(result.code, result.output).toBe(0);
      expect(requestsTo(mock.requests, '/downloads/users-28-day.ndjson.gz')).toHaveLength(1);
      expectSafeRequests(mock.requests, '2026-03-10');
      expect(comparable(readBundle(powershellFile))).toEqual(comparable(readBundle(bashFile)));
      expect(leftoverWork()).toEqual([]);
    }, RUN_TIMEOUT);

    it('lists the blocked download addresses as bash does', async () => {
      const bashFile = join(folder, 'bash-blocked.ndjson');
      const powershellFile = join(folder, 'powershell-blocked.ndjson');
      mock.settings.blockDownloads = true;
      const bashResult = await run('bash', networkArgs(bashFile));
      expect(bashResult.code, bashResult.output).toBe(0);
      mock.reset();
      mock.settings.blockDownloads = true;
      const result = await run('powershell', powershellArgs(networkArgs(powershellFile)));
      expect(result.errors).toBe('');
      expect(result.code, result.output).toBe(0);
      expect(comparable(readBundle(powershellFile))).toEqual(comparable(readBundle(bashFile)));
      const networkPart = (output: string) => output.slice(output.indexOf('\nNetwork\n'), output.indexOf('Saved:'));
      expect(networkPart(result.output)).toContain(`  ${NETWORK_MESSAGES.unreachable}\n    ${BLOCKED_HOST}\n`);
      expect(networkPart(result.output)).toEqual(networkPart(bashResult.output));

      // .NET downloads the files when there is no curl, and names the refused address as well.
      mock.reset();
      mock.settings.blockDownloads = true;
      const dotNetFile = join(folder, 'powershell-blocked-dotnet.ndjson');
      const dotNetResult = await run('powershell', powershellArgs(networkArgs(dotNetFile)), { PATH: programsWithoutCurl() });
      expect(dotNetResult.code, dotNetResult.output).toBe(0);
      const dotNetFailures = sourcesOf(readBundle(dotNetFile), 'user-metrics').filter((line) => line.status === 'failed');
      expect(dotNetFailures).toHaveLength(1);
      expect(dotNetFailures[0].message).toContain(`${NETWORK_MESSAGES.download}${BLOCKED_HOST}: `);
      expect(networkPart(dotNetResult.output)).toEqual(networkPart(bashResult.output));
      expect(leftoverWork()).toEqual([]);
    }, RUN_TIMEOUT);

    for (const oldCurl of [false, true]) {
      const name = oldCurl
        ? 'downloads with .NET when curl is too old to go on without the revocation check'
        : 'downloads without the revocation check as bash does';
      it.skipIf(oldCurl && !DOTNET_TRUSTS_TEST_CERTIFICATE)(name, async () => {
        const bashFile = join(folder, `bash-revocation-${oldCurl}.ndjson`);
        const bashResult = await run('bash', networkArgs(bashFile), revocationCurl(false));
        expect(bashResult.code, bashResult.output).toBe(0);
        const networkPart = (output: string) => output.slice(output.indexOf('\nNetwork\n'), output.indexOf('Saved:'));
        expect(networkPart(bashResult.output)).toContain(NETWORK_MESSAGES.retried);
        const powershellFile = join(folder, `powershell-revocation-${oldCurl}.ndjson`);
        mock.reset();
        const result = await run('powershell', powershellArgs(networkArgs(powershellFile)), revocationCurl(oldCurl));
        expect(result.errors).toBe('');
        expect(result.code, result.output).toBe(0);
        expect(comparable(readBundle(powershellFile))).toEqual(comparable(readBundle(bashFile)));
        expect(networkPart(result.output)).toEqual(networkPart(bashResult.output));
        expect(networkCheck(result.output)).toEqual(networkCheck(bashResult.output));
        expect(requestsTo(mock.requests, '/downloads/users-28-day.ndjson.gz')).toHaveLength(1);
        expect(leftoverWork()).toEqual([]);
      }, RUN_TIMEOUT);
    }

    it('names the GitHub address it cannot reach', async () => {
      const result = await run('powershell', ['-Org', 'octo-org', '-Only', 'seat-summary', '-Yes', '-Hostname', MOCK_HOST], { HTTPS_PROXY: CLOSED_PROXY, https_proxy: CLOSED_PROXY });
      expect(result.code).toBe(1);
      expect(networkCheck(result.output)[1]).toMatch(new RegExp(`^ {2}${MOCK_HOST.replace('.', '\\.')} +${CHECK_MESSAGES.noAnswer}\\S`));
      expect(networkCheck(result.output)).toContain(`  ${CHECK_MESSAGES.oneBlocked}`);
      expect(result.errors).toContain(`Could not reach ${MOCK_HOST}: `);
      expect(result.errors).toContain(`If your network blocks ${MOCK_HOST}${NETWORK_MESSAGES.loginHint}`);
      expect(mock.requests).toHaveLength(0);
    }, RUN_TIMEOUT);

    it.skipIf(!HAS_SCRIPT)('asks to go on when an address does not answer, as bash does', async () => {
      const args = ['--enterprise', 'octocorp'];
      const bashResult = await run('bash-terminal', args, { ...probeCurl(['api.github.com']), TERM: 'xterm' }, 'n\n');
      expect(bashResult.code, bashResult.output).toBe(0);
      const result = await run('powershell-terminal', powershellArgs(args), { ...probeCurl(['api.github.com']), TERM: 'xterm' }, 'n\n');
      expect(result.code, result.output).toBe(0);
      expect(networkCheck(result.output)).toEqual(networkCheck(bashResult.output));
      expect(result.output).toContain(CHECK_MESSAGES.goOn);
      expect(result.output).toContain(CHECK_MESSAGES.stopped);
      expect(mock.requests).toHaveLength(0);
      expect(leftoverWork()).toEqual([]);
    }, RUN_TIMEOUT);

    it('saves no file when nothing can be read', async () => {
      const outputFolder = join(folder, 'powershell-nothing');
      mkdirSync(outputFolder);
      const result = await run('powershell', ['-Org', 'octo-labs', '-Only', 'seat-summary', '-Yes', '-Hostname', MOCK_HOST, '-Output', outputFolder]);
      expect(result.errors).toBe('');
      expect(result.code).toBe(1);
      expect(result.output).toContain('No data could be read, so no file was saved.');
      expect(readdirSync(outputFolder)).toEqual([]);
      expect(leftoverWork()).toEqual([]);
    }, RUN_TIMEOUT);

    it('checks the options before it sends any request', async () => {
      for (const [args, message] of [
        [['-Org', 'bad/name', '-Yes'], 'is not valid'],
        [['-Org', 'octo-org', '-Months', '25', '-Yes'], 'Months needs a number'],
        [['-Org', 'octo-org', '-Only', 'nothing', '-Yes'], 'Unknown source: nothing'],
        [['-Yes'], 'Choose what to read'],
      ] as const) {
        const result = await run('powershell', [...args]);
        expect(result.code, args.join(' ')).toBe(1);
        expect(result.output + result.errors, args.join(' ')).toContain(message);
      }
      expect((await run('powershell', ['-Version'])).output).toMatch(/^collect\.ps1 \d+\.\d+\.\d+/);
      expect(mock.requests).toHaveLength(0);
    }, RUN_TIMEOUT);
  });
});

/** The addresses after the Network line of --list-sources or of the plan, in order. */
function networkAddresses(output: string): string[] {
  const lines = output.replace(/\r/g, '').split('\n');
  const start = lines.findIndex((line) => line.includes('Network:'));
  if (start < 0) return [];
  const addresses: string[] = [];
  for (const line of lines.slice(start + 1)) {
    const match = /^ {2,}(\S+) +\S/.exec(line);
    if (match) addresses.push(match[1]);
    else if (addresses.length > 0) break;
  }
  return addresses;
}

describe.skipIf(!HAS_BASH)('network addresses of the collector scripts', () => {
  const HOSTS = ['github.com', 'octocorp.ghe.com', 'ghes.example.com'];
  const listSources = (command: string, args: string[]) =>
    spawnSync(command, args, { encoding: 'utf8', timeout: 60_000, env: { ...process.env, NO_COLOR: '1' } });
  const bashList = (hostname?: string) => listSources(BASH, [BASH_SCRIPT, '--list-sources', ...(hostname === undefined ? [] : ['--hostname', hostname])]);
  /** The addresses the app shows that the script itself uses, not the ones to get the script and sign in. */
  const appAddresses = (hostname: string) =>
    collectorAddresses({ ...DEFAULT_COLLECTOR_CHOICES, hostname })
      .filter((entry) => !entry.beforeRun)
      .map((entry) => entry.address);
  const networkPart = (output: string) => {
    const text = output.replace(/\r/g, '');
    return text.slice(text.indexOf('Network:'));
  };

  it.each(HOSTS)('lists the same addresses for %s as the app', (hostname) => {
    const result = bashList(hostname);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain(`addresses for ${hostname}.`);
    expect(networkAddresses(result.stdout)).toEqual(appAddresses(hostname));
  });

  it('cleans the host the same way as the app, and uses github.com without one', () => {
    expect(networkAddresses(bashList('API.OctoCorp.GHE.com').stdout)).toEqual(appAddresses('API.OctoCorp.GHE.com'));
    expect(networkAddresses(bashList().stdout)).toEqual(appAddresses(''));
  });

  it.skipIf(!POWERSHELL_WORKS)('lists the same addresses in PowerShell as in bash', () => {
    for (const hostname of HOSTS) {
      const powershell = listSources('pwsh', ['-NoLogo', '-NoProfile', '-NonInteractive', '-File', POWERSHELL_SCRIPT, '-ListSources', '-Hostname', hostname]);
      expect(powershell.status, powershell.stderr).toBe(0);
      expect(networkPart(powershell.stdout).replace('-Hostname shows', '--hostname shows'), hostname).toBe(networkPart(bashList(hostname).stdout));
    }
  }, RUN_TIMEOUT);
});

describe('data collector script messages the app reads', () => {
  it.each(['collect.sh', 'collect.ps1'])('%s writes the AI usage report messages the app knows', (name) => {
    const text = readFileSync(join(ROOT, 'scripts', name), 'utf8');
    expect(text).toContain(EMPTY_REPORT_MESSAGE);
    for (const start of REPORT_WAITING_MESSAGES) expect(text).toContain(start);
  });

  it.each(['collect.sh', 'collect.ps1'])('%s writes the same network notes, which point to the README', (name) => {
    const text = readFileSync(join(ROOT, 'scripts', name), 'utf8');
    for (const message of Object.values(NETWORK_MESSAGES)) expect(text).toContain(message);
    for (const message of Object.values(CHECK_MESSAGES)) expect(text).toContain(message);
    expect(text).toContain('--ssl-revoke-best-effort');
    expect(readFileSync(join(ROOT, 'README.md'), 'utf8')).toMatch(/^#+ Network access$/m);
  });
});
