import { Badge, DocLinks, cx } from '../../../components/ui';
import { T, t } from '../../../i18n';
import { budgetLevel, roomOf, usedOnDay, type LimitBoard, type LimitLane, type LimitTarget, type LimitTop } from '../../../lib/collection';
import type { DataStore } from '../../../lib/types';
import { fmtInt, fmtPct } from '../../../lib/utils/format';
import { useApp } from '../../../state/store';
import { scopeDrill } from '../levels';
import { Fact, Gauge, Heading, KIND_ABOUT, KIND_ICONS, LimitAmount, SpendingLimit, USER_KINDS, WithIcon, kindLabel, laneAbout, laneEyebrow, laneIcon, laneTitle, levelOfShare, limitName, money, roomText, topIcon, topLabel, usersText, type UserKind } from './parts';

const CAVEAT = 'This file cannot confirm the full billing path, enterprise exclusions, or whether paid usage is enabled. Check these in GitHub.';

const kindName = (kind: UserKind) => <WithIcon Icon={KIND_ICONS[kind]}>{kindLabel(kind)}</WithIcon>;
const eachText = (amount: number) => <T text="{amount} each" values={{ amount: <LimitAmount amount={amount} /> }} />;

const reachedFirstText = (top: LimitTop): string => (top.scope === 'enterprise' ? t('The enterprise limit is reached first.') : t('The organization limit is reached first.'));

/** GitHub can leave a cost center out of the enterprise limit. The file does not say which, so a cost center says so. */
function ExclusionNote({ lane, top }: { lane: LimitLane | undefined; top: LimitTop }) {
  if (lane?.kind !== 'cost_center' || top.scope !== 'enterprise') return null;
  return <p className="text-[11px] text-fg-subtle">{t('By default, the enterprise limit counts this cost center too. GitHub can leave a cost center out of it, and this file does not show that.')}</p>;
}

function Step({ number, title, children }: { number: number; title: string; children: string }) {
  return (
    <li className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2">
      <span className="num flex size-5 items-center justify-center rounded-xs border border-border text-[11px] font-semibold" aria-hidden>{number}</span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold">{title}</span>
        <span className="block text-xs text-fg-muted">{children}</span>
      </span>
    </li>
  );
}

export interface DetailsProps {
  board: LimitBoard;
  target: LimitTarget;
  shares: Float32Array;
  day: number | null;
  store: DataStore;
  userIds: Map<string, number>;
  choose: (target: LimitTarget) => void;
}

