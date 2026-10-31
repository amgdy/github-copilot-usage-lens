import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Calculator, ChevronRight, FileUp, Filter, LockKeyhole, Moon, Sparkles, Sun } from 'lucide-react';
import { msg, t } from '../i18n';
import { LanguageButton } from './layout/LanguageButton';
import type { LinkId } from '../lib/links';
import { fmtInt } from '../lib/utils/format';
import { navigate } from '../state/router';
import { loadSample } from '../state/loadSample';
import { savedKeys } from '../state/savedData';
import { datasetLabel, resolveTheme, useApp } from '../state/store';
import { CollectorCommand } from '../pages/data/CollectorCommand';
import { UPLOAD_ACCEPT, takeUploads } from '../pages/data/LoadControl';
import { BrandLink } from './layout/Sidebar';
import { BuildVersion } from './BuildVersion';
import { DeleteSavedDataButton } from './DeleteSavedDataButton';
import { Badge, Callout, DocLinks, Spinner, type Tone } from './ui';
import { cx } from './ui/cx';

/** What the report gives, with a matching icon for each point. */
const POINTS = [
  {
    Icon: Sparkles,
    title: msg('Clear next steps'),
    text: msg('Users are grouped by how much and how they use GitHub Copilot. Actions are sorted by the money they can save.'),
  },
  {
    Icon: Filter,
    title: msg('Every angle'),
    text: msg('Filter by user, model, organization, cost center, product, date, weekday, billing and more. Click any chart to see the details.'),
  },
  {
    Icon: Calculator,
    title: msg('Every number explained'),
    text: msg('Each number has a button that shows how it is calculated, with an example. The Methodology page lists them all.'),
  },
  {
    Icon: LockKeyhole,
    title: msg('Private'),
    text: msg('The file is read in this browser tab only. Nothing is uploaded or saved on a server, and it works offline.'),
  },
];

/** Every file type the pickers take, for the list under the drop zone. */
const FILE_TYPES = ['.csv', '.json', '.txt', '.ndjson', '.ndjson.gz'];

interface FileGuide {
  id: 'usage' | 'license' | 'collection';
  title: string;
  badges: { label: string; tone: Tone }[];
  types: string[];
  gives: string;
  where: string;
  note?: string;
  links: LinkId[];
}

/** The files the app reads, from the one to start with to the ones that add more. */
const FILES: FileGuide[] = [
  {
    id: 'usage',
    title: msg('AI usage report'),
    badges: [{ label: msg('Start here'), tone: 'accent' }],
    types: ['.csv'],
    gives: msg('Every number in the report: usage, cost, users, models and tokens.'),
    where: msg('In GitHub, open Billing and licensing, then the AI usage page, and choose Get usage report. GitHub emails you a link to the file.'),
    links: ['usageBilling', 'manageSpending'],
  },
  {
    id: 'license',
    title: msg('License list'),
    badges: [{ label: msg('Recommended'), tone: 'good' }],
    types: ['.csv', '.json', '.txt'],
    gives: msg('Who has a seat and when they last used GitHub Copilot. It helps you review idle seats and makes the included credits estimate more exact.'),
    where: msg(
      'Easiest: the GitHub Copilot activity report (CSV) from your organization or enterprise settings. Advanced: the seat list from the GitHub REST API (JSON). A plain list of usernames (TXT) also works.',
    ),
    note: msg('Choose it together with the usage report, or add it later on the Licenses page.'),
    links: ['activityReport', 'seatsApi'],
  },
  {
    id: 'collection',
    title: msg('GitHub data file'),
    badges: [
      { label: msg('Optional'), tone: 'neutral' },
      { label: msg('Needs the GitHub CLI'), tone: 'neutral' },
    ],
    types: ['.ndjson.gz', '.ndjson'],
    gives: msg(
      'One command reads more from GitHub: budgets and limits, every seat, the bill check, activity with code completions and seat changes. For an enterprise the file has the AI usage report too, so it is the only file you need.',
    ),
    where: msg('Run the collector script on your computer. It uses the GitHub CLI, only reads from GitHub and saves one file.'),
    links: ['githubCli'],
  },
];

function FileTypes({ types, className }: { types: string[]; className?: string }) {
  return (
    <ul className={cx('flex flex-wrap gap-1.5', className)} aria-label={t('File types you can choose')}>
      {types.map((type) => (
        <li key={type}>
          <code dir="ltr" className="rounded-sm border border-border bg-surface px-1.5 py-px font-mono text-[11px] text-fg-muted">
            {type}
          </code>
        </li>
      ))}
    </ul>
  );
}

function GuideFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-[13px] leading-relaxed text-fg-muted">{children}</dd>
    </div>
  );
}

