import { useState } from 'react';
import { ArrowRight, ChevronDown, ExternalLink } from 'lucide-react';
import type { Audience, Confidence, RecTheme, Recommendation } from '../lib/analytics/recommendations';
import { msg, t } from '../i18n';
import { fmtUSD } from '../lib/utils/format';
import { drill } from '../state/router';
import { useApp } from '../state/store';
import { FeatureIcon, type FeatureId } from './icons';
import { Badge, CalcInfo, Figures, SeverityBadge, severityTone, cx } from './ui';
import { TONE_CLASS } from './ui/Primitives';

export const THEME_LABEL: Record<RecTheme, string> = {
  cost: msg('Cost'),
  pool: msg('Included credits'),
  efficiency: msg('Efficiency'),
  adoption: msg('Adoption'),
  governance: msg('Governance'),
  data: msg('Data quality'),
};

export const AUDIENCE_LABEL: Record<Audience, string> = {
  management: msg('Management'),
  admin: msg('Admins'),
  user: msg('Users'),
};

/** The translated theme and audience names. */
export const themeLabel = (theme: RecTheme): string => t(THEME_LABEL[theme]);
export const audienceLabel = (audience: Audience): string => t(AUDIENCE_LABEL[audience]);

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: msg('High'),
  medium: msg('Medium'),
  low: msg('Low'),
};

const BORDER: Record<string, string> = {
  bad: 'border-s-bad',
  warn: 'border-s-warn',
  info: 'border-s-info',
  good: 'border-s-good',
  neutral: 'border-s-border',
  accent: 'border-s-accent',
};

/** The GitHub icon of the feature a rule is about. Rules about no single feature carry none. */
const FEATURE_OF: Record<string, FeatureId> = {
  'auto-adoption': 'auto',
  'idle-seats': 'license',
  downgrade: 'license',
  'pool-underuse': 'license',
  'multi-org': 'license',
};

/** The impact figure of a recommendation: cash when there is some, otherwise the usage it avoids or the seat value it frees. */
export function ImpactChip({ rec: recommendation }: { rec: Recommendation }) {
  if (recommendation.cashUsd > 0.5) {
    const amount = fmtUSD(recommendation.cashUsd, 0);
    return (
      <span
        className={cx('num whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-xs font-semibold', TONE_CLASS.good)}
        title={
          recommendation.cashLowerBound
            ? t('Cash saved per month. This filtered view already has billed overage, so at least this much is cash. Included credits cannot be split for a filtered view, so the real saving can be higher.')
            : t('Cash saved per month, after the included credits are used first')
        }
      >
        {recommendation.cashLowerBound ? t('at least {amount}/mo saved', { amount }) : t('≈ {amount}/mo saved', { amount })}
      </span>
    );
  }
  if (recommendation.impactUsd > 0.5 && recommendation.impactKind === 'seats') {
    return (
      <span
        className={cx('num whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-xs font-medium', TONE_CLASS.neutral)}
        title={t('Monthly value of these seats. It only turns into cash when part of the included credits goes unused, because fewer seats also means a smaller pool that is used up sooner.')}
      >
        {t('≈ {amount}/mo of seat value', { amount: fmtUSD(recommendation.impactUsd, 0) })}
      </span>
    );
  }
  if (recommendation.impactUsd > 0.5) {
    return (
      <span
        className={cx('num whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-xs font-medium', TONE_CLASS.neutral)}
        title={
          recommendation.cashLowerBound
            ? t('Usage avoided per month. Whether it saves cash depends on the included credits, which cannot be split for a filtered view.')
            : t('Usage avoided per month. No cash saving while usage stays within the included credits.')
        }
      >
        {t('≈ {amount}/mo less usage', { amount: fmtUSD(recommendation.impactUsd, 0) })}
      </span>
    );
  }
  return null;
}

