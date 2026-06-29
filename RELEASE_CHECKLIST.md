# Release Checklist

- App starts without crash.
- Database initializes and migrations are idempotent.
- Settings load with defaults and can be reset.
- Onboarding opens on first run.
- Browser launches and ChatGPT/Gemini tabs open for manual login.
- Mock, sequential, and parallel sample workflows validate.
- Run preflight blocks errors and allows explicit continuation for warnings.
- Run history, result viewer, exports, backups, health checks, diagnostics, command palette, and keyboard shortcuts work.
- Production build excludes runtime folders: `browser-profile/`, `outputs/`, `exports/`, `backups/`, `diagnostics/`, `logs/`, and local database files.
