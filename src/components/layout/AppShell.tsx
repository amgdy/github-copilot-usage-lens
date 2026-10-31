import { Suspense, lazy, useEffect, useRef, type ComponentType, type LazyExoticComponent } from 'react';
import { t } from '../../i18n';
import { useAnalysis } from '../../state/analysis';
import { navigate, useRoute, type PageId } from '../../state/router';
import { useApp } from '../../state/store';
import { ErrorBoundary } from '../ErrorBoundary';
import { StartFreshButton, StartFreshDialog } from '../StartFreshButton';
import { UserDrawer } from '../UserDrawer';
import { Drawer, PendingBar, Spinner, cx } from '../ui';
import { FilterChips } from './FilterChips';
import { FilterDrawer } from './FilterDrawer';
import { navItem } from './nav';
import { CoverageNotice } from './CoverageNotice';
import { PrintHeader } from './PrintHeader';
import { SampleNotice } from './SampleNotice';
import { BrandLink, NavList, Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const PAGES: Record<PageId, LazyExoticComponent<ComponentType>> = {
  overview: lazy(() => import('../../pages/OverviewPage')),
  spend: lazy(() => import('../../pages/SpendPage')),
  budgets: lazy(() => import('../../pages/BudgetsPage')),
  users: lazy(() => import('../../pages/UsersPage')),
  segments: lazy(() => import('../../pages/SegmentsPage')),
  models: lazy(() => import('../../pages/ModelsPage')),
  efficiency: lazy(() => import('../../pages/EfficiencyPage')),
  organization: lazy(() => import('../../pages/OrganizationPage')),
  patterns: lazy(() => import('../../pages/PatternsPage')),
  recommendations: lazy(() => import('../../pages/RecommendationsPage')),
  licenses: lazy(() => import('../../pages/LicensesPage')),
  data: lazy(() => import('../../pages/DataPage')),
  settings: lazy(() => import('../../pages/SettingsPage')),
  methodology: lazy(() => import('../../pages/MethodologyPage')),
};

function PageFallback() {
  return (
    <div className="flex h-48 items-center justify-center" role="status">
      <Spinner size={22} />
    </div>
  );
}

function MobileNav() {
  const open = useApp((state) => state.navOpen);
  const setOpen = useApp((state) => state.setNavOpen);
  const setPickingData = useApp((state) => state.setPickingData);
  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      side="start"
      widthClass="w-[min(300px,85vw)]"
      title={<BrandLink onFollow={() => setOpen(false)} />}
      footer={
        <div className="flex flex-col items-start gap-2.5">
          <button
            type="button"
            className="btn btn-sm w-full"
            onClick={() => {
              setOpen(false);
              setPickingData(true);
            }}
          >
            {t('Load other data')}
          </button>
          <StartFreshButton look="link" className="text-xs" onOpen={() => setOpen(false)} />
        </div>
      }
    >
      <div className="py-3">
        <NavList onNavigate={() => setOpen(false)} />
      </div>
    </Drawer>
  );
}

export function AppShell() {
  const page = useRoute();
  const { pending, analysis } = useAnalysis();
  const main = useRef<HTMLElement>(null);
  const Page = PAGES[page];

  // A bad or empty hash lands on the overview with a proper URL.
  useEffect(() => {
    if (!window.location.hash) navigate('overview');
  }, []);

  useEffect(() => {
    main.current?.scrollTo({ top: 0 });
    document.title = `${t(navItem(page).label)} · ${t('GitHub Copilot Usage Lens')}`;
  }, [page]);

  return (
    <div className="flex h-full print:block print:h-auto">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col print:block">
        <TopBar />
        <FilterChips />
        <PendingBar active={pending} />
        <main ref={main} className={cx('min-h-0 flex-1 overflow-y-auto p-4 transition-opacity sm:p-6 print:overflow-visible print:p-0', pending && 'opacity-70')} aria-busy={pending}>
          <div className="mx-auto max-w-[1500px]">
            <PrintHeader />
            <SampleNotice />
            <CoverageNotice />
            <ErrorBoundary key={page} scope={t(navItem(page).label)}>
              <Suspense fallback={<PageFallback />}>
                <Page />
              </Suspense>
            </ErrorBoundary>
            <p className="no-print mt-10 border-t border-border pt-4 text-[11px] text-fg-subtle">
              {t(
                'Worked out in {ms} ms in your browser. Usage is AI credits × $0.01. Estimates are marked as estimates. Every number has a calculation button, and the Methodology page lists them all.',
                { ms: Math.max(1, Math.round(analysis.ms)) },
              )}
            </p>
          </div>
        </main>
      </div>
      <FilterDrawer />
      <UserDrawer />
      <MobileNav />
      <StartFreshDialog />
    </div>
  );
}
