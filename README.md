# AI Workflow Runner

AI Workflow Runner is a desktop app foundation for running structured AI workflows locally. It combines Electron, React, Vite, Node.js, Playwright placeholders, SQLite, and local file-system storage.

## Current status

Foundation only. This project currently includes app wiring, a starter dashboard, SQLite schema/init helpers, IPC placeholders, sample workflow JSON, and stub modules for future workflow automation. It does **not** implement real ChatGPT, Gemini, Claude, Perplexity, browser automation, login, captcha, rate-limit, or bypass logic.

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

## Folder structure

- `app/main.js` — Electron main process and lifecycle handling.
- `app/preload.js` — secure context bridge exposed to the React dashboard.
- `app/dashboard/` — React starter UI with sidebar navigation and page placeholders.
- `app/ipc/` — IPC handlers for settings, workflows, and results.
- `app/storage/` — SQLite schema and helper modules for workflows and results.
- `app/runner/` — placeholder workflow execution modules.
- `app/browser/` — placeholder Playwright browser/session modules.
- `app/connectors/` — placeholder connector contracts for future AI web connectors.
- `app/shared/` — shared constants, path helpers, and logging.
- `workflows/` — sample workflow JSON files.
- `outputs/` — local workflow output directory; runtime files are ignored by Git.
- `browser-profile/` — local browser profile directory; runtime files are ignored by Git.

## Next planned parts

1. Workflow JSON validation.
2. Variable resolver.
3. Sequential workflow engine.
4. Browser manager.
5. ChatGPT connector.
6. Result saving.
7. Checkpoint resume.
