import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import HelpCard from '../components/HelpCard.jsx';

export default function Help() {
  const [version, setVersion] = useState(null);
  useEffect(() => { window.appAPI.getVersionInfo?.().then(setVersion).catch(() => {}); }, []);
  const topics = [
    ['Getting started', 'Use onboarding, then run the mock sample before browser workflows.'],
    ['How workflows work', 'Workflows combine inputs, prompts, connectors, variables, sequential steps, and parallel groups.'],
    ['Persistent browser profile', 'ChatGPT and Gemini run in a visible persistent Chromium profile so you can login manually once.'],
    ['Manual login', 'Open the tool tab and complete login, CAPTCHA, or verification yourself in the browser.'],
    ['Templates and prompts', 'Use workflow templates and prompt library entries to create reusable workflows faster.'],
    ['Variables', 'Variables use {{name}} tokens from inputs, step outputs, reusable variables, and system variables.'],
    ['Exports and backups', 'Runs can be exported and app data can be backed up or restored from Backup & Restore.'],
    ['Safety notes', 'The app does not automate login, solve CAPTCHA, bypass rate limits, or use hidden browser modes.']
  ];
  return <div className="grid twoColumn"><Card title="Help & Setup Guide"><p>Version: {version?.appVersion ?? version?.version ?? 'unknown'} · Environment: {version?.environment ?? 'unknown'}</p><div className="buttonRow"><button className="secondaryButton" onClick={() => window.appAPI.openUserGuide?.()}>Open User Guide</button><button className="secondaryButton" onClick={() => window.appAPI.openTroubleshooting?.()}>Open Troubleshooting</button><button className="secondaryButton" onClick={() => window.appAPI.resetOnboarding?.()}>Restart Onboarding</button></div></Card>{topics.map(([title, body]) => <HelpCard key={title} title={title}>{body}</HelpCard>)}<Card title="Quick troubleshooting"><ul><li>Workflow paused: open the named tool, complete manual action, then retry paused step.</li><li>Prompt input not found: website UI may have changed or you may need to login manually.</li><li>Browser not launching: run Playwright install and check App Status.</li><li>Output file missing: use Results fallback data and export diagnostics.</li></ul></Card></div>;
}
