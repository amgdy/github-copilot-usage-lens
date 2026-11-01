# Contributing

Thank you for helping. This project, GitHub Copilot Usage Lens, analyzes the GitHub Copilot AI credits usage report. It runs only in the browser.

Read [AGENTS.md](AGENTS.md) first. It explains how the project is organized and the rules for every change.

## Never share real data

Usage reports and license lists contain names and other private details.

- Do not commit, attach or paste real reports, license lists, screenshots or logs. This includes a few rows.
- Tests and examples use invented data only. See `tests/fixtures.ts` and the sample generator in `src/lib/demo/generate.ts`.
- Git ignores `*.csv`, `seats*.json` and `demo-data/` on purpose.
- To get a safe sample file, run `npm run gen:demo`.

## Set up

You need Node 26. If you use nvm or fnm, run `nvm use` or `fnm use` in the project folder. Both read the `.nvmrc` file.

```bash
git clone https://github.com/amgdy/github-copilot-usage-lens.git
cd github-copilot-usage-lens
npm install
npm run dev
```

The app opens at http://localhost:5173.

### Run and debug in VS Code

Open the Run and Debug view and pick a setup from `.vscode/launch.json`:

- **App: start and debug in Chrome** or **in Edge** starts the development server and opens the app in that browser with the debugger on. The **server already running** setups only open the browser at http://localhost:5173.
- **Tests: current file** runs the test file that is open. **Tests: one test in current file** asks for part of a test name. **Tests: all** runs every test.
- **Script: make demo data**, **Script: check prices** and **Script: current file** run the scripts in `scripts/` with Node.

Breakpoints work in the TypeScript files, in the browser and in Node.

## Before you open a pull request

All three checks must pass:

```bash
npm run typecheck
npm test
npm run build
```

While you work, run single files, for example `npx vitest run tests/users.test.ts`. These guard tests are worth running often:

```bash
npx vitest run tests/naming.test.ts tests/i18n.test.ts tests/metric-docs.test.ts tests/readable-names.test.ts
```

## Project rules in short

- Write **GitHub Copilot**, never only "Copilot".
- Use very simple English: short sentences, everyday words, American spelling. No jargon, no exclamation marks, no emojis and no em dashes.
- Every new text needs an Arabic translation in `src/i18n/ar/`. The layout must work right to left.
- Every number needs a note that explains how it is calculated (`src/lib/metrics/docs/`).
- Name variables and functions with full words (`seatCount`, not `sc`). `tests/readable-names.test.ts` lists the few short names that are allowed.
- Put math in `src/lib/analytics/` as pure functions with tests.
- Use only official links from `src/lib/links.ts`.
- Follow the sorting rules in AGENTS.md for lists and dropdowns.
- Do not add network calls. The one exception is the price check that the user starts in Settings.

## Pull requests

- Keep each pull request small and about one thing.
- Describe what changed and why in plain words.
- Add or update tests.
- Check the page in English and Arabic, in light and dark mode, and on a narrow screen.

By contributing, you agree that your work is released under the [MIT License](LICENSE).
