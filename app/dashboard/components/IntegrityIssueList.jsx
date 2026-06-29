import React from 'react';
export default function IntegrityIssueList({ issues = [] }) { return <section className="card"><h2>Integrity Issues</h2>{issues.length===0?<p>No issues found.</p>:issues.map(i=><div className="errorBox" key={`${i.type}-${i.id}`}>{i.type}: {i.message}</div>)}</section>; }
