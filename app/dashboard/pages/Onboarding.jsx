import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import OnboardingStepCard from '../components/OnboardingStepCard.jsx';
import SetupChecklist from '../components/SetupChecklist.jsx';
import ConnectorReadinessChecklist from '../components/ConnectorReadinessChecklist.jsx';

const steps = [
  ['welcome', 'Welcome', 'Understand the local desktop workflow runner and its safety boundaries.', 'Review setup notes'],
  ['folders', 'Choose output and backup folders', 'Confirm outputs, exports, backups, and diagnostics folders are available.', 'Open Settings'],
  ['browser', 'Launch persistent browser', 'Start the visible Playwright Chromium profile used for manual login.', 'Launch Browser'],
  ['chatgpt', 'Open ChatGPT and login manually', 'Open ChatGPT in the persistent browser and complete login yourself.', 'Open ChatGPT'],
  ['gemini', 'Open Gemini and login manually', 'Open Gemini in the persistent browser and complete login yourself.', 'Open Gemini'],
  ['readiness', 'Run connector readiness check', 'Check Mock, ChatGPT, Gemini, and Generic readiness without sending prompts.', 'Check Readiness'],
  ['workflow', 'Import or choose a sample workflow', 'Start from bundled sample workflows or the Workflow Templates page.', 'Open Workflow Library'],
  ['mock', 'Run first mock workflow', 'Verify local engine, SQLite, outputs, and results without browser dependencies.', 'Run Mock Workflow'],
  ['browser-workflow', 'Run first browser workflow', 'Run ChatGPT or Gemini only after manual login and readiness checks.', 'Run Browser Workflow'],
  ['finish', 'Finish setup', 'Complete onboarding and continue to the Home dashboard.', 'Finish']
].map(([id, title, description, actionLabel]) => ({ id, title, description, actionLabel }));

export default function Onboarding() {
  const [state, setState] = useState({ currentStep: 0, completedSteps: [] });
  useEffect(() => { window.appAPI.getOnboardingState?.().then(setState).catch(() => {}); }, []);
  async function completeStep(id) { const next = await window.appAPI.markOnboardingStepComplete?.(id); if (next) setState(next); }
  async function finish(skip = false) { const next = skip ? await window.appAPI.updateOnboardingState?.({ skipped: true, completed: true, completedAt: new Date().toISOString() }) : await window.appAPI.completeOnboarding?.(); if (next) setState(next); }
  return <div className="grid twoColumn"><Card title="First-run Onboarding"><p>This guide helps you prepare folders, the persistent browser, manual logins, connector readiness, and a first safe workflow run. Login is never automated.</p><div className="buttonRow"><button className="primaryAction" onClick={() => finish(false)}>Finish Setup</button><button className="secondaryButton" onClick={() => finish(true)}>Skip Onboarding</button><button className="secondaryButton" onClick={async () => setState(await window.appAPI.resetOnboarding?.())}>Restart</button></div>{steps.map((step, index) => <OnboardingStepCard key={step.id} step={step} index={index} active={index === state.currentStep} completed={state.completedSteps?.includes(step.id)} onComplete={completeStep} />)}</Card><Card title="Setup Checklist"><SetupChecklist /></Card><Card title="Connector Readiness"><ConnectorReadinessChecklist onOpenTool={(tool) => window.appAPI.openTool?.(tool)} onTroubleshoot={() => window.appAPI.openTroubleshooting?.()} /></Card></div>;
}
