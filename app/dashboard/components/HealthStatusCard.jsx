import React from 'react';
import StatusBadge from './StatusBadge.jsx';
export default function HealthStatusCard({ check }) { return <article className="card compact"><h3>{check.label}</h3><StatusBadge status={check.status}/><p>{check.message}</p></article>; }
