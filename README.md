# AI Workflow Runner

AI Workflow Runner is a desktop app foundation for running structured AI workflows locally. It combines Electron, React, Vite, Node.js, Playwright placeholders, SQLite, and local file-system storage.

## Current status

Command 3 adds the Playwright Browser Manager, a persistent Chromium profile, manual login support, browser status, and tool tab controls. Workflow execution still uses the mock runner; real prompt sending and answer extraction are not implemented yet.

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

## Folder structure

- `app/main.js` — Electron main process and lifecycle handling.
- `app/preload.js` — secure context bridge exposed to the React dashboard.
- `app/dashboard/` — React starter UI with sidebar navigation, validation, run panel, browser panel, and result pages.
- `app/ipc/` — IPC handlers for settings, workflows, runs, and results.
- `app/storage/` — SQLite schema and helper modules for workflows, runs, checkpoints, and results.
- `app/runner/` — workflow validator, variable resolver, sequential engine, checkpoint manager, retry wrapper, mock runner, and output saver.
- `app/browser/` — Playwright persistent Chromium browser manager, profile utilities, tab manager, and browser state helpers.
- `app/connectors/` — placeholder connector contracts for future AI web connectors.
- `app/shared/` — shared constants, path helpers, and logging.
- `workflows/` — sample workflow JSON files.
- `outputs/` — local workflow output directory; runtime files are ignored by Git.
- `browser-profile/` — local browser profile directory; runtime files are ignored by Git.

## Next planned parts

1. ChatGPT connector prompt fill.
2. ChatGPT prompt send.
3. Response wait and extraction.
4. Connector-safe error handling.
5. Full checkpoint resume execution.
