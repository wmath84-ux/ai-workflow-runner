import React, { useEffect, useState } from 'react';
import ConnectorReadinessCard from './ConnectorReadinessCard.jsx';

const placeholders = [
  { tool: 'claude', label: 'Claude', implemented: false, status: 'not_ready' },
  { tool: 'perplexity', label: 'Perplexity', implemented: false, status: 'not_ready' }
];

export default function ConnectorReadinessChecklist({ onOpenTool, onTroubleshoot }) {
  const [items, setItems] = useState([]);
  async function refresh() { const result = await window.appAPI.getConnectorReadinessSummary?.(); setItems([...(result?.connectors ?? []), ...placeholders]); }
  async function check(toolName) { const result = await window.appAPI.checkConnectorReadiness?.(toolName); setItems((current) => current.map((item) => item.tool === toolName ? result : item)); }
  useEffect(() => { refresh().catch(() => {}); }, []);
  return <div className="connectorGrid">{items.map((connector) => <ConnectorReadinessCard key={connector.tool} connector={connector} onCheck={check} onOpen={onOpenTool} onTroubleshoot={onTroubleshoot} />)}</div>;
}
