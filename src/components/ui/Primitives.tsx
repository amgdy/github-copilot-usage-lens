import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { cx } from './cx';
import { Figures } from './Figure';
import { t } from '../../i18n';
import { useRoute } from '../../state/router';
import { groupLabel, navItem } from '../layout/nav';

export type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'info' | 'accent';

/** Outlined stamps: tone text and a light tone border on the panel color. Use for labels and status marks. */
export const TONE_CLASS: Record<Tone, string> = {
  neutral: 'border-border bg-surface text-fg-muted',
  good: 'border-good/40 bg-surface text-good',
  warn: 'border-warn/40 bg-surface text-warn',
  bad: 'border-bad/40 bg-surface text-bad',
  info: 'border-info/40 bg-surface text-info',
  accent: 'border-accent/40 bg-surface text-accent',
};

/** Filled version of a stamp, for a pressed or selected state next to plain stamps. */
export const TONE_FILL: Record<Tone, string> = {
  neutral: 'border-fg-subtle bg-surface-3 text-fg',
  good: 'border-good/60 bg-good-soft text-good',
  warn: 'border-warn/60 bg-warn-soft text-warn',
  bad: 'border-bad/60 bg-bad-soft text-bad',
  info: 'border-info/60 bg-info-soft text-info',
  accent: 'border-accent/60 bg-accent-soft text-accent',
};

/** Just the tone color, for a bare icon. */
export const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-fg-muted',
  good: 'text-good',
  warn: 'text-warn',
  bad: 'text-bad',
  info: 'text-info',
  accent: 'text-accent',
};

/** Page title with its navigation icon and group. */
export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  const page = useRoute();
  const Icon = navItem(page).Icon;
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
      <div className="min-w-0">
        <div className="eyebrow mb-1.5 flex items-center gap-2">
          <Icon size={14} strokeWidth={1.75} className="text-accent" aria-hidden />
          <span>{groupLabel(navItem(page).group)}</span>
        </div>
        <h1 className="font-display text-2xl leading-tight text-fg sm:text-[28px]">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-3xl wrap-anywhere text-sm text-fg-muted">
            <Figures text={description} />
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Section({ title, description, actions, children, className }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('mt-6 first:mt-0', className)}>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? (
            <p className="text-xs text-fg-muted">
              <Figures text={description} />
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ title, description, action, icon }: { title: ReactNode; description?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {icon ? <div className="text-fg-subtle">{icon}</div> : null}
      <div className="text-sm font-medium">{title}</div>
      {description ? <div className="max-w-md text-xs text-fg-muted">{description}</div> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

const CALLOUT_ICON: Record<Tone, ReactNode> = {
  neutral: <Info size={15} />,
  info: <Info size={15} />,
  accent: <Info size={15} />,
  good: <CheckCircle2 size={15} />,
  warn: <AlertTriangle size={15} />,
  bad: <XCircle size={15} />,
};

const CALLOUT_EDGE: Record<Tone, string> = {
  neutral: 'border-s-fg-subtle',
  info: 'border-s-info',
  accent: 'border-s-accent',
  good: 'border-s-good',
  warn: 'border-s-warn',
  bad: 'border-s-bad',
};

/** A note on a white panel with a colored bar on the start side, like the alerts in GitHub Docs. */
export function Callout({ tone = 'info', title, children, className, action }: { tone?: Tone; title?: ReactNode; children?: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <div
      className={cx('flex flex-wrap items-start gap-x-2.5 gap-y-2 rounded-md border border-s-[3px] border-border bg-surface px-3 py-2.5 text-sm sm:flex-nowrap', CALLOUT_EDGE[tone], className)}
      role={tone === 'bad' || tone === 'warn' ? 'alert' : 'note'}
    >
      <span className={cx('mt-0.5 shrink-0', TONE_TEXT[tone])}>{CALLOUT_ICON[tone]}</span>
      <div className="min-w-0 flex-1 basis-48 text-fg">
        {title ? <div className="font-semibold">{title}</div> : null}
        {children ? (
          <div className={cx('text-xs', title ? 'mt-0.5 text-fg-muted' : '')}>
            <Figures text={children} />
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cx('animate-spin text-fg-muted', className)} aria-label={t('Loading')} />;
}

/** Thin indeterminate bar shown at the top of the page while a recompute is pending. */
export function PendingBar({ active }: { active: boolean }) {
  return (
    <div className={cx('pointer-events-none h-0.5 w-full overflow-hidden bg-transparent', active ? 'opacity-100' : 'opacity-0')} aria-hidden>
      <div className="h-full w-1/3 bg-accent" style={{ animation: active ? 'bar-slide 1s ease-in-out infinite' : undefined }} />
    </div>
  );
}
