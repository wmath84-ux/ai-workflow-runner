import React from 'react';
import Card from './Card.jsx';

export default function BrowserStatusCard({ status }) {
  return (
    <Card title="Browser Status">
      <dl className="settingsList compact">
        <div><dt>Status</dt><dd><span className={`statusPill ${status?.status ?? 'closed'}`}>{status?.status ?? 'closed'}</span></dd></div>
        <div><dt>Profile path</dt><dd><code>{status?.profilePath ?? 'browser-profile'}</code></dd></div>
        <div><dt>Open tabs</dt><dd>{status?.pages ?? 0}</dd></div>
        {status?.lastError ? <div><dt>Last error</dt><dd className="dangerText">{status.lastError}</dd></div> : null}
      </dl>
    </Card>
  );
}
