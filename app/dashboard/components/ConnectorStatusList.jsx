import React from 'react';

export default function ConnectorStatusList({ connectors = [] }) {
  if (!connectors.length) return <div className="emptyState">Connector status is loading.</div>;
  return (
    <div className="connectorStatusList">
      {connectors.map((connector) => (
        <div key={connector.name} className="connectorStatusItem">
          <strong>{connector.label}</strong>
          <span className={connector.implemented ? 'statusPill running' : 'statusPill'}>
            {connector.name === 'mock' ? 'ready' : connector.implemented ? 'implemented' : 'not implemented yet'}
          </span>
          {connector.requiresManualLogin ? <small>manual login</small> : <small>no login required</small>}
        </div>
      ))}
    </div>
  );
}
