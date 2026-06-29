import React from 'react';
export default function QuickActionGrid({ actions = [] }) { return <div className="quickActionGrid">{actions.map((action) => <button key={action.label} className="secondaryButton" onClick={action.onClick}>{action.label}</button>)}</div>; }
