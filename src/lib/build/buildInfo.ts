/** What GitHub Actions knew about the build. Vite fills `__BUILD_INFO__` from the build environment (see vite.config.ts). */
export interface RawBuildInfo {
  version: string;
  runNumber?: string;
  runAttempt?: string;
  runId?: string;
  commit?: string;
  repository?: string;
  serverUrl?: string;
  builtAt?: string;
}

export interface BuildInfo {
  version: string;
  /** The GitHub Actions run number, or undefined for a build made on a computer. */
  runNumber?: number;
  /** The full commit, only for a build made by GitHub Actions on github.com. */
  commit?: string;
  /** The repository as owner/name, only for a build made by GitHub Actions on github.com. */
  repository?: string;
  /** The first 7 characters of the commit. */
  shortCommit?: string;
  runUrl?: string;
  commitUrl?: string;
  /** Build date as YYYY-MM-DD. */
  builtOn?: string;
}

declare const __BUILD_INFO__: RawBuildInfo;

const GITHUB_SERVER = 'https://github.com';
const REPOSITORY_PATTERN = /^[\w.-]+\/[\w.-]+$/;

/** Turns the raw values into safe links. Links are only made for github.com and a well-formed owner/repo. */
export function describeBuild(raw: RawBuildInfo): BuildInfo {
  const runNumber = raw.runNumber && /^\d+$/.test(raw.runNumber) ? Number(raw.runNumber) : undefined;
  const runId = raw.runId && /^\d+$/.test(raw.runId) ? raw.runId : undefined;
  const runAttempt = raw.runAttempt && /^\d+$/.test(raw.runAttempt) ? raw.runAttempt : undefined;
  const commit = raw.commit && /^[0-9a-f]{7,40}$/i.test(raw.commit) ? raw.commit.toLowerCase() : undefined;
  const repository = raw.serverUrl === GITHUB_SERVER && raw.repository && REPOSITORY_PATTERN.test(raw.repository) ? raw.repository : undefined;
  const repositoryUrl = repository ? `${GITHUB_SERVER}/${repository}` : undefined;
  const builtOn = raw.builtAt && /^\d{4}-\d{2}-\d{2}/.test(raw.builtAt) ? raw.builtAt.slice(0, 10) : undefined;
  return {
    version: raw.version,
    runNumber,
    commit: repository && commit?.length === 40 ? commit : undefined,
    repository,
    shortCommit: commit?.slice(0, 7),
    runUrl: repositoryUrl && runId ? `${repositoryUrl}/actions/runs/${runId}${runAttempt && runAttempt !== '1' ? `/attempts/${runAttempt}` : ''}` : undefined,
    commitUrl: repositoryUrl && commit ? `${repositoryUrl}/commit/${commit}` : undefined,
    builtOn,
  };
}

export const BUILD_INFO: BuildInfo = describeBuild(typeof __BUILD_INFO__ === 'undefined' ? { version: '0.0.0' } : __BUILD_INFO__);
