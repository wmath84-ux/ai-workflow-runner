import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import SetupChecklist from '../components/SetupChecklist.jsx';
import ConnectorReadinessChecklist from '../components/ConnectorReadinessChecklist.jsx';
import QuickActionGrid from '../components/QuickActionGrid.jsx';
import RecentActivityPanel from '../components/RecentActivityPanel.jsx';

export default function Home({ onNavigate }) {
  const [runs, setRuns] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [health, setHealth] = useState(null);
  useEffect(() => {
    window.appAPI.listRuns?.().then(setRuns).catch(() => {});
    window.appAPI.listWorkflows?.().then(setWorkflows).catch(() => {});
    window.appAPI.runQuickHealthCheck?.().then(setHealth).catch(() => {});
  }, []);
  const activities = runs.slice(0, 5).map((run) => `${run.workflowName ?? 'Workflow'} ${run.status} (${run.id})`);
  return <div className="grid twoColumn">
    <Card title="Setup Progress"><SetupChecklist onNavigate={onNavigate} /></Card>
    <Card title="Quick Actions"><QuickActionGrid actions={[{ label: 'New workflow', onClick: () => onNavigate?.('editor') }, { label: 'Open templates', onClick: () => onNavigate?.('templates') }, { label: 'Run workflow', onClick: () => onNavigate?.('run') }, { label: 'Launch browser', onClick: () => window.appAPI.launchBrowser?.() }, { label: 'Check connectors', onClick: () => onNavigate?.('browser') }, { label: 'Create backup', onClick: () => onNavigate?.('backup') }, { label: 'Open help', onClick: () => onNavigate?.('help') }]} /></Card>
    <Card title="Dashboard Summary"><p>Total workflows: {workflows.length}</p><p>Total runs: {runs.length}</p><p>Completed: {runs.filter((run) => run.status === 'completed').length}</p><p>Paused: {runs.filter((run) => run.status === 'paused').length}</p><p>Failed: {runs.filter((run) => run.status === 'failed').length}</p>{health?.status && health.status !== 'healthy' ? <div className="warningBox">Health warning: {health.status}</div> : null}</Card>
    <Card title="Connector Readiness"><ConnectorReadinessChecklist onOpenTool={(tool) => window.appAPI.openTool?.(tool)} onTroubleshoot={() => onNavigate?.('help')} /></Card>
    <Card title="Recent Activity"><RecentActivityPanel activities={activities} />{runs.some((run) => run.status === 'paused') ? <div className="warningBox">Paused workflows need manual action or retry.</div> : null}{runs.some((run) => run.status === 'failed') ? <div className="errorBox">Some recent runs failed. Open Run History for details.</div> : null}</Card>
    <Card title="Recent Runs">{runs.slice(0, 5).map((run) => <div className="runListItem" key={run.id}><strong>{run.workflowName}</strong><StatusBadge status={run.status} /><small>{run.id}</small></div>)}</Card>
  </div>;
}
