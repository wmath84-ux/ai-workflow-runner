# AI Workflow Runner

AI Workflow Runner is a desktop app foundation for running structured AI workflows locally. It combines Electron, React, Vite, Node.js, Playwright placeholders, SQLite, and local file-system storage.

## Current status

Command 2 adds the first real internal workflow layer: workflow JSON validation, variable injection, sequential mock step execution, step output saving, run records, and checkpoint persistence. The project still does **not** implement real ChatGPT, Gemini, Claude, Perplexity, browser automation, login, captcha, rate-limit, or bypass logic.

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

## Folder structure

- `app/main.js` — Electron main process and lifecycle handling.
- `app/preload.js` — secure context bridge exposed to the React dashboard.
- `app/dashboard/` — React starter UI with sidebar navigation, validation, run panel, and result pages.
- `app/ipc/` — IPC handlers for settings, workflows, runs, and results.
- `app/storage/` — SQLite schema and helper modules for workflows, runs, checkpoints, and results.
- `app/runner/` — workflow validator, variable resolver, sequential engine, checkpoint manager, retry wrapper, mock runner, and output saver.
- `app/browser/` — placeholder Playwright browser/session modules.
- `app/connectors/` — placeholder connector contracts for future AI web connectors.
- `app/shared/` — shared constants, path helpers, and logging.
- `workflows/` — sample workflow JSON files.
- `outputs/` — local workflow output directory; runtime files are ignored by Git.
- `browser-profile/` — local browser profile directory; runtime files are ignored by Git.

## Next planned parts

1. Browser manager.
2. Playwright persistent profile.
3. Manual login window.
4. Real connector integration after safe browser/profile setup.
5. Full checkpoint resume execution.
