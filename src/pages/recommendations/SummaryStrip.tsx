import { AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { themeLabel } from '../../components/RecommendationCard';
import { Card, CalcInfo, Figures, SeverityBadge, TONE_TEXT, cx } from '../../components/ui';
import { msg, t, tp } from '../../i18n';
import type { Recommendation } from '../../lib/analytics/recommendations';
import { pluralize } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { NarrowedNotice, usePerMonth } from '../shared';
import { SEVERITIES, THEMES, countBy, isActionable } from './recFilters';
import { cashHiddenReason, fmtMoney } from './scenario';

const STATUS = {
  action: { tone: 'warn', label: msg('Needs attention'), Icon: AlertTriangle, border: 'border-s-warn' },
  watch: { tone: 'info', label: msg('Worth watching'), Icon: Eye, border: 'border-s-info' },
  healthy: { tone: 'good', label: msg('Healthy'), Icon: CheckCircle2, border: 'border-s-good' },
} as const;

function Headline() {
  const { analysis } = useAnalysis();
  const headline = analysis.headline;
  const status = STATUS[headline.status];
  return (
    <div className={cx('card flex flex-wrap items-end gap-x-6 gap-y-3 border-s-[3px] px-5 py-4', status.border)}>
      <div className="min-w-0 flex-1 basis-64">
        <div className={cx('eyebrow flex items-center gap-1.5', TONE_TEXT[status.tone])}>
          <status.Icon size={13} aria-hidden />
          {t(status.label)}
          <CalcInfo id="headline-status" />
        </div>
        <h2 className="font-display mt-1.5 text-lg leading-snug text-fg sm:text-xl">{headline.title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-fg-muted">
          <Figures text={headline.detail} />
        </p>
      </div>
    </div>
  );
}

/** What the combined plan is worth, in cash when the pool size is known and otherwise in usage avoided. */
function PlanValue() {
  const { analysis } = useAnalysis();
  const perMonth = usePerMonth();
  const { plan } = analysis;
  const reason = cashHiddenReason(analysis);
  const usage = plan.levers.total * perMonth;

  let value: string;
  let detail: string;
  if (reason) {
    value = t('{amount} less usage per month', { amount: fmtMoney(usage) });
    detail = t('Usage that the whole plan avoids. {reason}', { reason });
  } else if (!Number.isFinite(plan.perMonth)) {
    value = '–';
    detail = t('The cash saving cannot be worked out from this data.');
  } else if (plan.perMonth >= 0.5) {
    value = t('{amount} saved per month', { amount: fmtMoney(plan.perMonth) });
    detail = t('Cash, about {year} a year, on top of any seat savings, if every recommendation is followed. The plan also avoids about {usage} of usage per month.', {
      year: fmtMoney(plan.perMonth * 12),
      usage: fmtMoney(usage),
    });
  } else {
    value = t('No cash saving yet');
    detail = t(
      'Usage stays within the included credits, so using less would not lower the bill today. The plan avoids about {usage} of usage per month, which turns into cash if usage grows past the included credits.',
      { usage: fmtMoney(usage) },
    );
  }

  return (
    <div>
      <div className="label flex items-center gap-1.5">
        {t('Combined value of the plan')}
        <CalcInfo id="rec-plan-value" />
      </div>
      <div className="num text-xl font-semibold leading-tight tracking-tight">{value}</div>
      <p className="mt-1 text-xs text-fg-muted">
        <Figures text={detail} />
      </p>
      <p className="mt-2 text-xs text-fg-subtle">{t('Recommendations overlap, so their individual values are not added up. This figure comes from one combined plan that applies each lever once.')}</p>
    </div>
  );
}

/** Headline, recommendation counts and the combined value of the plan. */
export function SummaryStrip({ recs: recommendations }: { recs: Recommendation[] }) {
  const bySeverity = countBy(recommendations, SEVERITIES, (recommendation) => recommendation.severity);
  const byTheme = countBy(recommendations, THEMES, (recommendation) => recommendation.theme);
  const actionable = recommendations.filter(isActionable).length;
  // With nothing to act on, a plan value would contradict the headline.
  const showPlan = actionable > 0;
  const needAction = recommendations.length > 0 ? `${t(', ')}${tp(actionable, '{n} that needs action', '{n} that need action')}` : '';

  return (
    <div className="space-y-3">
      <Headline />
      <NarrowedNotice />
      <Card>
        <div className={cx('grid gap-5', showPlan && 'lg:grid-cols-5')}>
          <div className={cx('space-y-3', showPlan && 'lg:col-span-3')}>
            <div>
              <div className="label flex flex-wrap items-center gap-1.5">
                {pluralize(recommendations.length, 'recommendation')}
                {needAction}
                <CalcInfo id="rec-severity" />
              </div>
              {recommendations.length > 0 ? (
                <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label={t('Recommendations by severity')}>
                  {SEVERITIES.filter((severity) => bySeverity[severity] > 0).map((severity) => (
                    <li key={severity} className="inline-flex items-center gap-1.5">
                      <SeverityBadge severity={severity} />
                      <span className="num text-sm font-semibold">{bySeverity[severity]}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-fg-muted">{t('Nothing to act on for this period.')}</p>
              )}
            </div>
            {recommendations.length > 0 ? (
              <div>
                <div className="label flex items-center gap-1.5">
                  {t('By theme')}
                  <CalcInfo id="rec-themes" />
                </div>
                <ul className="flex flex-wrap gap-1.5" aria-label={t('Recommendations by theme')}>
                  {THEMES.filter((theme) => byTheme[theme] > 0).map((theme) => (
                    <li key={theme} className="chip">
                      {themeLabel(theme)} <span className="num font-semibold">{byTheme[theme]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          {showPlan ? (
            <div className="border-t border-border-muted pt-4 lg:col-span-2 lg:border-s lg:border-t-0 lg:ps-5 lg:pt-0">
              <PlanValue />
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
