import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import arabic from '../src/i18n/ar/recommendations';
import { applyLocale } from '../src/i18n/core';
import { withGitHubBudget } from '../src/lib/analytics/githubBudget';
import { buildTaxonomy } from '../src/lib/analytics/taxonomy';
import { deriveGitHub } from '../src/lib/collection';
import { sampleCollection } from '../src/lib/demo/github';
import { buildCopilotData, compactCell, compactNumber, createUserNamer, latinDigits, type CopilotDataInput } from '../src/lib/export/copilotData';
import { anonymizeUserNames, buildCopilotPrompt, COPILOT_TASKS, copilotTaskLabel, type CopilotTask } from '../src/lib/export/copilotPrompt';
import type { DataStore } from '../src/lib/types';
import { loadDemo, pipelineOf } from './helpers';

afterEach(() => applyLocale('en', {}));

let store: DataStore;
let input: CopilotDataInput;

beforeAll(async () => {
  ({ store } = await loadDemo());
  const collection = sampleCollection(store);
  const pipeline = pipelineOf(store, { collection });
  const github = deriveGitHub(collection, store);
  input = {
    analysis: pipeline.analysis,
    store,
    models: pipeline.models,
    settings: withGitHubBudget(pipeline.settings, github).settings,
    taxonomy: buildTaxonomy(pipeline.settings),
    github,
    label: 'demo.csv',
    filters: [],
    searchOmitted: false,
    sample: true,
  };
});

const logins = (): string[] => store.dicts.user.values.filter(Boolean);
const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const containsLogin = (text: string, login: string): boolean =>
  new RegExp(`(^|[^A-Za-z0-9_-])${escapeRegex(login)}($|[^A-Za-z0-9_-])`, 'i').test(text);

/** The rows of one table in the data block, without its header. */
function tableRows(text: string, name: string): string[] {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.startsWith(`${name}[`));
  if (start < 0) return [];
  const end = lines.findIndex((line, index) => index > start && line.trim() === '');
  return lines.slice(start + 1, end < 0 ? undefined : end);
}

describe('user aliases', () => {
  it('follows the order of the names, so the user with the most usage is user-01', () => {
    expect(anonymizeUserNames('jane-smith and jane used the report. The annual view is the same.', ['jane', 'jane-smith'])).toBe(
      'user-02 and user-01 used the report. The annual view is the same.',
    );
  });

  it('skips an alias that is also a real login', () => {
    expect(anonymizeUserNames('user-01 and alex', ['user-01', 'alex'])).toBe('user-02 and user-03');
  });

  it('treats case variants of a login as the same user', () => {
    expect(anonymizeUserNames('JaneSmith and janesmith', ['JaneSmith'])).toBe('user-01 and user-01');
  });

  it('replaces logins with a dot or an @ as whole words only', () => {
    expect(anonymizeUserNames('ask jane.doe@corp or jane', ['jane.doe@corp', 'jane'])).toBe('ask user-01 or user-02');
  });

  it('shows what the first alias looks like, with as many digits as the user count needs', () => {
    const manyNames = Array.from({ length: 120 }, (_unused, index) => `person${index}`);
    expect(createUserNamer(['jane', 'alex'], true).example).toBe('user-01');
    expect(createUserNamer(manyNames, true).example).toBe('user-001');
    expect(createUserNamer(manyNames, false).example).toBe('user-001');
    expect(createUserNamer(['user-01', 'alex'], true).example).toBe('user-02');
  });
});

describe('compact format', () => {
  it('writes plain numbers with Latin digits and no trailing zeros', () => {
    expect(compactNumber(12.5)).toBe('12.5');
    expect(compactNumber(3.14159, 3)).toBe('3.142');
    expect(compactNumber(-0.001)).toBe('0');
    expect(compactNumber(Number.NaN)).toBe('-');
    expect(compactNumber(null)).toBe('-');
    expect(latinDigits('١٢٬٣٤٥٫٦')).toBe('12,345.6');
  });

  it('writes yes and no as y and n, unknown as - and quotes values with a comma or a quote', () => {
    expect(compactCell(true)).toBe('y');
    expect(compactCell(false)).toBe('n');
    expect(compactCell(undefined)).toBe('-');
    expect(compactCell('')).toBe('-');
    expect(compactCell('-')).toBe('-');
    expect(compactCell('a, b')).toBe('"a, b"');
    expect(compactCell('say "hi"')).toBe('"say ""hi"""');
    expect(compactCell('two\n lines')).toBe('two lines');
    expect(compactCell('```code```')).toBe("'''code'''");
  });
});

