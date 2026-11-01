# GitHub Copilot Usage Lens: features and value for admins

GitHub Copilot Usage Lens turns the GitHub Copilot usage report (a CSV file from GitHub billing) into clear pages that answer one question: **are we getting good value from GitHub Copilot, and what should we change?**

It is written for managers and admins, not only for technical people. Every number has an info button that explains, in plain words, how it was calculated.

Your files never leave your computer. The app runs in your browser and does not send your data anywhere.

![Overview page of the sample report](screenshots/overview.png)

## The key values for admins

Listed from the most valuable to the least.

| # | What you get | Why it matters |
| --- | --- | --- |
| 1 | **Usage, split into "covered" and "billed"** | The app shows how much usage was covered by included credits and how much was billed as extra. Seat subscriptions are separate; the usage report is not a full invoice. |
| 2 | **Seats to review** | Load the license list from GitHub to find seats with no usage in the report, check last activity, and estimate their monthly value. Confirm the person's needs before removing a seat. |
| 3 | **Early warning on high usage** | The app projects the month end, shows when the included credits will run out, tracks your budget, and lists runaway users (people who use far more than their own included credits). You can act before the bill arrives. |
| 4 | **More exact with data from GitHub** | Run the collector script from this repository to add your real seats and seat types, your budgets at GitHub, the whole bill, activity with code completions and seat changes. The app makes the command for you, ready to copy. It gets the script from GitHub, so there is nothing to download. For an enterprise the file has the AI usage report too, so it is the only file you need. Pool, budget and seat findings get more exact, people who only use code completions are no longer called idle, and five more recommendations can appear. |
| 5 | **Auto model selection and its discount** | GitHub Copilot gives a discount when people let Auto pick the model. The app shows who uses Auto and who picks models by hand, what the discount saved you (paid price vs original price), and how much more you could save. |
| 6 | **The right model for the job** | See which models cost the most and where to try a lighter model. Check the quality of its work before changing a team's default. |
| 7 | **One combined savings estimate** | Savings ideas often overlap. The app does not simply add them up. A combined plan and a what-if simulator apply them together, month by month, using the pool and settings you chose. |
| 8 | **Clear recommendations, most impact first** | Each recommendation says what is happening, the evidence, who should act (management, admins or users), the steps, the expected saving, how sure the app is, and official GitHub and Microsoft links to help you do it. |
| 9 | **Help each person get more value** | Users are grouped by how much and how often they use GitHub Copilot (for example Champions, New users, Fading users, Runaway users). Each user has a profile with personal tips, so team leads know who needs training and who can coach others. |
| 10 | **Fair cost sharing** | Split usage and billed cost by organization, cost center, repository or app. Find users without a cost center. Export the numbers for chargeback. |
| 11 | **Tokens and cache, per user** | See input, output, cache read and cache write tokens for each user and model. Good cache reuse makes the same work cheaper; the app shows who reuses well and who does not. |
| 12 | **Trends and unusual days** | A daily timeline flags unusual spikes, shows weekday habits, new users joining, and users who stopped. |
| 13 | **Numbers you can trust** | Every figure has its formula, inputs, an example and its limits, in the app and on the Methodology page. Model prices come from the official GitHub Docs page, with the date of the snapshot, and can be checked live. |
| 14 | **English and Arabic** | The whole app works in English (the main language) and Arabic, with a right-to-left layout. Switch with the language button at the top. |
| 15 | **Private and simple to share** | No server and no upload. The app can be built as one HTML file that works offline. |
| 16 | **Try it first with a sample report** | One click opens a full report made from invented people and numbers, so you can see every page before you load your own file. The sample has 140 people over three months, with logins in the GitHub Enterprise Managed Users style (`KofiIto_nwind`), and it shows every kind of recommendation. It also has made-up GitHub data, so the Budgets page has something to show. Every page says it is a sample, and your saved license list is never mixed in. |

## The pages