/** One recommendation: headline and summary, with evidence, actions, affected users and documentation when expanded. */
export function RecommendationCard({ rec: recommendation, defaultOpen = false }: { rec: Recommendation; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const selectUser = useApp((state) => state.selectUser);
  const tone = severityTone(recommendation.severity);
  const feature = FEATURE_OF[recommendation.id];
  const hasDetail = recommendation.evidence.length > 0 || recommendation.actions.length > 0 || !!recommendation.caveat || recommendation.affected.length > 0 || !!recommendation.docs?.length || !!recommendation.jump;
  const more = recommendation.affectedCount - recommendation.affected.length;

  return (
    <article className={cx('card overflow-hidden wrap-anywhere border-s-4', BORDER[tone] ?? BORDER.neutral)}>
      <div className={cx('flex items-start', hasDetail && 'hover:bg-surface-2')}>
        <button type="button" onClick={() => setOpen((wasOpen) => !wasOpen)} aria-expanded={open} disabled={!hasDetail} className="flex min-w-0 flex-1 items-start gap-3 py-3 ps-4 text-start disabled:cursor-default">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              {feature ? <FeatureIcon feature={feature} size={14} className="shrink-0 text-fg-muted" /> : null}
              <SeverityBadge severity={recommendation.severity} />
              <Badge>{themeLabel(recommendation.theme)}</Badge>
              <span className="text-[11px] text-fg-subtle">{t('For {audience}', { audience: recommendation.audience.map((audience) => audienceLabel(audience).toLowerCase()).join(t(', ')) })}</span>
            </div>
            <h3 className="text-sm font-semibold leading-snug">{recommendation.title}</h3>
            <p className="mt-1 text-sm text-fg-muted">
              <Figures text={recommendation.summary} />
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <ImpactChip rec={recommendation} />
            {hasDetail ? <ChevronDown size={16} className={cx('text-fg-subtle transition-transform', open && 'rotate-180')} /> : null}
          </div>
        </button>
        {/* Outside the toggle button: the calculator icon is a button of its own, and buttons cannot be nested. */}
        <div className="shrink-0 ps-2 pe-3 pt-4">{recommendation.calc ? <CalcInfo id={recommendation.calc} /> : null}</div>
      </div>

      {open && hasDetail ? (
        <div className="space-y-3 border-t border-border-muted bg-surface-2/50 px-4 py-3">
          <div className="grid gap-4 md:grid-cols-2">
            {recommendation.evidence.length ? (
              <div>
                <div className="label">{t('What the data shows')}</div>
                <ul className="list-disc space-y-1 ps-4 text-sm">
                  {recommendation.evidence.map((fact, index) => (
                    <li key={index}>
                      <Figures text={fact} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {recommendation.actions.length ? (
              <div>
                <div className="label">{t('What to do')}</div>
                <ol className="list-decimal space-y-1 ps-4 text-sm">
                  {recommendation.actions.map((action, index) => (
                    <li key={index}>
                      <Figures text={action} />
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>

          {recommendation.caveat ? (
            <p className="rounded-md bg-warn-soft px-2.5 py-1.5 text-xs text-warn">
              <Figures text={recommendation.caveat} />
            </p>
          ) : null}

          {recommendation.affected.length ? (
            <div>
              <div className="label">{t('Users involved')}</div>
              <div className="flex flex-wrap gap-1.5">
                {recommendation.affected.map((user) => (
                  <button key={user.id} type="button" className="chip hover:border-accent hover:text-accent" onClick={() => selectUser(user.id)} title={t('Open this user')}>
                    {user.name}
                  </button>
                ))}
                {more > 0 ? <span className="self-center text-xs text-fg-muted">{t('and {n} more', { n: more })}</span> : null}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            {recommendation.jump ? (
              <button type="button" className="btn btn-sm btn-primary" onClick={() => drill(recommendation.jump?.filters ?? {}, { page: recommendation.jump?.page, merge: true })}>
                {recommendation.jump.label} <ArrowRight size={14} className="rtl:-scale-x-100" />
              </button>
            ) : null}
            {recommendation.docs?.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                {t(link.label)} <ExternalLink size={11} />
              </a>
            ))}
            <span className="ms-auto inline-flex items-center gap-1 text-[11px] text-fg-subtle">
              {t('Confidence: {level}', { level: t(CONFIDENCE_LABEL[recommendation.confidence]).toLowerCase() })}
              <CalcInfo id="rec-confidence" />
            </span>
          </div>
        </div>
      ) : null}
    </article>
  );
}