export function Details({ board, target, shares, day, store, userIds, choose }: DetailsProps) {
  const { top } = board;

  if (target.kind === 'user') {
    const user = board.users[target.index];
    const used = usedOnDay(board, target.index, day);
    const share = shares[target.index];
    const lane = board.lanes[user.lane];
    const userId = userIds.get(user.login.toLowerCase());
    const laneRow = lane?.gauge ?? null;
    return (
      <div className="space-y-3">
        <Heading eyebrow={kindLabel(user.kind)} Icon={KIND_ICONS[user.kind]} title={user.login} />
        <p className="text-xs text-fg-muted">{t(KIND_ABOUT[user.kind])}</p>
        <div className="space-y-2 rounded-md border border-accent/40 bg-accent-soft p-3">
          <p className="eyebrow text-accent">{t('Effective user limit')}</p>
          <p className="num font-display text-2xl font-semibold">{user.limit === null ? t('Not found') : money(user.limit)}</p>
          <Fact label={t('Used')}>{money(used)}</Fact>
          {user.limit !== null ? (
            <>
              <Fact label={t('Credit left')}>{money(Math.max(0, user.limit - used))}</Fact>
              <Gauge share={Number.isFinite(share) ? share : 0} level={Number.isFinite(share) ? budgetLevel(share) : null} />
              <p className="text-[11px]">{user.limit === 0 ? t('A zero user limit blocks AI credit usage immediately.') : t('{share} used', { share: fmtPct(share, 0) })}</p>
              <Badge tone="neutral">{t('Always stops at the user limit')}</Badge>
            </>
          ) : null}
        </div>
        {user.replaces.length > 0 ? (
          <div className="space-y-1">
            <p className="eyebrow text-fg-subtle">{t('Replaced user limits')}</p>
            {user.replaces.map((replaced) => <Fact key={replaced.budget.id} label={kindName(replaced.kind)}>{money(replaced.amount)}</Fact>)}
            <p className="text-[11px] text-fg-muted">{t('These do not also cap this user. They are not extra credits.')}</p>
          </div>
        ) : null}
        <div className="space-y-1.5">
          <p className="eyebrow text-fg-subtle">{t('Spending limits that also apply')}</p>
          {lane !== undefined && lane.kind !== 'top' ? (
            <button type="button" className="block w-full rounded-md border border-border px-2 py-1.5 text-start hover:bg-surface-2" onClick={() => choose({ kind: 'lane', index: user.lane })}>
              <span className="eyebrow block text-fg-subtle"><WithIcon Icon={laneIcon(lane, top)}>{laneEyebrow(lane)}</WithIcon></span>
              <span className="block break-words text-xs font-semibold">{laneTitle(lane, top)}</span>
              <span className="num block text-[11px] text-fg-muted">
                {laneRow !== null ? (
                  <>
                    {limitName(laneRow)} <LimitAmount amount={laneRow.budget.amount} /> · {t('{amount} left', { amount: roomText(roomOf(laneRow)) })}
                  </>
                ) : lane.limits.length > 0
                    ? t('Only alert budgets are set here. They do not stop usage.')
                    : lane.kind === 'unclear'
                    ? t('GitHub picks one seat organization each billing cycle.')
                    : lane.countedByTop
                      ? t('No spending limit of its own')
                      : t('Its spending limit is set in the enterprise and is not in this file.')}
              </span>
            </button>
          ) : null}
          {lane === undefined || lane.countedByTop ? (
            <button type="button" className="block w-full rounded-md border border-border px-2 py-1.5 text-start hover:bg-surface-2" onClick={() => choose({ kind: 'top' })}>
              <span className="eyebrow block text-fg-subtle"><WithIcon Icon={topIcon(top)}>{topLabel(top)}</WithIcon></span>
              <span className="block break-words text-xs font-semibold">{top.name}</span>
              <span className="num block text-[11px] text-fg-muted">
                {top.wall !== null ? (
                  <>
                    {limitName(top.wall)} <LimitAmount amount={top.wall.budget.amount} /> · {t('{amount} left', { amount: roomText(top.room) })}
                  </>
                ) : top.limits.length > 0 ? t('Only alert budgets are set here. They do not stop usage.') : top.known ? t('No spending limit is set here.') : t('Not known')}
              </span>
            </button>
          ) : (
            <p className="text-[11px] text-fg-muted">{t('GitHub bills the usage of its members to this cost center of the enterprise, so the organization limit does not count it.')}</p>
          )}
          <ExclusionNote lane={lane} top={top} />
          <p className="text-[11px] text-fg-muted">{t('The user limit always stops usage. A spending limit stops billed usage only when it is set to stop.')}</p>
        </div>
        <div className="space-y-1">
          {user.costCenter ? <Fact label={t('Cost center assignment')}>{user.costCenter}</Fact> : null}
          {user.organizations.length > 0 ? <Fact label={t('Seat organization')}>{user.organizations.join(', ')}</Fact> : null}
          {user.poolCapped ? <p className="text-xs text-info">{t('This cost center can draw only its own included credit share. An individual limit does not remove that control.')}</p> : null}
          <p className="text-[11px] text-fg-subtle">{day === null && user.usedFrom === 'github' ? t('Amount used as GitHub showed it.') : t('Amount used from the usage report, included credits too.')}</p>
        </div>
        {userId !== undefined ? <button type="button" className="btn btn-sm" onClick={() => useApp.getState().selectUser(userId)}>{t('Open this user')}</button> : null}
      </div>
    );
  }

  if (target.kind === 'lane') {
    const lane = board.lanes[target.index];
    const usedUp = lane.members.filter((userIndex) => levelOfShare(shares[userIndex]) === 'used-up').length;
    const open = lane.kind === 'cost_center' || lane.kind === 'organization' ? scopeDrill(lane.kind, lane.name, store) : null;
    return (
      <div className="space-y-3">
        <Heading eyebrow={laneEyebrow(lane)} Icon={laneIcon(lane, top)} title={laneTitle(lane, top)} />
        <p className="text-xs text-fg-muted">{laneAbout(lane, top)}</p>
        {lane.limits.length > 0 ? (
          lane.limits.map((row) => <SpendingLimit key={row.budget.id} row={row} />)
        ) : lane.kind === 'cost_center' || lane.kind === 'organization' ? (
          <p className="text-xs">{lane.countedByTop ? t('No spending limit of its own') : t('Its spending limit is set in the enterprise and is not in this file.')}</p>
        ) : null}
        <div className="space-y-1">
          {lane.kind !== 'unclear' && (lane.countedByTop || lane.limits.length > 0) ? <Fact label={t('Room left')}>{roomText(lane.room)}</Fact> : null}
          {lane.capacity !== null && lane.reachedFirst === 'top' ? <p className="text-[11px] text-fg-muted">{reachedFirstText(top)}</p> : null}
          {lane.seats !== null ? <Fact label={t('Seats')}>{fmtInt(lane.seats)}</Fact> : null}
          {lane.perUser !== null ? <Fact label={kindName(lane.perUser.kind)}>{eachText(lane.perUser.budget.amount)}</Fact> : null}
          <Fact label={t('Users')}>{fmtInt(lane.members.length)}</Fact>
          <Fact label={t('At {share} of their user limit', { share: fmtPct(1, 0) })}>{usersText(usedUp)}</Fact>
        </div>
        {lane.poolCapped ? <p className="text-xs text-info">{t('This cost center can draw only its own included credit share. An individual limit does not remove that control.')}</p> : null}
        <ExclusionNote lane={lane} top={top} />
        {open ? <button type="button" className="btn btn-sm" onClick={open}>{t('Show its usage')}</button> : null}
      </div>
    );
  }

  if (target.kind === 'top') {
    return (
      <div className="space-y-3">
        <Heading eyebrow={topLabel(top)} Icon={topIcon(top)} title={top.name} />
        <p className="text-xs text-fg-muted">
          {top.scope === 'enterprise'
            ? t('The enterprise limit holds the billed usage of the whole enterprise. Every other spending limit sits inside it and can only stop usage sooner.')
            : t('The organization limit holds the billed usage of the whole organization.')}
        </p>
        {top.limits.length > 0 ? top.limits.map((row) => <SpendingLimit key={row.budget.id} row={row} />) : <p className="text-xs">{top.known ? t('No spending limit is set here.') : t('The file has no full budget list, so this limit is not known.')}</p>}
        <div className="space-y-1">
          {top.wall !== null ? <Fact label={t('Room left')}>{roomText(top.room)}</Fact> : null}
          {board.everyone !== null ? <Fact label={kindName('everyone')}>{eachText(board.everyone.amount)}</Fact> : null}
          {top.inside > 0 ? <Fact label={t('Limits inside, added up')}>{top.insideShare !== null ? `${money(top.inside)} · ${fmtPct(top.insideShare, 0)}` : money(top.inside)}</Fact> : null}
          <Fact label={t('Users')}>{fmtInt(board.users.length)}</Fact>
        </div>
        {top.insideShare !== null && top.insideShare > 1 ? <p className="text-xs text-fg-muted">{t('They cannot all be used in full. The limit around them is reached first.')}</p> : null}
        {top.scope === 'enterprise' ? <p className="text-[11px] text-fg-subtle">{t('By default it also counts cost center usage. A cost center can be left out in GitHub; this file does not show that. It does not cap license fees.')}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Heading eyebrow={t('How GitHub checks a request')} title={top.name} />
      <ol className="space-y-2.5">
        <Step number={1} title={t('The user limit')}>{t('Individual, else cost center default, else universal. It counts included credits too and always stops usage.')}</Step>
        <Step number={2} title={t('Included credits')}>{t('Usage is paid from the shared included credits first. After they run out, paid usage must be turned on.')}</Step>
        <Step number={3} title={t('A spending limit')}>{t('The cost center limit, else the seat organization limit, else only the enterprise limit. The one with the least room left is reached first.')}</Step>
      </ol>
      <div className={cx('space-y-1 border-t border-border-muted pt-3')}>
        {USER_KINDS.map((kind) => <Fact key={kind} label={kindName(kind)}>{fmtInt(board.held[kind])}</Fact>)}
      </div>
      <p className="text-xs text-fg-muted">{t('Select the frame, a row or a square to see its limits.')}</p>
      <p className="text-[11px] text-fg-subtle">{t(CAVEAT)}</p>
      <DocLinks topic="budgets" compact limit={1} />
    </div>
  );
}
