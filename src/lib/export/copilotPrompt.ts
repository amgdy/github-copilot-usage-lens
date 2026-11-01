import { getLocale, msg, t } from '../../i18n/core';
import { buildCopilotData, type CopilotDataInput, type CopilotTask } from './copilotData';

export { anonymizeUserNames, type CopilotTask } from './copilotData';

interface AnswerSection {
  title: string;
  detail: string;
}

interface TaskSpec {
  label: string;
  goal: string;
  focus: string[];
  sections: AnswerSection[];
}

const TASKS: Record<CopilotTask, TaskSpec> = {
  leadership: {
    label: msg('Brief leadership'),
    goal: msg('Write a decision brief for leaders who do not read dashboards. Explain what the numbers mean for the business, what is likely to happen next, and what leaders need to decide.'),
    focus: [
      msg('Tell the story of the period in three parts: what happened, why it most likely happened, and what happens next if nothing changes.'),
      msg('Link cost to value. Is usage growing because more people use GitHub Copilot, or because a few people use costly models more? Use users, user_spread, months and models together.'),
      msg('Project the next month from months (proj_*) and weeks. Give a low, a likely and a high case, and say what drives each one.'),
      msg('Choose at most three decisions. For each one, give the options, the cost of acting and of not acting, and who should own it.'),
      msg('Name one thing that goes well and should be kept.'),
    ],
    sections: [
      { title: msg('Outlook'), detail: msg('A table for next month with a low, likely and high case: usage, billed usage and pool use, with the main driver of each case.') },
      { title: msg('Decisions needed'), detail: msg('Up to three numbered decisions. For each: the options, your advice, the owner and a date to decide by.') },
    ],
  },
  patterns: {
    label: msg('Find patterns the dashboards miss'),
    goal: msg('Find patterns, links and outliers that a dashboard cannot show because they need several tables at once. Explain the likely causes and how to confirm them.'),
    focus: [
      msg('Look across time: weekday cycles (weekdays), spikes (spikes) and changes between months. Link each spike to the users and models behind it, and check whether the same users drive several spikes.'),
      msg('Look across groups. Compare the rows of group_mix and find groups that behave differently, for example high usage with low cache use, or many top models with few active days.'),
      msg('Look at dependency: how much of the usage depends on a few users (user_spread, users), and what would change if they stopped.'),
      msg('Find data that does not fit together, such as high usage with few active days, or users active in GitHub but missing in the report. Explain each case.'),
      msg('Find early warning signs: a rising trend_pct, more users above their own share, or a pool that runs out earlier each month.'),
      msg('For every pattern, give at least two possible explanations and say which data would confirm or rule out each one.'),
    ],
    sections: [
      { title: msg('Patterns'), detail: msg('A numbered list. For each pattern: what you see, the evidence (table and row), the most likely explanation and one other, the effect in USD per month when known, and how to confirm it.') },
      { title: msg('Outliers'), detail: msg('A table of the users, days or models that stand out, with what makes each one stand out.') },
      { title: msg('Watch list'), detail: msg('Three to five signals to check every month, each with the level that should start an action.') },
    ],
  },
  seats: {
    label: msg('Review seats'),
    goal: msg('Decide which seats to keep, check, change or remove, with fair and careful evidence. Put the seats in groups so an admin can act on each group at once.'),
    focus: [
      msg('Combine every signal for each seat: usage in the report (users, seat_candidates), license activity (license_findings), GitHub activity (github_activity, active_without_report_usage) and seat changes (audit_months).'),
      msg('Code completions are not in the report. A seat with no usage in the report but recent activity in the license list or in GitHub is in use. Never advise removing it.'),
      msg('Put the seats in groups: remove now (strong evidence from two sources), ask the user or manager first, change the plan, and keep. Say what evidence puts a seat in its group.'),
      msg('Look for problems in how seats are given: organizations that give every member a seat, seats added and never used, pending invitations, and users with seats in several organizations.'),
      msg('Give the monthly saving of each group from the data. Do not add savings that overlap.'),
      msg('Suggest a fair and respectful process: tell users first, give them time, and make it easy to get a seat back.'),
    ],
    sections: [
      { title: msg('Seat groups'), detail: msg('A table: group, number of seats, users, evidence and monthly USD.') },
      { title: msg('Plan'), detail: msg('Steps with timing, for example week 1, week 2 and week 4.') },
      { title: msg('Message to users'), detail: msg('A short and friendly draft message to users whose seat may be removed.') },
    ],
  },
  budgets: {
    label: msg('Review budgets and limits'),
    goal: msg('Explain how the spending limits and the included credits work together for this account, find where work could be blocked or costs could run over, and suggest better settings.'),
    focus: [
      msg('Explain the structure in plain words. The shared pool of included credits is used first, and only the rest is billed. Spending limits apply to billed usage. The enterprise or organization limit is the frame. Cost center and organization limits sit inside it. User limits (individual, cost center default or universal) cap single users.'),
      msg('Use limit_frame, limit_rows, limit_users, github_budgets and users_at_limit to find limits that are almost full, the limit that is reached first, rows with no limit, and users who will reach their limit before the month ends.'),
      msg('Compare the projection (months proj_*, monthly_budget) with each limit and say on which day a limit would be reached at the current pace.'),
      msg('Check whether each limit fits the usage. A limit far above use gives no control, and a limit far below use blocks work. Use user_spread and users to suggest values, with a reason for each.'),
      msg('Check github_bills and billing_check for gaps between the report and GitHub billing.'),
      msg('Do not claim that an enterprise budget blocks every user. GitHub settings that are not in this data can change that.'),
    ],
    sections: [
      { title: msg('How your limits work'), detail: msg('A short plain explanation of this account, with a small text tree of the frame, the rows inside it and the user limits.') },
      { title: msg('Limit risk'), detail: msg('A table: limit, used, room left, the expected day it is reached, and what happens then.') },
      { title: msg('Suggested settings'), detail: msg('A table: limit, current value, suggested value, stop or alert only, and the reason.') },
      { title: msg('Alerts'), detail: msg('Which alerts to set, at what level, and who should get them.') },
    ],
  },
  models: {
    label: msg('Review model usage'),
    goal: msg('Find where the model mix costs more than it needs to, without hurting work that really needs top models, and suggest a model policy.'),
    focus: [
      msg('Compare models by usd_per_mtok, cache_hit_pct, users and class. Find costly models used for work that a lower-cost model or Auto could do, and models with low cache use.'),
      msg('Link models to users: who drives each costly model, and is it a few users or many (users, group_mix)?'),
      msg('Check Auto: the discount received, the discount missed and auto_pct of each user. Say where Auto would save the most and where it may not fit.'),
      msg('Look at long_context_pct and the extra cost of long context.'),
      msg('Use savings_steps and savings_plan for the size of the savings. Single steps overlap, so use the combined plan for a total.'),
      msg('Never assume that a lower-cost model fits every task. Say which kinds of work should keep top models.'),
    ],
    sections: [
      { title: msg('Model mix'), detail: msg('A table: model, class, share of usage, cost per 1M tokens, main users, and your advice (keep, move to Auto, move to a lower class, or check).') },
      { title: msg('Opportunities'), detail: msg('A numbered list with USD per month and confidence.') },
      { title: msg('Model policy'), detail: msg('A short draft policy for admins and team leads.') },
      { title: msg('Rollout'), detail: msg('Steps to roll out the changes and to measure the effect.') },
    ],
  },
  'user-groups': {
    label: msg('Plan next steps for user groups'),
    goal: msg('Turn the user groups into a practical plan: help light users get value, guide heavy users to use credits wisely, and spread the good habits of the best users.'),
    focus: [
      msg('Describe each group from group_meaning and group_mix in plain words: who they are, how they work and what they need.'),
      msg('Find the groups with the most room to improve: low use with a seat, heavy use of top models, low cache or Auto use, or fading activity.'),
      msg('Find good examples: users or groups with high value and efficient habits (high efficiency, high cache_hit_pct, steady activity). Say what others can learn from them.'),
      msg('Suggest one action for each group, with the expected effect on usage and cost, and how to measure it in the next report.'),
      msg('Suggest actions for groups. Name a single user only when the evidence is about that user alone.'),
    ],
    sections: [
      { title: msg('Group plan'), detail: msg('A table: group, users, what they need, action, owner, expected effect and how to measure it.') },
      { title: msg('Good examples'), detail: msg('What the best users do differently and how to share it.') },
      { title: msg('Message draft'), detail: msg('A short message to the group where it matters most.') },
    ],
  },
};

