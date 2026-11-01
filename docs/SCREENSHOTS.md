# GitHub Copilot Usage Lens: screenshots

Every screenshot uses the made-up sample report (choose **View a sample report** on the start page). The people, organizations and numbers are invented. No real data is shown.

Pages, in the order of the side menu:

- [Start page](#start-page)
- [Overview](#overview)
- [Usage and pool](#usage-and-pool)
- [Budgets](#budgets)
- [Recommendations](#recommendations)
- [Licenses](#licenses)
- [Users](#users)
- [User details](#user-details)
- [Segments](#segments)
- [Models](#models)
- [Efficiency](#efficiency)
- [Organization](#organization)
- [Patterns](#patterns)
- [Data](#data)
- [Settings](#settings)
- [Methodology](#methodology)
- [Arabic, dark mode](#arabic-dark-mode)

## Start page

Drop one or more usage report files, or open the sample report. It also says how to download the report from GitHub. The file is read in the browser tab and is never uploaded.

![Start page with the file drop area and the sample report button](screenshots/start-page.png)

## Overview

The short answer for managers. It shows a headline verdict, the key figures with trends (usage, billed, included credits used, savings potential, Auto share, active users) and the top actions to take next.

![Overview page: headline verdict, key figures and top actions](screenshots/overview.png)

## Usage and pool

How the included credits are spent. It shows usage over time, how fast each month's pool runs out, a projected month end, budget tracking and a plain explanation of how billing works.

![Usage and pool page: included credits burn-down per month](screenshots/usage-and-pool.png)

## Budgets

The Limit map draws the enterprise limit as a frame around all spending. Each row inside is a spending limit, a cost center or a seat organization, with its room left and a square for each person it holds. A square fills to the share of that person's user limit used. Icons mark where each limit is set: a globe for the enterprise and the universal default, a building for an organization, a briefcase for a cost center and a person for an individual limit. The strip under the frame adds up the limits inside. Select a square to see the user's effective limit, the defaults it replaces and the spending limits that also apply. Missing paid usage policies and enterprise exclusions are clearly noted.

![Limit map: the enterprise limit as a frame, with a row for each spending limit and a square for each person](screenshots/budgets.png)

![Selected user with an individual limit and replaced defaults](screenshots/budgets-selected.png)

## Recommendations

What to change, ordered by impact. Each recommendation has the evidence, the steps, who it affects, an estimated saving and official links. The what-if simulator works out the combined saving, because savings from separate recommendations overlap.

![Recommendations page ordered by impact, with savings and steps](screenshots/recommendations.png)

## Licenses

Seats from your GitHub Copilot license list: who uses them, who does not, last activity, and seats you can free up. With the sample report the license list is not used, so real names never mix with invented data.

![Licenses page with the note that license lists are not used with the sample](screenshots/licenses.png)

## Users

Who uses what. It ranks users by any metric and shows how concentrated usage is. It lists users who need attention (runaway, fading or new) and has a full table with tokens, including cache read and cache write.

![Users page: rankings, concentration and users who need attention](screenshots/users.png)

## User details

Click a user to open their details: groups and traits, usage, billed amount, included credits used, daily usage, models and Auto use, and personal tips.

![User drawer with profile, daily usage and models](screenshots/user-drawer.png)

## Segments

Users in groups, compared side by side: persona, usage tier, engagement, usage profile, Pareto class, Auto use and traits. Each group shows its share of users and usage and the savings it could bring.

![Segments page comparing groups by persona](screenshots/segments.png)

## Models

Which models cost the most. It shows a model ranking, the split by model group and vendor, Auto compared with hand-picked models, the Auto discount, right-sizing ideas and the price card in use.

![Models page: ranking, Auto use and the Auto discount](screenshots/models.png)

## Efficiency

How well GitHub Copilot is used. It has a scorecard from best to worst, savings levers and their combined effect, tokens and cache reuse, and cost per active day.

![Efficiency page: scorecard, savings levers and cache reuse](screenshots/efficiency.png)

## Organization

Which parts of the business create the usage and the bill. View by organization, cost center, repository, application or product, as a ranking and a treemap. Use it for showback and chargeback.

![Organization page: usage by cost center as bars and a treemap](screenshots/organization.png)

## Patterns

When GitHub Copilot is used. It shows a daily timeline with unusual days marked, the busiest weekday, the weekend share, a calendar view and the adoption curve.

![Patterns page: daily usage with an unusual day marked](screenshots/patterns.png)

## Data

What was loaded and how clean it is: rows read and kept, duplicates, users, models, organizations and cost centers. You can add a license list here and download the filtered rows as CSV.

![Data page: file quality and coverage](screenshots/data.png)

## Settings

Your budget, license list, the thresholds behind the user groups, model price overrides, appearance (theme, colors and Arabic digits) and a glossary. Settings stay in this browser.

![Settings page with the budget section open](screenshots/settings.png)

## Methodology

Every calculation in one searchable list: what it means, the formula, the columns it uses and its limits. The same text opens from the info button next to each number.

![Methodology page listing formulas](screenshots/methodology.png)

## Arabic, dark mode

The whole app is also in Arabic, right to left, in light and dark mode. Arabic shows Arabic-Indic digits by default.

![Overview page in Arabic, right to left, in dark mode](screenshots/overview-arabic-dark.png)
