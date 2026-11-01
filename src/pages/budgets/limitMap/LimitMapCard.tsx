import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { ArrowLeft, Pause, Play, RotateCcw, type LucideIcon } from 'lucide-react';
import { Card, SearchInput, Slider, cx } from '../../../components/ui';
import { t, tp } from '../../../i18n';
import { limitBoard, limitFocus, monthOfKey, type BudgetLevel, type BudgetMap, type Collection, type LimitBoard, type LimitTarget } from '../../../lib/collection';
import type { DataStore } from '../../../lib/types';
import { fmtDay, monthLabel, monthStartDay } from '../../../lib/utils/date';
import { fmtInt } from '../../../lib/utils/format';
import { levelLabel, levelTone } from '../levels';
import { Board } from './Board';
import { Details } from './Details';
import { HoverTip } from './HoverTip';
import { KIND_ICONS, LEVELS, TILE_FILL, USER_KINDS, WithIcon, kindLabel, levelOfShare, sharesOn, usersText, type Highlight, type UserKind } from './parts';

const ALL: LimitTarget = { kind: 'all' };
/** How long each day shows when the month plays. */
const DAY_MILLISECONDS = 450;
const SEARCH_RESULTS = 8;

/** Selecting a level or a limit type fades the other users. */
function Legend({ board, shares, highlight, onHighlight }: { board: LimitBoard; shares: Float32Array; highlight: Highlight | null; onHighlight: (value: Highlight | null) => void }) {
  const counts = useMemo(() => {
    const levels: Record<BudgetLevel, number> = { low: 0, half: 0, near: 0, 'used-up': 0 };
    const kinds: Record<UserKind, number> = { own: 0, 'cost-center': 0, everyone: 0, none: 0 };
    for (const share of shares) {
      const level = levelOfShare(share);
      if (level !== null) levels[level]++;
    }
    for (const user of board.users) kinds[user.kind]++;
    return { levels, kinds };
  }, [board, shares]);
  const groups: { title: string; items: { value: Highlight; label: string; swatch: string; count: number; Icon?: LucideIcon }[] }[] = [
    {
      title: t('User limit used'),
      items: LEVELS.map((level) => ({ value: { by: 'level', value: level }, label: levelLabel(level), swatch: cx('border border-fg-subtle/70', TILE_FILL[levelTone(level)]), count: counts.levels[level] })),
    },
    {
      title: t('Limit type'),
      items: USER_KINDS.map((kind) => ({
        value: { by: 'kind', value: kind },
        label: kindLabel(kind),
        swatch: cx('bg-surface-3', kind === 'own' ? 'border-2 border-fg' : kind === 'none' ? 'border border-dashed border-fg-subtle' : 'border border-fg-subtle/70'),
        count: counts.kinds[kind],
        Icon: KIND_ICONS[kind],
      })),
    },
  ];
  return (
    <div className="no-print flex flex-wrap items-center gap-x-5 gap-y-2">
      {groups.map((group) => (
        <div key={group.title} role="group" aria-label={group.title} className="flex flex-wrap items-center gap-1.5">
          <span className="eyebrow me-0.5 text-fg-subtle">{group.title}</span>
          {group.items.map((item) => {
            const pressed = highlight !== null && highlight.by === item.value.by && highlight.value === item.value.value;
            return (
              <button
                key={`${item.value.by}|${item.value.value}`}
                type="button"
                aria-pressed={pressed}
                className={cx('inline-flex min-h-6 items-center gap-1.5 rounded-[3px] border px-1.5 py-0.5 text-[11px] hover:bg-surface-2', pressed ? 'border-accent bg-accent-soft' : 'border-border-muted')}
                onClick={() => onHighlight(pressed ? null : item.value)}
              >
                <span className={cx('inline-block size-3 rounded-[2px]', item.swatch)} aria-hidden />
                {item.Icon ? <WithIcon Icon={item.Icon}>{item.label}</WithIcon> : <span>{item.label}</span>}
                <span className="num text-fg-muted">{usersText(item.count)}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export interface LimitMapCardProps {
  collection: Collection;
  map: BudgetMap;
  store: DataStore;
}

/** Independent user limits and spending controls, with details for the selection. */
export function LimitMapCard({ collection, map, store }: LimitMapCardProps) {
  const board: LimitBoard = useMemo(() => limitBoard(collection, store, map), [collection, store, map]);
  const [target, setTarget] = useState<LimitTarget>(ALL);
  const [day, setDay] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [openLanes, setOpenLanes] = useState<ReadonlySet<number>>(() => new Set());
  const figure = useRef<HTMLDivElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const scrollTo = useRef<string | null>(null);

  // New data means new lanes and users, so a selection of the old data no longer applies.
  useEffect(() => {
    setTarget(ALL);
    setDay(null);
    setPlaying(false);
    setOpenLanes((current) => (current.size === 0 ? current : new Set()));
  }, [board]);

  const shares = useMemo(() => sharesOn(board, day), [board, day]);
  const focus = useMemo(() => limitFocus(board, target), [board, target]);
  const userIds = useMemo(() => new Map(store.dicts.user.values.map((login, id) => [login.toLowerCase(), id])), [store]);

  const choose = useCallback((next: LimitTarget) => setTarget(next), []);
  const onOpenLane = useCallback(
    (laneIndex: number, open: boolean) =>
      setOpenLanes((current) => {
        const next = new Set(current);
        if (open) next.add(laneIndex);
        else next.delete(laneIndex);
        return next;
      }),
    [],
  );

  useEffect(() => {
    if (target.kind !== 'all' && window.matchMedia('(max-width: 1023px)').matches) {
      details.current?.scrollIntoView({ block: 'nearest' });
      details.current?.focus({ preventScroll: true });
      scrollTo.current = null;
      return;
    }
    const anchor = scrollTo.current;
    if (anchor === null) return;
    scrollTo.current = null;
    const element = figure.current?.querySelector<HTMLElement>(`[data-anchor="${anchor}"]`);
    element?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    element?.focus({ preventScroll: true });
  }, [target]);

  const lastDay = board.month.lastDay;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setDay((current) => {
        const next = (current ?? 0) + 1;
        if (next >= lastDay) setPlaying(false);
        return Math.min(next, lastDay);
      });
    }, DAY_MILLISECONDS);
    return () => window.clearInterval(timer);
  }, [playing, lastDay]);

  const matches = useMemo(() => {
    const wanted = query.trim().toLowerCase();
    if (wanted === '') return [];
    return board.users
      .flatMap((user, index) => {
        const at = user.login.toLowerCase().indexOf(wanted);
        return at < 0 ? [] : [{ index, login: user.login, starts: at === 0 }];
      })
      .sort((a, b) => Number(b.starts) - Number(a.starts) || a.login.localeCompare(b.login))
      .slice(0, SEARCH_RESULTS);
  }, [board, query]);

  const monthIndex = monthOfKey(board.month.label);
  const dayText = (value: number) => fmtDay(monthStartDay(monthIndex) + value - 1);
  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (day === null || day >= lastDay) setDay(1);
    setPlaying(true);
  };

  const onFigureClick = (event: MouseEvent<HTMLDivElement>) => {
    if (target.kind === 'all') return;
    if (event.target instanceof Element && event.target.closest('button, a, input')) return;
    setTarget(ALL);
  };
  const onFigureKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || target.kind === 'all') return;
    event.preventDefault();
    setTarget(ALL);
  };

  return (
    <Card
      title={t('Limit map')}
      calc="budget-map"
      subtitle={t('The outer frame is the limit on all spending. Each row inside is a spending limit. Each square is one person, filled to the share of their user limit used.')}
    >
      <div className="space-y-3">
        <div className="no-print flex flex-wrap items-end gap-x-4 gap-y-2">
          <div className="relative w-56 max-w-full">
            <span className="mb-1 block text-xs font-medium text-fg-muted">{t('Find a user')}</span>
            <SearchInput value={query} onChange={setQuery} placeholder={t('Search users')} aria-label={t('Find a user')} />
            {matches.length > 0 ? (
              <ul className="absolute inset-x-0 top-full z-40 mt-1 max-h-64 overflow-auto rounded-md border border-border bg-surface py-1">
                {matches.map((match) => (
                  <li key={match.index}>
                    <button
                      type="button"
                      className="block w-full truncate px-2.5 py-1 text-start text-xs hover:bg-surface-2"
                      onClick={() => {
                        setQuery('');
                        scrollTo.current = `user-${match.index}`;
                        setTarget({ kind: 'user', index: match.index });
                      }}
                    >
                      {match.login}
                    </button>
                  </li>
                ))}
              </ul>
            ) : query.trim() !== '' ? (
              <p className="absolute inset-x-0 top-full z-40 mt-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-fg-subtle">{t('No user found.')}</p>
            ) : null}
          </div>
          {lastDay > 0 ? (
            <div className="flex items-end gap-2">
              <button type="button" className="btn btn-sm" onClick={togglePlay} aria-pressed={playing}>
                {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
                {playing ? t('Pause') : t('Play the month')}
              </button>
              <div className="w-48">
                <Slider
                  label={t('Day')}
                  min={1}
                  max={lastDay}
                  step={1}
                  value={day ?? lastDay}
                  format={(value) => (day === null ? t('Now') : dayText(value))}
                  onChange={(value) => {
                    setPlaying(false);
                    setDay(value);
                  }}
                />
              </div>
              {day !== null ? (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    setPlaying(false);
                    setDay(null);
                  }}
                >
                  <RotateCcw size={14} aria-hidden />
                  {t('Now')}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        {day !== null ? (
          <p className="text-xs text-fg-muted">
            {t('Shown: usage up to the end of {day}, from the usage report. {month} has {days} days.', { day: dayText(day), month: monthLabel(monthIndex), days: board.month.days })}{' '}
            {t('Current limits are applied to past usage for comparison. Spending budgets stay at the collection snapshot. This is not a history of who was blocked.')}
          </p>
        ) : null}
        <Legend board={board} shares={shares} highlight={highlight} onHighlight={setHighlight} />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div ref={figure} className="relative isolate min-w-0" onClick={onFigureClick} onKeyDown={onFigureKey}>
            <Board
              board={board}
              shares={shares}
              day={day}
              target={target}
              focus={focus}
              highlight={highlight}
              openLanes={openLanes}
              onOpenLane={onOpenLane}
              choose={choose}
            />
            <HoverTip figure={figure} />
          </div>
          <div ref={details} tabIndex={-1} aria-label={t('Limit details')} className={cx('min-w-0 space-y-3 self-start rounded-md border border-border bg-surface p-3 lg:sticky lg:top-4', target.kind !== 'all' && 'order-first lg:order-last')} aria-live="polite">
            {target.kind !== 'all' ? (
              <button type="button" className="no-print inline-flex items-center gap-1 text-xs text-accent hover:underline" onClick={() => setTarget(ALL)}>
                <ArrowLeft size={13} className="rtl:rotate-180" aria-hidden />
                {t('Back to the whole picture')}
              </button>
            ) : null}
            <Details board={board} target={target} shares={shares} day={day} store={store} userIds={userIds} choose={choose} />
          </div>
        </div>
        <p className="text-[11px] text-fg-subtle">
          {tp(board.users.length, 'The map shows 1 user: users with usage this month or listed by GitHub.', 'The map shows {n} users: users with usage this month or listed by GitHub.', { n: fmtInt(board.users.length) })}
        </p>
      </div>
    </Card>
  );
}