/** The tasks in the order the dialog shows them. */
export const COPILOT_TASKS: CopilotTask[] = ['leadership', 'patterns', 'seats', 'budgets', 'models', 'user-groups'];

export const copilotTaskLabel = (task: CopilotTask): string => TASKS[task].label;

const FIRST_SECTIONS: AnswerSection[] = [
  { title: msg('In brief'), detail: msg('Three to five bullets with the most important points and their numbers. A reader who stops here should know what to do.') },
  { title: msg('Findings'), detail: msg('A table: #, finding, evidence (table and row, for example models: model name), effect (USD per month or users) and confidence (high, medium or low). The most important first.') },
];

const LAST_SECTIONS: AnswerSection[] = [
  { title: msg('Actions'), detail: msg('A table: #, action, owner, effort (low, medium or high), expected effect and how to measure it. The most value first.') },
  { title: msg('Risks and data limits'), detail: msg('Short bullets: what could make your advice wrong, and what data is missing.') },
  { title: msg('Questions'), detail: msg('Up to three questions whose answers would change your advice. Write "None" when there are none.') },
];

const TEXT = {
  title: msg('GitHub Copilot usage analysis: {task}'),
  role: msg('You are a senior analyst for GitHub Copilot usage and costs. An admin gives you data that GitHub Copilot Usage Lens calculated from the GitHub Copilot AI credits usage report. Find what dashboards cannot show: links between tables, likely causes, risks ahead and the best next steps.'),
  taskHeading: msg('Your task'),
  order: msg('The data comes first. The full instructions and the answer format follow after it.'),
  legendHeading: msg('How to read the data'),
  dataHeading: msg('Data'),
  thinkHeading: msg('How to think'),
  rulesHeading: msg('Rules'),
  focusHeading: msg('What to look for'),
  formatHeading: msg('Answer format'),
  formatIntro: msg('Write in Markdown. Use these sections in this order, with these titles. Keep tables to 10 rows or fewer.'),
  checkHeading: msg('Check before you answer'),
  start: msg('Now write the answer. Start with the section "{title}".'),
} as const;

