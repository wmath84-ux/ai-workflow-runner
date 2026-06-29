import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import WorkflowCard from '../components/WorkflowCard.jsx';

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    window.appAPI?.listWorkflows?.().then(setWorkflows).catch((loadError) => setError(loadError.message));
  }, []);

  return (
    <Card title="Workflow List">
      <p>Saved and bundled workflows appear here. Use the Run Panel to paste and execute JSON.</p>
      {error ? <div className="errorBox">{error}</div> : null}
      {workflows.length === 0 ? <div className="emptyState">No workflows saved yet.</div> : (
        <div className="workflowGrid">
          {workflows.map((workflow) => <WorkflowCard key={workflow.id} workflow={workflow} />)}
        </div>
      )}
    </Card>
  );
}
