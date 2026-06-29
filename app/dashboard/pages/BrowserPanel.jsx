import React, { useEffect, useState } from 'react';
import BrowserStatusCard from '../components/BrowserStatusCard.jsx';
import Card from '../components/Card.jsx';
import ToolLoginCard from '../components/ToolLoginCard.jsx';
import ConnectorStatusList from '../components/ConnectorStatusList.jsx';
import ConnectorReadinessChecklist from '../components/ConnectorReadinessChecklist.jsx';

export default function BrowserPanel() {
  const [status, setStatus] = useState(null);
  const [connectors, setConnectors] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [profileInfo, setProfileInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [genericUrl, setGenericUrl] = useState('https://example.com');

  async function refreshAll() {
    const [nextStatus, nextTabs, nextProfile, nextConnectors] = await Promise.all([
      window.appAPI.getBrowserStatus(),
      window.appAPI.listBrowserTabs(),
      window.appAPI.getBrowserProfileInfo(),
      window.appAPI.listConnectors()
    ]);
    setStatus(nextStatus);
    setTabs(nextTabs);
    setProfileInfo(nextProfile);
    setConnectors(nextConnectors);
  }

  useEffect(() => { refreshAll().catch((error) => setMessage(error.message)); }, []);

  async function runAction(action, successMessage) {
    try {
      setMessage('');
      await action();
      if (successMessage) setMessage(successMessage);
      await refreshAll();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function clearProfile() {
    if (!window.confirm('Clear the persistent browser profile? This removes saved login sessions.')) return;
    runAction(() => window.appAPI.clearBrowserProfile(), 'Browser profile cleared.');
  }

  return (
    <div className="grid twoColumn browserPanelGrid">
      <BrowserStatusCard status={status} />

      <Card title="Main Actions">
        <div className="buttonRow">
          <button className="primaryAction" onClick={() => runAction(() => window.appAPI.launchBrowser(), 'Browser launched.')}>Launch Browser</button>
          <button className="primaryAction" onClick={() => runAction(() => window.appAPI.openTool('chatgpt'), 'ChatGPT opened.')}>Open ChatGPT</button>
          <button className="primaryAction" onClick={() => runAction(() => window.appAPI.openTool('gemini'), 'Gemini opened.')}>Open Gemini</button>
          <button className="secondaryButton" onClick={() => runAction(() => window.appAPI.closeBrowser(), 'Browser closed.')}>Close Browser</button>
          <button className="secondaryButton" onClick={() => runAction(refreshAll)}>Refresh Status</button>
        </div>
        <div className="buttonRow"><input className="inlineInput" value={genericUrl} onChange={(event) => setGenericUrl(event.target.value)} placeholder="https://example.com" /><button className="secondaryButton" onClick={() => runAction(() => window.appAPI.openUrl(genericUrl), 'Generic URL opened.')}>Open Generic URL</button></div>
        {message ? <div className="emptyState">{message}</div> : null}
      </Card>

      <Card title="Connector Status">
        <ConnectorStatusList connectors={connectors} />
      </Card>

      <Card title="Connector Readiness Checklist">
        <ConnectorReadinessChecklist onOpenTool={(toolName) => runAction(() => window.appAPI.openTool(toolName), `${toolName} opened.`)} onTroubleshoot={() => window.appAPI.openTroubleshooting?.()} />
      </Card>

      <Card title="Manual Login">
        <p>ChatGPT connector is implemented. Login manually once, keep the browser profile, and do not clear it unless you want to reset login.</p>
        <div className="toolGrid">
          {connectors.filter((connector) => ['chatgpt', 'gemini', 'claude', 'perplexity'].includes(connector.name)).map((connector) => (
            <ToolLoginCard key={connector.name} connector={connector} onOpen={(toolName) => connector.implemented ? runAction(() => window.appAPI.openTool(toolName), `${connector.label} opened.`) : null} />
          ))}
        </div>
      </Card>

      <Card title="Open Tabs">
        {tabs.length === 0 ? <div className="emptyState">No browser tabs are open.</div> : (
          <div className="tabList">
            {tabs.map((tab) => (
              <article key={`${tab.index}-${tab.url}`} className="tabListItem">
                <div>
                  <strong>{tab.title || 'Untitled tab'}</strong>
                  <p><code>{tab.url}</code></p>
                </div>
                <div className="buttonRow">
                  <button className="secondaryButton" onClick={() => runAction(() => window.appAPI.bringBrowserTabToFront(tab.url), 'Tab focused.')}>Front</button>
                  <button className="secondaryButton dangerButton" onClick={() => runAction(() => window.appAPI.closeBrowserTab(tab.url), 'Tab closed.')}>Close</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Card title="Profile">
        <dl className="settingsList compact">
          <div><dt>Path</dt><dd><code>{profileInfo?.path ?? status?.profilePath}</code></dd></div>
          <div><dt>Exists</dt><dd>{String(profileInfo?.exists ?? false)}</dd></div>
          <div><dt>Size</dt><dd>{profileInfo?.sizeBytes ?? 0} bytes</dd></div>
          <div><dt>Modified</dt><dd>{profileInfo?.modifiedAt ?? 'n/a'}</dd></div>
        </dl>
        <button className="secondaryButton dangerButton" onClick={clearProfile}>Clear / Reset Profile</button>
      </Card>
    </div>
  );
}
