# AI Workflow Runner

AI Workflow Runner is a desktop app foundation for running structured AI workflows locally. It combines Electron, React, Vite, Node.js, Playwright placeholders, SQLite, and local file-system storage.

## Current status

Command 6 adds parallel workflow groups, dependency validation, a run queue, concurrency limits, group metadata saving, and stronger checkpoint resume for paused grouped runs. Login remains manual and no CAPTCHA, rate-limit, stealth, or bypass automation is implemented.

## Commands

```bash
npm install
npm run dev
npm run build
npm start
```

Additional script aliases:

```bash
npm run electron:dev
npm run electron:build
```

## Testing the sample workflow

1. Start the app with `npm run dev`.
2. Open the Run Panel.
3. Use the preloaded sample workflow JSON or paste `workflows/sample-youtube-package.json`.
4. Click **Validate Workflow**.
5. Click **Run Workflow** to execute sequential mock steps.
6. Review outputs in the Run Panel and saved runs on the Results page.

Step outputs are written under `outputs/<safe-workflow-name>/<runId>/` as Markdown and JSON files. Successful runs also write `final-output.md`.


## Browser setup and manual login

1. Run `npm install`.
2. If Chromium is missing, run `npx playwright install chromium`.
3. Start the app with `npm run dev`.
4. Open the Browser Panel.
5. Click **Launch Browser**.
6. Open ChatGPT, Gemini, Claude, or Perplexity from the manual login cards.
7. Log in manually in the Chromium window.
8. Close the app and reopen it.
9. Launch the browser again; login sessions should remain saved because the persistent `browser-profile/` directory is reused.

Command 3 Status:

- Browser Manager added.
- Persistent Chromium profile added.
- Manual login support added.
- Tool tabs can be opened, focused, listed, and closed.
- Real prompt sending is not implemented yet.


## ChatGPT workflow test

1. Run `npm install` and `npx playwright install chromium` if Chromium is missing.
2. Start the app with `npm run dev`.
3. Open the Browser Panel and click **Launch Browser**.
4. Click **Open ChatGPT** and log in manually.
5. Open the Run Panel.
6. Paste `workflows/sample-chatgpt-basic.json` or load it from the workflow list.
7. Click **Validate Workflow** and then **Run Workflow**.
8. If the workflow pauses, complete the requested manual action in the browser, then click **Retry Paused Step**.
9. Completed ChatGPT outputs are saved under `outputs/<workflow-name>/<run-id>/` as step Markdown/JSON files and `final-output.md`.

Command 4 Status:

- ChatGPT connector implemented.
- Mock workflows still work.
- ChatGPT workflows can pause for manual intervention instead of failing.
- Paused ChatGPT steps can be retried.
- Gemini, Claude, and Perplexity remain unimplemented until later commands.


## Gemini, mixed, and generic workflow tests

1. Run the app with `npm run dev`.
2. Open the Browser Panel.
3. Launch the persistent browser.
4. Open Gemini and log in manually.
5. Run `workflows/sample-gemini-basic.json` from the Run Panel.
6. Run `workflows/sample-mixed-chatgpt-gemini.json` after confirming both ChatGPT and Gemini are logged in.
7. For generic testing, paste `workflows/sample-generic-basic.json`, update `url` and selector arrays for your target site, then run.
8. Check the `outputs/` folder and Results page for Markdown/JSON results.

Command 5 Status:

- Gemini connector added.
- Generic connector fallback added.
- Shared response waiting system added.
- Mixed ChatGPT + Gemini workflows supported.
- Claude and Perplexity are still placeholders.
- Parallel workflow execution is still not implemented.


## Parallel groups, dependencies, and queue tests

1. Run the app with `npm run dev`.
2. Open the Run Panel.
3. Test `workflows/sample-parallel-assets.json` first because it uses only the mock connector.
4. Test `workflows/sample-dependency-workflow.json` to verify `dependsOn` validation and output usage.
5. Test `workflows/sample-mixed-parallel-chatgpt-gemini.json` after confirming both ChatGPT and Gemini are logged in manually.
6. Add multiple workflows to the queue from the Run Panel and refresh the queue panel.
7. To test pause/retry inside a parallel group, log out of Gemini or close the Gemini tab before running the mixed parallel sample, then retry after manual login.
8. Check `outputs/<workflow>/<run-id>/groups/<group-id>.json`, step files, final output, and the Results page.

Command 6 Status:

- Parallel workflow groups added.
- Dependency validation added.
- Run queue added.
- Stronger checkpoint resume added.
- Parallel groups support max concurrency.
- Paused workflow retry works inside parallel groups.
- Claude and Perplexity are still placeholders.

## Folder structure

