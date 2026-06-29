import React from 'react';
import Card from '../components/Card.jsx';

export default function RunPanel() {
  return (
    <Card title="Run Panel">
      <p>Future workflow runs, checkpoints, and execution logs will be started from this panel.</p>
      <button className="primaryButton" disabled>Run workflow (coming soon)</button>
    </Card>
  );
}
