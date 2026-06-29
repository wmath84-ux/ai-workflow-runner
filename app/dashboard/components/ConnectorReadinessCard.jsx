import React from 'react';
import StatusBadge from './StatusBadge.jsx';

export default function ConnectorReadinessCard({ connector, onCheck, onOpen, onTroubleshoot }) {
  const implemented = connector.implemented !== false;
  return (
    <article className="connectorCard">
      <div className="stepHeader"><h3>{connector.label ?? connector.tool}</h3><StatusBadge status={implemented ? connector.status ?? 'pending' : 'failed'} /></div>
      <p>{implemented ? (connector.ready ? 'Ready to use.' : connector.warnings?.[0] ?? 'Not checked yet.') : 'Registered as a placeholder but not implemented yet.'}</p>
      {connector.lastCheckedAt ? <small>Last checked: {connector.lastCheckedAt}</small> : null}
      <ul>{(connector.checks ?? []).map((check) => <li key={check.id}><strong>{check.label}:</strong> {check.message}</li>)}</ul>
      <div className="buttonRow">
        {implemented ? <button className="secondaryButton" onClick={() => onCheck?.(connector.tool)}>Check Readiness</button> : null}
        {implemented && connector.tool !== 'mock' ? <button className="secondaryButton" onClick={() => onOpen?.(connector.tool)}>Open Tool</button> : null}
        <button className="secondaryButton" onClick={onTroubleshoot}>View Troubleshooting</button>
      </div>
    </article>
  );
}
