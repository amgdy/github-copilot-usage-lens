# AGENTS.md

A guide for people and AI coding agents who work on this project. Read it before you change anything.

## What this project is

**GitHub Copilot Usage Lens** (short name: Usage Lens): a report viewer for the **GitHub Copilot AI credits usage report** (the CSV you download from GitHub billing). An admin drops the file into the page and gets a management view: how much is used, how much is billed, who uses what, which models cost the most, how the included credits are shared, which seats are idle, and what to do about it.

- Everything runs **in the browser**. There is no server, no database and no login. Files are never uploaded.
- English is the main language. Arabic is fully supported, with a right-to-left layout.
- The audience is managers and admins, many of them not technical. Every screen uses short, plain words.

## Commands

| Command | Use it to |
| --- | --- |
| `npm install` | Install packages (Node 26 only). |
| `npm run dev` | Start the app at http://localhost:5173. |
| `npm run typecheck` | Check types for the app (`tsconfig.app.json`) and for the tests and scripts (`tsconfig.node.json`). Run it after every change. |
| `npm test` | Run all tests (Vitest). Run single files while you work: `npx vitest run tests/users.test.ts`. |
| `npm run build` | Production build in `dist/`. |
| `npm run build:single` | One self-contained `dist/index.html` that works offline. |
| `npm run gen:demo` | Write a made-up usage CSV to `demo-data/` for tests and manual tries. |
| `npm run check:prices` | Compare the built-in price card with the live GitHub Docs pricing page. |
| `bash scripts/collect.sh` | Read seats, budgets, billing, activity, seat changes and (for an enterprise) the AI usage report from GitHub with the GitHub CLI (`gh`) and save one GitHub data file. Read only. |
| `pwsh -File scripts/collect.ps1` | The same collector in PowerShell. On Windows: `powershell -ExecutionPolicy Bypass -File scripts\collect.ps1`. |

## Where things are

```
src/
  lib/                pure TypeScript, no React, fully unit-tested
    csv/              reading the usage CSV in a Web Worker (columns, dates, duplicates)
    analytics/        all math: filters, totals, included credits (pool), users, segments,
                      Auto discount, savings levers, simulator, seats, anomalies,
                      recommendations, tips; analyze.ts is the one entry point
    licenses/         reading the GitHub Copilot license list (seat assignments) and
                      matching it to the usage report
    collection/       reading the GitHub data file of the collector scripts and what it adds:
                      seats, budgets, billing, activity, seat changes (derive.ts)
    pricing/          model price card (card.ts), model groups, live price check (docsParser.ts)
    metrics/          how every number is calculated (docs/*.ts), shown in the app
    demo/             made-up data generator for the sample report, tests and `gen:demo`
    export/           executive summary (Markdown)
    build/            build version and GitHub Actions run link, filled by vite.config.ts
    links.ts          official GitHub and Microsoft links used across the app
  i18n/               translation core; ar/*.ts holds the Arabic text
  state/              store (Zustand), router (hash), analysis provider, theme
  components/         shared UI: layout, ui kit, charts (ECharts), icons, user drawer
  pages/              one file per page plus a folder of its parts; budgets/limitMap/ holds the
                      Limit map of the Budgets page (its model is pure and tested in
                      lib/collection/limitBoard.ts)
tests/                Vitest suites, including guard tests (naming, i18n, metric docs, readable names)
scripts/              demo data and price check scripts, and the collector scripts
                      (collect.sh for bash, collect.ps1 for PowerShell)
docs/FEATURES.md      what the app does and the value it gives admins
```

Pages: Overview, Usage and pool, Budgets, Users, Segments, Models, Efficiency, Organization, Patterns, Recommendations, Licenses, Data, Settings, Methodology.

## Key ideas you must keep right