describe('GitHub Copilot prompt', () => {
  const expected: Record<CopilotTask, string[]> = {
    leadership: ['months', 'weeks', 'user_spread', 'models', 'users', 'seat_review', 'savings_plan', 'recommendations'],
    patterns: ['days', 'weekdays', 'spikes', 'repos', 'group_mix', 'github_activity', 'audit_months'],
    seats: ['seat_review', 'seat_candidates', 'github_seats', 'org_seats', 'active_without_report_usage', 'audit_log'],
    budgets: ['monthly_budget', 'github_bills', 'billing_check', 'github_budgets', 'limit_frame', 'limit_rows', 'limit_users', 'users_at_limit'],
    models: ['model_classes', 'models', 'auto', 'auto_by_plan', 'products', 'apps', 'savings_steps'],
    'user-groups': ['groups', 'group_meaning', 'group_mix', 'users'],
  };

  it.each(COPILOT_TASKS)('gives the %s task the data it needs, in a size a model can read', (task) => {
    const prompt = buildCopilotPrompt({ input, task, includeNames: false });
    expect(prompt.sections.slice(0, 2)).toEqual(['report', 'totals']);
    expect(prompt.sections).toEqual(expect.arrayContaining(expected[task]));
    expect(new Set(prompt.sections).size).toBe(prompt.sections.length);
    expect(prompt.text.length).toBeLessThan(45_000);
    expect(prompt.text).toContain(`GitHub Copilot usage analysis: ${copilotTaskLabel(task)}`);
  });

  it('puts the data first, then the rules, the task and the answer format, and ends with what to write first', () => {
    const { text } = buildCopilotPrompt({ input, task: 'leadership', includeNames: false });
    const order = ['## How to read the data', '## Data', '```text', '## How to think', '## Rules', '## Answer format', '## Check before you answer'];
    const positions = order.map((heading) => text.indexOf(heading));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(text).toContain('Use your deepest reasoning.');
    expect(text).toContain('Never add them up.');
    expect(text).toContain('### 1. In brief');
    expect(text).toContain('### 3. Outlook');
    expect(text.trimEnd().endsWith('Now write the answer. Start with the section "1. In brief".')).toBe(true);
  });

  it('keeps each data section to one header line and comma-separated rows', () => {
    const { text } = buildCopilotPrompt({ input, task: 'models', includeNames: false });
    const header = text.split('\n').find((line) => line.startsWith('models['));
    expect(header).toMatch(/^models\[\d+(\/\d+)?\]\{[a-z_,]+\}:$/);
    const columns = header!.slice(header!.indexOf('{') + 1, header!.indexOf('}')).split(',').length;
    for (const row of tableRows(text, 'models')) {
      const cells = row.match(/("([^"]|"")*"|[^,]*)(,|$)/g)!.filter((cell) => cell !== '');
      expect(cells).toHaveLength(columns);
    }
  });

  it('leaves out every real login when names are off, in tables and in free text', () => {
    for (const task of COPILOT_TASKS) {
      const { text } = buildCopilotPrompt({ input, task, includeNames: false });
      const leaked = logins().filter((login) => containsLogin(text, login));
      expect(leaked, task).toEqual([]);
      expect(text).toMatch(/user-\d{2,}/);
    }
  });

  it('keeps the real logins when the admin turns names on', () => {
    const { text } = buildCopilotPrompt({ input, task: 'user-groups', includeNames: true });
    expect(logins().some((login) => containsLogin(text, login))).toBe(true);
    expect(text).toContain('The admin chose to include real user names.');
    expect(text).not.toMatch(/\buser-\d{2,}\b/);
  });

  it('gives the user with the most usage the first alias', () => {
    const { text } = buildCopilotData(input, 'user-groups', false);
    expect(tableRows(text, 'users')[0]).toMatch(/^user-0+1,/);
  });

  it('names the same alias in the rules as in the data', () => {
    const prompt = buildCopilotPrompt({ input, task: 'user-groups', includeNames: false });
    expect(tableRows(prompt.text, 'users')[0].startsWith(`${prompt.aliasExample},`)).toBe(true);
    expect(prompt.text).toContain(`aliases such as ${prompt.aliasExample}.`);
  });

  it('turns a user filter into an alias and leaves out the search text', () => {
    const top = [...input.analysis.users.profiles].sort((a, b) => b.gross - a.gross)[0].name;
    const filtered = { ...input, filters: [{ group: 'User', value: top, user: true }], searchOmitted: true };
    const { text } = buildCopilotData(filtered, 'leadership', false);
    expect(containsLogin(text, top)).toBe(false);
    expect(text).toMatch(/filters: User: user-0+1/);
    expect(text).toContain('search_text: left out for privacy');
  });

  it('marks the sample report, so the model does not take it for real data', () => {
    const { text } = buildCopilotData(input, 'leadership', false);
    expect(text).toMatch(/^report:\n(  .+\n)*  sample: y/m);
  });

  it('lists alert-only budgets in the limit rows instead of calling them no limit', () => {
    const { text } = buildCopilotData(input, 'budgets', false);
    const rows = tableRows(text, 'limit_rows');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((row) => row.includes('alert-only'))).toBe(true);
    expect(text).toMatch(/^limit_frame:\n(  .+\n)*  limits: .+/m);
  });

  it('cuts long lists of organizations, so a large enterprise still fits in one prompt', () => {
    const github = input.github!;
    const seats = github.seats!;
    const orgs = Array.from({ length: 60 }, (_, index) => ({ ...seats.orgs[0], org: `org-${index}`, total: index }));
    const { text } = buildCopilotData({ ...input, github: { ...github, seats: { ...seats, orgs } } }, 'seats', false);
    expect(text).toContain('org_seats[25/60]{');
    expect(tableRows(text, 'org_seats')[0]).toMatch(/^org-59,59,/);
  });

  it('writes the instructions in Arabic when the app is in Arabic, with Latin digits and English data names', () => {
    applyLocale('ar', arabic);
    const { text } = buildCopilotPrompt({ input, task: 'budgets', includeNames: false });
    expect(text).toContain('أجب باللغة العربية.');
    expect(text).toContain('تحليل استخدام GitHub Copilot: مراجعة الميزانيات والحدود');
    expect(text).toContain('### 1. باختصار');
    expect(text).toContain('limit_rows[');
    expect(text).toMatch(/^# الأكثر امتلاءً أولًا؛ واستُبعدت \d+ ميزانيات/m);
    expect(text).not.toMatch(/[\u0660-\u0669]/);
  });
});