| Page | What you see | What it helps you decide |
| --- | --- | --- |
| **Overview** | A short verdict, the key numbers with their trend, usage over time, the state of the included credits, savings you can still make, the top recommendations and top users. | Where to look first. |
| **Usage and pool** | Usage by day and month, how fast the included credits are used, a month-end projection, budget tracking and a plain explanation of how billing works. With the GitHub data file: the whole GitHub Copilot bill and a short budget summary that links to the Budgets page. | Whether you will pay extra this month, and how much. |
| **Budgets** | With the GitHub data file: a Limit map of every AI credit limit, read from the bottom up in the order GitHub checks them (each user as a glass in the group of the limit that holds them, then the included credits, the spending limits of cost centers, organizations and repositories, and the enterprise at the top; select anything to number every limit that holds it in the order GitHub checks them, move the line between steps up and fade the rest, find a user, fade users by how full their limit is and play the month day by day), every GitHub Copilot budget, how full it is, which run out this month at the current pace, users stopped or near their limit and which limit holds each one, billed usage with no budget and recent budget changes. | Which budgets to raise, add or watch before people are stopped, and where a cost center or user limit is missing. |
| **Users** | Rankings by any number, how concentrated the usage is, users who need attention, a full table and a profile for each user with personal tips. With the GitHub data file, the profile shows the AI credit limit that holds the user (own budget, cost center limit or limit for each user) as their target, with the month pace and the day they reach it. | Who needs help, training, a limit or a different seat. |
| **Segments** | Users grouped by persona, usage tier, engagement, lifecycle, usage profile and Auto use, with the rules behind each group and live thresholds. | Which groups to target with training or policies. |
| **Models** | Model ranking, cost by model group and vendor, Auto vs manual choice, the Auto discount (paid price vs original price), right-sizing ideas and the price card in use. | Which models to allow, and where to push Auto. |
| **Efficiency** | A scorecard, the savings levers and their combined effect, tokens and cache use, cost per active day, and role models to learn from. | How to get the same work done for less. |
| **Organization** | Usage and billed cost by organization, cost center, repository, app or team from the license list, with chargeback tables and seat coverage. | Who pays for what. |
| **Patterns** | Daily timeline with unusual days marked, weekday habits, a calendar view, adoption over time, and users who stopped. | Whether usage is healthy and growing. |
| **Recommendations** | All recommendations, most impact first, with filters, a what-if simulator and seat actions. | What to do next, in what order. |
| **Licenses** | Seat coverage, last activity, pending cancellations and seats with no usage in the report. With the GitHub data file: seat totals per organization, members without a seat, activity at GitHub (code completions included) and the seats added and removed each month. | Which seats to review with their owners before removing or moving them. |
| **Data** | File quality, what each file adds, a row explorer, and other GitHub exports you can add for better results. With the GitHub data file: what it holds, what could not be read, and a month-by-month check of the usage report against GitHub billing. | Whether the numbers are complete. |
| **Settings** | Theme, colors (GitHub, high contrast or colorblind friendly), Arabic digits, budget, every threshold behind the groups, the seat list, model price overrides and a live price check. | How the app should judge your data. |
| **Methodology** | Every calculation in one place, searchable. | How a number was made. |

Filters at the top apply to every page: dates, weekdays, users, plans, organizations, cost centers, models, vendors, Auto or manual, products, repositories, covered or billed, and user groups. Clicking a bar, slice or row narrows the whole app to it. Every chart and table can be downloaded.

## Files you can load

The start page lists the first three files in this order, with the file types each one takes. The logo in the sidebar and the mobile menu leads back to it.