- **1 AI credit = 0.01 USD.** `gross = discount + net`.
- **Included credits are shared.** Each seat adds its monthly included credits (Business 19 USD, Enterprise 39 USD) to one shared pool. Usage is paid from the pool first; only the rest is **billed**. Usage is the reported gross amount, already reduced by any Auto discount. It is not the price before that discount.
- **Pool size can be unknown.** The usage file only shows seats that used something. If more credits were covered than the visible seats can fund, the app hides pool and seat statements instead of guessing. A complete license list improves the estimate, but a current list is not proof of past seat counts or billing terms.
- **Auto model selection** gets a discount (10 percent at the time of writing, `AUTO_DISCOUNT` in `lib/pricing/card.ts`). "Original price" is only used for Auto: what the same tokens would cost without the discount.
- **Savings overlap.** Never add the savings of separate recommendations. The combined plan and the simulator are the only totals.
- **Prices** come from the GitHub Docs page "Models and pricing". The snapshot date is `CARD_AS_OF`. Never invent a price; models without a price are listed as "Usage on models without a price".
- **Code completions are not in the export.** Never call a seat unused on usage data alone; use the license list's last activity when it exists.
- **Seat import choice.** Recommend the GitHub Copilot activity report CSV for most admins because it downloads in the GitHub UI. Keep the seats API JSON as an advanced option for plan, seat start and pending-cancellation details or repeatable exports. Both have a 90-day activity limit. Tell admins to check the file's scope and seat count against GitHub; a CSV may omit seats, and a blank activity date is not proof that a user never used GitHub Copilot.

## Rules for every change

### Words
- Always write **GitHub Copilot** (also "GitHub Copilot Chat", "GitHub Copilot CLI", "GitHub Copilot code review"). Never drop the word "GitHub" from the product name. `tests/naming.test.ts` checks `src/`, `docs/`, `README.md` and this file.
- Very simple language: short sentences, everyday words, no jargon, no marketing words, no exclamation marks, no emojis, no em dashes.
- American spelling (organization, behavior, optimize).
- Fixed terms: Usage, Included credits, Included credits used, Billed, Covered by included credits, Auto discount received, Original price (Auto only), price card (never "list price"), Usage profile, Runaway users, Models with prices.

### Order
- Lists that rate something (efficiency, health, quality) go from **positive to negative**.
- Dropdowns and filter options are sorted **A to Z**. `Select` and the filter pickers do this through `sortOptions` in `src/components/ui/sortOptions.ts` (it also keeps "All" first). Pass `order="given"` only when the order means something, such as months or tiers.
- Recommendations and tiles go from the **most impact or value to the least**.
- When cache data exists, show **both cache read and cache write**.

### Visual design
- The app should look like a printed company report, not a generic dashboard: GitHub Primer colors: a light gray page (dark gray in dark mode), white panels drawn with thin lines, GitHub blue for the brand, links and the first chart series, and GitHub green only for the main action button. Charts use the Primer data colors (`--cp-series-*`). Settings also offers GitHub's other color sets: **High contrast** and **Colorblind friendly** (blue for good, orange for bad, Okabe-Ito chart colors). They live in `src/index.css` as `html[data-theme=…][data-palette=…]` rules that override only the colors that change. No gradients, glows, big shadows or decorative icons.
- Fonts are bundled so the report looks the same offline (`src/fonts.css`): Mona Sans by GitHub for English and IBM Plex Sans Arabic for Arabic. Titles and big numbers use `font-display` (a wider Mona Sans).
- Use the shared tokens in `src/index.css`. Corners are small: 2 px marks, 3 px tags, 4 px controls, 6 px blocks and 8 px panels. Bars, dots and labels are square; only switches and info buttons are round.
- Use the shared pieces: `.eyebrow` for small section labels, Lucide icons for navigation and feature lists, `.card` for panels and `Brand` for the mark and name. The mark (`BrandMark`) is a coffee mug that holds the credit pool, with usage bars and a lens; `Brand` shows it animated (CSS only, stopped for reduced motion and print). The favicon in `index.html` is the still version, and the logo files are in `docs/brand/`. Keep all three in step when the mark changes. Do not add palettes for single components.
- The Budgets page has one **Limit map** (`src/pages/budgets/limitMap/`), built with HTML and CSS. The outer limit (enterprise, or organization in an organization file) is a frame around everything. Each row inside is the spending limit a user's billed usage checks: their cost center, else their only seat organization with a limit, else only the frame. Users with seats in several organizations, or no seat, go in a "not clear" row, because GitHub picks one organization each billing cycle. Room left in a row is the smaller of its own room and the frame's. In an organization file, users in an enterprise cost center go in a dashed box outside the frame (`countedByTop` is false), because GitHub bills them to the cost center, not the organization. Each square is one person, filled to the share of their user limit used: individual, else cost center default, else universal. An individual limit replaces broader per-user limits, not spending limits or included-pool controls. Teams can assign cost centers but are not another budget level. Icons (`KIND_ICONS`, `laneIcon` and `topIcon` in `parts.tsx`) mark where a limit is set and must match in the legend, the rows and the details. Enterprise exclusions and the paid usage policy are not collected, so never claim every user is blocked by an enterprise budget. Repository budgets remain in the budget table, not the AI credit map. Search reveals a hidden user without rendering the whole group. Playback compares past usage with current limits, not historical blocking. Keep one view, with no 3D or animated billing paths.
- Numbers have an order of weight, so the ones that matter stand out. Do not make every number bold: when everything is bold, nothing stands out. Each tile or panel has one big value. In a sentence, the figures that answer the question (money, percents, multiples and limits) are semibold through `Figures` (it finds them in the text) or `Fig` (by hand, for example for an important count). Inside gray text they also take the full text color. Each table makes its one key column semibold with `strong: true`. Dates, counts and IDs stay regular. Color is only for meaning, never for emphasis. `tests/figures.test.ts` checks this.
- Keep layouts usable in Arabic and right to left, in light and dark. `tests/theme.test.ts` checks the colors, the contrast of every text color in every color set, the corner sizes and the bundled fonts.

