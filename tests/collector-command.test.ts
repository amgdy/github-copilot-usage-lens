import { describe, expect, it } from 'vitest';
import {
  DEFAULT_COLLECTOR_CHOICES,
  cleanCollectorChoices,
  collectorAddresses,
  collectorCommand,
  collectorCopyCommand,
  collectorNames,
  collectorProblems,
  collectorScriptPageUrl,
  collectorScriptSource,
  collectorScriptUrl,
  collectorZipUrl,
  type CollectorChoices,
} from '../src/lib/collection';

const choices = (overrides: Partial<CollectorChoices> = {}): CollectorChoices => ({ ...DEFAULT_COLLECTOR_CHOICES, ...overrides });

// A fixed source, because builds in GitHub Actions point the command at their own commit.
const source = { repository: 'amgdy/github-copilot-usage-lens', ref: 'main' };
const RAW = 'https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts';
const bash = (options = '') => `curl -fsSL ${RAW}/collect.sh | bash${options === '' ? '' : ` -s -- ${options}`}`;
const powershell = (options = '') => `powershell -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm ${RAW}/collect.ps1)))${options === '' ? '' : ` ${options}`}"`;
const command = (overrides: Partial<CollectorChoices> = {}) => collectorCommand(choices(overrides), source);

describe('collectorCommand', () => {
  it('gets the script from GitHub and runs it with no options when nothing is chosen, so the script asks', () => {
    expect(command()).toBe(bash());
    expect(command({ system: 'powershell' })).toBe(powershell());
  });

  it('names the enterprise or the organizations', () => {
    expect(command({ name: ' octocorp ' })).toBe(bash('--enterprise octocorp'));
    expect(command({ scope: 'organization', name: 'octo-org, octo-labs octo-org' })).toBe(bash('--org octo-org,octo-labs'));
    expect(command({ system: 'powershell', scope: 'organization', name: 'octo-org,octo-labs' })).toBe(powershell('-Org octo-org,octo-labs'));
  });

  it('adds the other options in the same order for both scripts', () => {
    const full = { name: 'octocorp', months: 6, dailyMetrics: true, teams: true, hostname: ' OctoCorp.GHE.com ' };
    expect(command(full)).toBe(bash('--enterprise octocorp --months 6 --daily-metrics --teams --hostname octocorp.ghe.com'));
    expect(command({ ...full, system: 'powershell' })).toBe(powershell('-Enterprise octocorp -Months 6 -DailyMetrics -Teams -Hostname octocorp.ghe.com'));
  });

  it('leaves out the default months and host, and keeps months between 1 and 24', () => {
    expect(command({ name: 'octocorp', months: 3, hostname: 'github.com' })).toBe(bash('--enterprise octocorp'));
    expect(command({ months: 40 })).toBe(bash('--months 24'));
    expect(command({ months: 0 })).toBe(bash('--months 1'));
    expect(command({ months: Number.NaN })).toBe(bash());
  });

  it('never puts shell characters in the options', () => {
    const risky = { scope: 'organization' as const, name: 'octo-org; rm -rf ~, $(whoami), `id`, "quoted"', hostname: 'host.example.com && curl x' };
    // A name may not start with a dash, so it can never pass as an option of the script.
    expect(command(risky)).toBe(bash('--org rm'));
    expect(command({ ...risky, system: 'powershell' })).toBe(powershell('-Org rm'));
    expect(collectorCopyCommand(choices(risky))).toBe('bash scripts/collect.sh --org rm');
    for (const system of ['bash', 'powershell'] as const) {
      const options = command({ ...risky, system }).split(/collect\.(?:sh|ps1)/)[1];
      expect(options).not.toMatch(/[;$`&<>~]/);
    }
  });

  it('has no $ in the PowerShell command, so PowerShell and Command Prompt run it the same way', () => {
    expect(command({ system: 'powershell', name: 'octocorp', months: 6, dailyMetrics: true, teams: true, hostname: 'octocorp.ghe.com' })).not.toContain('$');
  });
});

describe('collectorCopyCommand', () => {
  it('runs a downloaded copy of the scripts with the same options', () => {
    expect(collectorCopyCommand(choices())).toBe('bash scripts/collect.sh');
    expect(collectorCopyCommand(choices({ system: 'powershell' }))).toBe('powershell -ExecutionPolicy Bypass -File scripts\\collect.ps1');
    expect(collectorCopyCommand(choices({ name: 'octocorp', months: 6, teams: true }))).toBe('bash scripts/collect.sh --enterprise octocorp --months 6 --teams');
    expect(collectorCopyCommand(choices({ system: 'powershell', scope: 'organization', name: 'octo-org octo-labs' }))).toBe(
      'powershell -ExecutionPolicy Bypass -File scripts\\collect.ps1 -Org octo-org,octo-labs',
    );
  });
});

describe('collector script source', () => {
  const commit = 'e3b1fb9c0ffee1234567890abcdef1234567890a';

  it('uses the commit the app was built from, so the script writes the file this app reads', () => {
    expect(collectorScriptSource({ repository: 'octo/fork', commit })).toEqual({ repository: 'octo/fork', ref: commit });
  });

  it('uses the main branch of this repository for a build made on a computer or with odd values', () => {
    const main = { repository: 'amgdy/github-copilot-usage-lens', ref: 'main' };
    expect(collectorScriptSource({})).toEqual(main);
    expect(collectorScriptSource({ repository: 'octo/fork' })).toEqual(main);
    expect(collectorScriptSource({ repository: 'octo/fork', commit: 'e3b1fb9' })).toEqual(main);
    expect(collectorScriptSource({ repository: 'octo/x"><script>', commit })).toEqual(main);
  });

  it('links the raw script, the script page and the ZIP file of the same commit', () => {
    const pinned = { repository: 'octo/fork', ref: commit };
    expect(collectorScriptUrl('bash', pinned)).toBe(`https://raw.githubusercontent.com/octo/fork/${commit}/scripts/collect.sh`);
    expect(collectorScriptUrl('powershell', pinned)).toBe(`https://raw.githubusercontent.com/octo/fork/${commit}/scripts/collect.ps1`);
    expect(collectorScriptPageUrl('powershell', pinned)).toBe(`https://github.com/octo/fork/blob/${commit}/scripts/collect.ps1`);
    expect(collectorZipUrl(pinned)).toBe(`https://github.com/octo/fork/archive/${commit}.zip`);
  });
});

describe('collectorAddresses', () => {
  const addresses = (overrides: Partial<CollectorChoices> = {}) => collectorAddresses(choices(overrides)).map((entry) => entry.address);
  const scriptAddresses = (overrides: Partial<CollectorChoices> = {}) =>
    collectorAddresses(choices(overrides))
      .filter((entry) => !entry.beforeRun)
      .map((entry) => entry.address);

  it('lists the script download, the sign-in, the API and the report files of GitHub.com', () => {
    expect(addresses()).toEqual([
      'raw.githubusercontent.com',
      'github.com',
      'api.github.com',
      'copilot-reports.github.com',
      'copilot-reports-*.b01.azurefd.net',
      'usagereports*.blob.core.windows.net',
      'mbproduction.blob.core.windows.net',
    ]);
  });

  it('adds the AI usage report storage only for an enterprise, the only scope that gets that report', () => {
    expect(addresses({ scope: 'organization' })).not.toContain('mbproduction.blob.core.windows.net');
    expect(addresses({ scope: 'organization' })).toContain('copilot-reports.github.com');
  });

  it('follows the host the same way the scripts clean it', () => {
    expect(scriptAddresses({ hostname: ' OctoCorp.GHE.com ' })).toEqual(['api.octocorp.ghe.com', '*.octocorp.ghe.com']);
    expect(scriptAddresses({ hostname: 'api.octocorp.ghe.com' })).toEqual(['api.octocorp.ghe.com', '*.octocorp.ghe.com']);
    expect(addresses({ hostname: 'octocorp.ghe.com' })).toContain('octocorp.ghe.com');
    expect(addresses({ hostname: 'ghes.example.com' })).toEqual(['raw.githubusercontent.com', 'ghes.example.com']);
  });

  it('uses GitHub.com when the host is left out of the command', () => {
    expect(addresses({ hostname: 'https://octocorp.ghe.com/' })).toEqual(addresses());
    expect(addresses({ hostname: '   ' })).toEqual(addresses());
  });

  it('says what each address is for and has no repeats', () => {
    for (const hostname of ['', 'octocorp.ghe.com', 'ghes.example.com']) {
      for (const scope of ['enterprise', 'organization'] as const) {
        const entries = collectorAddresses(choices({ hostname, scope }));
        expect(new Set(entries.map((entry) => entry.address)).size).toBe(entries.length);
        for (const entry of entries) expect(entry.purpose).not.toBe('');
      }
    }
  });
});

describe('collectorProblems', () => {
  it('says nothing when the choices are fine', () => {
    expect(collectorProblems(choices({ name: 'octocorp', hostname: 'octocorp.ghe.com:8443' }))).toEqual([]);
  });

  it('names what was left out and why', () => {
    expect(collectorProblems(choices({ scope: 'organization', name: 'octo-org, bad;name', hostname: 'https://octocorp.ghe.com' }))).toEqual([
      'Left out: bad;name. A name has only letters, digits, dots, dashes and underscores.',
      'Left out: the host. Type only the host name, for example octocorp.ghe.com.',
    ]);
    expect(collectorProblems(choices({ name: 'octocorp other-corp' }))).toEqual(['Only the first enterprise is used. Run the script once for each enterprise.']);
  });
});

describe('collector choices', () => {
  it('splits names on commas and spaces and drops repeats', () => {
    expect(collectorNames(' a, b  c,,a ')).toEqual(['a', 'b', 'c']);
    expect(collectorNames('')).toEqual([]);
  });

  it('reads stored choices back and repairs what is broken', () => {
    expect(cleanCollectorChoices(null)).toEqual(DEFAULT_COLLECTOR_CHOICES);
    expect(cleanCollectorChoices({ system: 'cmd', scope: 'team', name: 5, months: 99, dailyMetrics: 'yes', teams: true, hostname: 'octocorp.ghe.com' })).toEqual({
      ...DEFAULT_COLLECTOR_CHOICES,
      months: 24,
      teams: true,
      hostname: 'octocorp.ghe.com',
    });
    expect(cleanCollectorChoices({ system: 'powershell', scope: 'organization', name: 'octo-org', months: 6 })).toMatchObject({ system: 'powershell', scope: 'organization', name: 'octo-org', months: 6 });
  });
});
