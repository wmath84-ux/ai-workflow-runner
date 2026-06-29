import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function CommandPalette({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [actions, setActions] = useState([]);
  const inputRef = useRef(null);
  useEffect(() => { window.appAPI.listShortcuts?.().then(() => {}).catch(() => {}); import('../../shortcuts/commandPaletteActions.js').then((mod) => setActions(mod.listCommandPaletteActions())).catch(() => setActions([])); }, []);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 0); }, [open]);
  const filtered = useMemo(() => actions.filter((action) => `${action.label} ${action.description} ${(action.keywords ?? []).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [actions, query]);
  if (!open) return null;
  function run(action) { if (action.page) onNavigate?.(action.page); onClose?.(); }
  return <div className="modalOverlay" role="dialog" aria-modal="true"><div className="commandPalette"><input ref={inputRef} aria-label="Command search" placeholder="Search commands…" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') onClose?.(); if (event.key === 'Enter' && filtered[0]) run(filtered[0]); }} />{filtered.map((action) => <button key={action.id} onClick={() => run(action)}><strong>{action.label}</strong><small>{action.description}</small></button>)}</div></div>;
}