### Every number explains itself
- Each figure on a page has a doc in `src/lib/metrics/docs/<area>.ts` (what it is, the formula, the inputs, an example, the limits, links) and shows it through the info button (`CalcInfo`). The Methodology page lists them all.
- `tests/metric-docs.test.ts` fails when a KPI or chart has no doc.

### Translation (English and Arabic)
- English text is the key. Use `t('text', { n })` for text, `tp(n, one, other)` for plurals, `msg('text')` for constants that are translated later, and `<T text="..." values={{ link: <a/> }} />` for sentences with elements inside.
- Arabic goes in `src/i18n/ar/<area>.ts` (and `ar/docs-<area>.ts` for metric docs). A key lives in only one file; shared words go in `ar/common.ts`.
- Lib code imports from `src/i18n/core.ts`; components import from `src/i18n`.
- The app remounts when the language changes, so lib code may call `t()` at run time. Text built once at load time is not rebuilt.
- Layout must work right to left: use logical classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`), never `left`/`right`.
- Arabic shows Arabic-Indic digits (١٢٣) by default; Settings can switch to Latin digits. Format every shown number with the helpers in `src/lib/utils/format.ts` and `date.ts`, or wrap it in `localizeDigits`. Numbers passed to `t()` as numbers are converted too; strings such as logins and model names never are. CSV files always use Latin digits. `tests/arabic-digits.test.ts` checks this.
- `tests/i18n.test.ts` finds missing Arabic, raw English in JSX and left/right classes.

### Links
- Use only official links (GitHub Docs, GitHub Blog, GitHub Changelog, GitHub Resources, Microsoft Learn) from `src/lib/links.ts`. Add new ones there and pick them through `TOPIC_LINKS` or the `DocLinks` component.

### Icons
- Use the vector icons in `src/components/icons` for products and vendors, and `lucide-react` for general icons. No bitmap images.

### Names in code
- Name variables, parameters and functions with full words that say what they hold: `seatCount`, `monthlyQuota`, `taxonomy`, `octoberRows`. Avoid single letters and short forms such as `e`, `cb`, `cfg`, `idx`, `tmp`, `tax` or `q0`.
- Allowed short names: `i`, `j` and `k` as the counter of a classic `for` loop, `a` and `b` as the two parameters of a sort comparator, `x` and `y` for chart coordinates, names that start with `_` for values that are not used, and the helpers `t`, `T`, `tp`, `msg` and `cx` where they are defined.
- Plain words (`out`, `pick`, `spec`), standard terms (`html`, `iso`, `sku`) and the project words `calc`, `doc` and `lens` are fine.
- `tests/readable-names.test.ts` checks `src/`, `tests/`, `scripts/` and `vite.config.ts`.

### Node and TypeScript
- The project uses **Node 26 only**. `engines` in `package.json`, `.nvmrc`, the CI workflow and the Pages workflow all use that one version. Dependabot skips major updates of `@types/node` so the types stay on version 26.
- The workflows run on the fixed runner image `ubuntu-26.04`, not `ubuntu-latest`, so a change of the default image never changes the build without notice.
- Files in `scripts/` run with plain `node` and its built-in TypeScript support. Keep them to syntax that only needs the types removed: no `enum`, no `namespace` and no constructor parameter properties such as `constructor(private x: T)`. Import local files with the `.ts` extension. `tsc` enforces this (`erasableSyntaxOnly`).
- Types are checked with two configs. `tsconfig.app.json` covers the browser code in `src/` and stops at ES2023, so `tsc` fails if that code uses features that not every browser has yet, such as `Temporal`. `tsconfig.node.json` covers the code that runs only in Node (`scripts/`, `tests/`, `vite.config.ts`) and allows the newest features (`ESNext`).
- In code that runs only in Node, use the built-ins: `import.meta.dirname` for paths, `fs.globSync` to list files, `util.parseArgs` for options, `Temporal` for dates and `Map.prototype.getOrInsert` or `getOrInsertComputed` to group values. The date helpers in `tests/helpers.ts` use `Temporal`, so the tests check the app's own date math against a separate calendar.
- Tests start Node with `--no-experimental-webstorage` (see `vite.config.ts`), so `localStorage` is undefined in tests. A test that needs it must stub it.

### Data and privacy
- Never read, copy, bundle or test with real customer exports. Git ignores a local `samples/` folder, `*.csv`, `seats*.json` and the GitHub data files (`usage-lens-data*.ndjson`, `.ndjson.gz`) because they may hold private files: do not open them. Tests use made-up data (`tests/fixtures.ts`, `makeCsv`, `generateDemo`, `tests/collectionLines.ts`).
- The start page has two ways in: choose or drop your own files, or **View a sample report**. The sample is made up in the browser by `src/state/loadSample.ts`, which loads the generator only when clicked and never reads a file. While the sample is open, every page says so (`SampleNotice`), and the saved license list is left out of the analysis (`withoutRoster`), so real names never mix with invented data. Settings and Licenses say why the list is not used (`SampleListNote`), never compare the list with the sample's users, and turn off the button that fills the list from the loaded report, so invented users are never saved as seats. The sample also has made-up GitHub data (seats, budgets, billing and audit events) from `src/lib/demo/github.ts`, loaded through `dataset.sampleGitHub`; your own GitHub data file is never used with the sample. Any new code that reads `useApp((s) => s.dataset)` directly must check `dataset.sample` in the same way. `tests/landing.test.ts`, `tests/sample-report.test.ts`, `tests/sample-license-list.test.ts` and `tests/data-isolation.test.ts` guard this.
- The sample generator (`src/lib/demo/generate.ts`) builds a made-up company with `DEMO_SEAT_COUNT` seats over three months. Logins follow the GitHub Enterprise Managed Users pattern: an invented Microsoft Entra ID login name, `_` and the short code `DEMO_SHORTCODE` (for example `KofiIto_nwind`). The months are built so that every recommendation shows in some view (the whole range, one month or the `northwind-labs` organization). Keep it that way when you change the generator; `tests/recommendations.test.ts` checks it.
- No network calls, except the live price check that the user starts in Settings.
- The build version (`BuildVersion`) is baked in at build time from the GitHub Actions variables. It links only to github.com runs and commits and never calls the network.
- Settings are stored in `localStorage` (`ghcu.settings.v1`); the theme, color set, language, Arabic digits and the Show calculations switch in `ghcu.theme`, `ghcu.palette`, `ghcu.locale`, `ghcu.digits` and `ghcu.showCalc`; the command maker's choices in `ghcu.collector`. Every key starts with `ghcu.`: a new key must too, so "Delete saved settings" (`src/state/savedData.ts`, on the start page and Settings > Data on this device, and in the Start fresh dialog) removes it. Usage data stays in memory only.
- **Start fresh** (`src/components/StartFreshButton.tsx`, in the sidebar, the mobile menu and on the Data page) closes everything in memory through `startFresh` in `src/state/startFresh.ts`: the store's `closeData()` (dataset, sample, GitHub data file, filters, errors and open panels) and the upload notice. New in-memory state that holds loaded data must be cleared there too. `tests/start-fresh.test.ts` guards it.

### Collector scripts
- `scripts/collect.sh` (bash) and `scripts/collect.ps1` (Windows PowerShell 5.1 and PowerShell 7) read data from GitHub with the GitHub CLI (`gh`) and save one GitHub data file. Admins run them straight from GitHub (`curl -fsSL <raw URL> | bash`, or `powershell -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm <raw URL>)))"`), or from a copy of the repository; the README section "Collect more data from GitHub" is their guide. Keep the README, `--help` and `--list-sources` in step.
- Both scripts must keep working when they do not come from a file. Bash reads `collect.sh` from its input, so nothing may read that input before `main` runs; answers come from the terminal through `use_terminal_for_answers`. Keep `main; exit` as one line at the very end, so a cut-off download never runs and bash reads no more commands from the terminal after `main`. `collect.ps1` runs as a script block: `$PSScriptRoot` is empty, `$script:` is not the scope of the parameters (read them through `$script:OptionValues`), and `exit` ends the whole process, so the command starts a new `powershell` process. `tests/collector.test.ts` checks both ways.
- They only read. Send only GET requests and GraphQL queries, with one exception: the `usage-report` source may POST to the enterprise usage reports endpoint to ask GitHub to make an AI usage report, the same as Get usage report on the billing page (`tests/collector.test.ts` checks this). Never change anything else on GitHub, and never print, save or ask for a token. They talk only to the GitHub host and the report download links it returns.
- A GitHub data file with `usage-report` records is a complete report on its own: `routeUploads` in `src/pages/data/uploads.ts` loads its CSV parts as the usage data when no usage CSV is in the same batch. A usage CSV in the batch always wins.
- The command maker (`src/lib/collection/command.ts`, shown by `src/pages/data/CollectorCommand.tsx` on the start page and the Data page) must only offer options that both scripts accept. Keep it in step with the options of the scripts. Its command gets the scripts of the commit the app was built from (`COLLECTOR_SCRIPT_SOURCE`, from `BUILD_INFO`), or of `main` for a build made on a computer, so the file always fits the app. Only names and hosts from a safe set of characters reach the command.
- Keep both scripts in step: the same options, sources, requests in the same order, jq filters, messages and records. `tests/collector.test.ts` runs both against the made-up GitHub in `tests/collectorMock.ts` and checks that they write the same data.
- Keep only the fields the app needs. The jq filters (`SEAT_FILTER`, `AUDIT_FILTER` and the others, `$script:SeatFilter` and so on in PowerShell) leave out names, emails, avatars, locations and user agents.
- The file format is `github-copilot-usage-lens-data`, version 1 (`COLLECTION_FORMAT` and `COLLECTION_VERSION` in `src/lib/collection/types.ts`, `FORMAT_VERSION` in both scripts). New fields and new kinds need no new version: the reader skips kinds it does not know. Raise the version in all three places only when older apps would read the file wrong.
- A source that cannot be read must not stop the run. The script writes its result line and goes on, and the app shows what is missing instead of guessing (for example, members without a seat are not counted when the member list is incomplete).
- `collect.sh` must run on bash 3.2 (the macOS default) with tools that macOS and Linux both have: no associative arrays, `mapfile`, `${name,,}`, GNU-only options or `date -d`, and no `set -u` (empty arrays fail with it in bash 3.2).
- `collect.ps1` must use ASCII characters only (Windows PowerShell 5.1 reads a file without a byte order mark in the local code page) and must keep working with Windows line ends. `.gitattributes` keeps `*.sh` files with Unix line ends.

