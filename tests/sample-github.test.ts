import { describe, expect, it } from 'vitest';
import { budgetMap, budgetOverview, deriveGitHub, userTarget } from '../src/lib/collection';
import { DEMO_SHORTCODE } from '../src/lib/demo/generate';
import { sampleCollection, sampleCollectionDay, sampleGitHubLines } from '../src/lib/demo/github';
import { loadDemo, pipelineOf } from './helpers';

const RANGE = { start: '2026-08-01', end: '2026-10-20' };
// Two days after the included credits of September run out, so the AI credit budgets have billed usage.
const COLLECTED_ON = '2026-09-24';

describe('the made-up GitHub data of the sample report', async () => {
  const { store } = await loadDemo(RANGE);
  const collection = sampleCollection(store);
  const github = deriveGitHub(collection, store);

  it('is collected just after the included credits of the second month run out', () => {
    expect(sampleCollectionDay(store)).toBe(COLLECTED_ON);
  });

  it('is a complete file that the app reads without problems', () => {
    expect(collection.complete).toBe(true);
    expect(collection.skippedLines).toBe(0);
    expect(collection.header.day).toBe(COLLECTED_ON);
    expect(collection.header.months).toEqual(['2026-08', '2026-09']);
    expect(github.problems).toEqual([]);
  });

  it('holds only made-up logins', () => {
    const logins = [...collection.members, ...collection.budgetUsers.map((state) => state.login)];
    expect(logins.length).toBeGreaterThan(100);
    for (const login of logins) expect(login.toLowerCase().endsWith(`_${DEMO_SHORTCODE}`)).toBe(true);
    for (const line of sampleGitHubLines(store, COLLECTED_ON)) expect(line).not.toMatch(/[\w.]+@[\w-]+\.\w/);
  });

  it('agrees with the sample report for every month that is over', () => {
    expect(github.months.map((check) => check.status)).toEqual(['match', 'open']);
  });

  it('has budgets with room, near the limit and used up, users held to budgets and budget changes', () => {
    const overview = budgetOverview(collection, store);
    const levels = new Set(overview.budgets.map((row) => row.level));
    expect(levels).toContain('used-up');
    expect(levels).toContain('near');
    expect(levels).toContain('low');
    expect(overview.projectedOut.length).toBeGreaterThan(0);
    expect(overview.stopping).toBeGreaterThan(0);
    expect(overview.alerting).toBeGreaterThan(0);
    expect(overview.users.length).toBeGreaterThan(20);
    expect(overview.userLevels['used-up']).toBeGreaterThan(0);
    expect(overview.unbudgeted?.some((scope) => scope.name === 'northwind-data')).toBe(true);
    expect(overview.changes.length).toBeGreaterThan(0);
    expect(github.usersAtLimit.length).toBeGreaterThan(0);
  });

  it('shows every kind of limit for users, so the budget map and the target of a user have something to show', () => {
    const map = budgetMap(collection, store);
    expect(map.top.limits.length).toBeGreaterThan(0);
    expect(map.held.own).toBe(2);
    expect(map.held['cost-center']).toBeGreaterThan(5);
    expect(map.held.everyone).toBeGreaterThan(20);
    expect(map.held.none).toBe(0);
    expect(map.rooms.filter((room) => room.perUser !== null).map((room) => room.name)).toEqual(['Mobile Studio', 'Applied AI Research']);
    expect(map.rooms.some((room) => room.poolCapped)).toBe(true);
    expect(map.roomsWithoutLimit).toBeGreaterThan(0);
    const kinds = new Set(budgetOverview(collection, store).users.map((user) => user.kind));
    expect([...kinds].sort()).toEqual(['cost-center', 'everyone', 'own']);
    for (const own of map.own) expect(userTarget(collection, store, own.login)?.limit.kind).toBe('own');
  });

  it('gives the analysis a monthly budget from GitHub', () => {
    const { analysis } = pipelineOf(store, { collection });
    expect(analysis.budgetSource).toBe('github');
  });
});
