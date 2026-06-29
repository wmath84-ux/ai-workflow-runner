# AI Workflow Runner

AI Workflow Runner is a desktop app foundation for running structured AI workflows locally. It combines Electron, React, Vite, Node.js, Playwright placeholders, SQLite, and local file-system storage.

## Current status

Command 4 adds the first real browser connector for ChatGPT: prompt fill, send, response wait, answer extraction, workflow pause on manual intervention, and retry for paused steps. Login remains manual and no CAPTCHA, rate-limit, or bypass automation is implemented.

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

## Folder structure

- `app/main.js` — Electron main process and lifecycle handling.
- `app/preload.js` — secure context bridge exposed to the React dashboard.
- `app/dashboard/` — React starter UI with sidebar navigation, validation, run panel, browser panel, and result pages.
- `app/ipc/` — IPC handlers for settings, workflows, runs, and results.
- `app/storage/` — SQLite schema and helper modules for workflows, runs, checkpoints, and results.
- `app/runner/` — workflow validator, variable resolver, sequential engine, checkpoint manager, retry wrapper, mock runner, and output saver.
- `app/browser/` — Playwright persistent Chromium browser manager, profile utilities, tab manager, and browser state helpers.
- `app/connectors/` — connector registry, ChatGPT browser connector, selector helpers, and placeholders for future AI web connectors.
- `app/shared/` — shared constants, path helpers, and logging.
- `workflows/` — sample workflow JSON files.
- `outputs/` — local workflow output directory; runtime files are ignored by Git.
- `browser-profile/` — local browser profile directory; runtime files are ignored by Git.

## Next planned parts

1. Gemini connector.
2. Generic connector fallback.
3. Stronger response completion detection.
4. Connector-safe error handling improvements.
5. Full checkpoint resume execution.