- `app/main.js` — Electron main process and lifecycle handling.
- `app/preload.js` — secure context bridge exposed to the React dashboard.
- `app/dashboard/` — React starter UI with sidebar navigation, validation, run panel, browser panel, and result pages.
- `app/ipc/` — IPC handlers for settings, workflows, runs, and results.
- `app/storage/` — SQLite schema and helper modules for workflows, runs, checkpoints, and results.
- `app/runner/` — workflow validator, variable resolver, sequential engine, checkpoint manager, retry wrapper, mock runner, and output saver.
- `app/browser/` — Playwright persistent Chromium browser manager, profile utilities, tab manager, and browser state helpers.
- `app/connectors/` — connector registry, ChatGPT/Gemini/Generic browser connectors, selector helpers, shared response waiter, and placeholders for future AI web connectors.
- `app/shared/` — shared constants, path helpers, and logging.
- `workflows/` — sample workflow JSON files.
- `outputs/` — local workflow output directory; runtime files are ignored by Git.
- `browser-profile/` — local browser profile directory; runtime files are ignored by Git.

## Next planned parts

1. Run history viewer.
2. Result viewer.
3. Export system.
4. Logs UI.
5. Workflow library UI.

## Command 7 Status

- Workflow Library UI added for bundled samples, saved SQLite workflows, JSON import, templates, preview, duplicate, delete, and copy actions.
- Run History and Result Viewer pages added for searching runs, inspecting step outputs, and viewing final/partial outputs.
- Markdown, TXT, JSON, and ZIP-style export actions added under `exports/<workflow-name>/<run-id>/`.
- Logs system added with SQLite-backed records and a dashboard Logs page.
- Safe file opening added for approved project folders only: `outputs/`, `exports/`, `workflows/`, and `browser-profile/`.
- Search, filter, and sort controls added for run and workflow browsing.

### Command 7 Testing Flow

1. Run `npm install` if dependencies are not installed.
2. Run `npm run dev`.
3. Open **Workflow Library** and preview or import a workflow JSON.
4. Open **Run Panel** and run a mock workflow first, such as `workflows/sample-parallel-assets.json`.
5. Open **Run History** and select the latest run.
6. Open **Result Viewer** to inspect step outputs, raw JSON, and available final output text.
7. Use the export buttons to create Markdown, TXT, JSON, or ZIP-style exports.
8. Use Settings or Result Viewer actions to open approved output/export folders.
9. Open **Logs** to inspect workflow, browser, connector, export, and file-opening events.

### Command 7 Known Limitations

- ZIP export currently creates a portable JSON bundle with a `.zip` filename unless a true ZIP archiver package is added later.
- Workflow editing intentionally uses a plain textarea; richer editor features are planned for a later command.
- File opening remains restricted to approved local project folders for safety.

## Command 8 Status

- Workflow templates added with a template gallery, built-in template seeding, template duplication, favorites, and template-to-workflow creation.
- Prompt library added with default prompt seeding, search, favorites, duplicate/delete, prompt variable detection, and prompt copy/insert support.
- Input form builder and dynamic run form added so workflows/templates can be run from form fields instead of only raw JSON.
- Reusable variables system added with scoped variables, safe secret masking in UI, token copying, and variable preview support.
- Variable picker and prompt preview panels added for workflow/prompt editing.
- Workflow editor now supports JSON mode and visual step mode with simple add/edit/reorder/delete step controls and parallel-group insertion.

### Command 8 Testing Flow

1. Run `npm install` if dependencies are not installed.
2. Run `npm run dev`.
3. Open **Prompt Library**, seed default prompts, and create a prompt with variables such as `{{topic}}` and `{{audience}}`.
4. Open **Workflow Templates**, seed default templates, choose a template, fill the dynamic input form, and create a workflow.
5. Open **Variables**, create a reusable variable, and copy its `{{variable_name}}` token.
6. Open **Workflow Editor**, switch between JSON and visual step mode, insert prompts/variables, validate, and run.
7. Open **Run Panel**, select a saved workflow or template, fill the dynamic form, optionally save a preset, and run or queue the workflow.
8. Check Run History, Results, Exports, and Logs to confirm existing features still work.

### Command 8 Known Limitations

- Visual editing is intentionally simple and uses buttons instead of drag-and-drop.
- Secret variables are masked in the dashboard and excluded from reusable variable context by default, but deeper export-confirmation controls are planned for a future hardening command.
- Template and prompt editing use lightweight forms and textareas rather than a full code editor.

## Command 9 Status

