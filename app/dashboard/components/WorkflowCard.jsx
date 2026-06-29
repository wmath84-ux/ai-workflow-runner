import React from 'react';

export default function WorkflowCard({ workflow, onLoad }) {
  return (
    <article className="workflowCard">
      <div>
        <h3>{workflow.name ?? workflow.workflowName}</h3>
        <p>{workflow.description || 'No description provided.'}</p>
      </div>
      <button className="secondaryButton" onClick={() => onLoad?.(workflow)}>Load</button>
    </article>
  );
}
