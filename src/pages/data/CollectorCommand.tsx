import { ChevronRight, Download, ExternalLink } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { DocLinks, NumberField, Segmented, Toggle } from '../../components/ui';
import { T, msg, t } from '../../i18n';
import {
  COLLECTOR_MONTHS,
  DEFAULT_COLLECTOR_CHOICES,
  cleanCollectorChoices,
  collectorAddresses,
  collectorCommand,
  collectorCopyCommand,
  collectorProblems,
  collectorScriptPageUrl,
  collectorZipUrl,
  type CollectorChoices,
  type CollectorScope,
  type CollectorSystem,
} from '../../lib/collection';
import { fmtInt } from '../../lib/utils/format';
import { CopyButton } from '../recommendations/CopyButton';

/** The choices are kept in this browser, so the command is ready on the next visit. "Delete saved settings" removes them. */
const STORAGE_KEY = 'ghcu.collector';

// Names and hosts are the same in every language.
const EXAMPLE_ENTERPRISE = 'octocorp';
const EXAMPLE_ORGANIZATIONS = 'octo-org, octo-labs';
const EXAMPLE_HOST = 'github.com';
const SIGN_IN_COMMAND = 'gh auth login';
const HTTPS_PORT = 443;
/** Windows checks certificate revocation over plain HTTP. */
const HTTP_PORT = 80;

const SYSTEMS: { value: CollectorSystem; label: string }[] = [
  { value: 'bash', label: msg('Mac or Linux') },
  { value: 'powershell', label: msg('Windows') },
];

const SCOPES: { value: CollectorScope; label: string }[] = [
  { value: 'enterprise', label: msg('Enterprise account') },
  { value: 'organization', label: msg('Organizations') },
];

const detectSystem = (): CollectorSystem => (typeof navigator !== 'undefined' && /windows/i.test(navigator.userAgent) ? 'powershell' : 'bash');

function loadChoices(): CollectorChoices {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return cleanCollectorChoices(JSON.parse(stored));
  } catch {
    /* storage is blocked or the saved value is broken: start from the defaults */
  }
  return { ...DEFAULT_COLLECTOR_CHOICES, system: detectSystem() };
}

function saveChoices(choices: CollectorChoices): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choices));
  } catch {
    /* storage is blocked; the choices last until the tab is closed */
  }
}

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2">
      <span aria-hidden className="num flex size-6 items-center justify-center rounded-sm border border-border bg-surface-2 text-xs font-semibold">
        {fmtInt(number)}
      </span>
      <div className="min-w-0 space-y-2">
        <h4 className="text-sm font-semibold leading-6">{title}</h4>
        {children}
      </div>
    </li>
  );
}

function CommandBox({ command, copyLabel }: { command: string; copyLabel: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 p-2">
      <code dir="ltr" className="block whitespace-pre-wrap break-all text-xs leading-relaxed">
        {command}
      </code>
      <div className="mt-2 flex justify-end">
        <CopyButton size="sm" label={copyLabel} getText={() => command} />
      </div>
    </div>
  );
}

/**
 * The addresses to allow before running the command, for networks that allow only some addresses. They follow the
 * host and the scope, like the plan the script shows before it starts.
 */
