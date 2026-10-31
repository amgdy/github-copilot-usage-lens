import type { ReactNode } from 'react';
import { Badge, Callout, ProgressBar, cx } from '../../../components/ui';
import { t } from '../../../i18n';
import { budgetLevel, usedOnDay, type LimitBoard, type LimitFocus, type LimitTarget } from '../../../lib/collection';
import type { DataStore } from '../../../lib/types';
import { fmtInt, fmtPct, fmtUSD } from '../../../lib/utils/format';
import { useApp } from '../../../state/store';
import { levelTone, scopeDrill } from '../levels';
import { CHECK_ORDER, Fact, GROUP_ABOUT, Heading, SCOPE_NAMES, SpendingLimit, Step, groupKindLabel, groupTitle } from './parts';

const PEOPLE_SHOWN = 6;

function LinkButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="btn btn-sm" onClick={onClick}>
      {children}
    </button>
  );
}

/** The users of a selection that are closest to their limit, to jump to one. */
function PeopleList({ board, indexes, shares, day, choose }: { board: LimitBoard; indexes: number[]; shares: Float32Array; day: number | null; choose: (target: LimitTarget) => void }) {
  const shareOf = (userIndex: number) => (Number.isFinite(shares[userIndex]) ? shares[userIndex] : -1);
  const fullest = [...indexes].sort((a, b) => shareOf(b) - shareOf(a) || usedOnDay(board, b, day) - usedOnDay(board, a, day) || board.users[a].login.localeCompare(board.users[b].login));
  if (fullest.length === 0) return <p className="text-xs text-fg-subtle">{t('No users here.')}</p>;
  return (
    <div className="space-y-1">
      <p className="eyebrow text-fg-subtle">{t('Closest to their limit')}</p>
      <ul className="space-y-0.5">
        {fullest.slice(0, PEOPLE_SHOWN).map((userIndex) => {
          const share = shares[userIndex];
          return (
            <li key={userIndex}>
              <button type="button" className="flex w-full items-baseline justify-between gap-2 rounded-[3px] px-1 py-0.5 text-start text-xs hover:bg-surface-2" onClick={() => choose({ kind: 'user', index: userIndex })}>
                <span className="min-w-0 truncate text-accent">{board.users[userIndex].login}</span>
                <span className={cx('num shrink-0', Number.isFinite(share) && share >= 1 ? 'text-bad' : 'text-fg-muted')}>
                  {Number.isFinite(share) ? fmtPct(share, 0) : fmtUSD(usedOnDay(board, userIndex, day), 2)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {fullest.length > PEOPLE_SHOWN ? <p className="num text-[11px] text-fg-subtle">{t('{n} more', { n: fmtInt(fullest.length - PEOPLE_SHOWN) })}</p> : null}
    </div>
  );
}

/** One step of the path of a user, numbered in the order GitHub checks it. */
function PathStep({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <Step step={step} active />
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-xs font-semibold">{title}</p>
        {children}
      </div>
    </li>
  );
}

/** A name that selects a part of the map. */
function PickLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="max-w-full truncate text-start text-xs font-medium text-accent hover:underline" onClick={onClick}>
      {children}
    </button>
  );
}

const topStepTitle = (board: LimitBoard): string => (board.topScope === 'enterprise' ? t('Spending limit of the enterprise') : t('Spending limit of the organization'));

function HeldCounts({ board }: { board: LimitBoard }) {
  const held = board.held;
  const total = held.own + held['cost-center'] + held.everyone + held.none;
  return (
    <div>
      <p className="eyebrow text-fg-subtle">{t('Users by the limit that holds them')}</p>
      <dl className="mt-1.5 divide-y divide-border-muted rounded-md border border-border-muted text-xs">
        {[
          { label: t('Own budget'), value: held.own, warn: false },
          { label: t('Cost center limit'), value: held['cost-center'], warn: false },
          { label: t('Limit for each user'), value: held.everyone, warn: false },
          { label: t('No limit'), value: held.none, warn: held.none > 0 },
        ].map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-3 px-2.5 py-1">
            <dt className="text-fg-muted">{item.label}</dt>
            <dd className={cx('num font-medium', item.warn && 'text-warn')}>{fmtInt(item.value)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-1 text-[11px] text-fg-subtle">
        {t('Out of {n} users with usage this month or listed by GitHub.', { n: fmtInt(total) })}
      </p>
    </div>
  );
}

export interface DetailsProps {
  board: LimitBoard;
  target: LimitTarget;
  focus: LimitFocus | null;
  shares: Float32Array;
  day: number | null;
  store: DataStore;
  userIds: Map<string, number>;
  choose: (target: LimitTarget) => void;
}

/** What the selection is, and every limit that holds it in the order GitHub checks them. */
export function Details({ board, target, focus, shares, day, store, userIds, choose }: DetailsProps) {
  const top = board.top >= 0 ? board.places[board.top] : null;

  if (target.kind === 'user') {
    const user = board.users[target.index];
    const share = shares[target.index];
    const used = usedOnDay(board, target.index, day);
    const userId = userIds.get(user.login.toLowerCase());
    const group = board.groups[user.group];
    return (
      <div className="space-y-3">
        <Heading eyebrow={groupKindLabel(user.kind)} title={user.login} />
        <p className="text-xs text-fg-muted">{t('GitHub checks these limits for each request, from the first step up. Any one can stop the usage.')}</p>
        <ol className="space-y-3">
          <PathStep step={1} title={t('The limit of the user')}>
            {group ? <PickLink onClick={() => choose({ kind: 'group', index: user.group })}>{groupTitle(group)}</PickLink> : null}
            {user.limit !== null ? (
              <>
                <Fact label={groupKindLabel(user.kind)}>{fmtUSD(user.limit, 0)}</Fact>
                <Fact label={t('Used')}>{fmtUSD(used, 2)}</Fact>
                <Fact label={t('Credit left')}>{fmtUSD(Math.max(0, user.limit - used), 2)}</Fact>
                {Number.isFinite(share) ? (
                  <div className="space-y-1">
                    <ProgressBar value={Math.min(1, share)} tone={levelTone(budgetLevel(share))} height={6} label={t('Share of the limit used')} />
                    <p className={cx('num text-[11px]', share >= 1 ? 'text-bad' : 'text-fg-subtle')}>{share >= 1 ? t('Used up. GitHub stops the usage of this user.') : t('{share} used', { share: fmtPct(share, 0) })}</p>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <Fact label={t('Used')}>{fmtUSD(used, 2)}</Fact>
                <p className="text-xs text-warn">{t('No limit holds this user. Only the spending limits above can stop them.')}</p>
              </>
            )}
          </PathStep>
          <PathStep step={2} title={t('Included credits')}>
            <p className="text-xs text-fg-muted">{t('Included credits pay for the usage while they last. Only the rest is billed and counts against the spending limits.')}</p>
          </PathStep>
          <PathStep step={3} title={t('Spending limits that count their usage')}>
            {user.places.length > 0 ? (
              user.places.map((placeIndex) => {
                const place = board.places[placeIndex];
                return (
                  <div key={placeIndex} className="space-y-1">
                    <p className="flex items-baseline justify-between gap-2">
                      <PickLink onClick={() => choose({ kind: 'place', index: placeIndex })}>{place.name}</PickLink>
                      <span className="shrink-0 text-[11px] text-fg-subtle">{t(SCOPE_NAMES[place.scope])}</span>
                    </p>
                    {place.limits.map((row) => (
                      <SpendingLimit key={row.budget.id} row={row} />
                    ))}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-fg-muted">{t('No cost center, organization or repository limit counts their usage.')}</p>
            )}
          </PathStep>
          <PathStep step={4} title={topStepTitle(board)}>
            {top !== null ? top.limits.map((row) => <SpendingLimit key={row.budget.id} row={row} />) : <p className="text-xs text-warn">{t('No spending limit at the top.')}</p>}
          </PathStep>
        </ol>
        <div className="space-y-1 border-t border-border-muted pt-2">
          {user.costCenter ? <Fact label={t('Cost center')}>{user.costCenter}</Fact> : null}
          {user.organization ? <Fact label={t('Organization')}>{user.organization}</Fact> : null}
          <p className="text-[11px] text-fg-subtle">{day === null && user.usedFrom === 'github' ? t('Amount used as GitHub showed it.') : t('Amount used from the usage report, included credits too.')}</p>
        </div>
        {userId !== undefined ? <LinkButton onClick={() => useApp.getState().selectUser(userId)}>{t('Open this user')}</LinkButton> : null}
      </div>
    );
  }

  if (target.kind === 'group') {
    const group = board.groups[target.index];
    const place = group.place >= 0 ? board.places[group.place] : null;
    const open = group.kind === 'cost-center' ? scopeDrill('cost_center', group.name, store) : null;
    return (
      <div className="space-y-3">
        <Heading eyebrow={groupKindLabel(group.kind)} title={groupTitle(group)} />
        <p className="text-xs text-fg-muted">{t(GROUP_ABOUT[group.kind])}</p>
        {group.kind === 'none' && board.everyone === null ? (
          <Callout tone="warn" title={t('No limit for each user')}>
            {t('Users without a budget of their own or a cost center limit can use AI credits without a cap. Only the spending limits above stop them.')}
          </Callout>
        ) : null}
        {group.poolCapped ? (
          <Badge tone="info" title={t('This cost center may use only the included credits of its own members.')}>
            {t('Own credit share')}
          </Badge>
        ) : null}
        <div className="space-y-1">
          {group.perUser ? <Fact label={t('Limit for each user')}>{fmtUSD(group.perUser.amount, 0)}</Fact> : null}
          <Fact label={t('Users')}>{fmtInt(group.members.length)}</Fact>
          {group.kind !== 'none' ? <Fact label={t('Used up')}>{fmtInt(group.usedUp)}</Fact> : null}
          {focus !== null ? <Fact label={t('Spending limits that count their usage')}>{fmtInt([...focus.places].filter((placeIndex) => placeIndex !== board.top).length)}</Fact> : null}
        </div>
        {place !== null ? (
          <div className="space-y-1.5">
            <p className="eyebrow text-fg-subtle">{t('Spending limit of the cost center')}</p>
            {place.limits.map((row) => (
              <SpendingLimit key={row.budget.id} row={row} />
            ))}
          </div>
        ) : null}
        <PeopleList board={board} indexes={group.members} shares={shares} day={day} choose={choose} />
        <div className="flex flex-wrap gap-2">
          {group.place >= 0 ? <LinkButton onClick={() => choose({ kind: 'place', index: group.place })}>{t('Show its spending limit')}</LinkButton> : null}
          {open ? <LinkButton onClick={open}>{t('Show its usage')}</LinkButton> : null}
        </div>
      </div>
    );
  }

  if (target.kind === 'place') {
    const place = board.places[target.index];
    const open = place.top ? null : scopeDrill(place.scope, place.name, store);
    const counted = focus !== null ? [...focus.users] : [];
    return (
      <div className="space-y-3">
        <Heading eyebrow={t(SCOPE_NAMES[place.scope])} title={place.name} />
        {place.seats !== null ? <Fact label={t('Seats')}>{fmtInt(place.seats)}</Fact> : null}
        {place.limits.map((row) => (
          <SpendingLimit key={row.budget.id} row={row} />
        ))}
        {place.top ? (
          <>
            <p className="text-xs text-fg-muted">{t('It counts the amount billed for every user. When it stops usage, it stops everyone.')}</p>
            <HeldCounts board={board} />
          </>
        ) : (
          <>
            <p className="text-xs text-fg-muted">{t('It counts the amount billed for the usage of these users. When it stops usage, it stops them all, whatever their own limit.')}</p>
            <Fact label={t('Users it counts')}>{fmtInt(counted.length)}</Fact>
            <PeopleList board={board} indexes={counted} shares={shares} day={day} choose={choose} />
          </>
        )}
        <div className="flex flex-wrap gap-2">
          {place.group >= 0 ? <LinkButton onClick={() => choose({ kind: 'group', index: place.group })}>{t('Show its users')}</LinkButton> : null}
          {open ? <LinkButton onClick={open}>{t('Show its usage')}</LinkButton> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Heading eyebrow={board.topScope === 'enterprise' ? t('Enterprise account') : t('Organization')} title={board.topName} />
      <HeldCounts board={board} />
      <div>
        <p className="eyebrow text-fg-subtle">{t('Order GitHub checks')}</p>
        <ol className="mt-1.5 space-y-1.5 text-xs">
          {CHECK_ORDER.map((step, index) => (
            <li key={step} className="flex gap-2">
              <Step step={index + 1} />
              <span className="text-fg-muted">{t(step)}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="text-[11px] text-fg-subtle">{t('Select a glass, a group or a user to see every limit that holds it. Each one gets the number of its step.')}</p>
    </div>
  );
}