## How to add things

- **A page:** add the id to `PAGE_IDS` in `src/state/router.ts`, an entry in `src/components/layout/nav.tsx`, a lazy route in `src/components/layout/AppShell.tsx`, a docs file in `src/lib/metrics/docs/` registered in `registry.ts`, and Arabic in `src/i18n/ar/`.
- **A number:** compute it in `src/lib/analytics/` (pure, tested), add its doc, show it with `CalcInfo`, translate the label.
- **A recommendation:** add it in `src/lib/analytics/recommendations.ts` with evidence, actions, audience, confidence, saving and official links; savings must follow the pool rules.
- **A model price:** update `PRICE_CARD` and `CARD_AS_OF` in `src/lib/pricing/card.ts`, then run `npm run check:prices`.
- **A collector source:** in `scripts/collect.sh`, add it to `ALL_SOURCES`, `show_sources`, `needed_scopes` and `collect_enterprise` or `collect_organization`, with a jq filter that keeps only the needed fields. Do the same in `scripts/collect.ps1` (`$script:AllSources`, `$script:SourceTable`, `Get-NeededScopes`, `Read-Enterprise` or `Read-Organization`). Add the route to `tests/collectorMock.ts`, read the new kind in `src/lib/collection/read.ts`, use it in `derive.ts` with tests, and add a row to the sources table in the README.

## Before you finish

1. `npm run typecheck` is clean.
2. The tests for the files you touched pass, and so do the guards: `npx vitest run tests/naming.test.ts tests/i18n.test.ts tests/metric-docs.test.ts tests/readable-names.test.ts`.
3. Check the page in the browser in English and Arabic, light and dark, wide and narrow.