function NetworkAddresses({ choices }: { choices: CollectorChoices }) {
  const addresses = collectorAddresses(choices);
  const hasPattern = addresses.some((entry) => entry.address.includes('*'));
  return (
    <details className="group text-xs">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-accent hover:underline [&::-webkit-details-marker]:hidden">
        <ChevronRight size={12} aria-hidden className="transition-transform group-open:rotate-90 rtl:-scale-x-100 rtl:group-open:-rotate-90" />
        {t('Does your network allow only some addresses?')}
      </summary>
      <div className="mt-2 space-y-2">
        <p className="leading-relaxed text-fg-muted">
          {t('Ask your network team to allow HTTPS (port {port}) to these addresses before you run the command.', { port: HTTPS_PORT })}
          {hasPattern ? ` ${t('A * stands for any part of the name.')}` : ''}
        </p>
        <ul className="divide-y divide-border rounded-md border border-border bg-surface-2">
          {addresses.map((entry) => (
            <li key={entry.address} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-2 py-1.5">
              <code dir="ltr" className="break-all">
                {entry.address}
              </code>
              <span className="text-fg-muted">{t(entry.purpose)}</span>
            </li>
          ))}
        </ul>
        <p className="leading-relaxed text-fg-muted">
          {t('When the script starts, before it asks anything, it checks that the GitHub API and the report addresses answer. GitHub can send report files from other addresses. If the network blocks one, the script names it in its summary.')}
        </p>
        {choices.system === 'powershell' ? (
          <p className="leading-relaxed text-fg-muted">
            {t('Windows also checks each certificate with its issuer over HTTP (port {port}). If the network blocks that check, the script downloads the file again without it.', {
              port: HTTP_PORT,
            })}
          </p>
        ) : null}
        <DocLinks ids={['copilotAllowlist']} compact />
      </div>
    </details>
  );
}

/**
 * Three steps to make a GitHub data file: get the GitHub CLI, make the command and run it. The command gets the script
 * from GitHub, so nothing has to be downloaded. A downloaded copy of the scripts is the way for computers that cannot
 * run scripts from the internet.
 */
