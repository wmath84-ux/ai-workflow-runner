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
