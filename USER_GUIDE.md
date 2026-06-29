# AI Workflow Runner User Guide

## App overview
AI Workflow Runner is a personal desktop app for structured AI workflows. It combines Electron, React, Node.js, Playwright, and SQLite to run mock, ChatGPT, Gemini, and Generic browser-backed workflow steps.

## First setup
Open the app, complete or skip onboarding, confirm folders, run a quick health check, and run the mock sample before using browser tools.

## Browser profile setup
Use **Browser Panel → Launch Browser**. The browser is visible and uses a persistent local profile. Open ChatGPT or Gemini and login manually. The app does not automate login, CAPTCHA, verification, or account switching.

## Workflow basics
A workflow contains `inputs`, ordered `steps`, optional parallel groups, prompts, tools, and `saveAs` output keys. Later steps can reference earlier outputs with `{{saveAs_name}}`.

## Workflow JSON format
Use `mode: "single"` for normal steps and `mode: "parallel"` for groups. Supported tools are `mock`, `chatgpt`, `gemini`, and `generic`.

## Visual workflow editor
Use Workflow Editor for JSON mode or simple visual step editing. Validate before saving or running.

## Parallel groups
Parallel groups run child steps with a concurrency limit. Child steps should not reference sibling outputs from the same group.

## Templates
Workflow Templates create ready-made workflows with input schemas. Fill the dynamic form, preview the generated workflow, then save or run it.

## Prompt library
Save reusable prompts with variables, categories, tags, and tool hints. Insert prompts into workflow steps from the editor.

## Variables
Variables use `{{name}}` syntax. They can come from workflow inputs, previous step outputs, reusable variables, or system variables such as `{{current_date}}`.

## Running workflows
Run Panel flow: choose workflow or paste JSON, fill inputs, validate, run preflight checks, review warnings/errors, then Run Now or Add To Queue.

## Paused workflow retry
If a connector needs manual action, the run pauses. Open the relevant tool tab, complete the manual action, then click Retry Paused Step.

## Results and exports
Use Run History and Results to inspect outputs. Export runs as Markdown, TXT, JSON, or ZIP.

## Backups and restore
Use Backup & Restore to create database or full backups. Restore creates a pre-restore backup first.

## Diagnostics
Use Diagnostics or App Status to export health information without browser cookies/session data.

## Best practices
Start with mock workflows, keep workflows small, validate variables, back up before restore, and never attempt to bypass website verification or rate limits.
