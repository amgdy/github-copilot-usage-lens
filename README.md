<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/github-copilot-usage-lens-animated-dark.svg" />
    <img src="docs/brand/github-copilot-usage-lens-animated.svg" alt="GitHub Copilot Usage Lens" width="420" />
  </picture>
</p>

# GitHub Copilot Usage Lens

[![CI and deploy](https://github.com/amgdy/github-copilot-usage-lens/actions/workflows/pages.yml/badge.svg)](https://github.com/amgdy/github-copilot-usage-lens/actions/workflows/pages.yml)

**GitHub Copilot Usage Lens** is an analysis tool for the GitHub Copilot **AI credits usage report** (the CSV export from GitHub billing). Drop one or more files in and you get an interactive management view: how much is used and billed, who uses what, how the shared included credits behave, which users and models drive cost, which seats are idle, and a list of recommendations ordered by impact, each with an estimated saving and official GitHub and Microsoft links.

**Try it:** [amgdy.github.io/github-copilot-usage-lens](https://amgdy.github.io/github-copilot-usage-lens/). Choose **View a sample report** to see every page with made-up data, or drop in your own file.

![Overview page of the sample report: usage, billed amount, included credits and the top actions](docs/screenshots/overview.png)

More screenshots are in [Screenshots](#screenshots), and [docs/SCREENSHOTS.md](docs/SCREENSHOTS.md) shows every page with a short explanation.

Nothing is uploaded. The CSV is read and analyzed in your browser (in a Web Worker). There is no backend and no network call after the page has loaded, except the live price check that you start yourself in Settings.

The app is in **English** (the main language) and **Arabic** (right-to-left), and every number has an info button that explains how it was calculated.

The interface has its own calm look, like a printed company report in GitHub colors: Primer grays, GitHub blue for the brand and charts and GitHub green for the main action, set in Mona Sans by GitHub and IBM Plex Sans Arabic. Both fonts are bundled, so the report looks the same offline, in light and dark modes. Settings also offers high contrast and colorblind friendly colors, like GitHub's own appearance settings.

This is an independent open source project. It is not made by, connected to or endorsed by GitHub or Microsoft. GitHub, GitHub Copilot and Microsoft are trademarks of their owners, and their names and logos are used only to name the products.

- [docs/FEATURES.md](docs/FEATURES.md): what the app does and the key values for admins, in plain language.
- [docs/SCREENSHOTS.md](docs/SCREENSHOTS.md): a screenshot of every page with a short explanation.
- [CONTRIBUTING.md](CONTRIBUTING.md): how to set up the project and send a change.
- [AGENTS.md](AGENTS.md): how the project is organized and the rules for changing it.

## Quick start

```bash
git clone https://github.com/amgdy/github-copilot-usage-lens.git
cd github-copilot-usage-lens
npm install
npm run dev            # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload. |
| `npm run build` | Type-check and build to `dist/` (code-split, one lazy chunk per page). |
| `npm run build:single` | Build **one self-contained `dist/index.html`**. Open it from disk, email it, or put it on any static host. Works offline and from `file://`. |
| `npm run preview` | Serve the production build locally. |
| `npm test` | Run the Vitest suite (`tests/`). |
| `npm run typecheck` | Check types twice: `tsconfig.app.json` for the app in `src/` and `tsconfig.node.json` for the tests, scripts and Vite config. |
| `npm run gen:demo` | Write the made-up demo CSV to `demo-data/demo-usage-report.csv` (add `-- --seed 42` or `-- --random`). |
| `npm run check:prices` | Compare the built-in model price card with the live GitHub Docs pricing page. |

Requires Node 26. The `.nvmrc` file holds the version for tools such as nvm and fnm. The `gen:demo` and `check:prices` scripts run their TypeScript files directly with Node, so they need no extra tool.

## Loading data

The start page has two ways in:

- **Drop or choose** one or more usage CSV files (and, in the same drop, a license list or a GitHub data file). For an enterprise, the GitHub data file of the [collector script](#collect-more-data-from-github) can hold the AI usage report, so that one file is enough. The drop zone lists the file types it takes, and **Which file do I need?** leads to a short guide below it: the AI usage report first, then the license list, then the GitHub data file, each with what it gives and where to get it.
- **View a sample report** to see every page before you load your own file. The sample is made up in your browser from invented people, organizations and numbers. It reads no file, and no report data is built into the app. While the sample is open, every page says so, and your saved license list is left out so no real names mix with invented data. Settings and Licenses say so too, and the sample's invented users can't be saved into your license list. Open your own report at any time to replace it.

### What the sample shows

The sample is a made-up company, Northwind, with 140 GitHub Copilot seats over three months. Logins follow the GitHub Enterprise Managed Users pattern: the Microsoft Entra ID login name, an underscore and the enterprise short code, for example `KofiIto_nwind`. The months tell one story, so every recommendation and tip has something to show:

| Month | What happens | Try this view |
| --- | --- | --- |
| First month | A careful rollout. Less than half of the included credits are used. | Pick the first month in the date range: the pool is under-used. |
| Second month | Six people start long agent sessions on costly models. The included credits run out and the rest is billed. The last week is a release freeze. | Pick the second month: overage, budgets and a drop in the last week. |
| Third month | Session limits calm the heavy users, coaching lifts everyday use and a new team of 22 people joins. | Pick the third month: a healthy pool. The whole range shows the new users and the rise in the last week. |

The sample also has idle and lapsed seats, people in two organizations, repository scans with no user, a cost center that is missing for some people, and one small research team (`northwind-labs`) where one person uses most of the credits. Filter on that organization to see it. Only one recommendation needs your own data: the one about missing columns in the file. The sample also has made-up GitHub data (seats, budgets, billing and seat changes), so the Budgets page and the GitHub data cards have something to show. Your own GitHub data file is never used with the sample.

The same generator can write the sample as a file for tests and for people who work on the app: `npm run gen:demo` (or `npm run gen:demo -- --random`) writes `demo-data/demo-usage-report.csv`. The folder is ignored by Git and holds made-up data only.

Several files are merged. A row that appears in more than one file with identical values is dropped once, so overlapping exports do not double count (the Data page lists duplicates per file). **Load other data** in the sidebar returns to the start page without losing the current dataset, and so does the logo at the top of the sidebar and the mobile menu; **Back** returns to it. **Start fresh** (in the sidebar, the mobile menu and on the Data page) closes everything loaded in the tab, the usage report or sample and the GitHub data file, after one question that lists what is closed. In the same question you can also delete the settings saved in this browser.

### Where to get the files

- **Usage report (required, unless the GitHub data file has it):** in GitHub, open Billing and licensing, then the AI usage page, and choose Get usage report. GitHub emails you a link to the CSV.
- **License list (recommended):** for most admins, use the [GitHub Copilot activity report](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/administer-copilot/download-activity-report) (CSV). No CLI is needed. In an organization, open Settings, then GitHub Copilot, Access, Get usage report and Get activity report. In an enterprise, open Billing and licensing, then Licensing and Get activity report. It adds activity details for seat review, but has no plan or seat start date. Check that the file covers the same organization or enterprise as your usage report and compare its seat count with GitHub. A CSV can have missing seats, and the app cannot identify omitted seats. Load it on the Licenses page, the Data page or together with the usage report.
- **Other license files:** the [GitHub Copilot user management REST API](https://docs.github.com/en/rest/copilot/copilot-user-management) (JSON), seats CSV, or a plain list of logins are also supported. The API is an advanced option for plans, seat start dates, pending cancellations or repeatable exports. Both the activity report and API use a 90-day activity window. New seats and activity older than 90 days can have a blank activity date; blank does not mean never used.
- **GitHub data file (optional, the most complete):** made by the collector script in this repository. It adds your seats, budgets, the whole bill, activity with code completions and seat changes. For an enterprise it has the AI usage report too. See [Collect more data from GitHub](#collect-more-data-from-github).
- **Settings file (optional):** exported from the Settings page, to share your budget, thresholds, seat list and price overrides.

The Data page also lists other GitHub exports that add context (usage metrics, cost centers, teams, budgets), what each adds, and how to get it.

### Advanced: export seat assignments with the GitHub CLI

Most admins can use the activity report above instead. Use the seats API when you need the assignment details it includes, or want a repeatable export. The API does not extend the 90-day activity window. Check that the result covers the right organization or enterprise and compare the number of seats with GitHub.

An administrator with access to the relevant organization or enterprise can export all pages of seat assignments:

```bash
gh api --paginate "/orgs/ORG/copilot/billing/seats?per_page=100" > seats.json
# Or, for the whole enterprise:
gh api --paginate "/enterprises/ENTERPRISE/copilot/billing/seats?per_page=100" > seats.json
```

Replace `ORG` or `ENTERPRISE` with your GitHub name. Import the resulting file into the app; do not paste a token into it. Export all pages, use the same billing scope as the usage report, and check the import preview before replacing the current list. A current list does not prove which seats existed in past months.

The [collector script](#collect-more-data-from-github) reads the same seats, together with budgets, billing and activity, in one step.

### Expected columns

```
date, username, product, sku, model, quantity, unit_type, applied_cost_per_quantity,
gross_amount, discount_amount, net_amount, total_monthly_quota, organization,
app_client_id, repository, cost_center_name, aic_quantity, aic_gross_amount,
input, output, cache_read, cache_write
```

The parser handles the UTF-8 BOM, quoted fields, CRLF, and numbers in scientific notation, and it accepts common header variants (`user`, `login`, `ai_credits`, `cost_center`, ...). Only a `date` column and either `gross_amount` or `quantity` are required; any other missing column is listed on the Data page and the views that need it say so, instead of the file being rejected. Notes on the format:

- `date` is normally `2026-10-03`. The parser also reads `2026/10/03`, `10/3/2026` (month first), `25/10/2026` (day first, when only that reading is possible), `Oct 3, 2026` and `3 Oct 2026`, with or without a time. Only the calendar date is used, so the result does not depend on your time zone. Rows with an unreadable date are skipped and counted on the Data page.
- `quantity` is AI credits; **1 credit = 0.01 USD**. `gross = quantity × 0.01 = discount + net`.
- `discount_amount` is the part **covered by included credits** of the seats; `net_amount` is **billed**.
- `username` is blank for repository-level products (such as code quality). Those rows still use included credits and are shown as one unattributed entry.
- Auto model selection appears as `Auto: <model>` and is split into a model plus an "Auto" flag. The Auto discount is already inside `quantity`, so the app works out the original price from it.
- The `aic_*` columns duplicate the credit columns and are ignored.
- Token columns (`input`, `output`, `cache_read`, `cache_write`) are optional. With them, every user and model shows input, output, cache read and cache write tokens; without them the app uses the credit totals and hides cache and token figures.

## Collect more data from GitHub

The usage report shows AI credits only. It has no seat list, no budgets, no seat charges and no code completions. Two scripts in this repository read that data from GitHub and save it in one file, the **GitHub data file**. Load it in the app, and the app gets more exact and finds more.

For an enterprise, the script gets the AI usage report too, so the GitHub data file is the only file you need. For organizations, GitHub has no way to download the AI usage report from a script, so load the file together with the usage report CSV.

The start page and the Data page have a **command maker**: choose your computer, the enterprise or organizations and the options, and copy the command it makes. The command gets the script from GitHub and runs it, so there is nothing to download. The steps below say the same in more detail.

| What the file holds | What the app does with it |
| --- | --- |
| The AI usage report (CSV) of each month, enterprises only | The app reads it as if you had loaded the usage report. A usage report CSV that you load with the file takes its place. |
| Every GitHub Copilot seat: plan (Business or Enterprise), start date, last activity, pending cancellation and team | Fills the license list, so the included credits, the pool size and the seat review use your real seats. |
| Budgets: the amount, what is used, whether the budget stops usage or only sends alerts, and budgets for single users, cost centers and everyone | The Budgets page shows how the limits fit together, each budget, how full it is and when it runs out. Each user profile shows the limit that holds the user as their target. The AI credit budget becomes the monthly budget when Settings has none. |
| What GitHub billed each month, seats included | Usage and pool shows the whole GitHub Copilot bill. The Data page checks the usage report against GitHub billing, month by month. |
| Seat totals, the seat policy and the members of each organization | Licenses shows the seats added, pending and inactive this billing cycle, and members without a seat. |
| Activity per user and day from the GitHub Copilot usage metrics, including code completions | Licenses shows who is active at GitHub but has no usage in the report, so nobody is called idle by mistake. |
| Seat, plan, policy and budget changes from the audit log | Licenses shows the seats added and removed each month. |
| The teams of each GitHub Copilot user | The Organization page groups usage by team. |

The file also adds five recommendations: a budget that only sends alerts, a budget that will stop usage, people who reached their own budget, organizations that give a seat to every member, and months where the usage report and GitHub billing do not agree.

The scripts only read. They change no settings on GitHub and send your data nowhere else. The one thing they can ask GitHub to do is make an AI usage report, the same as **Get usage report** on the billing page, when there is no recent report for a month. The file stays on your computer, and the app reads it in your browser.

### Before you start

1. Install the [GitHub CLI](https://cli.github.com/) (`gh`), version 2.40 or later.
   - Windows: `winget install --id GitHub.cli`
   - macOS: `brew install gh`
   - Linux: follow [Installing gh on Linux](https://github.com/cli/cli/blob/trunk/docs/install_linux.md).
2. Sign in once with `gh auth login`. For GitHub Enterprise Cloud with data residency, add `--hostname NAME.ghe.com`.
3. Use an account that is an enterprise owner or billing manager, or an organization owner or billing manager.

You do not need to know the token scopes. The script checks your sign-in and, when a scope is missing, offers to add it with `gh auth refresh`, which opens GitHub in your browser.

### Run it

Open a terminal (on Windows, PowerShell or Command Prompt) and run the line for your computer. It gets the script from this repository and runs it, so there is nothing to download or install.

macOS or Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts/collect.sh | bash
```

Windows:

```powershell
powershell -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts/collect.ps1)))"
```

`-ExecutionPolicy Bypass` lets Windows run this one script and changes no settings. You can read [collect.sh](https://github.com/amgdy/github-copilot-usage-lens/blob/main/scripts/collect.sh) and [collect.ps1](https://github.com/amgdy/github-copilot-usage-lens/blob/main/scripts/collect.ps1) on GitHub before you run them. The command maker in the app points the command at the scripts of the app version you use, so the file always fits the app.

With no options, the script asks what to read. It lists the enterprises and organizations you manage, asks whether to get the AI usage report (enterprises only), asks how many months to read, shows the plan and waits for your OK. To give the options yourself, put them after `bash -s --` on macOS and Linux, or before the last quote on Windows:

```bash
curl -fsSL https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts/collect.sh | bash -s -- --enterprise octocorp --months 6
curl -fsSL https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts/collect.sh | bash -s -- --org octo-org,octo-labs
```

```powershell
powershell -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts/collect.ps1))) -Enterprise octocorp -Months 6"
powershell -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create((irm https://raw.githubusercontent.com/amgdy/github-copilot-usage-lens/main/scripts/collect.ps1))) -Org octo-org,octo-labs"
```

#### With a copy of the scripts

Use a copy when your company does not let you run scripts from the internet, or to run the script on a schedule, so that a change on GitHub never changes what runs. Download the [repository as a ZIP file](https://github.com/amgdy/github-copilot-usage-lens/archive/main.zip) and unpack it, or clone it. Open a terminal in its folder and run the line for your computer:

| Your computer | Command |
| --- | --- |
| Windows | `powershell -ExecutionPolicy Bypass -File scripts\collect.ps1` |
| macOS or Linux | `bash scripts/collect.sh` |
| PowerShell 7 on any system | `pwsh -File scripts/collect.ps1` |

Git Bash and WSL on Windows can run `bash scripts/collect.sh` too. To run it without questions, for example on a schedule, give the options and `--yes`:

```bash
bash scripts/collect.sh --enterprise octocorp --months 6 --yes
bash scripts/collect.sh --org octo-org,octo-labs --yes
```

```powershell
powershell -ExecutionPolicy Bypass -File scripts\collect.ps1 -Enterprise octocorp -Months 6 -Yes
powershell -ExecutionPolicy Bypass -File scripts\collect.ps1 -Org octo-org,octo-labs -Yes
```

#### Options

| bash | PowerShell | What it does |
| --- | --- | --- |
| `--enterprise SLUG` | `-Enterprise SLUG` | Read an enterprise. |
| `--org NAME` | `-Org NAME` | Read one or more organizations. Separate names with commas. With an enterprise, only these organizations get their own details. |
| `--months N` | `-Months N` | Months of billing data and audit events, counting this month: 1 to 24, default 3. |
| `--daily-metrics` | `-DailyMetrics` | Read the activity of every day in those months, not only the last 28 days. It takes longer. |
| `--teams` | `-Teams` | Also read the members of every team. It sends one request per team. |
| `--hostname HOST` | `-Hostname HOST` | Your GitHub host, for example `octocorp.ghe.com`. The default is `github.com`. |
| `--output FILE` | `-Output FILE` | Where to save the file. A folder works too. |
| `--plain` | `-Plain` | Save plain text (`.ndjson`) instead of a compressed file. |
| `--only LIST`, `--skip LIST` | `-Only LIST`, `-Skip LIST` | Read only these sources, or leave them out. Separate names with commas. |
| `--list-sources` | `-ListSources` | Show every source and the access it needs. |
| `--yes` | `-Yes` | Ask nothing and use the options as given. |
| `--help` | `-Help` | Show every option. |

The PowerShell script also accepts the bash names, such as `--enterprise octocorp`.

### Sources and access

| Source | What it reads | Who can read it (token scope) |
| --- | --- | --- |
| `usage-report` | The AI usage report (CSV) of each month, enterprises only | Enterprise owner or billing manager (`manage_billing:enterprise`) |
| `organizations` | Organizations in the enterprise | Enterprise owner (`read:enterprise`) |
| `seats` | GitHub Copilot seats: user, plan, start, last activity | Owner or billing manager (`manage_billing:copilot`) |
| `seat-summary` | Seat totals and GitHub Copilot policies per organization | Organization owner (`read:org`) |
| `members` | Members of each organization | Organization member (`read:org`) |
| `teams` | Members of each team, only with `--teams` | Organization member (`read:org`, `read:enterprise`) |
| `budgets` | Budgets, their amounts and what is used | Owner or billing manager (`manage_billing:enterprise`) |
| `cost-centers` | Cost centers and who is in them | Enterprise owner or billing manager (`manage_billing:enterprise`) |
| `ai-credit-usage` | AI credits billed per month, by product, SKU and model | Owner or billing manager (`manage_billing:enterprise`) |
| `usage-summary` | Billing summary per month for every product | Owner or billing manager (`manage_billing:enterprise`) |
| `billing-usage` | Daily GitHub Copilot charges | Owner or billing manager (`manage_billing:enterprise`) |
| `user-metrics` | Activity per user and day, including code completions | Owner or billing manager (`manage_billing:copilot`, `read:org`) |
| `scope-metrics` | Activity totals per day | The same as `user-metrics` |
| `user-teams` | Teams of each GitHub Copilot user | The same as `user-metrics` |
| `audit-log` | Seat, plan, policy and budget changes | Owner (`read:audit_log`) |

For organizations, the billing sources need an organization owner or billing manager. The activity sources need the usage metrics policy for GitHub Copilot set to "Enabled everywhere". When a source cannot be read, the script goes on and its summary says why. The app uses what is there and shows what is missing.

`usage-report` uses a report from the last 31 days when one covers the whole month. Otherwise it asks GitHub to make one, which takes a few minutes and adds the report to the billing page, as the [usage reports API](https://docs.github.com/en/rest/billing/usage-reports) does. The script waits at most 15 minutes and checks every 20 seconds. To change that, set `USAGE_LENS_REPORT_WAIT_SECONDS` and `USAGE_LENS_REPORT_POLL_SECONDS`. If a report is not ready in time, the file says so; run the script again a few minutes later. Leave the report out with `--skip usage-report` (`-Skip usage-report`).

### The file

- The file is saved in the folder you run the script from, as `usage-lens-data-NAME-TIME.ndjson.gz`. Git ignores these files.
- It is NDJSON (one JSON object per line), compressed with gzip. The first line says what was read and for which months, each data line holds one item from GitHub, each request has a line with its result, and an end line shows that the script finished. Any tool that reads JSON lines can open it.
- It holds GitHub logins, seat details, budgets, billing amounts and activity counts. Names, email addresses, avatars, locations and user agents are left out. Treat it like the usage report: keep it safe and delete it when you are done.
- Load it on the start page, alone when it has the AI usage report or together with the usage report CSV, or later on the Data page. The **GitHub data file** card on the Data page shows what the file holds and what could not be read.

If a request is refused with HTTP 403, check your role, the scopes in the table above and, with SAML single sign-on, that the token is authorized for the organization. If `gh` uses a token from `GH_TOKEN`, `GITHUB_TOKEN` or `GH_ENTERPRISE_TOKEN`, that token needs the scopes, because `gh auth refresh` cannot change it.

## What is in the app

| Page | What you get |
| --- | --- |
| **Overview** | Headline verdict, key figures with trend, usage over time (covered vs billed, by tier, vendor or product), included credits status, savings still possible, the Auto discount received, top recommendations, segment mix, top users and model groups. |
| **Usage and pool** | Usage over time, monthly pool burn-down with a projected month end, monthly table, cost drivers, SKU table, budget tracking and a plain explanation of how billing works. |
| **Budgets** | With the GitHub data file: every GitHub Copilot budget at GitHub, how full each one is, which run out this month at the current pace, users stopped or near their own limit, billed usage with no budget of its own and budget changes from the audit log. The Limit map shows every AI credit limit on one page, read from the bottom up in the order GitHub checks them: each user as a small glass in the group of the limit that holds them (their own budget, their cost center, the limit for each user or no limit), then the included credits, then the spending limits of cost centers, organizations and repositories, and the enterprise spending limit at the top. Each glass fills to the share used. Select a user, a group or a glass and every limit that holds it gets the number of its step while the rest fades, and the side panel explains each step. You can find a user, fade users by how full their limit is and play the month day by day. This is also what prints. |
| **Users** | Rankings by any metric, concentration (Lorenz curve and A/B/C classes), usage vs active days, users who need attention (runaway users, most to gain, fading, new), idle seats, a full sortable table with input, output, cache read and cache write tokens, and a **user drawer** with a profile, trend, models, Auto use, personal tips and, with the GitHub data file, the user's AI credit limit as their target. |
| **Segments** | User groups side by side (persona, usage tier, engagement, lifecycle, usage profile, Auto use), a cross-group matrix, pool flow (who lends and who borrows credits) and the rules behind each group with live thresholds. |
| **Models** | Model ranking, model group and vendor split, models over time, Auto vs hand-picked models, the Auto discount (paid price vs original price), a model table with tokens, right-sizing ideas, and the price card in use with its date. |
| **Efficiency** | Scorecard from best to worst, savings levers and their combined effect, tokens and cache reuse (read and write), cost per active day, role models and a playbook. |
| **Organization** | Any dimension (organization, cost center, repository, app) as ranking and treemap, showback and chargeback, users without a cost center. |
| **Patterns** | Daily timeline with unusual days marked, weekday profile, calendar heatmap, adoption curve, unusual days table, lapsed and fading users, month table. |
| **Recommendations** | Recommendations ordered by impact, with filters, a **what-if simulator** that recomputes cost live, seat actions, the playbook and official links for each step. |
| **Licenses** | Seats from your license list: who uses them, who does not, last activity, seats you can free up and what they cost, and seats with no usage in the report. |
| **Data** | File quality (rows read, kept, duplicates, bad cells), integrity checks, coverage, the license list, other GitHub exports you can add, a row explorer and a CSV download of the filtered rows. |
| **Settings** | Theme, colors (GitHub, high contrast, colorblind friendly), Arabic digits, monthly budget, every threshold behind the groups with live previews, seat list and extra seats, model price overrides, a live price check, import and export of settings, and a glossary. |
| **Methodology** | Every calculation in one searchable list: what it is, the formula, the inputs, an example, the limits and official links. The same text opens from the info button next to each number. |

The language button at the top switches between English and Arabic. Dropdowns are sorted A to Z, lists that rate something go from best to worst, and recommendations and tiles go from most to least impact.

### Filtering

The top bar and **Filters** drawer apply to every page at once and show a live "N of M rows match". Active filters appear as removable chips. Filters cover:

- **Time**: date range with presets, and weekdays.
- **Users, plans and organizations**: users, plan (by included credits), organizations, cost centers.
- **Models**: model, vendor, model group, and Auto vs hand-picked.
- **Products and sources**: product, SKU, repository, app client, source file.
- **Billing and rows**: covered vs billed, per-user vs repository-level, the cost of a single row, and a free-text search.
- **User groups**: persona, usage tier, engagement and lifecycle, usage profile, Auto use, traits, Pareto class and usage per user.

Charts and tables are clickable: clicking a bar, slice, cell or row narrows the whole app to it (drill-down), and the same filters are applied to exports.

### Exports

From **Export** in the top bar: an executive summary in Markdown (copy or download), per-user action list (CSV), recommendations (CSV), and print or save as PDF (light colors, navigation hidden, filters and data source printed at the top). Charts have a PNG download, tables have CSV download. Downloaded files are named `github-copilot-...`.

CSV downloads are UTF-8 with a byte order mark, so Excel opens them with the right characters. A text cell that starts with `=`, `+`, `-` or `@` gets a leading `'`, so a spreadsheet shows it as text instead of running it as a formula.

## Screenshots

All screenshots use the made-up sample report. No real data is shown. See [docs/SCREENSHOTS.md](docs/SCREENSHOTS.md) for every page.

| | |
| --- | --- |
| ![Overview: headline verdict, key figures and top actions](docs/screenshots/overview.png) | ![Recommendations ordered by impact, with savings and steps](docs/screenshots/recommendations.png) |
| **Overview** | **Recommendations** |
| ![Usage and pool: included credits burn-down per month](docs/screenshots/usage-and-pool.png) | ![Users: rankings, concentration and users who need attention](docs/screenshots/users.png) |
| **Usage and pool** | **Users** |
| ![Models: ranking, Auto use and the Auto discount](docs/screenshots/models.png) | ![Efficiency: scorecard, savings levers and cache reuse](docs/screenshots/efficiency.png) |
| **Models** | **Efficiency** |
| ![Overview in Arabic, right to left, in dark mode](docs/screenshots/overview-arabic-dark.png) | ![User drawer: profile, trend, models and personal tips](docs/screenshots/user-drawer.png) |
| **Arabic, dark mode** | **User details** |

## How the numbers work

**Included credits are shared.** Each GitHub Copilot seat comes with monthly included credits (Business 1,900 credits = 19 USD, Enterprise 3,900 credits = 39 USD) that go into one pool per billing entity and reset on the 1st (UTC). Usage is paid from the pool first; only what goes beyond the pool is billed. So:

- a user can use more than their own included credits without causing a charge if others leave credits unused;
- monthly cost = `max(seat fees, usage)`, because unused included credits are still paid for in the seat fee;
- using less saves cash only down to the pool size, and removing a seat saves only what the pool does not need.

The app separates **usage** (the gross amount in the report, already reduced by any Auto discount) from **billed** (usage charged on top of seats). Usage is not the price before Auto discounts, and billed usage alone is not the whole invoice.

**Pool size.** The file only knows the seats that appear in it. Without a license list, pool size is a lower bound, and the app says so. Load the license list (Licenses page) or add the seat list in **Settings** to include seats missing from the usage report. The estimate still depends on list completeness, seat plans, dates and billing scope. If covered usage exceeds what the visible seats can fund, pool size, unused credits and seat savings are hidden instead of guessed. The savings calculation can still use reported billed usage: it estimates the effect on that overage, not a guaranteed change to your invoice.

**Auto discount.** The export already includes any Auto reduction. The app compares eligible Auto rows with the official token prices to estimate the **original price** and **Auto discount received**. Each plan uses its measured rate when at least $1 of eligible Auto usage is available; otherwise it uses the assumed rate in Settings (10% by default). Both bases are labeled. Rates can differ between plans; the app does not guess why. The app also shows each user's share of usage through Auto and the possible discount on hand-picked usage. This is potential usage reduction, not guaranteed cash savings.

**License list.** Load the GitHub Copilot activity report, the seat assignments JSON, a seats CSV or a plain list of logins. The app matches seats to users without regard to case, and groups seats by last activity: active in the last 30 days, fading (30 to 89 days), inactive for 90 days or more, and seats with no recent activity date. Blank dates are not proof that a seat was never used, so those seats are shown for review and are not counted as seats to free or unused seats. A list older than 30 days is flagged as old. The values of idle and unused seats overlap, so they are never added up.

**Seat list in Settings.** Paste or upload one GitHub username per line, optionally followed by the plan (`alice,Enterprise` or `alice Business`). A plan can be `Business`, `Enterprise`, a number of credits (`3900` or `3900 credits`) or a dollar amount (`$39`). A seat without a plan uses the plan the report shows for that user, or the most common plan in the report if the user never appears in it. A header row is recognized and usernames are matched without regard to case.

**Filtered views.** The pool is shared by everyone, so it cannot be split by a filter. In a view narrowed by any row or group filter (a date range does not count), organization-wide pool and seat statements are hidden, and savings are shown as usage, with the cash that is already billed in that slice given as "at least".

**Every number explains itself.** Each figure has an info button with what it is, the formula, the inputs, a worked example, the limits and official links. The Methodology page lists all of them and can be searched.

### Classifications

All thresholds are editable in **Settings** (defaults in brackets) and take effect immediately.

| Group | Classes |
| --- | --- |
| **Usage tier** (usage as a share of the user's own included credits) | Minimal (below 10%), Light (10 to 40%), Core (40 to 100%), Power (100 to 300%), Runaway (300% and above). |
| **Engagement** (share of workdays active since the user started) | Daily (60% and above), Regular (30 to 60%), Occasional (10 to 30%), Rare; plus New (first seen in the last 14 days) and Lapsed (no activity for 7 or more days after earlier use). |
| **Persona** (one label per user, in this precedence) | Runaway users, New users, Lapsed users, Champions (regular and at least Light), Burst users (heavy use on few days), Steady light users, Dormant or low use. |
| **Usage profile** | Efficient (70% or more of usage on Versatile or Lightweight models), Balanced, Frontier-heavy (70% or more on Powerful models). |
| **Auto use** | Auto-first (50% or more of usage through Auto), Mixed (10 to 50%), Direct models (under 10%), Not enough data. |
| **Pareto class** | A: top users (first 80% of usage), B: middle (next 15%), C: long tail (last 5%). |
| **Traits** (can combine) | Long-context surcharges, Spiky usage, Low cache reuse, Rarely uses Auto, Many models, Growing fast, No cost center, Fading. |

### Recommendations and savings

Recommendations are generated from the data in scope: billed usage, pool exhaustion and projected overage, unused included credits, idle and downgradable seats, seats from the license list, runaway users, model right-sizing, Auto adoption, cache reuse, context size, long-context surcharges, unusual days, missing cost centers, budgets, new-user onboarding and data quality. They are ordered by impact. Each has severity, audience (management, admins, users), evidence, concrete actions, affected users, official GitHub and Microsoft links, a confidence level and an estimated saving.

Savings **overlap** (right-sizing a model and limiting a runaway user touch the same dollars), so recommendation figures are never added up. The **combined plan** on the Overview and the **simulator** on the Recommendations page apply the levers together, month by month, with the pool rules above, and give the one number that can be quoted.

Levers in the plan: right-size models, use Auto, cache discipline, leaner context, avoid long-context surcharges, limit runaway users, and the seat actions (reclaim idle seats, move Enterprise users who never needed it to Business, remove unused seats). An Enterprise to Business move is only suggested when the user's peak month stays within 80% of the Business included credits.

## Assumptions and limits

- Prices come from the built-in model price card (rates per million tokens, with long-context rates where they exist), taken from the GitHub Docs page [Models and pricing for GitHub Copilot](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/copilot-billing/models-and-pricing). The snapshot date is shown in the app. Settings has a **live price check** that reads the same page and shows any change; `npm run check:prices` does the same from the command line. Token-based figures are **estimates**: the export has no per-request tokens for every row and the app says "estimated" wherever it uses the card. You can override a model's rates in Settings. A model that is not on the card (a new release, for example) is listed as "Usage on models without a price"; its usage still counts everywhere, but token-based estimates leave it out until you enter its rates. No price is invented.
- The export contains AI credits only. **Code completions and next edit suggestions are not in it**, so a user who looks idle here may still use GitHub Copilot. Do not remove a seat on this evidence alone; check the license list's last activity first. The idle-seat recommendations say so.
- Projections follow the recent daily rate and show a range, not a promise. Only an incomplete last month is projected.
- Unusual days use a robust z-score (3.5 or more and at least 1.5 times the median) and need at least 10 days with usage.
- Trend figures (last 7 days vs the 7 before) need at least 14 days of data.
- Seat prices are public prices and do not include discounts or enterprise agreements.
- The GitHub data file is a snapshot of the day the script ran. Seats, members and budgets are as they were that day; billing, activity and seat changes cover the months you chose. Activity per user covers the last 28 days unless you add `--daily-metrics`.
- In Arabic, numbers use Arabic-Indic digits (١٢٣) by default, or Latin digits if you choose them in Settings; downloaded CSV files always use Latin digits. The column names of the original export stay in English. Product and vendor logos belong to their owners and are used only to name the product.

## Privacy

The file never leaves your machine. Settings (thresholds, seat list, budget), the theme, color set, language and Arabic digits are stored in `localStorage` under keys that start with `ghcu.`. To remove them all, use **Start fresh** in the sidebar and turn on **Also delete the settings saved in this browser** (or use **Delete saved settings** on the start page, or Settings > Data on this device); other sites are not touched. The data itself is kept in memory only and is gone when you reload or close the tab. The single-file build contains no external resources and makes no network requests unless you start the live price check. No real customer data is built into the app or used by the tests.

The collector scripts talk only to GitHub, with your own `gh` sign-in, and save one file on your computer. The app reads that file in your browser, like the usage report.

## Project layout

```
src/
  lib/                      pure TypeScript, no React, fully unit-tested
    csv/                    tokenizer, ingest (columnar store, dedupe, validation), worker + client
    analytics/              filters, aggregate, pool, users, taxonomy, Auto discount, levers,
                            simulator, seats, anomalies, series, recommendations, tips,
                            analyze (the one entry point)
    licenses/               license list import (activity report, seats JSON or CSV, login list)
    collection/             reading the GitHub data file of the collector scripts, and what it adds
    pricing/                model price card, model groups, live price check
    metrics/                how every number is calculated (docs per area, registry)
    demo/                   made-up data generator for the sample report, tests and gen:demo
    export/                 Markdown executive summary
    utils/                  dates (UTC days), formatting, downloads
    links.ts                official GitHub and Microsoft links
  i18n/                     translation core and the Arabic dictionaries (ar/)
  state/                    Zustand store, hash router, analysis provider, sample report loader, theme, print
  components/               UI kit (cards, KPIs, controls, drawers), charts (ECharts), icons, shell, landing
  pages/                    one file per page, each with its own folder of parts
tests/                      Vitest suites, made-up fixtures, guard tests (naming, i18n, metric docs, readable names)
scripts/                    demo data, price check and the collector scripts (collect.sh, collect.ps1)
docs/FEATURES.md            features and key values for admins
AGENTS.md                   guide for contributors and AI coding agents
.github/                    CI and GitHub Pages workflows, issue and pull request templates
```

Stack: Vite, React 19, TypeScript, Tailwind CSS v4, Apache ECharts 6, Zustand. The CSV is parsed into dictionary-encoded typed arrays in a worker, so large files stay responsive; filters are boolean masks over those arrays and every figure on screen is derived from one `analyze()` call. As a reference point, a synthetic file with 314,000 rows (69 MB, 670 users) is ingested in about half a second and fully re-analyzed in about 0.1 s (Node on a laptop; a filtered re-analysis takes about 20 ms).

## Tests

```bash
npm test
```

The suite covers the tokenizer and ingest (BOM, quoting, scientific notation, date formats, duplicates, bad cells), filters, aggregation, the pool and projection math, the Auto discount, seat plans, the license list, user classification, recommendations, the savings simulator and the exports. It uses made-up fixtures and generated data only. Guard tests check that the product is always called "GitHub Copilot", that every visible text has Arabic, that layouts use start/end instead of left/right, that every number on a page has a calculation doc, that the start page offers your own files first and one clearly labeled sample report, that the sample never reads a file or uses your saved license list, and that the theme keeps every text color readable.

When `gh`, `curl` and `openssl` are installed (on Linux), the collector scripts run against a made-up GitHub (`tests/collectorMock.ts`). The tests check what the scripts send and keep, that the app reads their file, that `collect.sh` works the same when piped into bash (as the command from GitHub does), and, when PowerShell is installed, that `collect.ps1` writes the same data as `collect.sh`, from a file or as a script block.

## Publishing the site

The site is built by [.github/workflows/pages.yml](.github/workflows/pages.yml) and published with GitHub Pages. Every push to `main` runs the checks (types, tests, both builds) and then deploys `dist/`. The build uses relative paths, so it works under any repository name. The deploy steps run only while the repository is public. Before the first deploy, open Settings, then Pages, and set the source to **GitHub Actions**. Do this once for each repository, also for a fork.

Each published build shows its version at the bottom of the sidebar and on the start page, for example "Version 1.0.0 · Build 42 · e3b1fb9 · 2026-10-28". "Build 42" opens the GitHub Actions run that made the site, and the short code opens the commit it was built from, so anyone can check that the site comes from this repository's public code. A build made on your own computer shows "Local build". The values come from the variables GitHub Actions sets for every run (`GITHUB_RUN_NUMBER`, `GITHUB_RUN_ID`, `GITHUB_SHA`), so the workflow needs no extra step. The version number comes from `package.json`.

## Contributing

Ideas and fixes are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first, and follow the [Code of Conduct](CODE_OF_CONDUCT.md). Please never post real usage reports, license lists, names or screenshots with real data in an issue or pull request. To report a security problem, follow [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE). Packages, fonts and icons that ship inside the app are listed with their licenses in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
