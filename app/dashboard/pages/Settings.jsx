import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
<<<<<<< HEAD
import DangerZone from '../components/DangerZone.jsx';
import SettingsSection from '../components/SettingsSection.jsx';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState('');
  useEffect(() => { window.appAPI.loadSettings().then((result) => setSettings(result.settings)).catch((error) => setMessage(error.message)); }, []);
  function update(section, key, value) { setSettings((current) => ({ ...current, [section]: { ...(current?.[section] ?? {}), [key]: value } })); }
  async function save() { const saved = await window.appAPI.saveSettings(settings); setSettings(saved); setMessage('Settings saved and validated.'); }
  async function resetSection(section) { const result = await window.appAPI.resetSettingsSection(section); setSettings(result.settings); setMessage(`${section} settings reset.`); }
  if (!settings) return <Card title="Settings"><p>Loading settings…</p>{message}</Card>;
  return <div className="grid twoColumn"><div>
    <SettingsSection title="App" onReset={() => resetSection('app')}><label>Theme<input value={settings.app.theme} onChange={e=>update('app','theme',e.target.value)}/></label><label><input type="checkbox" checked={settings.app.compactMode} onChange={e=>update('app','compactMode',e.target.checked)}/> Compact mode</label></SettingsSection>
    <SettingsSection title="Browser" onReset={() => resetSection('browser')}><label>Profile path<input value={settings.browser.profilePath} onChange={e=>update('browser','profilePath',e.target.value)}/></label><label>Default tool<input value={settings.browser.defaultTool} onChange={e=>update('browser','defaultTool',e.target.value)}/></label></SettingsSection>
    <SettingsSection title="Workflow Execution" onReset={() => resetSection('workflow')}><label>Default max concurrency<input type="number" value={settings.workflow.defaultMaxConcurrency} onChange={e=>update('workflow','defaultMaxConcurrency',Number(e.target.value))}/></label><label><input type="checkbox" checked={settings.workflow.queueEnabled} onChange={e=>update('workflow','queueEnabled',e.target.checked)}/> Queue enabled</label><label><input type="checkbox" checked={settings.workflow.allowConcurrentRuns} onChange={e=>update('workflow','allowConcurrentRuns',e.target.checked)}/> Allow concurrent runs</label></SettingsSection>
    <SettingsSection title="Outputs & Exports" onReset={() => resetSection('outputs')}><label>Output folder<input value={settings.outputs.outputFolder} onChange={e=>update('outputs','outputFolder',e.target.value)}/></label><label>Exports folder<input value={settings.outputs.exportsFolder} onChange={e=>update('outputs','exportsFolder',e.target.value)}/></label><select value={settings.outputs.defaultExportFormat} onChange={e=>update('outputs','defaultExportFormat',e.target.value)}><option>markdown</option><option>txt</option><option>json</option><option>zip</option></select></SettingsSection>
  </div><div>
    <SettingsSection title="Logs" onReset={() => resetSection('logs')}><select value={settings.logs.retentionDays} onChange={e=>update('logs','retentionDays',Number(e.target.value))}><option value={0}>Keep forever</option><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={365}>365 days</option></select></SettingsSection>
    <SettingsSection title="Backups" onReset={() => resetSection('backups')}><label>Backup folder<input value={settings.backups.backupFolder} onChange={e=>update('backups','backupFolder',e.target.value)}/></label><label><input type="checkbox" checked={settings.backups.autoBackupEnabled} onChange={e=>update('backups','autoBackupEnabled',e.target.checked)}/> Auto backup</label></SettingsSection>
    <SettingsSection title="Safety" onReset={() => resetSection('safety')}><label><input type="checkbox" checked={settings.safety.requireConfirmBeforeDelete} onChange={e=>update('safety','requireConfirmBeforeDelete',e.target.checked)}/> Confirm before delete</label><label><input type="checkbox" checked={settings.safety.blockUnsafeFileOpen} onChange={e=>update('safety','blockUnsafeFileOpen',e.target.checked)}/> Block unsafe file open</label></SettingsSection>
    <DangerZone><div className="buttonRow"><button className="primaryAction" onClick={save}>Save Settings</button><button className="secondaryButton" onClick={async()=>setMessage(JSON.stringify(await window.appAPI.exportSettings()))}>Export Settings JSON</button><button className="secondaryButton" onClick={async()=>{if(window.confirm('Reset all settings?')){const result=await window.appAPI.resetSettings(); setSettings(result.settings);}}}>Reset All Settings</button><button className="secondaryButton" onClick={async()=>setMessage(JSON.stringify(await window.appAPI.runQuickHealthCheck()))}>Check App Health</button><button className="secondaryButton" onClick={async()=>setMessage(`Cleared ${await window.appAPI.clearOldLogs(settings.logs.retentionDays)} old logs.`)}>Clear Old Logs</button></div></DangerZone>
    {message?<pre className="jsonPreview">{message}</pre>:null}
  </div></div>;
=======

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [profileInfo, setProfileInfo] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    window.appAPI?.getSettings?.().then(setSettings).catch((error) => setMessage(error.message));
    window.appAPI?.getBrowserProfileInfo?.().then(setProfileInfo).catch(() => {});
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
      <div className="formGrid">
        <label>Browser profile path<input value={settings.browserProfileDirectory ?? ''} placeholder={settings.resolvedBrowserProfileDirectory ?? 'browser-profile'} onChange={(event) => updateField('browserProfileDirectory', event.target.value)} /></label>
        <label>Output folder<input value={settings.outputDirectory ?? 'outputs'} onChange={(event) => updateField('outputDirectory', event.target.value)} /></label>
        <label>Default wait timeout<input type="number" value={settings.defaultWaitTimeout ?? 30000} onChange={(event) => updateField('defaultWaitTimeout', Number(event.target.value))} /></label>
        <label>Retry count<input type="number" value={settings.retryCount ?? 1} onChange={(event) => updateField('retryCount', Number(event.target.value))} /></label>
      </div>
      <div className="buttonRow">
        <button className="primaryAction" onClick={saveSettings}>Save Settings</button>
        <button className="secondaryButton" onClick={() => updateField('browserProfileDirectory', '')}>Reset to Default Profile Path</button>
        <button className="secondaryButton" onClick={refreshProfileInfo}>Open Browser Profile Info</button>
      </div>
      {message ? <div className="emptyState">{message}</div> : null}
      {profileInfo ? <pre className="jsonPreview">{JSON.stringify(profileInfo, null, 2)}</pre> : null}
    </Card>
  );
>>>>>>> origin/main
}
