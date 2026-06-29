import React from 'react';
export default function StatusBadge({ status }) { return <span className={`statusPill ${status}`}>{status ?? 'unknown'}</span>; }
