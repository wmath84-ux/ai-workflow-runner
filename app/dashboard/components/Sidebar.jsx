import React from 'react';

const navItems = [
  ['home', 'Home'],
  ['library', 'Workflow Library'],
  ['templates', 'Workflow Templates'],
  ['prompts', 'Prompt Library'],
  ['variables', 'Variables'],
  ['workflows', 'Workflow List'],
  ['editor', 'Workflow Editor'],
  ['run', 'Run Panel'],
  ['browser', 'Browser Panel'],
  ['history', 'Run History'],
  ['results', 'Results'],
  ['resultViewer', 'Result Viewer'],
  ['logs', 'Logs'],
  ['backup', 'Backup & Restore'],
  ['status', 'App Status'],
  ['diagnostics', 'Diagnostics'],
  ['onboarding', 'Onboarding / Setup Guide'],
  ['help', 'Help'],
  ['settings', 'Settings']
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark">AI</div>
        <div>
          <strong>Workflow Runner</strong>
          <small>Desktop automation lab</small>
        </div>
      </div>
      <nav className="navList" aria-label="Dashboard navigation">
        {navItems.map(([key, label]) => (
          <button key={key} className={activePage === key ? 'active' : ''} onClick={() => onNavigate(key)}>
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
