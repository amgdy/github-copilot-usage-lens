import { describe, expect, it } from 'vitest';
import { describeBuild } from '../src/lib/build/buildInfo';

const actionsBuild = {
  version: '1.0.0',
  runNumber: '42',
  runAttempt: '1',
  runId: '40601996915',
  commit: 'E3B1FB9C0FFEE1234567890ABCDEF1234567890A',
  repository: 'amgdy/github-copilot-usage-lens',
  serverUrl: 'https://github.com',
  builtAt: '2026-10-28T11:00:00.000Z',
};

describe('describeBuild', () => {
  it('links a GitHub Actions build to its run and commit', () => {
    const build = describeBuild(actionsBuild);
    expect(build.runNumber).toBe(42);
    expect(build.shortCommit).toBe('e3b1fb9');
    expect(build.runUrl).toBe('https://github.com/amgdy/github-copilot-usage-lens/actions/runs/40601996915');
    expect(build.commitUrl).toBe('https://github.com/amgdy/github-copilot-usage-lens/commit/e3b1fb9c0ffee1234567890abcdef1234567890a');
    expect(build.builtOn).toBe('2026-10-28');
    expect(build.commit).toBe('e3b1fb9c0ffee1234567890abcdef1234567890a');
    expect(build.repository).toBe('amgdy/github-copilot-usage-lens');
  });

  it('points to the exact attempt when a run was re-run', () => {
    expect(describeBuild({ ...actionsBuild, runAttempt: '3' }).runUrl).toBe('https://github.com/amgdy/github-copilot-usage-lens/actions/runs/40601996915/attempts/3');
  });

  it('shows a local build without links', () => {
    const build = describeBuild({ version: '1.0.0' });
    expect(build).toEqual({ version: '1.0.0', runNumber: undefined, commit: undefined, repository: undefined, shortCommit: undefined, runUrl: undefined, commitUrl: undefined, builtOn: undefined });
  });

  it('makes no link for other servers or malformed values', () => {
    expect(describeBuild({ ...actionsBuild, serverUrl: 'https://example.com' }).runUrl).toBeUndefined();
    expect(describeBuild({ ...actionsBuild, repository: 'amgdy/x"><script>' }).runUrl).toBeUndefined();
    expect(describeBuild({ ...actionsBuild, runId: '12abc' }).runUrl).toBeUndefined();
    expect(describeBuild({ ...actionsBuild, commit: 'not-a-sha' }).commitUrl).toBeUndefined();
    expect(describeBuild({ ...actionsBuild, serverUrl: 'https://example.com' }).commit).toBeUndefined();
    expect(describeBuild({ ...actionsBuild, commit: 'e3b1fb9' }).commit).toBeUndefined();
  });
});

describe('source code link', () => {
  it('points to the GitHub repository named in package.json', async () => {
    const { APP_REPOSITORY_URL } = await import('../src/lib/links');
    const { readFileSync } = await import('node:fs');
    const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(APP_REPOSITORY_URL.startsWith('https://github.com/')).toBe(true);
    expect(packageJson.repository.url).toBe(`git+${APP_REPOSITORY_URL}.git`);
  });
});
