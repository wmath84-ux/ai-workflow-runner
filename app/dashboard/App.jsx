import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import WorkflowList from './pages/WorkflowList.jsx';
import WorkflowEditor from './pages/WorkflowEditor.jsx';
import RunPanel from './pages/RunPanel.jsx';
import Results from './pages/Results.jsx';
import Settings from './pages/Settings.jsx';
import RunHistory from './pages/RunHistory.jsx';
import ResultViewer from './pages/ResultViewer.jsx';
import WorkflowLibrary from './pages/WorkflowLibrary.jsx';
import Logs from './pages/Logs.jsx';
import PromptLibrary from './pages/PromptLibrary.jsx';
import WorkflowTemplates from './pages/WorkflowTemplates.jsx';
import VariableManager from './pages/VariableManager.jsx';
import BrowserPanel from './pages/BrowserPanel.jsx';
import './styles/main.css';

const pages = {
  home: Home,
  workflows: WorkflowList,
  editor: WorkflowEditor,
  run: RunPanel,
  results: Results,
  settings: Settings,
  browser: BrowserPanel,
  history: RunHistory,
  resultViewer: ResultViewer,
  library: WorkflowLibrary,
  logs: Logs,
  prompts: PromptLibrary,
  templates: WorkflowTemplates,
  variables: VariableManager
};

function App() {
  const [activePage, setActivePage] = useState('home');
  const [appInfo, setAppInfo] = useState({ name: 'AI Workflow Runner', version: '0.1.0' });

  useEffect(() => {
    window.aiWorkflowRunner?.getAppInfo?.().then(setAppInfo).catch(() => {});
  }, []);

  const ActivePage = useMemo(() => pages[activePage] ?? Home, [activePage]);

  return (
    <div className="appShell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="mainContent">
        <header className="topBar">
          <div>
            <p className="eyebrow">Foundation build</p>
            <h1>{appInfo.name}</h1>
          </div>
          <span className="versionBadge">v{appInfo.version}</span>
        </header>
        <ActivePage />
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
