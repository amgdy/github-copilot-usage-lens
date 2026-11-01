import { Fragment, type MouseEvent } from 'react';
import { Lock } from 'lucide-react';
import { t, tp } from '../../i18n';
import { useAnalysis } from '../../state/analysis';
import { navigate, useRoute, type PageId } from '../../state/router';
import { useApp } from '../../state/store';
import { BuildVersion } from '../BuildVersion';
import { StartFreshButton } from '../StartFreshButton';
import { GitHubCopilotIcon } from '../icons/brand';
import { BrandMark } from '../icons/BrandMark';
import { cx } from '../ui/cx';
import { groupLabel, NAV, NAV_GROUPS } from './nav';

/** The app name with its animated mark. The sidebar, the mobile menu and the start page show it. */
export function Brand({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-center gap-2.5', className)}>
      <BrandMark size={32} animated className="shrink-0 text-fg" />
      <div className="min-w-0 leading-none">
        <div className="flex items-center gap-1 text-[11px] font-medium text-fg-muted">
          <GitHubCopilotIcon size={12} className="shrink-0" />
          <span className="truncate">{t('GitHub Copilot')}</span>
        </div>
        <div className="font-display mt-1 truncate text-[15px] text-fg">{t('Usage Lens')}</div>
      </div>
    </div>
  );
}

/** A click that the browser should handle itself, such as Ctrl or Cmd click to open a new tab. */
const opensElsewhere = (event: MouseEvent) => event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

/**
 * The app name as a link to the start page. With data loaded, the start page opens on top of it, and Back returns to
 * the report. On the start page itself (`current`) it is marked as the current page and goes back to the top.
 */
export function BrandLink({ current = false, onFollow, className }: { current?: boolean; onFollow?: () => void; className?: string }) {
  return (
    <a
      href="#/"
      aria-current={current ? 'page' : undefined}
      aria-label={t('GitHub Copilot Usage Lens: start page')}
      title={current ? undefined : t('Go to the start page')}
      onClick={(event) => {
        if (opensElsewhere(event)) return;
        event.preventDefault();
        if (current) window.scrollTo({ top: 0 });
        else useApp.getState().setPickingData(true);
        onFollow?.();
      }}
      className={cx('focus-inset block min-w-0 rounded-md p-1 transition-colors hover:bg-surface-3', className)}
    >
      <Brand />
    </a>
  );
}

/** The page list, shared by the desktop sidebar and the mobile drawer. */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const page = useRoute();
  const { analysis } = useAnalysis();
  const actionable = analysis.recs.filter((recommendation) => recommendation.severity === 'critical' || recommendation.severity === 'high').length;
  const go = (id: PageId) => {
    navigate(id);
    onNavigate?.();
  };
  return (
    <nav className="flex flex-col gap-px px-3" aria-label={t('Report sections')}>
      {NAV_GROUPS.map((group) => (
        <Fragment key={group}>
          <div className="eyebrow mb-1 mt-5 px-2 first:mt-0">{groupLabel(group)}</div>
          {NAV.filter((item) => item.group === group).map((item) => {
            const active = page === item.id;
            const Icon = item.Icon;
            return (
              <a
                key={item.id}
                href={`#/${item.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  go(item.id);
                }}
                aria-current={active ? 'page' : undefined}
                title={t(item.hint)}
                className={cx(
                  'relative flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors',
                  active ? 'bg-surface font-semibold text-fg ring-1 ring-border' : 'text-fg-muted hover:bg-surface-3 hover:text-fg',
                )}
              >
                {active ? <span className="absolute inset-y-1.5 start-0 w-0.5 rounded-xs bg-accent" aria-hidden /> : null}
                <Icon size={16} strokeWidth={1.75} className={cx('shrink-0', active ? 'text-accent' : 'text-fg-subtle')} aria-hidden />
                <span className="flex-1 truncate">{t(item.label)}</span>
                {item.id === 'recommendations' && actionable > 0 ? (
                  <span className="num rounded-xs border border-bad/40 px-1 text-[10px] font-semibold leading-4 text-bad" title={tp(actionable, '{n} urgent action', '{n} urgent actions')}>
                    {actionable}
                  </span>
                ) : null}
              </a>
            );
          })}
        </Fragment>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const setPickingData = useApp((state) => state.setPickingData);
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-e border-border bg-bg lg:flex">
      <div className="px-4 pb-4 pt-3">
        <BrandLink />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <NavList />
      </div>
      <div className="space-y-2.5 border-t border-border p-4 text-[11px] text-fg-muted">
        <div className="flex items-start gap-1.5">
          <Lock size={12} className="mt-0.5 shrink-0" />
          <span>{t('Your file is read in this browser tab only. Nothing is uploaded.')}</span>
        </div>
        <button type="button" className="btn btn-sm w-full" onClick={() => setPickingData(true)}>
          {t('Load other data')}
        </button>
        <StartFreshButton look="link" />
        <BuildVersion className="flex text-[10px] text-fg-subtle" />
      </div>
    </aside>
  );
}
