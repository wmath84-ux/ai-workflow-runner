import React from 'react';
export default function RecentActivityPanel({ activities = [] }) { return <div>{activities.length ? <ul>{activities.map((item, index) => <li key={index}>{item}</li>)}</ul> : <div className="emptyState">Recent activity will appear here after runs, exports, backups, and imports.</div>}</div>; }
