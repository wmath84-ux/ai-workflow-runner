<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Home() { const [runs,setRuns]=useState([]); const [workflows,setWorkflows]=useState([]); useEffect(()=>{ window.appAPI.listRuns().then(setRuns).catch(()=>{}); window.appAPI.listWorkflows().then(setWorkflows).catch(()=>{}); },[]); return <div className="grid twoColumn"><Card title="Dashboard Summary"><p>Total workflows: {workflows.length}</p><p>Total runs: {runs.length}</p><p>Completed: {runs.filter(r=>r.status==='completed').length}</p><p>Paused: {runs.filter(r=>r.status==='paused').length}</p><p>Failed: {runs.filter(r=>r.status==='failed').length}</p></Card><Card title="Quick Actions"><p>Use Workflow Library to import or preview workflows, Run Panel to execute, Browser Panel for manual login, and Run History for exports.</p></Card><Card title="Recent Runs">{runs.slice(0,5).map(run=><div className="runListItem" key={run.id}><strong>{run.workflowName}</strong><StatusBadge status={run.status}/><small>{run.id}</small></div>)}</Card></div>; }
=======
import React from 'react';
import Card from '../components/Card.jsx';

export default function Home() {
  return (
    <div className="grid twoColumn">
      <Card title="Project foundation">
        <p>This starter app wires Electron, React, Vite, SQLite storage, and placeholder automation modules.</p>
      </Card>
      <Card title="Next build step">
        <p>Command 2 will add workflow JSON validation, variable resolution, and the first sequential step engine.</p>
      </Card>
    </div>
  );
}
>>>>>>> origin/main