const LEGEND = [
  msg('Each section starts with its name. Simple sections have one "key: value" line per item.'),
  msg('A table starts with name[rows]{columns}: and each line after it is one row of values split by commas. [25/140] means 25 of 140 rows are shown.'),
  msg('A value with a comma or a quote is in double quotes. A quote inside it is written twice.'),
  msg('A line that starts with # explains the table below it.'),
  msg('y means yes, n means no and - means unknown or not available. A | splits a list inside one value.'),
  msg('Names that end in _usd are US dollars, _pct is a percentage from 0 to 100, _mtok is millions of tokens. Dates are YYYY-MM-DD.'),
  msg('usage is the reported usage, after any Auto discount. covered is the part paid by included credits. billed is the rest, which is charged.'),
  msg('own_share is the included credits of a user\'s own seat. It is only a yardstick, because the credits are shared.'),
  msg('Ids such as persona or tier values are explained in group_meaning when it is present.'),
];

const THINKING = [
  msg('Use your deepest reasoning. If you can choose a reasoning mode or level, use the highest one.'),
  msg('Read every table before you write. Then link the tables: time with users and models, groups with limits, organizations with seats.'),
  msg('For each finding, test at least two explanations and keep the one the data supports best. Say how sure you are.'),
  msg('Look for what the recommendations of the app miss. Say where you disagree with them and why.'),
  msg('Check every number you quote against the data. Do the math step by step and round only at the end.'),
  msg('Do not show your working notes. Show only the results, with short reasons.'),
];

