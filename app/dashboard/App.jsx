import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
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
import BackupRestore from './pages/BackupRestore.jsx';
import AppStatus from './pages/AppStatus.jsx';
import Diagnostics from './pages/Diagnostics.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Help from './pages/Help.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import AppShell from './components/AppShell.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal.jsx';
import BrowserPanel from './pages/BrowserPanel.jsx';
import './styles/main.css';

function createBrowserFallbackApi() {
  const defaultValueFor = (name) => {
    if (name === 'getAppInfo') return { name: 'AI Workflow Runner', version: '0.1.0' };
    if (name === 'getOnboardingState') return { completed: true, skipped: true };
    if (name === 'getShortcutSettings') return { enabled: true };
    if (name === 'getBrowserStatus') return { running: false, tabs: [] };
    if (name === 'getBrowserProfileInfo') return { profilePath: 'browser-profile' };
    if (name === 'runQuickHealthCheck' || name === 'runDeepHealthCheck') return { status: 'browser-preview', checks: [] };
    if (name === 'checkDataIntegrity') return { status: 'browser-preview', issues: [] };
    if (name === 'getDatabaseStats') return { tables: [] };
    if (name.toLowerCase().includes('list')) return [];
    if (name.toLowerCase().includes('summary')) return {};
    if (name.toLowerCase().includes('status')) return {};
    return null;
  };

  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (typeof prop !== 'string') return undefined;
        return async () => defaultValueFor(prop);
      }
    }
  );
}

if (typeof window !== 'undefined' && !window.appAPI) {
  window.appAPI = createBrowserFallbackApi();
  window.aiWorkflowRunner = window.appAPI;
}

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
  variables: VariableManager,
  backup: BackupRestore,
  status: AppStatus,
  diagnostics: Diagnostics,
  onboarding: Onboarding,
  help: Help
};

function App() {
  const [activePage, setActivePage] = useState('home');
  const [appInfo, setAppInfo] = useState({ name: 'AI Workflow Runner', version: '0.1.0' });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [shortcutSettings, setShortcutSettings] = useState({ enabled: true });

  useEffect(() => {
    window.aiWorkflowRunner?.getAppInfo?.().then(setAppInfo).catch(() => {});
    window.appAPI?.getOnboardingState?.().then((state) => {
      if (!state?.completed && !state?.skipped) setActivePage('onboarding');
    }).catch(() => {});
    window.appAPI?.getShortcutSettings?.().then(setShortcutSettings).catch(() => {});
  }, []);

  useEffect(() => {
    function isTyping(target) {
      return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable;
    }

    function onKeyDown(event) {
      const mod = event.ctrlKey || event.metaKey;
      if (event.key === 'Escape') {
        setPaletteOpen(false);
        setShortcutsOpen(false);
        return;
      }
      if (shortcutSettings.enabled === false || !mod || isTyping(event.target)) return;
      if (event.key.toLowerCase() === 'k' && shortcutSettings.commandPaletteEnabled !== false) {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        setActivePage('editor');
      }
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        setActivePage('run');
      }
      if (event.shiftKey && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setActivePage('browser');
        window.appAPI?.launchBrowser?.();
      }
      if (event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        setActivePage('browser');
        window.appAPI?.openTool?.('chatgpt');
      }
      if (event.shiftKey && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        setActivePage('browser');
        window.appAPI?.openTool?.('gemini');
      }
      if (event.shiftKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        setActivePage('help');
      }
      if (event.key === ',') {
        event.preventDefault();
        setActivePage('settings');
      }
      if (event.key === '?') {
        event.preventDefault();
        setShortcutsOpen(true);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortcutSettings.enabled, shortcutSettings.commandPaletteEnabled]);

  const ActivePage = useMemo(() => pages[activePage] ?? Home, [activePage]);

  return (
    <AppShell
      activePage={activePage}
      onNavigate={setActivePage}
      appInfo={appInfo}
      extras={
        <>
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={setActivePage} />
          <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        </>
      }
    >
      <ErrorBoundary>
        <ActivePage onNavigate={setActivePage} />
      </ErrorBoundary>
    </AppShell>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