/** One file in the guide: its name and types, what it gives and where to get it. */
function FileRow({ file, step }: { file: FileGuide; step: number }) {
  return (
    <li className="grid gap-x-8 gap-y-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <div className="flex min-w-0 gap-3">
        <span
          aria-hidden
          className={cx(
            'num flex size-6 shrink-0 items-center justify-center rounded-sm border text-xs font-semibold',
            step === 1 ? 'border-accent bg-accent text-accent-fg' : 'border-border bg-surface-2 text-fg',
          )}
        >
          {step}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-6">{t(file.title)}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {file.badges.map((badge) => (
              <Badge key={badge.label} tone={badge.tone}>
                {t(badge.label)}
              </Badge>
            ))}
          </div>
          <FileTypes types={file.types} className="mt-2.5" />
        </div>
      </div>
      <dl className="grid gap-x-8 gap-y-4 ps-9 sm:grid-cols-2 lg:ps-0">
        <GuideFact label={t('What it gives')}>{t(file.gives)}</GuideFact>
        <GuideFact label={t('Where to get it')}>
          {t(file.where)}
          {file.note ? <span className="mt-1.5 block text-fg">{t(file.note)}</span> : null}
          <DocLinks ids={file.links} compact className="mt-2" />
        </GuideFact>
      </dl>
      {file.id === 'usage' ? (
        <p className="ps-9 text-[11px] leading-relaxed text-fg-subtle lg:col-span-2">
          {t('Columns the report needs: {columns} and the token columns. Other columns are ignored.', {
            columns: 'date, username, model, quantity, gross_amount, discount_amount, net_amount, total_monthly_quota, organization, cost_center_name',
          })}
        </p>
      ) : null}
      {file.id === 'collection' ? (
        <details className="group ps-9 lg:col-span-2">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm text-accent hover:underline [&::-webkit-details-marker]:hidden">
            <ChevronRight size={14} aria-hidden className="transition-transform group-open:rotate-90 rtl:-scale-x-100 rtl:group-open:-rotate-90" />
            {t('Show the steps')}
          </summary>
          <div className="mt-3 rounded-lg border border-border bg-surface-2 p-4 text-fg">
            <CollectorCommand />
          </div>
        </details>
      ) : null}
    </li>
  );
}