- Hardened settings system added with nested defaults, validation, merge/sanitize helpers, import/export, reset all, and reset-section support.
- Settings validation and defaults added for app, browser, workflow, outputs, logs, backups, and safety sections.
- Database and full backup system added under `backups/`, with backup manifests and backup listing/deletion support.
- Restore system added with backup validation and pre-restore backup creation before database/workflow restore operations.
- Workflow package import/export added with `.aiworkflowpkg` JSON package bundles, package manifests, workflow JSON export, and secret-variable exclusion by default.
- Migration manager added with an idempotent registry and migration status tracking table.
- Startup health checks added after folder initialization, database initialization, migrations, and default prompt/template seeding.
- Data integrity checker and basic repair tools added for stuck runs, missing folders, broken settings, queue state, and result index rebuild placeholders.
- App Status, Backup & Restore, and Diagnostics dashboard pages added.
- Diagnostics export added under `diagnostics/` with masked logs, health results, table counts, and app status metadata.
- Error boundary and notification toast components added for safer UI failure handling and user feedback.

### Command 9 Testing Flow

1. Run `npm install` if dependencies are not installed.
2. Run `npm run dev`.
3. Open **Settings**, change settings, save, reset one section, export settings JSON, and reset all settings if needed.
4. Open **Backup & Restore**, create a database backup, create a full backup, validate a backup, and test restore only after confirming you want to replace data.
5. Open **Workflow Library**, export a workflow package, validate/import a package, and confirm imported workflows appear in the library.
6. Open **App Status**, run quick health check, run deep health check, check data integrity, and run safe repair actions.
7. Open **Diagnostics**, export diagnostics, and inspect the generated diagnostics bundle path.
8. Confirm existing workflows, prompt library, templates, run history, results, exports, and logs still work.

### Command 9 Known Limitations

- Backup, diagnostics, and workflow package files are JSON bundle files with `.zip`/`.aiworkflowpkg`-style extensions; true compressed archive packaging can be added during production packaging polish.
- Repair tools are intentionally conservative and do not delete outputs or user data automatically.
- Restore supports safe database/workflow restore paths first; richer merge conflict UI can be expanded later.

## Current App Status

- Personal desktop AI workflow automation app.
- Uses Electron + React + Node.js + Playwright + SQLite.
- Supports persistent browser profile.
- Supports manual login to AI websites.
- Supports mock, ChatGPT, Gemini, and Generic connectors.
- Supports sequential and parallel workflows.
- Supports workflow templates, prompt library, variables, run history, exports, backups, diagnostics, and health checks.

## Command 10 Status

- First-run onboarding and setup checklist added.
- Connector readiness checks added for Mock, ChatGPT, Gemini, and Generic.
- Run preflight checks added before workflow execution.
- Command palette and keyboard shortcut registry added.
- Help page, user guide, troubleshooting guide, and release checklist added.
- Production packaging metadata and lightweight QA checks added.

## Install

```bash
npm install
npx playwright install chromium
```

## Run in development

```bash
npm run dev
```

## Build production app

```bash
npm run build
npm run qa:check
```

## First setup

Open Onboarding / Setup Guide, confirm folders, launch the browser, manually login to ChatGPT/Gemini if needed, run connector readiness checks, and run the mock sample first.

## Manual login setup

Use Browser Panel to launch the persistent browser and open ChatGPT or Gemini. Complete login and verification manually in the visible browser. The app never automates login, CAPTCHA, verification, or rate-limit bypasses.

## Running first workflow

Open Run Panel, paste or select a workflow, fill inputs, validate, run preflight checks, and then Run Now or Add To Queue.

## Creating workflows

Use Workflow Editor, Workflow Library, or Workflow Templates. Validate JSON and variable references before running.

## Using templates

Open Workflow Templates, choose a template, fill the dynamic input form, preview the workflow, then save or run it.

## Using prompt library

Open Prompt Library to create reusable prompts with tags, categories, tool hints, and `{{variables}}`.

## Using variables

Variables resolve from step outputs, workflow inputs, reusable variables, and system variables. Preview resolution before running.

## Parallel workflows

Use `mode: "parallel"` groups with child single steps. Child steps should not reference sibling outputs from the same group.

## Results and exports

Use Run History and Results to inspect outputs and export Markdown, TXT, JSON, or ZIP packages.

## Backups

Use Backup & Restore for database/full backups and validate backups before restore. Browser profile is not included by default.

## Troubleshooting

See `TROUBLESHOOTING.md` from Help or the project root.

## Safety boundaries

No Claude connector, no Perplexity connector, no API-key mode, no login automation, no CAPTCHA solving, no rate-limit bypass, and no hidden/stealth browser automation.

## Known limitations

- Claude connector not implemented yet.
- Perplexity connector not implemented yet.
- No API-key mode.
- No login automation.
- No CAPTCHA solving.
- No rate-limit bypass.
- Website UI changes may require connector selector updates.
