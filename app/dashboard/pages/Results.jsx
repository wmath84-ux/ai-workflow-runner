import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';

export default function Results() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    window.aiWorkflowRunner?.listResults?.().then(setResults).catch(() => setResults([]));
  }, []);

  return (
    <Card title="Results">
      <p>Workflow outputs saved to SQLite and local files will be listed here.</p>
      {results.length === 0 ? <div className="emptyState">No results saved yet.</div> : null}
    </Card>
  );
}
