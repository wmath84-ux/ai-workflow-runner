import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [profileInfo, setProfileInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [folders, setFolders] = useState({});

  useEffect(() => {
    window.appAPI?.getSettings?.().then(setSettings).catch((error) => setMessage(error.message));
    window.appAPI?.getBrowserProfileInfo?.().then(setProfileInfo).catch(() => {});
    Promise.all([window.appAPI?.getProjectPath?.('outputs'), window.appAPI?.getProjectPath?.('exports')]).then(([outputs, exportsDir]) => setFolders({ outputs: outputs?.path, exports: exportsDir?.path })).catch(() => {});
  }, []);

  function updateField(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function saveSettings() {
    try {
      const saved = await window.appAPI.saveSettings(settings);
      setSettings(saved);
      setMessage('Settings saved. Browser changes apply the next time the browser launches.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function refreshProfileInfo() {
    try {
      setProfileInfo(await window.appAPI.getBrowserProfileInfo());
      setMessage('Browser profile info refreshed.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Card title="Settings">
      <h3>Workflow Execution Settings</h3>
      <div className="formGrid">
        <label>Browser profile path<input value={settings.browserProfileDirectory ?? ''} placeholder={settings.resolvedBrowserProfileDirectory ?? 'browser-profile'} onChange={(event) => updateField('browserProfileDirectory', event.target.value)} /></label>
        <label>Output folder<input value={settings.outputDirectory ?? 'outputs'} onChange={(event) => updateField('outputDirectory', event.target.value)} /></label>
        <label>Default wait timeout<input type="number" value={settings.defaultWaitTimeout ?? 30000} onChange={(event) => updateField('defaultWaitTimeout', Number(event.target.value))} /></label>
        <label>Retry count<input type="number" value={settings.retryCount ?? 1} onChange={(event) => updateField('retryCount', Number(event.target.value))} /></label>
        <label>Default max concurrency<input type="number" value={settings.defaultMaxConcurrency ?? 2} onChange={(event) => updateField('defaultMaxConcurrency', Number(event.target.value))} /></label>
        <label>Stop parallel group on first failure<input type="checkbox" checked={Boolean(settings.stopParallelGroupOnFailure ?? true)} onChange={(event) => updateField('stopParallelGroupOnFailure', event.target.checked)} /></label>
        <label>Allow concurrent workflow runs<input type="checkbox" checked={Boolean(settings.allowConcurrentRuns)} onChange={(event) => updateField('allowConcurrentRuns', event.target.checked)} /></label>
        <label>Queue enabled<input type="checkbox" checked={Boolean(settings.queueEnabled ?? true)} onChange={(event) => updateField('queueEnabled', event.target.checked)} /></label>
        <label>Log retention<select value={settings.logRetention ?? 'forever'} onChange={(event) => updateField('logRetention', event.target.value)}><option value="forever">Keep forever</option><option value="7">Delete logs older than 7 days</option><option value="30">Delete logs older than 30 days</option></select></label>
        <label>Show variable preview values<input type="checkbox" checked={Boolean(settings.showVariablePreviewValues ?? true)} onChange={(event) => updateField('showVariablePreviewValues', event.target.checked)} /></label>
        <label>Hide secret variable values<input type="checkbox" checked={Boolean(settings.hideSecretVariableValues ?? true)} onChange={(event) => updateField('hideSecretVariableValues', event.target.checked)} /></label>
        <label>Default workflow creation mode<select value={settings.defaultWorkflowCreationMode ?? 'json'} onChange={(event) => updateField('defaultWorkflowCreationMode', event.target.value)}><option value="json">JSON</option><option value="visual">Visual</option></select></label>
        <label>Default run mode<select value={settings.defaultRunMode ?? 'run-now'} onChange={(event) => updateField('defaultRunMode', event.target.value)}><option value="run-now">Run now</option><option value="queue">Add to queue</option></select></label>
        <label>Default export format<select value={settings.defaultExportFormat ?? 'markdown'} onChange={(event) => updateField('defaultExportFormat', event.target.value)}><option value="markdown">Markdown</option><option value="txt">TXT</option><option value="json">JSON</option><option value="zip">ZIP</option></select></label>
      </div>
      <div className="buttonRow">
        <button className="primaryAction" onClick={saveSettings}>Save Settings</button>
        <button className="secondaryButton" onClick={() => updateField('browserProfileDirectory', '')}>Reset to Default Profile Path</button>
        <button className="secondaryButton" onClick={refreshProfileInfo}>Open Browser Profile Info</button>
        <button className="secondaryButton" onClick={() => window.appAPI.openFolder(folders.outputs)}>Open Output Folder</button>
        <button className="secondaryButton" onClick={() => window.appAPI.openFolder(folders.exports)}>Open Exports Folder</button>
        <button className="secondaryButton" onClick={async () => { const result = await window.appAPI.seedDefaultPrompts(); setMessage(`Seeded ${result.seeded} default prompts.`); }}>Seed Default Prompts</button>
        <button className="secondaryButton" onClick={async () => { const result = await window.appAPI.seedDefaultTemplates(); setMessage(`Seeded ${result.seeded} default templates.`); }}>Seed Default Templates</button>
      </div>
      {folders.outputs ? <div className="emptyState">Outputs: {folders.outputs}<br />Exports: {folders.exports}</div> : null}
      {message ? <div className="emptyState">{message}</div> : null}
      {profileInfo ? <pre className="jsonPreview">{JSON.stringify(profileInfo, null, 2)}</pre> : null}
    </Card>
  );
}