| File | Needed? | Where to get it | What it adds |
| --- | --- | --- | --- |
| **GitHub Copilot usage report** (CSV) | Yes, unless the GitHub data file has it | In GitHub, open Billing and licensing, then the AI usage page, and choose Get usage report. GitHub emails you a link to the file. | All usage, cost, model, user and token numbers. |
| **License list** (seat assignments) | Recommended. The activity report CSV is the easiest choice for most admins. | Download the GitHub Copilot activity report in GitHub's organization or enterprise settings. Use the REST API JSON as an advanced option for plans, seat start dates, pending cancellations or repeatable exports. | Better included-credit estimates and activity context for seat review. The activity report has no plan or seat start date. Check its scope and seat count against GitHub; the app cannot identify seats omitted from a CSV. |
| **GitHub data file** (NDJSON, from the collector script) | Optional. The most complete choice. | Run `scripts/collect.ps1` (Windows) or `scripts/collect.sh` (macOS and Linux) from this repository. The start page and the Data page make the command for you; it gets the script from GitHub, so there is nothing to download. See [Collect more data from GitHub](../README.md#collect-more-data-from-github). | Your seats and seat types (they fill the license list), budgets at GitHub, the whole bill, activity with code completions, seat changes and teams. For an enterprise, the AI usage report too, so no other file is needed. |
| **Settings file** (JSON) | Optional | Exported from this app's Settings page. | Your budget, thresholds, seat list and price overrides, shared with your team. Settings are saved in this browser; **Delete saved settings** removes them all in one click. **Start fresh** closes every loaded file and can delete the saved settings in the same step. |

No file yet? Choose **View a sample report** on the start page to look around with invented data first. Each month of the sample shows a different side: pick the first month to see unused included credits, the second for billed overage and budgets, and the third for a healthy month. Filter on the organization `northwind-labs` to see one person using most of the credits.

## Other GitHub exports that improve the analysis

Listed by how much they add. The Data page shows the same list with links.

1. **GitHub Copilot activity report** (CSV): last activity, sign-in date and last surface per user. The Licenses page uses it to flag seats for review, including people who may use code completions (which the usage report does not include). It has no plan or seat start date. Activity is limited to 90 days, so a blank date can mean a new seat or activity older than 90 days.
2. **GitHub data file** (from the collector script): seats with their plans, budgets, the whole bill, activity per user with code completions, seat changes from the audit log, members and teams, and for an enterprise the AI usage report, all in one file. The app reads all of it except cost centers, which the usage report already names for each row. See [Collect more data from GitHub](../README.md#collect-more-data-from-github).
3. **Seat assignments** (REST API, JSON): the advanced option for plans, seat start dates and pending cancellations. It can help check the activity report's seat count, but its activity dates have the same 90-day limit. Include every page and check the scope before using seat-cost estimates.

The app cannot tell whether a CSV omitted licensed users. Compare its scope and seat count with the assigned seats shown in GitHub before acting. A blank activity date is not proof that someone never used GitHub Copilot.

## How the numbers are calculated

- **1 AI credit = 0.01 USD.** Usage = covered by included credits + billed.
- **Included credits are shared.** Each seat adds its monthly included credits (Business 19 USD, Enterprise 39 USD) to one shared pool. Usage is paid from the pool first. Only what goes beyond the pool is billed.
- **Pool size.** The usage report only lists users who used something. If covered usage exceeds what the visible seats can fund, the app hides uncertain pool and seat figures. A complete license list improves the estimate (the GitHub data file fills it in for you), but a current list is not proof of past seat counts or your contract terms.
- **Auto discount.** Requests that Auto model selection handles cost less. The app shows the original price (what the same requests would cost without the discount), the price paid, and the difference.
- **Savings.** Separate savings overlap, so they are never added up. The combined plan and the simulator give the one total.
- **Prices.** Model prices come from the GitHub Docs page "Models and pricing" (the date of the snapshot is shown). Models without a price are listed, never guessed.

Open the info button next to any number, or the Methodology page, for the full formula, inputs, an example and the limits.

## Limits to keep in mind

- The usage report has AI credits only. **Code completions and next edit suggestions are not in it.** A user who looks idle may still use GitHub Copilot every day. Check the license list's last activity before you remove a seat.
- Projections follow the recent daily rate. They are a guide, not a promise.
- Seat prices are the public prices. Your contract may differ.
- The GitHub data file is a snapshot of the day the script ran. Seats, members and budgets are as they were that day.
- In Arabic, numbers show with Arabic-Indic digits (١٢٣) by default, or Latin digits if you choose them in Settings. Downloaded CSV files always use Latin digits. Column names of the original export stay in English.

## Where the site comes from

The sidebar and the start page show a "Source code" link to the GitHub repository, the version and the GitHub Actions build number. The build number opens the run that published the site, and the short commit code opens the exact code it was built from. Admins can check that the site is built from the public repository and nothing else.

## Official links

- [GitHub Copilot billing](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/product-billing/github-copilot-billing) (GitHub Docs)
- [Usage-based billing for organizations and enterprises](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/billing-and-usage/organizations-and-enterprises/billing) (GitHub Docs)
- [Managing your company's spending on GitHub Copilot](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/manage-and-track-spending/manage-company-spending) (GitHub Docs)
- [Budgets for usage-based billing](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/billing-and-usage/organizations-and-enterprises/budgets) (GitHub Docs)
- [Models and pricing for GitHub Copilot](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/copilot-billing/models-and-pricing) (GitHub Docs)
- [About GitHub Copilot auto model selection](https://docs.github.com/en/enterprise-cloud@latest/copilot/concepts/models/auto-model-selection) (GitHub Docs)
- [A guide to deciding what AI model to use in GitHub Copilot](https://github.blog/ai-and-ml/github-copilot/a-guide-to-deciding-what-ai-model-to-use-in-github-copilot/) (GitHub Blog)
- [Downloading a GitHub Copilot activity report](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/administer-copilot/download-activity-report) (GitHub Docs)
- [REST API endpoints for GitHub Copilot user management](https://docs.github.com/en/rest/copilot/copilot-user-management) (GitHub Docs)
- [Cost centers](https://docs.github.com/en/enterprise-cloud@latest/billing/concepts/cost-centers) (GitHub Docs)
- [Managing policies and features for GitHub Copilot in your organization](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/administer-copilot/manage-for-organization/manage-policies) (GitHub Docs)
- [Best practices for using GitHub Copilot](https://docs.github.com/en/enterprise-cloud@latest/copilot/get-started/best-practices) (GitHub Docs)
- [GitHub Copilot Fundamentals, part 1](https://learn.microsoft.com/en-us/training/paths/copilot/) (Microsoft Learn)
- [GitHub Copilot Fundamentals, part 2](https://learn.microsoft.com/en-us/training/paths/gh-copilot-2/) (Microsoft Learn)
- [Introduction to prompt engineering with GitHub Copilot](https://learn.microsoft.com/en-us/training/modules/introduction-prompt-engineering-with-github-copilot/) (Microsoft Learn)
