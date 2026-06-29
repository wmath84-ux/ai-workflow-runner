import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    window.aiWorkflowRunner?.listWorkflows?.().then(setWorkflows).catch(() => setWorkflows([]));
  }, []);

  return (
    <Card title="Workflow List">
      <p>Saved workflows will appear here.</p>
      {workflows.length === 0 ? <div className="emptyState">No workflows saved yet.</div> : null}
    </Card>
  );
}