const RULES = [
  msg('The data above is your only source. Do not invent numbers, causes, prices or GitHub settings.'),
  msg('The totals of the app are correct, so do not recalculate them. You may derive new figures such as ratios, shares and differences. Show the formula in short, for example "12.4 / 80 = 15.5%".'),
  msg('1 AI credit is 0.01 USD. Usage is the amount covered by included credits plus the amount billed.'),
  msg('Included credits form one shared pool for the account. They are not personal allowances.'),
  msg('Savings of separate recommendations or steps overlap. Never add them up. Use savings_plan for a combined figure.'),
  msg('Code completions and next edit suggestions are not in the report. No usage is not proof that a seat is unused.'),
  msg('A - means unknown, not zero. Say when data is missing, filtered or made up for a sample.'),
  msg('Mark estimates as estimates. Write money in USD with two decimals at most.'),
  msg('Write for managers in plain words and short sentences. Explain a technical term the first time you use it.'),
];

const NAMES = {
  anonymous: msg('User names were replaced with aliases such as {alias}. The lowest number has the most usage. Use the aliases as they are. They are not GitHub logins.'),
  identified: msg('The admin chose to include real user names. Name a person only when the task needs it.'),
};

const LANGUAGE = {
  ar: msg('Answer in Arabic. Keep the names of tables, columns, ids, models and users as they are in the data.'),
  en: msg('Answer in English. Keep the names of tables, columns, ids, models and users as they are in the data.'),
};

const CHECKS = [
  msg('Every number in your answer is in the data or comes from a formula you show.'),
  msg('No savings are added together.'),
  msg('Every finding has evidence and a confidence level.'),
  msg('Every action has an owner and a way to measure it.'),
  msg('No seat is called unused on report usage alone.'),
  msg('The answer uses the sections in the order given.'),
];

export interface CopilotPrompt {
  text: string;
  /** The names of the data sections in the prompt. */
  sections: string[];
  /** What the first user alias looks like, such as user-01 or user-001. */
  aliasExample: string;
}

const bullets = (items: readonly string[]): string[] => items.map((item) => `- ${t(item)}`);

/** Builds a task prompt: the role and the goal, the data in a compact form, then the instructions and the answer format. */
export function buildCopilotPrompt({ input, task, includeNames }: { input: CopilotDataInput; task: CopilotTask; includeNames: boolean }): CopilotPrompt {
  const spec = TASKS[task];
  const data = buildCopilotData(input, task, includeNames);
  const answerSections = [...FIRST_SECTIONS, ...spec.sections, ...LAST_SECTIONS];
  const text = [
    `# ${t(TEXT.title, { task: t(spec.label) })}`,
    '',
    t(TEXT.role),
    '',
    `## ${t(TEXT.taskHeading)}`,
    t(spec.goal),
    '',
    t(TEXT.order),
    '',
    `## ${t(TEXT.legendHeading)}`,
    ...bullets(LEGEND),
    '',
    `## ${t(TEXT.dataHeading)}`,
    '```text',
    data.text,
    '```',
    '',
    `## ${t(TEXT.thinkHeading)}`,
    ...bullets(THINKING),
    '',
    `## ${t(TEXT.rulesHeading)}`,
    ...bullets(RULES),
    `- ${includeNames ? t(NAMES.identified) : t(NAMES.anonymous, { alias: data.namer.example })}`,
    `- ${t(getLocale() === 'ar' ? LANGUAGE.ar : LANGUAGE.en)}`,
    '',
    `## ${t(TEXT.taskHeading)}: ${t(spec.label)}`,
    t(spec.goal),
    '',
    `### ${t(TEXT.focusHeading)}`,
    ...bullets(spec.focus),
    '',
    `## ${t(TEXT.formatHeading)}`,
    t(TEXT.formatIntro),
    '',
    ...answerSections.flatMap((section, index) => [`### ${index + 1}. ${t(section.title)}`, t(section.detail), '']),
    `## ${t(TEXT.checkHeading)}`,
    ...bullets(CHECKS),
    '',
    t(TEXT.start, { title: `1. ${t(FIRST_SECTIONS[0].title)}` }),
  ].join('\n');
  return { text, sections: data.sections, aliasExample: data.namer.example };
}
