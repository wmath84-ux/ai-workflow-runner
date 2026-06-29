import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
<<<<<<< HEAD
import ResultOutputViewer from '../components/ResultOutputViewer.jsx';
import RunSummaryCard from '../components/RunSummaryCard.jsx';

export default function Results() { const [runs,setRuns]=useState([]); const [selected,setSelected]=useState(null); useEffect(()=>{ window.appAPI.listRuns().then(setRuns).catch(()=>{}); },[]); async function open(runId){ setSelected(await window.appAPI.getRunState(runId)); } return <div className="grid twoColumn"><Card title="Results"><p>Select a run to view saved outputs.</p>{runs.map(run=><button className="runListItem" key={run.id} onClick={()=>open(run.id)}><strong>{run.workflowName}</strong><span>{run.status}</span><small>{run.id}</small></button>)}</Card><div>{selected?<><RunSummaryCard run={selected}/><ResultOutputViewer run={selected}/></>:<Card title="No run selected"><p>Choose a run from the list.</p></Card>}</div></div>; }
=======
import StepStatusList from '../components/StepStatusList.jsx';

export default function Results() {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [error, setError] = useState('');

  async function loadRuns() {
    try {
      setRuns(await window.appAPI.listRuns());
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => { loadRuns(); }, []);

  async function openRun(runId) {
    try { setSelectedRun(await window.appAPI.getRun(runId)); }
    catch (loadError) { setError(loadError.message); }
  }

  return (
    <div className="grid twoColumn">
      <Card title="Saved Runs">
        <button className="secondaryButton" onClick={loadRuns}>Refresh</button>
        {error ? <div className="errorBox">{error}</div> : null}
        {runs.length === 0 ? <div className="emptyState">No runs saved yet.</div> : (
          <div className="runList">
            {runs.map((run) => (
              <button key={run.id} className="runListItem" onClick={() => openRun(run.id)}>
                <strong>{run.workflowName}</strong>
                <span>{run.status}</span>
                <small>Started: {run.startedAt || 'not started'}</small>
                <small>Finished: {run.completedAt || 'not finished'}</small>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card title="Run Summary">
        {selectedRun ? (
          <>
            <p><strong>Run ID:</strong> {selectedRun.id}</p>
            <p><strong>Workflow:</strong> {selectedRun.workflowName}</p>
            <p><strong>Status:</strong> {selectedRun.status}</p>
            <StepStatusList steps={selectedRun.steps ?? []} />
          </>
        ) : <div className="emptyState">Select a run to see its step summary.</div>}
      </Card>
    </div>
  );
}
>>>>>>> origin/main
