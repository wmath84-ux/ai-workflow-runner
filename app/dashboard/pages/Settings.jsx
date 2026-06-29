import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';

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
}
