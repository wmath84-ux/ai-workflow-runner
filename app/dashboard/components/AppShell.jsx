import React from 'react';
import Sidebar from './Sidebar.jsx';
export default function AppShell({ activePage, onNavigate, appInfo, children, extras }) { return <div className="appShell"><Sidebar activePage={activePage} onNavigate={onNavigate} /><main className="mainContent"><header className="topBar"><div><p className="eyebrow">Production readiness build</p><h1>{appInfo?.name ?? 'AI Workflow Runner'}</h1></div><span className="versionBadge">v{appInfo?.version ?? '0.1.0'}</span></header>{children}{extras}</main></div>; }
