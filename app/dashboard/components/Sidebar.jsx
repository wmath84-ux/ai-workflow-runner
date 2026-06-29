import React from 'react';

const navItems = [
  ['home', 'Home'],
  ['workflows', 'Workflow List'],
  ['editor', 'Workflow Editor'],
  ['run', 'Run Panel'],
  ['browser', 'Browser Panel'],
  ['results', 'Results'],
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