export function Landing() {
  const loading = useApp((state) => state.loading);
  const error = useApp((state) => state.error);
  const setError = useApp((state) => state.setError);
  const theme = useApp((state) => state.theme);
  const setTheme = useApp((state) => state.setTheme);
  const dataset = useApp((state) => state.dataset);
  const [hasSavedData] = useState(() => savedKeys().length > 0);
  const setPickingData = useApp((state) => state.setPickingData);
  const dark = resolveTheme(theme) === 'dark';
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const guideTitle = useRef<HTMLHeadingElement>(null);
  const busy = loading !== null;

  useEffect(() => {
    // The tab keeps the name of the last page otherwise, after Start fresh or Load other data.
    document.title = t('GitHub Copilot Usage Lens');
    // Opened from the report (the logo or Load other data): the link that was clicked is gone, so focus moves to the title.
    if (useApp.getState().pickingData) title.current?.focus();
  }, []);

  const take = (list: FileList | File[]) => {
    const files = Array.from(list);
    if (!files.length) return;
    void takeUploads(files).then((outcome) => {
      // A license list or GitHub data file loaded with (or after) a usage report: show its result on the Data page.
      if (outcome.notice && (outcome.notice.files.length > 0 || outcome.notice.collection !== null) && useApp.getState().dataset) {
        setPickingData(false);
        navigate('data');
      }
    });
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    if (!busy) take(event.dataTransfer.files);
  };

  const showGuide = () => {
    guideTitle.current?.scrollIntoView({ block: 'start' });
    guideTitle.current?.focus({ preventScroll: true });
  };

  return (
    <div className="min-h-full bg-bg">
      <div className="mx-auto flex min-h-full max-w-6xl flex-col px-5 py-5 sm:px-8">
        <header className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <BrandLink current className="-m-1" />
          <div className="flex min-w-0 items-center gap-1.5">
            {dataset ? (
              <button
                type="button"
                className="btn btn-sm min-w-0"
                disabled={busy}
                title={t('Go back to {name}', { name: datasetLabel(dataset) })}
                onClick={() => {
                  setError(null);
                  setPickingData(false);
                }}
              >
                <ArrowLeft size={14} className="shrink-0 rtl:-scale-x-100" />
                <span className="max-w-[14rem] truncate">{t('Back to {name}', { name: datasetLabel(dataset) })}</span>
              </button>
            ) : null}
            <LanguageButton className="btn btn-ghost btn-sm" />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={t('Switch between light and dark')}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <main className="flex-1 py-10 lg:py-16">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:grid-rows-[auto_1fr] lg:gap-x-20">
            <div className="lg:col-start-1 lg:row-start-1">
              <span aria-hidden className="block h-[3px] w-10 bg-accent" />
              <p className="eyebrow mt-4">{t('For GitHub Copilot admins and managers')}</p>
              <h1 ref={title} tabIndex={-1} className="font-display mt-3 text-balance text-[34px] leading-[1.06] outline-none sm:text-[46px]">
                {t('See where your GitHub Copilot AI credits go')}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted">
                {t(
                  'Drop the AI usage report you downloaded from GitHub. You get usage and pool health, rankings, user groups, tokens and the Auto discount for each user, and clear steps to get more from GitHub Copilot at a fair cost.',
                )}
              </p>
            </div>

            {/* Second in the page, so on a phone the ways to open a report come right after the title. */}
            <div className="space-y-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <section aria-labelledby="landing-open" className="card p-5 sm:p-6">
                <h2 id="landing-open" className="font-display text-lg">
                  {t('Open a report')}
                </h2>
                <div
                  className={cx(
                    'mt-4 rounded-lg border border-dashed px-5 py-6 text-center transition-colors',
                    over ? 'border-accent bg-accent-soft' : 'border-control bg-surface-2',
                    busy && 'pointer-events-none',
                  )}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (!busy) setOver(true);
                  }}
                  onDragLeave={() => setOver(false)}
                  onDrop={onDrop}
                >
                  {busy ? (
                    <div role="status" aria-live="polite">
                      <Spinner size={20} className="mx-auto text-accent" />
                      <div className="mt-3 text-sm font-medium">{loading.label}</div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-xs bg-surface-3">
                        <div className="h-full rounded-xs bg-accent transition-[width] duration-150" style={{ width: `${Math.max(4, Math.round(loading.fraction * 100))}%` }} />
                      </div>
                      <div className="num mt-1.5 text-xs text-fg-muted">{loading.rows > 0 ? t('{n} rows read', { n: fmtInt(loading.rows) }) : t('Starting…')}</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-semibold">{t('Drop your files here')}</div>
                      <p className="mt-1 text-xs leading-relaxed text-fg-muted">{t('The AI usage report, a license list or a GitHub data file. You can choose several at once.')}</p>
                      <FileTypes types={FILE_TYPES} className="mt-3 justify-center" />
                      <button type="button" className="btn btn-primary mt-4" onClick={() => input.current?.click()}>
                        <FileUp size={16} /> {t('Choose files')}
                      </button>
                      <input
                        ref={input}
                        type="file"
                        accept={UPLOAD_ACCEPT}
                        multiple
                        hidden
                        onChange={(event) => {
                          if (event.target.files?.length) take(event.target.files);
                          event.target.value = '';
                        }}
                      />
                      <p className="mt-3 text-[11px] text-fg-subtle">{t('Several files are joined into one, and repeated rows are removed.')}</p>
                    </>
                  )}
                </div>

                <button type="button" className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline" onClick={showGuide}>
                  <ArrowDown size={12} aria-hidden />
                  {t('Which file do I need?')}
                </button>

                <div className="my-4 flex items-center gap-3 text-xs text-fg-subtle">
                  <span aria-hidden className="h-px flex-1 bg-border" />
                  {t('or')}
                  <span aria-hidden className="h-px flex-1 bg-border" />
                </div>

                <button type="button" className="btn w-full" disabled={busy} onClick={() => void loadSample()}>
                  {t('View a sample report')}
                  <ArrowRight size={14} className="rtl:-scale-x-100" />
                </button>
                <p className="mt-2 text-center text-xs text-fg-subtle">{t('The sample uses made-up people and numbers. It is made in this browser tab.')}</p>
              </section>

              {error ? (
                <Callout tone="bad" title={t('That file could not be loaded')}>
                  {error}
                </Callout>
              ) : null}
            </div>

            <div className="lg:col-start-1 lg:row-start-2">
              <h2 className="eyebrow">{t('What you get')}</h2>
              <ol className="mt-3 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {POINTS.map((point) => (
                  <li key={point.title} className="border-t border-border pt-3">
                    <div className="flex items-center gap-2.5">
                      <point.Icon size={15} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden />
                      <h3 className="text-sm font-semibold">{t(point.title)}</h3>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{t(point.text)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <section aria-labelledby="landing-files" className="mt-16">
            <h2 id="landing-files" ref={guideTitle} tabIndex={-1} className="font-display scroll-mt-6 text-xl outline-none">
              {t('Which files you can use')}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-muted">
              {t('Start with the AI usage report. Add the others for a fuller picture. You can choose them all at once, and the app sees which file is which.')}
            </p>
            <ol className="card mt-5 divide-y divide-border">
              {FILES.map((file, index) => (
                <FileRow key={file.id} file={file} step={index + 1} />
              ))}
            </ol>
          </section>
        </main>

        <footer className="flex flex-col gap-1.5 border-t border-border pt-3 text-[11px] leading-relaxed text-fg-subtle">
          {hasSavedData ? (
            <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              {t('This browser keeps your settings from an earlier visit.')} <DeleteSavedDataButton look="link" />
            </span>
          ) : null}
          <BuildVersion className="flex" />
        </footer>
      </div>
    </div>
  );
}
