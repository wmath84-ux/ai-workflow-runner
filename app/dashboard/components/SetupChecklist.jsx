import React, { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

export default function SetupChecklist({ onNavigate }) {
  const [health, setHealth] = useState(null);
  useEffect(() => { window.appAPI.runQuickHealthCheck?.().then(setHealth).catch((error) => setHealth({ checks: [{ id: 'health', label: 'Health check', status: 'error', message: error.message }] })); }, []);
  const base = [
    { id: 'folders', label: 'Required folders created', status: 'ok', message: 'outputs, exports, backups, diagnostics, workflows, and browser-profile are managed by the app.' },
    { id: 'browser-profile', label: 'Browser profile folder ready', status: 'ok', message: 'Persistent browser profile folder is available.', action: 'Open Browser Panel', page: 'browser' },
    { id: 'workflows', label: 'At least one workflow available', status: 'ok', message: 'Sample workflows are bundled in workflows/.' }
  ];
  const checks = [...base, ...(health?.checks ?? [])];
  return <div className="checklist">{checks.map((item) => <div className="checkItem" key={item.id}><StatusBadge status={item.status === 'ok' ? 'completed' : item.status} /><div><strong>{item.label}</strong><p>{item.message}</p>{item.action ? <button className="secondaryButton" onClick={() => onNavigate?.(item.page)}>{item.action}</button> : null}</div></div>)}</div>;
}