export function CollectorCommand() {
  const [choices, setChoices] = useState(loadChoices);
  const nameId = useId();
  const hostId = useId();
  const update = (change: Partial<CollectorChoices>) =>
    setChoices((current) => {
      const next = { ...current, ...change };
      saveChoices(next);
      return next;
    });
  const command = collectorCommand(choices);
  const copyCommand = collectorCopyCommand(choices);
  const problems = collectorProblems(choices);
  const enterprise = choices.scope === 'enterprise';

  return (
    <ol className="@container space-y-4">
      <Step number={1} title={t('Get the GitHub CLI')}>
        <p className="text-xs leading-relaxed text-fg-muted">
          <T
            text="Install it and sign in with {command}. The script asks for any other access it needs."
            values={{ command: <code dir="ltr" className="rounded-xs bg-surface-2 px-1">{SIGN_IN_COMMAND}</code> }}
          />
        </p>
        <DocLinks ids={['githubCli']} compact />
      </Step>

      <Step number={2} title={t('Make the command')}>
        <div className="grid gap-3 @md:grid-cols-2">
          <div className="min-w-0">
            <span className="label">{t('Your computer')}</span>
            <Segmented size="sm" label={t('Your computer')} value={choices.system} onChange={(system) => update({ system })} options={SYSTEMS.map((option) => ({ value: option.value, label: t(option.label) }))} />
          </div>
          <div className="min-w-0">
            <span className="label">{t('Collect')}</span>
            <Segmented size="sm" label={t('Collect')} value={choices.scope} onChange={(scope) => update({ scope })} options={SCOPES.map((option) => ({ value: option.value, label: t(option.label) }))} />
          </div>
          <div className="min-w-0">
            <label htmlFor={nameId} className="label">
              {enterprise ? t('Enterprise name in its GitHub address') : t('Organization names')}
            </label>
            <input
              id={nameId}
              dir="ltr"
              className="input"
              value={choices.name}
              placeholder={enterprise ? EXAMPLE_ENTERPRISE : EXAMPLE_ORGANIZATIONS}
              spellCheck={false}
              autoComplete="off"
              onChange={(event) => update({ name: event.target.value })}
            />
          </div>
          <div className="min-w-0">
            <span className="label">{t('Months')}</span>
            <NumberField
              aria-label={t('Months')}
              value={choices.months}
              min={COLLECTOR_MONTHS.min}
              max={COLLECTOR_MONTHS.max}
              onChange={(months) => update({ months: months ?? COLLECTOR_MONTHS.default })}
            />
            <span className="mt-1 block text-xs text-fg-subtle">{t('Counting this month, 1 to 24.')}</span>
          </div>
          <div className="min-w-0 @md:col-span-2">
            <label htmlFor={hostId} className="label">
              {t('GitHub host')}
            </label>
            <input
              id={hostId}
              dir="ltr"
              className="input"
              value={choices.hostname}
              placeholder={EXAMPLE_HOST}
              spellCheck={false}
              autoComplete="off"
              onChange={(event) => update({ hostname: event.target.value })}
            />
            <span className="mt-1 block text-xs text-fg-subtle">{t('Leave it empty for GitHub.com. With data residency, type your host, for example octocorp.ghe.com.')}</span>
          </div>
          <div className="space-y-2 @md:col-span-2">
            <Toggle
              checked={choices.dailyMetrics}
              onChange={(dailyMetrics) => update({ dailyMetrics })}
              label={t('Activity of every day')}
              description={t('Makes older months exact. It takes longer and the file is larger.')}
            />
            <Toggle checked={choices.teams} onChange={(teams) => update({ teams })} label={t('Team members')} description={t('Adds the teams of each user. It sends one request per team.')} />
          </div>
        </div>

        <CommandBox command={command} copyLabel={t('Copy the command')} />
        <p className="text-xs leading-relaxed text-fg-muted">
          {t('The command gets the script from GitHub and runs it, so there is nothing to download or install.')}{' '}
          <a className="inline-flex items-center gap-1 text-accent hover:underline" href={collectorScriptPageUrl(choices.system)} target="_blank" rel="noreferrer">
            {t('Read the script on GitHub')}
            <ExternalLink size={11} aria-hidden />
            <span className="sr-only">{t('(opens in a new tab)')}</span>
          </a>
        </p>
        {problems.length > 0 ? (
          <ul className="space-y-0.5 text-xs text-warn">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        ) : null}
        {choices.name.trim() === '' ? <p className="text-xs text-fg-subtle">{t('Without a name, the script asks for it when it starts.')}</p> : null}
      </Step>

      <Step number={3} title={t('Run it and load the file')}>
        <p className="text-xs leading-relaxed text-fg-muted">
          {choices.system === 'powershell'
            ? t('Open PowerShell or Command Prompt, paste the command and press Enter. The script shows its plan and asks before it starts. It only reads from GitHub.')
            : t('Open a terminal, paste the command and press Enter. The script shows its plan and asks before it starts. It only reads from GitHub.')}
        </p>
        <p className="text-xs leading-relaxed text-fg-muted">
          {enterprise
            ? t('When it says the file is saved, drop the file here. It has the AI usage report too, so it is the only file you need. You need to be an enterprise owner or billing manager.')
            : t('When it says the file is saved, drop it here together with the usage report CSV from GitHub billing. GitHub makes the AI usage report file only for enterprises. You need to be an organization owner or billing manager.')}
        </p>
        <NetworkAddresses choices={choices} />
        <details className="group text-xs">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-accent hover:underline [&::-webkit-details-marker]:hidden">
            <ChevronRight size={12} aria-hidden className="transition-transform group-open:rotate-90 rtl:-scale-x-100 rtl:group-open:-rotate-90" />
            {t('Your computer cannot run scripts from the internet?')}
          </summary>
          <div className="mt-2 space-y-2">
            <p className="leading-relaxed text-fg-muted">
              {t('Download the scripts and unpack the ZIP file. Open a terminal in the unpacked folder and run this command instead.')}
            </p>
            <a href={collectorZipUrl()} className="btn btn-sm" rel="noreferrer">
              <Download size={13} aria-hidden /> {t('Download the scripts (ZIP)')}
            </a>
            <CommandBox command={copyCommand} copyLabel={t('Copy the command for the downloaded scripts')} />
          </div>
        </details>
      </Step>
    </ol>
  );
}
