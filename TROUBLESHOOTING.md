# Troubleshooting

## 1. Browser does not launch
Possible reason: Playwright browser files are missing or locked. Safe fix: run `npx playwright install chromium`, restart the app, and check App Status. Do not add stealth flags.

## 2. Playwright Chromium missing
Possible reason: dependencies were installed without browsers. Safe fix: run `npx playwright install chromium`.

## 3. ChatGPT login not saved
Possible reason: profile was cleared or a different profile path is used. Safe fix: open ChatGPT and login manually again. Do not automate login.

## 4. Gemini login not saved
Possible reason: profile was cleared or manual verification is needed. Safe fix: open Gemini and complete login manually.

## 5. Prompt input not found
Possible reason: not logged in, page still loading, or website UI changed. Safe fix: complete manual login and retry readiness. Do not bypass verification.

## 6. Send button not found
Possible reason: prompt box is disabled, page changed, or required account action is pending. Safe fix: inspect the visible browser and complete required manual steps.

## 7. Response timeout
Possible reason: site is slow, rate limited, or output is long. Safe fix: retry later and keep partial output if captured. Do not bypass rate limits.

## 8. Workflow paused
Possible reason: connector requested manual intervention. Safe fix: open the named tool, login/verify manually, then retry paused step.

## 9. Retry paused step fails
Possible reason: the page was closed or the input selector changed. Safe fix: reopen the tool tab and run readiness checks.

## 10. Output folder missing
Possible reason: folder was moved or deleted. Safe fix: App Status repair can recreate folders; database results may still exist.

## 11. Database migration warning
Possible reason: an idempotent migration could not complete. Safe fix: create backup, export diagnostics, and rerun app.

## 12. Backup restore failed
Possible reason: invalid manifest or active browser/run. Safe fix: close browser, stop queue, validate backup, then restore again.

## 13. Workflow package import failed
Possible reason: invalid `.aiworkflowpkg` or bad workflow JSON. Safe fix: validate package and import with duplicate conflict strategy.

## 14. App opens blank window
Possible reason: dev server not running or renderer build missing. Safe fix: run `npm run dev` for development or `npm run build` before `npm start`.

## 15. Dev server not loading
Possible reason: port 5173 is busy. Safe fix: stop the other process and rerun `npm run dev`.

## Safety note
Do not attempt to bypass login, CAPTCHA, verification, or rate limits. Complete manual verification in the visible browser when required.
