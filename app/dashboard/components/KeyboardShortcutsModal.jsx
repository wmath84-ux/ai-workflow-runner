import React, { useEffect, useState } from 'react';
export default function KeyboardShortcutsModal({ open, onClose }) {
  const [shortcuts, setShortcuts] = useState([]);
  const [settings, setSettings] = useState({ enabled: true });
  useEffect(() => { if (open) { window.appAPI.listShortcuts?.().then(setShortcuts).catch(() => {}); window.appAPI.getShortcutSettings?.().then(setSettings).catch(() => {}); } }, [open]);
  if (!open) return null;
  async function toggle() { const next = { ...settings, enabled: !settings.enabled }; setSettings(next); await window.appAPI.updateShortcutSettings?.(next); }
  return <div className="modalOverlay" role="dialog" aria-modal="true"><div className="modalCard"><div className="stepHeader"><h2>Keyboard Shortcuts</h2><button onClick={onClose} aria-label="Close shortcuts">×</button></div><label><input type="checkbox" checked={settings.enabled !== false} onChange={toggle} /> Enable keyboard shortcuts</label><ul>{shortcuts.map((item) => <li key={item.id}><strong>{item.label}</strong>: <code>{item.windows}</code> / <code>{item.mac}</code></li>)}</ul></div></div>;
}
