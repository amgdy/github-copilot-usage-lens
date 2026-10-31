import { useCallback, useEffect, useRef } from 'react';
import { t } from '../i18n';
import { useAnalysis } from '../state/analysis';
import { useApp } from '../state/store';
import { Drawer, EmptyState } from './ui';
import { AutoVsDirect } from './user/AutoVsDirect';
import { CompareBars } from './user/CompareBars';
import { DailyChart } from './user/DailyChart';
import { LicenseBlock } from './user/LicenseBlock';
import { ModelMix } from './user/ModelMix';
import { SavingsBars } from './user/SavingsBars';
import { userSubtitle } from './user/shared';
import { TipCards } from './user/TipCards';
import { TokensCard } from './user/TokensCard';
import { UserBadges } from './user/UserBadges';
import { UserFooter } from './user/UserFooter';
import { UserKpis } from './user/UserKpis';
import { UserLimitBlock } from './user/UserLimitBlock';

/** Slide-over with everything about one user. Any page opens it with `useApp.getState().selectUser(id)`. */
export function UserDrawer() {
  const selected = useApp((state) => state.selectedUser);
  return selected === null ? null : <OpenDrawer id={selected} />;
}

function OpenDrawer({ id }: { id: number }) {
  const { analysis, store } = useAnalysis();
  const selectUser = useApp((state) => state.selectUser);
  const close = useCallback(() => selectUser(null), [selectUser]);
  const body = useRef<HTMLDivElement>(null);
  const user = analysis.population.byId.get(id);

  // The drawer focuses its panel first. A button is a better start for keyboard users.
  useEffect(() => {
    const close = t('Close');
    const buttons = body.current?.closest('[role="dialog"]')?.querySelectorAll<HTMLElement>('button[aria-label]') ?? [];
    for (const button of buttons) {
      if (button.getAttribute('aria-label') === close) {
        button.focus();
        break;
      }
    }
  }, []);

  useEffect(() => {
    const scroller = body.current?.parentElement;
    if (scroller) scroller.scrollTop = 0;
  }, [id]);

  const name = user?.name ?? store.dicts.user.values[id] ?? t('User');
  const subtitle = user ? userSubtitle(user) : '';

  return (
    <Drawer open onClose={close} title={name} subtitle={subtitle || undefined} footer={user ? <UserFooter p={user} /> : undefined}>
      <div ref={body} className="space-y-5 p-4">
        {user ? (
          <>
            <UserBadges p={user} />
            <UserKpis p={user} />
            {user.license ? <LicenseBlock license={user.license} /> : null}
            <UserLimitBlock login={store.dicts.user.values[id]} name={name} />
            <DailyChart p={user} />
            <ModelMix p={user} />
            <AutoVsDirect p={user} />
            <TokensCard p={user} />
            <CompareBars p={user} />
            <TipCards p={user} />
            <SavingsBars p={user} />
          </>
        ) : (
          <EmptyState
            title={t('No usage for this user in the current view')}
            description={t('The date range or the filters leave out every row for this user. Reset the filters to see them again.')}
            action={
              <button type="button" className="btn btn-sm" onClick={() => useApp.getState().resetFilters()}>
                {t('Reset all filters')}
              </button>
            }
          />
        )}
      </div>
    </Drawer>
  );
}
